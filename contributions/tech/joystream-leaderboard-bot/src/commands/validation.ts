import BN from 'bn.js';
import { decodeAddress } from '@polkadot/util-crypto';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';

export function validateAddress(
  address: string,
  errorMessage = 'Invalid address'
): void {
  try {
    decodeAddress(address);
  } catch (e) {
    throw new Error(errorMessage);
  }
}

export function checkBalance(
  accBalances: DeriveBalancesAll,
  requiredBalance: BN
): void {
  if (requiredBalance.gt(accBalances.availableBalance)) {
    throw new Error(
      'Not enough balance available at the faucet'
    );
  }
}
