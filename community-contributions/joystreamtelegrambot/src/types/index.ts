import { ApiPromise } from "@polkadot/api";
import { MemberId } from "@joystream/types/members";
import { AnyJson } from "@polkadot/types/types/helpers";
import { ProposalParameters, ProposalStatus } from "@joystream/types/proposals";

export interface Api {
  query: any;
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
}

export type ProposalArray = number[];

export interface Proposals {
  current: number;
  last: number;
  active: ProposalArray;
  pending: ProposalArray;
}

export interface Member {
  id: MemberId;
  handle: string;
  url?: string;
}
