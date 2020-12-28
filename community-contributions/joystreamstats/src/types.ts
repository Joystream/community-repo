import { ApiPromise } from "@polkadot/api";
import { MemberId } from "@joystream/types/members";
import {
  ProposalParameters,
  ProposalStatus,
  VotingResults,
} from "@joystream/types/proposals";
import { AccountId, Nominations } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types/codec";
import { StorageKey } from "@polkadot/types/primitive";

export interface Api {
  query: any;
  rpc: any;
}

export interface IState {
  //gethandle: (account: AccountId | string)  => string;
  now: number;
  block: number;
  blocks: Block[];
  nominators: string[];
  validators: string[];
  loading: boolean;
  councils: number[][];
  councilElection?: { stage: any; round: number; termEndsAt: number };
  channels: number[];
  proposals: ProposalDetail[];
  posts: number[];
  categories: number[];
  threads: Thread[];
  domain: string;
  proposalCount: number;
  proposalPosts: any[];
  handles: Handles;
  members: Member[];
  tokenomics?: Tokenomics;
  reports: { [key: string]: string };
  [key: string]: any;
}

export interface Seat {
  member: AccountId;
}

export interface Council {
  round: number;
  last: string;
}

export interface Options {
  verbose: number;
  channel: boolean;
  council: boolean;
  forum: boolean;
  proposals: boolean;
}

export interface ProposalDetail {
  createdAt: number;
  finalizedAt: number;
  message: string;
  parameters: ProposalParameters;
  stage: string;
  result: string;
  exec: any;
  id: number;
  title: string;
  description: any;
  votes: VotingResults;
  type: string;
  votesByMemberId?: Vote[];
}

export interface Vote {
  vote: string;
  memberId: number;
}

export type ProposalArray = number[];

export interface ProposalPost {
  threadId: number;
  text: string;
  id: number;
}

export interface Proposals {
  current: number;
  last: number;
  active: ProposalArray;
  executing: ProposalArray;
}

export interface Member {
  account: AccountId | string;
  handle: string;
  id: MemberId | number;
}

export interface Block {
  id: number;
  timestamp: number;
  duration: number;
}

export interface Summary {
  blocks: Block[];
  validators: number[];
  nominators: number[];
}

export type NominatorsEntries = [StorageKey, Option<Nominations>][];

export interface ProviderStatus {
  [propName: string]: boolean;
}

export interface Handles {
  [key: string]: string;
}

export interface Thread {}

export interface Tokenomics {
  price: string;
  totalIssuance: string;
  validators: { total_stake: string };
  burns: Burn[];
  exchanges: Exchange[];
  extecutedBurnsAmount: number;
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
