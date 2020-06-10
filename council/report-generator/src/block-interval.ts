import {ApiPromise, WsProvider} from "@polkadot/api";
import {Hash, Header} from "@polkadot/types/interfaces/runtime";
import {registerJoystreamTypes} from "@joystream/types/lib";

async function main() {
    let startDate = new Date(2020, 4, 20, 13, 0);
    let endDate = new Date(2020, 4, 29, 23, 59);

    // Initialise the provider to connect to the local node
    const provider = new WsProvider('wss://rome-rpc-endpoint.joystream.org:9944');

    // register types before creating the api
    registerJoystreamTypes();

    // Create the API and wait until ready
    const api = await ApiPromise.create({provider});

    let blockInterval = await getBlockInterval(api, startDate.getTime(), endDate.getTime());

}

async function getBlockInterval(api: ApiPromise, startTimestamp: number, endTimestamp: number) {

    let approximateStartBlockHash = await getApproximatedBlockHash(api, startTimestamp);
    let startBlock = await adjustApproximatedBlockHash(api, startTimestamp, approximateStartBlockHash);

    let approximateEndBlockHash = await getApproximatedBlockHash(api, endTimestamp);
    let endBlock = await adjustApproximatedBlockHash(api, endTimestamp, approximateEndBlockHash);

    let startBlockHeader = await api.rpc.chain.getHeader(startBlock) as Header;
    let endBlockHeader = await api.rpc.chain.getHeader(endBlock) as Header;

    return {
        'startBlock':
            startBlockHeader.number.unwrap().toNumber(),
        'endBlock':
            endBlockHeader.number.unwrap().toNumber()
    };
}

async function getApproximatedBlockHash(api: ApiPromise, timestampToFound: number): Promise<Hash> {
    let lastHeader = await api.rpc.chain.getHeader();
    let lastHash = lastHeader.hash.toString();
    let lastTimestamp = parseInt((await api.query.timestamp.now.at(lastHash)).toString());

    let prevousBlockHash = lastHeader.parentHash;
    let previousBlockTimestamp = parseInt((await api.query.timestamp.now.at(prevousBlockHash)).toString());

    let secondsPerBlock = lastTimestamp - previousBlockTimestamp;

    let blocksDiff = Math.floor((lastTimestamp - timestampToFound) / secondsPerBlock);
    let lastBlockNumber = lastHeader.number.unwrap();
    let approximatedBlockNr = lastBlockNumber.toNumber() - blocksDiff;
    return await api.rpc.chain.getBlockHash(approximatedBlockNr);
}

async function adjustApproximatedBlockHash(api: ApiPromise, timestamp: number, hash: Hash) {
    let approximatedBlockTimestamp = parseInt((await api.query.timestamp.now.at(hash)).toString());

    if (timestamp == approximatedBlockTimestamp) {
        return hash;
    }

    let step = 1;
    if (timestamp < approximatedBlockTimestamp) {
        step = -1;
    }

    let approximatedBlockHeader = await api.rpc.chain.getHeader(hash);
    let blockNumber = approximatedBlockHeader.number.unwrap().toNumber();
    let lastHashFound = hash;
    do {
        blockNumber += step;
        let nextBlockHash = await api.rpc.chain.getBlockHash(blockNumber);
        let nextBlockTimeStamp = parseInt((await api.query.timestamp.now.at(nextBlockHash)).toString());

        if (Math.abs(approximatedBlockTimestamp - timestamp) < Math.abs(nextBlockTimeStamp - timestamp)) {
            return lastHashFound;
        }

        approximatedBlockTimestamp = nextBlockTimeStamp;
        lastHashFound = nextBlockHash;

    } while (true);
}

main();