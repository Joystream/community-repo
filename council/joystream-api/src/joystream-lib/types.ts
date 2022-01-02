import { AccountId, AccountData } from "@polkadot/types/interfaces";
import { GenericEventData } from "@polkadot/types/generic/Event";
import { MemberId } from "@joystream/types/members";
import { Stake } from "@joystream/types/stake";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { VotingResults } from "@joystream/types/augment/all";

export interface AccountBalance {
  accountId: string;
  balance: AccountData;
}

export interface ElectionInfo {
  durations: number[];
  stage: any;
  round: number;
  stageEndsAt: number;
  termEndsAt: number;
}

export interface Vote {
  vote: string;
  handle: string;
}

export interface ProposalDetail {
  created: number;
  finalizedAt: number;
  message: string;
  parameters: string;
  stage: any;
  result: string;
  exec: any;
  id: number;
  title: string;
  description: any;
  votes: VotingResults;
  type: string;
  votesByAccount?: Vote[];
  author?: string;
  authorId: number;
}

export interface SpendingProposal {
  id: number;
  title: string;
  amount: number;
}

export interface Round {
  round: number;
  start: number;
  end: number;
}

export class Bounty {
  constructor(
    public testnet: string,
    public proposalId: number,
    public title: string,
    public status: string,
    public amountAsked: number,
    public amountMinted: number
  ) {}
}

export class CacheEvent {
  constructor(
    public section: string,
    public method: string,
    public data: GenericEventData
  ) {}
}

export interface BlockEvent {
  blockId: number;
  section: string;
  method: string;
  data: string;
}

export interface WorkerReward {
  id: number;
  memberId: MemberId;
  account: AccountId;
  handle: string;
  stake: Stake;
  reward: RewardRelationship;
  status: string;
}

// status endpoint at https://status.joystream.org/status
export interface StatusData {
  burns: Burn[];
  dollarPoolChanges: DollarPoolChange[];
  exchanges: Exchange[];
  extecutedBurnsAmount: number;
  price: string;
  totalIssuance: string;
  validators: { total_stake: string };
}

export interface DollarPoolChange {
  blockHeight: number;
  blockTime: string;
  change: number;
  reason: string;
  issuance: number;
  valueAfter: number;
  rateAfter: number;
}

export interface Burn {
  amount: number;
  blockHeight: number;
  date: string;
  logTime: string;
}

export interface Exchange {
  amount: number;
  amountUSD: number;
  blockHeight: number;
  date: string;
  logTime: string;
  price: number;
  recipient: string;
  sender: string;
  senderMemo: string;
  status: string;
  xmrAddress: string;
}
