import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { AccountId, Hash } from "@polkadot/types/interfaces";
import { config } from "dotenv";
import BN from "bn.js";
import { Option, Vec } from "@polkadot/types";
import { log } from "./debug"
import { ActiveEra } from "./Types";

config();

export class JoyApi {
  endpoint: string;
  isReady: Promise<ApiPromise>;
  api!: ApiPromise;

  constructor(endpoint?: string) {
    const wsEndpoint = endpoint || process.env.REACT_APP_WS_PROVIDER || "ws://127.0.0.1:9944";
    this.endpoint = wsEndpoint;
    this.isReady = (async () => {
      const api = await new ApiPromise({ provider: new WsProvider(wsEndpoint), types })
        .isReadyOrError;
      return api;
    })();
  }
  get init(): Promise<JoyApi> {
    return this.isReady.then((instance) => {
      this.api = instance;
      return this;
    });
  }

  async totalIssuance(blockHash?: Hash) {
    const issuance =
      blockHash === undefined
        ? await this.api.query.balances.totalIssuance()
        : await this.api.query.balances.totalIssuance.at(blockHash);

    return issuance.toNumber();
  }

  async systemData() {
    const [chain, nodeName, nodeVersion] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version(),
      // this.api.rpc.system.peers(),
    ]);

    return {
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      // peerCount: peers.length,
    };
  }

  async finalizedHash() {
    return this.api.rpc.chain.getFinalizedHead();
  }

  async finalizedBlockHeight() {
    const finalizedHash = await this.finalizedHash();
    const { number } = await this.api.rpc.chain.getHeader(`${finalizedHash}`);
    return number.toNumber();
  }

  async getActiveErasForBlock(address: string, blockStart: number): Promise<ActiveEra[] | undefined> {
    const stash = address;
    const startHash = (await this.api.rpc.chain.getBlockHash(blockStart));
    const startEra = (await this.api.query.staking.activeEra.at(startHash)).unwrap().index.toNumber();
    const startTimestamp = new Date((await this.api.query.timestamp.now.at(startHash)).toNumber()).toISOString();
    const eraPoints = await this.api.query.staking.erasRewardPoints.at(startHash, startEra)
    let data = undefined
    eraPoints.individual.forEach((points, author) => {
      log(`Author Points [${author}]`);
      log(`Individual Points [${points}]`);
      if (author.toString() === stash) {
        const pn = Number(points.toBigInt())
        const activeEra: ActiveEra = {
          id: blockStart,
          era: startEra,
          hash: startHash.toString(),
          block: blockStart,
          date: startTimestamp,
          points: pn
        }
        log(`Era [${activeEra.era}], Block [${activeEra.block}], Date [${activeEra.date}], Points [${activeEra.points}], Hash [${activeEra.hash}]`);
        data = activeEra
      }
    });
    return data
  }

  async findActiveValidators(hash: Hash, searchPreviousBlocks: boolean): Promise<AccountId[]> {
    const block = await this.api.rpc.chain.getBlock(hash);

    let currentBlockNr = block.block.header.number.toNumber();
    let activeValidators;
    do {
      let currentHash = (await this.api.rpc.chain.getBlockHash(currentBlockNr)) as Hash;
      let allValidators = await this.api.query.staking.snapshotValidators.at(currentHash) as Option<Vec<AccountId>>;
      if (!allValidators.isEmpty) {
        let max = (await this.api.query.staking.validatorCount.at(currentHash)).toNumber();
        activeValidators = Array.from(allValidators.unwrap()).slice(0, max);
      }

      if (searchPreviousBlocks) {
        --currentBlockNr;
      } else {
        ++currentBlockNr;
      }

    } while (activeValidators === undefined);
    return activeValidators;
  }

  async validatorsData() {
    const validators = await this.api.query.session.validators();
    const era = await this.api.query.staking.currentEra();
    const totalStake = era.isSome ?
      await this.api.query.staking.erasTotalStake(era.unwrap())
      : new BN(0);

    return {
      count: validators.length,
      validators: validators.toJSON(),
      total_stake: totalStake.toNumber(),
    };
  }
}
