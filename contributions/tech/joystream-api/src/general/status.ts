// @ts-check

import { ApiPromise, WsProvider } from '@polkadot/api';
import { types } from '@joystream/types'
import { Seat } from '@joystream/types/council';
// import { ValidatorId } from '@polkadot/types/interfaces';

// import BN from 'bn.js';
const BN = require('bn.js');

async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider, types })

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`Chain '${chain}' - node: ${nodeName} v${nodeVersion}`);

  let council = await api.query.council.activeCouncil() as unknown as Seat[];
  let validators = await api.query.session.validators() //  as unknown as ValidatorId[];
  let version  = await api.rpc.state.getRuntimeVersion() // as any;

  console.log(`Runtime Version: ${version.authoringVersion}.${version.specVersion}.${version.implVersion}`);

  // number of council members
  console.log('Council size:', council.length)

  console.log('Validator count:', validators.length);

  if (validators && validators.length > 0) {
    // Retrieve the balances of validators' stash accounts
    const validatorBalances = await Promise.all(
      validators.map(authorityId => api.derive.balances.all(authorityId))
    );

    const totalValidatorBalances =
      validatorBalances.reduce((total, value) => total.add(value.lockedBalance), new BN(0))
    
    console.log('Total Validator Locked Balances:', totalValidatorBalances.toString());
  }

  api.disconnect();
}

main()
