import { ApiPromise } from "@polkadot/api";
import { MemberId } from "@joystream/types/members";
import { AnyJson } from "@polkadot/types/types/helpers";
import { ProposalParameters, ProposalStatus } from "@joystream/types/proposals";
import { Nominations } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types/codec";
import { StorageKey } from "@polkadot/types/primitive";

export interface Api {
  query: any;
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
}

export type ProposalArray = number[];

export interface Proposals {
  current: number;
  last: number;
  active: ProposalArray;
  executing: ProposalArray;
}

export interface Member {
  id: MemberId;
  handle: string;
  url?: string;
}

export interface Block {
  id: number;
  timestamp: number;
  duration: number;
  stake: number;
  noms: number;
  vals: number;
  issued: number;
  reward: number;
}

export type Send = (msg: string, channel: any) => void;
