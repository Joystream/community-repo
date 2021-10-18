import fs from "fs";
const exec = require("util").promisify(require("child_process").exec);
import { StatisticsCollector } from "./StatisticsCollector";
import { connectApi, getHead, getCouncils } from "./lib/api";
import { Round } from "./lib/types";

const TEMPLATE_FILE = __dirname + "/../report-template.md";
const PROVIDER_URL = "ws://127.0.0.1:9944";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) return updateReports(Number(args[0]));

  const startBlock = Number(args[0]);
  const endBlock = Number(args[1]);

  if (isNaN(startBlock) || isNaN(endBlock) || startBlock >= endBlock) {
    console.error("Invalid block range.");
    process.exit(1);
  } else generateReport(startBlock, endBlock, TEMPLATE_FILE);
}

const generateReport = (
  startBlock: number,
  endBlock: number,
  templateFile: string
): Promise<any> => {
  let fileData = fs.readFileSync(templateFile, "utf8");
  let staticCollecttor = new StatisticsCollector();
  console.log(`-> Collecting stats from ${startBlock} to ${endBlock}`);
  return staticCollecttor.getStatistics(startBlock, endBlock).then((stats) => {
    console.log(stats);
    if (!stats.dateStart) return false;
    const round = stats.councilRound || 1;

    const fileName = `Council_Round${round}_${startBlock}-${endBlock}_Tokenomics_Report.md`;
    // antioch was updated to sumer at 717987
    const version = startBlock < 717987 ? "antioch-3" : "sumer-4";
    const dir = __dirname + `/../../../../council/tokenomics/${version}`;

    const reports = fs.readdirSync(dir);
    const exists = reports.find(
      (file: string) => file.indexOf(`_${endBlock + 1}_T`) !== -1
    );
    if (exists && exists !== fileName) {
      console.log(`INFO renaming ${exists} to ${fileName}`);
      try {
        exec(`git mv ${dir}/${exists} ${dir}/${fileName}`);
      } catch (e) {}
    }

    console.log(`-> Writing report to ${fileName}`);
    for (const entry of Object.entries(stats)) {
      const regex = new RegExp("{" + entry[0] + "}", "g");
      fileData = fileData.replace(regex, entry[1].toString());
    }
    fs.writeFileSync(`${dir}/${fileName}`, fileData);
    return true;
  });
};

const updateReports = async (round?: number) => {
  console.debug(`Connecting to ${PROVIDER_URL}`);
  const api = await connectApi(PROVIDER_URL);
  await api.isReady;

  console.log(`-> Fetching councils`);
  const head = await getHead(api)
  getCouncils(api, +head).then(async (councils: Round[]) => {
    api.disconnect();
    if (round !== null) {
      const council = councils.find((c) => c.round === round);
      if (!council) return console.warn(`Round ${round} not found:`, councils);
      console.log(
        `-> Updating round ${round} (${council.start}-${council.end})`
      );
      await generateReport(council.start, council.end, TEMPLATE_FILE);
    } else {
      console.log(`-> Updating reports`);
      await Promise.all(
        councils.map((council) =>
          generateReport(council.start, council.end, TEMPLATE_FILE)
        )
      );
    }
    process.exit();
  });
};

main();
