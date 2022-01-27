import { MemberId } from "@joystream/types/members";
import { Post } from "@joystream/types/forum";
import { ParseMode } from "node-telegram-bot-api";
import { ProposalId } from "@joystream/types/proposals";

export interface Council {
  round: number;
  last: string;
  seats: MemberHandles[];
}

export interface Options {
  verbose: number;
  channel: boolean;
  council: boolean;
  forum: boolean;
  proposals: boolean;
}

export interface Proposals {
  current: number;
  last: number;
  active: ProposalId[];
  executing: number[];
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

export type Send = (
  msg: { tg: string; discord: string; tgParseMode: ParseMode | undefined },
  channel: any
) => void;

// github
export interface MemberHandles {
  memberId: MemberId;
  handle: string;
  discord?: { handle: string; id: number };
  telegram?: string;
}

// jstats
export interface ProposalVotes {
  id: ProposalId;
  title: string;
  votes: { memberId: MemberId; vote: string }[];
}
