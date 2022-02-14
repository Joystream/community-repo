import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { Vec } from "@polkadot/types";
import {
  Balance,
  EventRecord,
  Extrinsic,
  SignedBlock,
} from "@polkadot/types/interfaces";

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("ws://127.0.0.1:9944");

  //If you want to play around on our staging network, go ahead and connect to this staging network instead.
  //const provider = new WsProvider('wss://testnet-rpc-2-singapore.joystream.org');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider, types });

  // get finalized head of chain, as number and hash:
  const finalizedHeadNumber = await api.derive.chain.bestNumberFinalized();
  const finalizedHeadHash = await api.rpc.chain.getFinalizedHead();
  // get head of chain, as hash or number:
  const headNumber = await api.derive.chain.bestNumber();
  const headHash = await api.rpc.chain.getBlockHash(headNumber);

  console.log(
    `Finalized head of chain
      - as number: ${finalizedHeadNumber}
      - with hash: ${finalizedHeadHash}`
  );
  console.log(
    `Head of chain
      - as number: ${headNumber}
      - with hash: ${headHash}`
  );

  // get current issuance
  const issuance = (await api.query.balances.totalIssuance()) as Balance;
  console.log(`current issuance is: ${issuance.toNumber()}tJOY`);

  // get events in newest block:
  const events = (await api.query.system.events()) as Vec<EventRecord>;
  for (let { event } of events) {
    const section = event.section;
    const method = event.method;
    const data = event.data;
    console.log("section", section);
    console.log("method", method);
    console.log("data", data.toHuman());
    console.log("");
  }

  // get events in newest block:
  const events = (await api.query.system.events()) as Vec<EventRecord>;
  for (let { event } of events) {
    const section = event.section;
    const method = event.method;
    const data = event.data;
    console.log("section", section);
    console.log("method", method);
    console.log("data", data.toHuman());
    console.log("");
  }

  // get extrinsics in finalized head block:
  const getLatestBlock = (await api.rpc.chain.getBlock(
    finalizedHeadHash
  )) as SignedBlock;
  const extrinsics = getLatestBlock.block.extrinsics as Vec<Extrinsic>;
  for (let i = 0; i < extrinsics.length; i++) {
    const section = extrinsics[i].method.section;
    const method = extrinsics[i].method.method;
    console.log("section", section);
    console.log("method", method);
    console.log("");
    // get signer of extrinsics if applicable
    const signer = extrinsics[i].signer;
    if (!signer.isEmpty) {
      console.log("signer", signer);
    }
  }

  api.disconnect();
}

main();
