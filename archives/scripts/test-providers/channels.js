const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const {
  ch,
  time,
  sleep,
  loadResults,
  headAsset,
  sendResult,
  printFailed,
  writeTable,
  query,
} = require("./util");

// config
const QN = `https://ipfs.joystreamstats.live/graphql`;
const resultsUrl = `https://joystreamstats.live/api/v1/bags/status`;
const resultsFile = `./bag_availability.json`;
const getUrl = (metadata) => metadata?.nodeEndpoint;
const testProviders = async (channelId, object, sUrls, dUrls) => {
  const storage = await Promise.all(
    sUrls
      .filter((url) => url)
      .map((url) =>
        headAsset(object.id, url, url + `api/v1/files/${object.id}`)
      )
  );
  const distribution = await Promise.all(
    dUrls.map((url) =>
      headAsset(object.id, url, url + `api/v1/assets/${object.id}`)
    )
  );
  return [storage, distribution];
};
const testBags = async (bags, objects = [], rapid = false) => {
  console.debug(
    time(),
    `Starting rapid test`,
    objects.length && `for ${objects}`
  );
  const start = new Date();
  let results = [];
  for (const bag of bags.sort((a, b) => ch(b.id) - ch(a.id))) {
    if (!bag.objects) continue;
    const channelId = ch(bag.id);
    const sUrls = bag.storageBuckets.map((sb) => getUrl(sb.operatorMetadata));
    const dUrls = bag.distributionBuckets.map((db) =>
      getUrl(db.operators[0]?.metadata)
    );
    for (const object of bag.objects) {
      //if (results.length) continue; // TODO
      if (objects.length && !objects.includes(object.id)) continue;
      const [storage, distribution] = await testProviders(
        ch(bag.id),
        object,
        sUrls,
        dUrls
      );
      const sFailed = storage.filter((b) => b.status !== `success`);
      const dFailed = distribution.filter((b) => b.status !== `success`);
      const SP =
        `${storage.length - sFailed.length}/${storage.length} ` +
        (sFailed.length ? `( ` + printFailed(sFailed) + ` )` : "OK");
      const DP =
        `${distribution.length - dFailed.length}/${distribution.length} ` +
        (dFailed.length ? `( ` + printFailed(dFailed) + ` )` : "OK");
      console.log(`${time()} ${channelId} ${object.id} SP:${SP} DP:${DP}`);
      const result = { channelId, storage, distribution };
      sendResult(result, resultsUrl);
      results.push(result);
    }
    if (!rapid) await sleep(Math.randon * 10.0);
  }
  const duration = (moment().diff(start) / 1000).toFixed(3) + `s`;
  console.log(time(), `Finished rapid test in `, duration);
  if (!objects.length) {
    fs.writeFileSync(resultsFile, JSON.stringify(results));
    console.log(time(), `Wrote results to ${resultsFile} `);
  }
};

// start
const bagIds = process.argv.slice(2);
if (bagIds.length) console.log(`selected bags`, bagIds);
const old = loadResults(resultsFile);
console.debug(time(), `Fetching bags with buckets and objects\n`, query);
axios
  .post(QN, { query })
  .then(({ data }) => {
    const bags = data.data.storageBags;
    if (!bags.length)
      return console.error(time(), `No bags received.`, data.error);
    console.log(time(), `Received list with ${bags.length} bags.`);
    //bags.forEach((b) => printBagBuckets(b));
    let selected = bags;
    if (bagIds.length) {
      console.log(time(), `Selecting bags with id`, bagIds);
      selected = bags.filter(
        (b) => !bagIds.length || bagIds.find((id) => id === ch(b.id))
      );
    }
    if (old.length) {
      console.log(time(), `Testing formerly failed assets`);
      const ids = old.reduce(
        (ids, bag) =>
          ids.concat(
            ...bag.storage.map((r) => r.objectId),
            ...bag.distribution.map((r) => r.objectId)
          ),
        []
      );
      console.log(ids);
      testBags(selected, ids);
    } else testBags(selected);
  })
  .catch((e) => console.error(e.message, e.response?.data));
