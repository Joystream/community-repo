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

// api

export const timestamp = async (api: Api) =>
  (await api.query.timestamp.now()).toNumber();

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
  let count = 0;
  try {
    console.log(`fetching active proposal count`);
    count = Number(await api.query.proposalsEngine.activeProposalCount());
  } catch (e) {
    console.error(`failed to fetch active proposal count: ${e.message}`);
  }
  let ids: number[] = [];
  for (let id = last; ids.length < count; id--) {
    if ([837, 839].includes(id)) continue;
    try {
      console.log(`fetching proposal ${id}`);
      const proposal = await proposalDetail(api, id);
      if (proposal && proposal.result === "Pending") ids.push(id);
    } catch (e) {
      console.error(`Failed to fetch proposal ${id}: ${e.message}`);
    }
  }
  return ids;
};

const getProposalType = async (api: Api, id: number): Promise<string> => {
  const details: ProposalDetailsOf =
    await api.query.proposalsCodex.proposalDetailsByProposalId(id);
  const [type]: string[] = Object.getOwnPropertyNames(details.toJSON());
  return type;
};

export const proposalDetail = async (
  api: Api,
  id: number
): Promise<ProposalDetail | undefined> => {
  let proposal: Proposal;
  try {
    proposal = await api.query.proposalsEngine.proposals(id);
    if (!proposal) return;
  } catch (e) {
    console.log(`Failed to fetch proposal detail ${id}`);
    return;
  }
  const status: { [key: string]: any } = proposal.status;
  if (!status) return;
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
  const { parameters, proposerId } = proposal;
  const author: string = await memberHandle(api, proposerId);
  const title: string = proposal.title.toString();
  const type: string = await getProposalType(api, id);
  const args: string[] = [String(id), title, type, stage, result, author];
  const message: { tg: string; discord: string } = formatProposalMessage(args);
  const createdAt: number = proposal.createdAt.toNumber();
  return { id, createdAt, finalizedAt, parameters, message, stage, result };
};

// status endpoint

export const fetchTokenValue = async (): Promise<string> =>
  axios
    .get("https://status.joystream.org/status")
    .then(({ data }) => `${Math.floor(+data.price * 100000000) / 100} $`)
    .catch((e) => {
      console.log(`Failed to fetch status.`);
      return `?`;
    });

// hdyra

export const fetchStorageSize = async () => {
  const dashboard = "https://analytics.dapplooker.com/api/public/dashboard";
  const asset = "c70b56bd-09a0-4472-a557-796afdc64d3b/card/155";

  const { data } = await axios.get(`${dashboard}/${asset}`);

  const size = Math.round(data.data.rows[0][0]) + " GB";
  return size;
};
