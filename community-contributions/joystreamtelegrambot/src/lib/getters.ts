import { Api, Proposals, ProposalArray, ProposalDetail } from "../types";
import {
  ChannelId,
  ElectionStage,
  PostId,
  ProposalDetailsOf,
  ThreadId
} from "@joystream/types/augment";
import { Category, CategoryId } from "@joystream/types/forum";
import { MemberId, Membership } from "@joystream/types/members";
import { Proposal, ProposalStatus } from "@joystream/types/proposals";

import { formatProposalMessage } from "./announcements";
import { domain } from "../../config";

// channel

export const currentChannelId = async (api: Api): Promise<number> => {
  const id: ChannelId = await api.query.contentWorkingGroup.nextChannelId();
  return id.toNumber() - 1;
};

export const memberHandle = async (api: Api, id: number): Promise<string> => {
  const membership: Membership = await api.query.members.membershipById(id);
  return membership.handle.toJSON();
};

export const memberHandleByAccount = async (
  api: Api,
  account: string
): Promise<string> => {
  const id: number = await api.query.members.memberIdsByRootAccountId(account);
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

export const proposalCount = async (api: Api): Promise<number> => {
  const proposalCount: number = await api.query.proposalsEngine.proposalCount();
  return proposalCount || 0;
};

const activeProposalCount = async (api: Api): Promise<number> => {
  const proposalCount: number = await api.query.proposalsEngine.activeProposalCount();
  return proposalCount || 0;
};

export const pendingProposals = async (api: Api): Promise<ProposalArray> => {
  const pending: ProposalArray = await api.query.proposalsEngine.pendingExecutionProposalIds(
    await activeProposalCount(api)
  );
  //const pending: ProposalArray = pendingProposals.toJSON();
  if (pending.length) console.debug("pending proposals", pending);
  return pending;
};

export const activeProposals = async (api: Api): Promise<ProposalArray> => {
  const active: ProposalArray = await api.query.proposalsEngine.activeProposalIds(
    await activeProposalCount(api)
  );
  //const active: ProposalArray = result.toJSON();
  if (active.length) console.debug("active proposals", active);
  return active;
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
  const { parameters, proposerId, description } = proposal;
  const author: string = await memberHandle(api, proposerId.toNumber());
  const createdAt: number = proposal.createdAt.toNumber();
  const title: string = proposal.title.toString();
  const proposerHandle: string = await memberHandle(api, proposerId.toJSON());
  const status: { [key: string]: any } = proposal.status;
  const stage: string = status.isActive ? "Active" : "Finalized";
  const { finalizedAt, proposalStatus } = status[`as${stage}`];
  const type: string = await getProposalType(api, id);
  const result: string = proposalStatus
    ? (proposalStatus.isApproved && "Approved") ||
      (proposalStatus.isCanceled && "Canceled") ||
      (proposalStatus.isExpired && "Expired") ||
      (proposalStatus.isRejected && "Rejected") ||
      (proposalStatus.isSlashed && "Slashed") ||
      (proposalStatus.isVetoed && "Vetoed")
    : "Pending";

  const message: string = formatProposalMessage([
    String(id),
    title,
    type,
    stage,
    result,
    author
  ]);
  const proposalDetail: ProposalDetail = {
    createdAt,
    finalizedAt,
    parameters,
    message,
    stage,
    result
  };
  return proposalDetail;
};
