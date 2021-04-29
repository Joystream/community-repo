import {ApiPromise, WsProvider} from "@polkadot/api";
import {types} from '@joystream/types';

async function main() {

    const provider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({provider, types});
    const hash = await api.rpc.chain.getBlockHash(155528);
    console.log(hash.toHuman());
}
main();

//

// import {Moment} from "@polkadot/types/interfaces";
// //
// const fs = require('fs');
//
// async function main() {
//     // let startDate = new Date(2020, 4, 20, 13, 0);
//     // console.log(startDate);
//     // let endDate = new Date(2020, 4, 29, 23, 59);
//
//     // Initialise the provider to connect to the local node
//     const provider = new WsProvider('wss://babylon.joystreamstats.live:9945');
//
//     // Create the API and wait until ready
//     const api = await ApiPromise.create({provider, types});
//
//     const hash = await api.rpc.chain.getBlockHash(2528244);
//
//     const block = await api.rpc.chain.getBlock(hash);
//
//     let startDate = (await api.query.timestamp.now.at(hash)) as Moment;
//     console.log(startDate.toString());
//
//     // console.log(block.toJSON());
//
//     // let ext = block.block.extrinsics[1];
//     // let json = ext.toHuman() as any;
//     // let buffer = Buffer.from(json.method.args[0].replace(/0x/g, ''), "hex");
//     // fs.writeFile('image.png', ext.data, (err: any) => {
//     //     console.log(err);
//     // });
//     // // }
//
//
//     // const events = await api.query.system.events.at(hash);
//
//     // for(let event of events){
//     //     console.log(event.event.data);
//     // }
//
//
//     // let blockInterval = await getBlockInterval(api, startDate.getTime(), endDate.getTime());
//     // console.log(blockInterval);
// }
//
// //
// // async function getBlockInterval(api: ApiPromise, startTimestamp: number, endTimestamp: number) {
// //
// //     let approximateStartBlockHash = await getApproximatedBlockHash(api, startTimestamp);
// //     let startBlock = await adjustApproximatedBlockHash(api, startTimestamp, approximateStartBlockHash);
// //
// //     let approximateEndBlockHash = await getApproximatedBlockHash(api, endTimestamp);
// //     let endBlock = await adjustApproximatedBlockHash(api, endTimestamp, approximateEndBlockHash);
// //
// //     let startBlockHeader = await api.rpc.chain.getHeader(startBlock) as Header;
// //     let endBlockHeader = await api.rpc.chain.getHeader(endBlock) as Header;
// //
// //     return {
// //         'startBlock':
// //             startBlockHeader.number.unwrap().toNumber(),
// //         'endBlock':
// //             endBlockHeader.number.unwrap().toNumber()
// //     };
// // }
// //
// // async function getApproximatedBlockHash(api: ApiPromise, timestampToFound: number): Promise<Hash> {
// //     let lastHeader = await api.rpc.chain.getHeader();
// //     let lastHash = lastHeader.hash.toString();
// //     let lastTimestamp = parseInt((await api.query.timestamp.now.at(lastHash)).toString());
// //
// //     let prevousBlockHash = lastHeader.parentHash;
// //     let previousBlockTimestamp = parseInt((await api.query.timestamp.now.at(prevousBlockHash)).toString());
// //
// //     let secondsPerBlock = lastTimestamp - previousBlockTimestamp;
// //
// //     let blocksDiff = Math.floor((lastTimestamp - timestampToFound) / secondsPerBlock);
// //     let lastBlockNumber = lastHeader.number.unwrap();
// //     let approximatedBlockNr = lastBlockNumber.toNumber() - blocksDiff;
// //     return await api.rpc.chain.getBlockHash(approximatedBlockNr);
// // }
// //
// // async function adjustApproximatedBlockHash(api: ApiPromise, timestamp: number, hash: Hash) {
// //     let approximatedBlockTimestamp = parseInt((await api.query.timestamp.now.at(hash)).toString());
// //
// //     if (timestamp == approximatedBlockTimestamp) {
// //         return hash;
// //     }
// //
// //     let step = 1;
// //     if (timestamp < approximatedBlockTimestamp) {
// //         step = -1;
// //     }
// //
// //     let approximatedBlockHeader = await api.rpc.chain.getHeader(hash);
// //     let blockNumber = approximatedBlockHeader.number.unwrap().toNumber();
// //     let lastHashFound = hash;
// //     do {
// //         blockNumber += step;
// //         let nextBlockHash = await api.rpc.chain.getBlockHash(blockNumber);
// //         let nextBlockTimeStamp = parseInt((await api.query.timestamp.now.at(nextBlockHash)).toString());
// //
// //         if (Math.abs(approximatedBlockTimestamp - timestamp) < Math.abs(nextBlockTimeStamp - timestamp)) {
// //             return lastHashFound;
// //         }
// //
// //         approximatedBlockTimestamp = nextBlockTimeStamp;
// //         lastHashFound = nextBlockHash;
// //
// //     } while (true);
// // }
// //
// main();