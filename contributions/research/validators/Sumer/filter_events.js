const fs = require("fs");
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { types } = require("@joystream/types");
const moment = require("moment");

const startBlock = 2000000;

const filterEvents = (events) => {
  let offences = [];
  let offline = [];
  let payout = [];
  let rewards = [];

  events.forEach(({ section, method, data }) => {
    if (section === "imOnline" && method === "SomeOffline") offline.push(data);
    else if (section === "offences") offences = data;
    else if (section === "staking" && method === "EraPayout") payout = data;
    else if (section === "staking" && method === "Reward") rewards.push(data);
  });
  return { offences, offline, rewards, payout };
};

// load blocks from cache files
let unsorted = {};
process.argv.slice(2).forEach((file) => {
  console.log(`Loading ${file}`);
  const loaded = require(file).filter(([block]) => block > startBlock);
  const filtered = loaded.map(([block, events]) => {
    const { offences, offline, rewards, payout } = filterEvents(events);
    if (offences.length + offline.length + rewards.length + payout.length)
      unsorted[block] = { block, offences, offline, rewards, payout };
  });
});
const blocks = Object.keys(unsorted)
  .sort((a, b) => a.block - b.block)
  .map((block) => unsorted[block]);
fs.writeFileSync(`blocks.json`, JSON.stringify(blocks));
console.log(`Saved ${blocks.length} blocks to \`blocks.json\`.`);

let Offences = `| Block | Offence | Offline |\n|---|---|---|\n`;
blocks.forEach(({ block, offences, offline }) => {
  if (offences.length || offline.length)
    Offences += `| ${block} | ${offences.join(", ")} | ${offline
      .map((o) => o.map((v) => v[0][0]))
      .join("<br/>")} |\n`;
});
fs.writeFileSync("Offences.md", Offences);
console.log(`Wrote Offences.md.`);

console.log(`Connecting to local api`);
ApiPromise.create({ provider: new WsProvider(), types }).then(async (api) => {
  await api.isReady;
  const head = await api.derive.chain.bestNumber();
  const startHash = await api.rpc.chain.getBlockHash(blocks[0].block);
  const startTime = (await api.query.timestamp.now.at(startHash)).toNumber();
  console.log(`Connected. Head: ${head}`);

  const getRewardPoints = async (block, era) => {
    const hash = await api.rpc.chain.getBlockHash(block);
    const timestamp = (await api.query.timestamp.now.at(hash)).toNumber();
    const points = await api.query.staking.erasRewardPoints.at(hash, era);
    return [points.toJSON(), timestamp];
  };

  const Rewards = blocks.reduce((previous, { block, rewards }) => {
    if (!rewards.length) return previous;
    const summary = `${rewards.length} validators rewarded`;
    const list = rewards.join("<br/>");
    return `${previous}| ${block} | ${summary} | ${list} |\n`;
  }, `| Block | Summary | Validators |\n|---|---|---|\n`);
  fs.writeFileSync("Rewards.md", await Rewards);
  console.log(`Wrote Rewards.md.`);

  // Generate table with points and reward for each era
  //     |  Era            |
  // ----|-----------------|
  // Key | Points / Reward |

  let weeks = {};
  let validatorEras = { Total: { Total: [0, 0] } };

  console.log(`Fetching reward points`);
  await Promise.all(
    blocks.map(async ({ block, payout }) => {
      if (block > head) return;
      if (!payout.length) return;
      const era = payout[0];
      const [{ total, individual }, time] = await getRewardPoints(block, era);
      const week = Math.floor((time - startTime) / 1000 / (3600 * 24 * 7));
      const date = moment.utc(time).format(`YYYY-MM-DD`);
      if (!weeks[week]) weeks[week] = { date, eras: [era] };
      else weeks[week].eras.push(era);

      validatorEras.Total.Total[0] += total;
      validatorEras.Total[era] = [total, 0];

      // save points per validator
      Object.keys(individual).forEach((v) => {
        const points = individual[v];
        if (!points) return;
        if (!validatorEras[v]) validatorEras[v] = {};
        if (validatorEras[v][era]) validatorEras[v][era][0] = +points;
        else validatorEras[v][era] = [points, 0];
      });
    })
  );

  console.log(`Processing rewards`);
  for (const data of blocks) {
    const { block, rewards } = data;
    if (block > head) continue;
    if (!rewards.length) continue;
    const hash = await api.rpc.chain.getBlockHash(block);
    const era = (await api.query.staking.currentEra.at(hash)) - 1;

    rewards.forEach(([v, reward]) => {
      if (!reward) return;
      if (!validatorEras.Total[era]) validatorEras.Total[era] = [0, 0];
      validatorEras.Total[era][1] += reward;

      if (!validatorEras[v]) validatorEras[v] = { Total: [0, 0] };
      if (validatorEras[v][era]) validatorEras[v][era][1] += reward;
      else validatorEras[v][era] = [0, reward];
    });
  }

  const Intro = `# Validator points and rewards\n\nWeekly summary of validator points and rewards per era.\n\n`;

  const weekTable = (week) => {
    const { eras, date } = weeks[week];
    let Head = `## Week from ${date}\n\n| Validator / Era | Total |`;
    let Separator = `|---|---|`;
    eras.forEach((era) => {
      Head += ` ${era} |`;
      Separator += `---|`;
    });

    // generate rows
    const rows = Object.keys(validatorEras).map((v) => {
      let points = 0;
      let reward = 0;
      const data = validatorEras[v];
      const fields = Object.keys(data)
        .filter((e) => eras.includes(+e))
        .map((e) => {
          points += +data[e][0];
          reward += +data[e][1];
          return ` ${+data[e][0]}<br>${+data[e][1]} |`;
        })
        .join(``);
      const total = `${points}<br/>${reward}`;
      return [points, reward, `| ${v} | ${total} |${fields}\n`];
    });
    const Rows = rows
      .filter((r) => r[0] + r[1])
      .sort((b, a) => a[0] - b[0])
      .map((r) => r[2]);
    const filename = `Validator_points_${date}.md`;
    const md = `${Intro}${Head}\n${Separator}\n${Rows.join(``)}\n`;
    fs.writeFileSync(filename, md);
    console.log(`Wrote ${filename}`);
  };
  console.log(`Generating week tables`);
  Object.keys(weeks).map((w) => weekTable(w));
  fs.writeFileSync("points.json", JSON.stringify(validatorEras));
  console.log(`Wrote points.json`);

  process.exit();
});
