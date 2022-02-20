
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Bytes } from '@polkadot/types';
import { types } from "@joystream/types";

async function main() {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider, types })

  const input:string = "myInputString"
  const output = new Bytes(api.registry, input);

  /*
  Some extrinsics require input as "Bytes".
  Replace <myInputString> with the string you want, and the output can be pasted in.
  */


  console.log("input string", input)
  console.log("output, as bytes toHex",output.toHex())
  await api.disconnect()
}

main()

