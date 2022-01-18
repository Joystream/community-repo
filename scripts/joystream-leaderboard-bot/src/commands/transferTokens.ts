/*
  This is adapted code from CLI
*/
import BN from 'bn.js';
import { Keyring } from '@polkadot/api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import {
  SubmittableExtrinsic,
} from '@polkadot/api/types';
import { types } from '@joystream/types';
import { Balance } from '@polkadot/types/interfaces';
import { KeyringPair } from '@polkadot/keyring/types';
import chalk from 'chalk';
import { formatBalance } from '@polkadot/util';
import { Hash } from '@polkadot/types/interfaces';

import { checkBalance, validateAddress } from './validation';

export const DEFAULT_API_URI = 'wss://rome-rpc-endpoint.joystream.org:9944/';

type NamedKeyringPair = KeyringPair & {
  meta: {
    name: string
  }
}

export default class TransferTokens {
  private api: ApiPromise;

  getAccountBalancesInfo = async (
    accountAddresses: string
  ): Promise<DeriveBalancesAll> => {
    return await Promise.resolve(
      this.api.derive.balances.all(accountAddresses)
    );
  };

  createTransferTx(recipient: string, amount: BN) {
    return this.api.tx.balances.transfer(recipient, amount);
  }

  async estimateFee(
    account: KeyringPair,
    tx: SubmittableExtrinsic<'promise'>
  ): Promise<Balance> {
    const paymentInfo = await tx.paymentInfo(account);
    return paymentInfo.partialFee;
  }

  async start(recipient: string, amount: number) {
    console.log('start transfer', recipient, amount);

    await this.init();

    const selectedAccount: NamedKeyringPair =
      await this.getFaucetAccount();

    const amountBN: BN = new BN(amount);

    // Initial validation
    validateAddress(recipient, 'Invalid recipient address');

    const accBalance = await this.getAccountBalancesInfo(selectedAccount.address);

    checkBalance(accBalance, amountBN);

    await this.requestAccountDecoding(selectedAccount);

    console.log(chalk.magentaBright('Estimating fee...'));
    const tx = await this.createTransferTx(recipient, amountBN);
    let estimatedFee: BN = new BN(0);

    try {
      estimatedFee = await this.estimateFee(selectedAccount, tx);
    } catch (e) {
      throw new Error('Could not estimate the fee.');
    }

    const totalAmount: BN = amountBN.add(estimatedFee);
    console.log(
      chalk.magentaBright('Estimated fee:', formatBalance(estimatedFee))
    );
    console.log(
      chalk.magentaBright('Total transfer amount:', formatBalance(totalAmount))
    );

    checkBalance(accBalance, totalAmount);

    try {
      const txHash: Hash = await tx.signAndSend(selectedAccount);
      console.log(chalk.greenBright('Transaction successfully sent!'));
      console.log(chalk.magentaBright('Hash:', txHash.toString()));
    } catch (e) {
      console.error('Could not send the transaction.');
    }
  }

  async getBalance() {
    await this.init();

    const selectedAccount: NamedKeyringPair =
      await this.getFaucetAccount();

    const accBalance = await this.getAccountBalancesInfo(selectedAccount.address);

    return accBalance.availableBalance;
  }

  async init() {
    let apiUri: string = DEFAULT_API_URI;
    if (!apiUri) {
      console.warn(
        "You haven't provided a node/endpoint for the bot to connect to yet!"
      );
    }

    this.api = await this.initApi(apiUri);
  }

  private async initApi(
    apiUri: string = DEFAULT_API_URI,
  ): Promise<ApiPromise> {
    const wsProvider: WsProvider = new WsProvider(apiUri);
    const api = new ApiPromise({
      provider: wsProvider,
      types,
    });
    await api.isReadyOrError;

    // Initializing some api params based on pioneer/packages/react-api/Api.tsx
    const [properties] = await Promise.all([api.rpc.system.properties()]);

    const tokenSymbol = properties.tokenSymbol.unwrap()[0].toString();
    const tokenDecimals = properties.tokenDecimals.unwrap()[0].toNumber();

    // formatBlanace config
    formatBalance.setDefaults({
      decimals: tokenDecimals,
      unit: tokenSymbol,
    });

    return api;
  }

  async getFaucetAccount(): Promise<NamedKeyringPair | null> {
    const jsonBackupFilePath = `../../accounts/${process.env.ACCOUNT_JSON_NAME}`;
    let accountJsonObj;

    try {
      accountJsonObj = require(jsonBackupFilePath);
    } catch (e) {
      console.error(
        'Provided backup file is not valid or cannot be accessed'
      );

      throw new Error('Server error [1]');
    }

    const keyring = new Keyring();
    let account: NamedKeyringPair;
    try {
      // Try adding and retrieving the keys in order to validate that the backup file is correct
      keyring.addFromJson(accountJsonObj);
      account = keyring.getPair(accountJsonObj.address) as NamedKeyringPair; // We can be sure it's named, because we forced it before
    } catch (e) {
      console.error('Provided backup file is not valid');
      throw new Error('Server error [2]');
    }

    return account;
  }

  async requestAccountDecoding(account: NamedKeyringPair): Promise<void> {
    // Skip if account already unlocked
    if (!account.isLocked) {
      return;
    }

    // First - try decoding using empty string
    try {
      account.decodePkcs8('');
      return;
    } catch (e) {
      // Continue...
    }

    let isPassValid = false;
    while (!isPassValid) {
      try {
        const password = process.env.ACCOUNT_PASSWORD;
        account.decodePkcs8(password);
        isPassValid = true;
      } catch (e) {
        console.warn('Invalid password... Try again.');
      }
    }
  }
}
