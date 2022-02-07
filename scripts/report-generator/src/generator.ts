import fs from "fs";
const exec = require("util").promisify(require("child_process").exec);

import { ApiPromise } from "@polkadot/api";
import { connectApi, getHead, getCouncils, getCouncilRound } from "./lib/api";
import { StatisticsCollector } from "./tokenomics";
import { generateReportData } from "./council";
import { Config } from "./types/tokenomics";

// types
import { Round } from "./lib/types";
import { types as joyTypes } from "@joystream/types";
import { Hash, Moment } from "@polkadot/types/interfaces";
import {
  BlockRange,
  CouncilMemberInfo,
  CouncilRoundInfo,
  ProposalFailedReason,
  ProposalInfo,
  ProposalStatus,
  ProposalType,
  ReportData,
} from "./types/council";
import { Seats } from "@joystream/types/council";
import { MemberId, Membership } from "@joystream/types/members";
import { StorageKey, u32, U32, Vec } from "@polkadot/types";
import { Mint, MintId } from "@joystream/types/mint";
import { ProposalDetailsOf, ProposalOf } from "@joystream/types/augment/types";

const CONFIG: Config = {
  repoDir: __dirname + "/../../../",
  reportsDir: "council/tokenomics",
  spendingCategoriesFile: "council/spending_proposal_categories.csv",
  councilTemplate: __dirname + "/../templates/council.md",
  tokenomicsTemplate: __dirname + "/../templates/tokenomics.md",
  providerUrl: "ws://127.0.0.1:9944",
  proposalUrl: "https://testnet.joystream.org/#/proposals/",
  statusUrl: "https://status.joystream.org/status",
  burnAddress: "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu",
  cacheDir: "cache",
  councilRoundOffset: 2,
  videoClassId: 10,
  channelClassId: 1,
};

const createDir = (dir: string) => {
  try {
    fs.statSync(dir);
  } catch (e) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const councilReport = async (
  startBlock: number,
  endBlock: number,
  config: Config
) => {
  const { repoDir, councilTemplate, providerUrl } = config;
  const api: ApiPromise = await connectApi(providerUrl);
  await api.isReady;

  // council report
  const startHash: Hash = await api.rpc.chain.getBlockHash(startBlock);
  const endHash: Hash = await api.rpc.chain.getBlockHash(endBlock);
  const blockRange = new BlockRange(startBlock, startHash, endBlock, endHash);

  const data = await generateReportData(api, blockRange);
  const report = await generateCouncilReport(data, councilTemplate);

  const term = data.councilTerm;
  let version = "giza";
  if (endBlock < 4191207) version = "sumer";
  if (startBlock < 717987) "antioch";
  const versionStr = version[0].toUpperCase() + version.slice(1);
  const dir = repoDir + `council/reports/` + version + `/`;
  const filename = `${versionStr}_Council${term}_Report.md`;
  createDir(dir);
  fs.writeFileSync(dir + filename, report);
  console.log(`-> Wrote ${dir + filename}`);
  api.disconnect();
};

const generateCouncilReport = async (
  data: ReportData,
  templateFile: string
) => {
  try {
    let fileData = await fs.readFileSync(templateFile, "utf8");
    let entries = Object.entries(data);

    for (let entry of entries) {
      let regex = new RegExp("{" + entry[0] + "}", "g");
      fileData = fileData.replace(regex, entry[1].toString());
    }
    return fileData;
  } catch (e) {
    console.error(e);
    return "";
  }
};

const tokenomicsReport = async (
  startBlock: number,
  endBlock: number,
  config: Config
): Promise<boolean> => {
  const { tokenomicsTemplate, repoDir, reportsDir } = config;
  let fileData = fs.readFileSync(tokenomicsTemplate, "utf8");
  let statsCollecttor = new StatisticsCollector();
  console.log(`-> Collecting stats from ${startBlock} to ${endBlock}`);
  const stats = await statsCollecttor.getStats(startBlock, endBlock, config);
  if (!stats.dateStart) return false;
  const round = stats.councilRound || 1;

  const fileName = `Council_Round${round}_${startBlock}-${endBlock}_Tokenomics_Report.md`;
  // antioch was updated to sumer at 717987
  const version =
    startBlock < 717987 ? "antioch-3" : endBlock > 4191207 ? "giza" : "sumer-4";
  const dir = `${repoDir}${reportsDir}/${version}`;
  createDir(dir);

  console.log(`-> Writing report to ${fileName}`);
  for (const entry of Object.entries(stats)) {
    if (entry[1] !== null) {
      let regex = new RegExp("{" + entry[0] + "}", "g");
      fileData = fileData.replace(regex, entry[1]?.toString());
    } else console.warn(`empty value:`, entry[0]);
  }
  fs.writeFileSync(`${dir}/${fileName}`, fileData);
  return true;
};

const updateReports = async (config: Config, round?: number) => {
  const { providerUrl } = config;
  console.debug(`Connecting to ${providerUrl}`);
  const api: ApiPromise = await connectApi(providerUrl);
  await api.isReady;

  console.log(`-> Fetching councils`);
  const head = await getHead(api);
  getCouncils(api, +head).then(async (councils: Round[]) => {
    api.disconnect();
    if (round === null || isNaN(round)) {
      console.log(`-> Updating reports`);
      await Promise.all(
        councils.map(({ start, end }) => createReports(start, end, config))
      );
    } else {
      const council = councils.find((c) => c.round === round);
      if (!council) return console.warn(`Round ${round} not found:`, councils);
      console.log(
        `-> Updating round ${round} (${council.start}-${council.end})`
      );
      await createReports(council.start, council.end, config);
    }
    process.exit();
  });
};

const createReports = (
  startBlock: number,
  endBlock: number,
  config: Config
) => {
  councilReport(startBlock, endBlock, config);
  return tokenomicsReport(startBlock, endBlock, config);
};

const main = async (config: Config) => {
  const args = process.argv.slice(2);
  if (args.length < 2) return updateReports(config, Number(args[0]));

  const startBlock = Number(args[0]);
  const endBlock = Number(args[1]);

  if (isNaN(startBlock) || isNaN(endBlock) || startBlock >= endBlock) {
    console.error("Invalid block range.");
    process.exit(1);
  }

  createReports(startBlock, endBlock, config);
};
main(CONFIG);
