import { formatProposalMessage } from "./announcements";
import axios from "axios";

//types

import { Api, ProposalArray, ProposalDetail } from "../types";
import {
  ChannelId,
  PostId,
  ProposalDetailsOf,
  ThreadId,
} from "@joystream/types/augment";
import { Category, CategoryId } from "@joystream/types/forum";
import { MemberId, Membership } from "@joystream/types/members";
import { Proposal } from "@joystream/types/proposals";

// channel

export const currentChannelId = async (api: Api): Promise<number> => -1;

export const memberHandle = async (api: Api, id: MemberId): Promise<string> => {
  const membership: Membership = await api.query.members.membershipById(id);
  return membership.handle.toJSON();
};

export const memberHandleByAccount = async (
  api: Api,
  account: string
): Promise<string> => {
  const id: MemberId = await api.query.members.memberIdsByRootAccountId(
    account
  );
  const handle: string = await memberHandle(api, id);
  return handle;
};

// forum

export const categoryById = async (api: Api, id: number): Promise<Category> => {
  const category: Category = await api.query.forum.categoryById(id);
  return category;
};

export const currentPostId = async (api: Api): Promise<number> => {
  const postId: PostId = await api.query.forum.nextPostId();
  return postId.toNumber() - 1;
};

export const currentThreadId = async (api: Api): Promise<number> => {
  const threadId: ThreadId = await api.query.forum.nextThreadId();
  return threadId.toNumber() - 1;
};

export const currentCategoryId = async (api: Api): Promise<number> => {
  const categoryId: CategoryId = await api.query.forum.nextCategoryId();
  return categoryId.toNumber() - 1;
};

// proposals

export const proposalCount = async (api: Api): Promise<number> =>
  Number(await api.query.proposalsEngine.proposalCount());

export const activeProposals = async (
  api: Api,
  last: number
): Promise<number[]> => {
  const count = Number(await api.query.proposalsEngine.activeProposalCount());
  let ids: number[] = [];
  for (let id = last; ids.length < count; id--) {
    const proposal = await proposalDetail(api, id);
    if (proposal.result === "Pending") ids.push(id);
  }
  return ids;
};

const getProposalType = async (api: Api, id: number): Promise<string> => {
  const details: ProposalDetailsOf = await api.query.proposalsCodex.proposalDetailsByProposalId(
    id
  );
  const [type]: string[] = Object.getOwnPropertyNames(details.toJSON());
  return type;
};

export const proposalDetail = async (
  api: Api,
  id: number
): Promise<ProposalDetail> => {
  const proposal: Proposal = await api.query.proposalsEngine.proposals(id);
  const status: { [key: string]: any } = proposal.status;
  const stage: string = status.isActive ? "Active" : "Finalized";
  const { finalizedAt, proposalStatus } = status[`as${stage}`];
  const result: string = proposalStatus
    ? (proposalStatus.isApproved && "Approved") ||
      (proposalStatus.isCanceled && "Canceled") ||
      (proposalStatus.isExpired && "Expired") ||
      (proposalStatus.isRejected && "Rejected") ||
      (proposalStatus.isSlashed && "Slashed") ||
      (proposalStatus.isVetoed && "Vetoed")
    : "Pending";
  const exec = proposalStatus ? proposalStatus["Approved"] : null;

  const { parameters, proposerId } = proposal;
  const author: string = await memberHandle(api, proposerId);
  const title: string = proposal.title.toString();
  const type: string = await getProposalType(api, id);
  const args: string[] = [String(id), title, type, stage, result, author];
  const message: { tg: string; discord: string } = formatProposalMessage(args);
  const createdAt: number = proposal.createdAt.toNumber();
  return { createdAt, finalizedAt, parameters, message, stage, result, exec };
};

export const fetchTokenValue = async () => {
  const { data } = await axios.get("https://status.joystream.org/status");
  return data ? `${Math.floor(+data.price * 100000000) / 100} $` : `?`;
};

export const fetchStorageSize = async () => {
  const dashboard = "https://analytics.dapplooker.com/api/public/dashboard";
  const asset = "c70b56bd-09a0-4472-a557-796afdc64d3b/card/155";

  const { data } = await axios.get(`${dashboard}/${asset}`);

  const size = Math.round(data.data.rows[0][0]) + "GB";
  return size;
};
