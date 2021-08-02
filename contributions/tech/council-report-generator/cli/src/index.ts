// @ts-check

import {ApiPromise, WsProvider} from '@polkadot/api'
import {types as joyTypes} from '@joystream/types'
import {Hash, Moment} from '@polkadot/types/interfaces'
import {
    BlockRange,
    CouncilMemberInfo,
    CouncilRoundInfo,
    ProposalFailedReason,
    ProposalInfo,
    ProposalStatus,
    ProposalType,
    ReportData
} from "./types";
import {Seats} from "@joystream/types/council";
import {MemberId, Membership} from "@joystream/types/members";
import {StorageKey, u32, U32, Vec} from "@polkadot/types";
import {Mint, MintId} from "@joystream/types/mint";
import {ProposalDetailsOf, ProposalOf} from "@joystream/types/augment/types";

import {generateReportData} from './report-functions'

const fsSync = require('fs')
const fs = fsSync.promises

const PROPOSAL_URL = 'https://testnet.joystream.org/#/proposals/';
const ELECTION_OFFSET = 1;

async function main() {
    const args = process.argv.slice(2);
    if (args.length != 2) {
        console.error('Usage: [start bock number] [end block number]');
        process.exit(1);
    }

    const startCouncilBlock = Number(args[0]);
    const endCouncilBlock = Number(args[1]);

    const provider = new WsProvider('ws://localhost:9944');

    const api = new ApiPromise({provider, types: joyTypes});
    await api.isReady;

    const startHash = (await api.rpc.chain.getBlockHash(startCouncilBlock)) as Hash;
    const endHash = (await api.rpc.chain.getBlockHash(endCouncilBlock)) as Hash;
    const blockRange = new BlockRange(startCouncilBlock, startHash, endCouncilBlock, endHash);

    const reportData = await generateReportData(api, blockRange)
    const reportGenerationResult = await generateReport(reportData);
    await fs.writeFile('report.md', reportGenerationResult);

    api.disconnect()
}


async function generateReport(data: ReportData) {
    try {
        let fileData = await fs.readFile(__dirname + '/../report-template.md', {
            encoding: "utf8"
        });

        let entries = Object.entries(data);

        for (let entry of entries) {
            let regex = new RegExp('{' + entry[0] + '}', "g");
            fileData = fileData.replace(regex, entry[1].toString());
        }

        return fileData;
    } catch (e) {
        console.error(e);
    }
    return "";
}

main()
