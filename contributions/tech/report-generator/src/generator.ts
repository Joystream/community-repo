import fs from "fs";
const exec = require("util").promisify(require("child_process").exec);
import { StatisticsCollector } from "./StatisticsCollector";
import { connectApi, getHead, getCouncils } from "./lib/api";
import { Round } from "./lib/types";
import { Config } from "./types";

const CONFIG: Config = {
  repoDir: __dirname + "/../../../../",
  reportsDir: "council/tokenomics",
  spendingCategoriesFile: "governance/spending_proposal_categories.csv",
  templateFile: __dirname + "/../report-template.md",
  providerUrl: "ws://127.0.0.1:9944",
  statusUrl: "https://status.joystream.org/status/",
  burnAddress: "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu",
  cacheDir: "cache",
  councilRoundOffset: 2,
  videoClassId: 10,
  channelClassId: 1,
};

async function main(config: Config) {
  const { templateFile } = config;
  const args = process.argv.slice(2);
  if (args.length < 2) return updateReports(config, Number(args[0]));

  const startBlock = Number(args[0]);
  const endBlock = Number(args[1]);

  if (isNaN(startBlock) || isNaN(endBlock) || startBlock >= endBlock) {
    console.error("Invalid block range.");
    process.exit(1);
  } else generateReport(startBlock, endBlock, config);
}

const generateReport = async (
  startBlock: number,
  endBlock: number,
  config: Config
): Promise<boolean> => {
  const { templateFile, repoDir, reportsDir } = config;
  let fileData = fs.readFileSync(templateFile, "utf8");
  let statsCollecttor = new StatisticsCollector();
  console.log(`-> Collecting stats from ${startBlock} to ${endBlock}`);
  const stats = await statsCollecttor.getStats(startBlock, endBlock, config);
  console.log(stats);
  if (!stats.dateStart) return false;
  const round = stats.councilRound || 1;

  const fileName = `Council_Round${round}_${startBlock}-${endBlock}_Tokenomics_Report.md`;
  // antioch was updated to sumer at 717987
  const version = startBlock < 717987 ? "antioch-3" : "sumer-4";
  const dir = `${repoDir}${reportsDir}/${version}`;

  console.log(`-> Writing report to ${fileName}`);
  for (const entry of Object.entries(stats)) {
    const regex = new RegExp("{" + entry[0] + "}", "g");
    fileData = fileData.replace(regex, entry[1].toString());
  }
  fs.writeFileSync(`${dir}/${fileName}`, fileData);
  return true;
};

const updateReports = async (config: Config, round?: number) => {
  const { templateFile, providerUrl } = config;
  console.debug(`Connecting to ${providerUrl}`);
  const api = await connectApi(providerUrl);
  await api.isReady;

  console.log(`-> Fetching councils`);
  const head = await getHead(api);
  getCouncils(api, +head).then(async (councils: Round[]) => {
    api.disconnect();
    if (round !== null) {
      const council = councils.find((c) => c.round === round);
      if (!council) return console.warn(`Round ${round} not found:`, councils);
      console.log(
        `-> Updating round ${round} (${council.start}-${council.end})`
      );
      await generateReport(council.start, council.end, config);
    } else {
      console.log(`-> Updating reports`);
      await Promise.all(
        councils.map((council) =>
          generateReport(council.start, council.end, config)
        )
      );
    }
    process.exit();
  });
};

main(CONFIG);
