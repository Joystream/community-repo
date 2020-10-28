import { Api, Member, ProposalDetail, Proposals } from "../types";
import { BlockNumber } from "@polkadot/types/interfaces";
import { Channel, ElectionStage } from "@joystream/types/augment";
import { Category, Thread, Post } from "@joystream/types/forum";
import { domain } from "../../config";
import {
  categoryById,
  memberHandle,
  memberHandleByAccount,
  proposalDetail
} from "./getters";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const query = async (test: string, cb: () => Promise<any>): Promise<any> => {
  let result = await cb();
  for (let i: number = 0; i < 10; i++) {
    if (result[test] !== "") return result;
    result = await cb();
    await sleep(5000);
  }
};

export const channels = async (
  api: Api,
  channels: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = channels;
  const messages: string[] = [];

  for (let id: number = last + 1; id <= current; id++) {
    const channel: Channel = await query("title", () =>
      api.query.contentWorkingGroup.channelById(id)
    );
    const member: Member = { id: channel.owner, handle: "", url: "" };
    member.handle = await memberHandle(api, member.id.toJSON());
    member.url = `${domain}/#/members/${member.handle}`;
    messages.push(
      `<b>Channel <a href="${domain}/#//media/channels/${id}">${channel.title}</a> by <a href="${member.url}">${member.handle} (${member.id})</a></b>`
    );
  }
  sendMessage(messages.join("\r\n\r\n"));
  return current;
};

export const councils = async (
  api: Api,
  currentBlock: number,
  sendMessage: (msg: string) => void
): Promise<number> => {
  let lastBlock: number = currentBlock;
  const round: number = await api.query.councilElection.round();
  const stage: ElectionStage | null = await api.query.councilElection.stage();
  let msg = "";
  if (!stage) {
    const councilEnd: BlockNumber = await api.query.council.termEndsAt();
    lastBlock = councilEnd.toNumber();
    const termDuration: BlockNumber = await api.query.councilElection.newTermDuration();
    const block = lastBlock - termDuration.toNumber();
    msg = `<a href="${domain}/#/council/members">Council for round ${round}</a> has been elected at block ${block} until block ${councilEnd}.`;
  } else {
    if (stage.isAnnouncing) {
      lastBlock = stage.asAnnouncing.toNumber();
      const announcingPeriod: BlockNumber = await api.query.councilElection.announcingPeriod();
      const block = lastBlock - announcingPeriod.toNumber();
      msg = `Announcing election for round ${round} at ${block}.<a href="${domain}/#/council/applicants">Apply now!</a>`;
    } else if (stage.isVoting) {
      lastBlock = stage.asVoting.toNumber();
      const votingPeriod: BlockNumber = await api.query.councilElection.votingPeriod();
      const block = lastBlock - votingPeriod.toNumber();
      msg = `Voting stage for council election started at block ${block}. <a href="${domain}/#/council/applicants">Vote now!</a>`;
    } else if (stage.isRevealing) {
      lastBlock = stage.asRevealing.toNumber();
      const revealingPeriod: BlockNumber = await api.query.councilElection.revealingPeriod();
      const block = lastBlock - revealingPeriod.toNumber();
      msg = `Revealing stage for council election started at block ${block}. <a href="${domain}/#/council/votes">Don't forget to reveal your vote!</a>`;
    }
  }
  sendMessage(msg);
  return lastBlock;
};

// forum

export const categories = async (
  api: Api,
  category: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const messages: string[] = [];
  let id: number = category[0] + 1;
  for (id; id <= category[1]; id++) {
    const cat: Category = await query("title", () => categoryById(api, id));
    const msg = `Category ${id}: <b><a href="${domain}/#/forum/categories/${id}">${cat.title}</a></b>`;
    messages.push(msg);
  }
  sendMessage(messages.join("\r\n\r\n"));
  return category[1];
};

export const posts = async (
  api: Api,
  posts: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = posts;
  const messages: string[] = [];
  let id: number = last + 1;
  for (id; id <= current; id++) {
    const post: Post = await query("current_text", () =>
      api.query.forum.postById(id)
    );
    const replyId: number = post.nr_in_thread.toNumber();
    const message: string = post.current_text;
    const excerpt: string = message.substring(0, 100);
    const threadId: number = post.thread_id.toNumber();
    const thread: Thread = await query("title", () =>
      api.query.forum.threadById(threadId)
    );
    const threadTitle: string = thread.title;
    const category: Category = await query("title", () =>
      categoryById(api, thread.category_id.toNumber())
    );
    const handle = await memberHandleByAccount(api, post.author_id.toJSON());
    const msg = `<b><a href="${domain}/#/members/${handle}">${handle}</a> posted <a href="${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}">${threadTitle}</a> in <a href="${domain}/#/forum/categories/${category.id}">${category.title}</a>:</b>\n\r<i>${excerpt}</i> <a href="${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}">more</a>`;
    messages.push(msg);
  }
  sendMessage(messages.join("\r\n\r\n"));
  return current;
};

export const threads = async (
  api: Api,
  threads: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = threads;
  const messages: string[] = [];
  let id: number = last + 1;
  for (id; id <= current; id++) {
    const thread: Thread = await query("title", () =>
      api.query.forum.threadById(id)
    );
    const { title, author_id } = thread;
    const handle: string = await memberHandleByAccount(api, author_id.toJSON());
    const category: Category = await query("title", () =>
      categoryById(api, thread.category_id.toNumber())
    );
    const msg = `Thread ${id}: <a href="${domain}/#/forum/threads/${id}">"${title}"</a> by <a href="${domain}/#/members/${handle}">${handle}</a> in category "<a href="${domain}/#/forum/categories/${category.id}">${category.title}</a>" `;
    messages.push(msg);
  }
  sendMessage(messages.join("\r\n\r\n"));
  return id;
};

// proposals

const processActive = async (
  id: number,
  details: ProposalDetail,
  sendMessage: (s: string) => void
): Promise<boolean> => {
  const { createdAt, finalizedAt, message, parameters, result } = details;
  let msg = `Proposal ${id} <b>created</b> at block ${createdAt}.\r\n${message}`;
  if (details.stage === "Finalized") {
    let label: string = result;
    if (result === "Approved") {
      const executed = parameters.gracePeriod.toNumber() > 0 ? false : true;
      label = executed ? "Finalized" : "Executed";
    }
    msg = `Proposal ${id} <b>${label}</b> at block ${finalizedAt}.\r\n${message}`;
    sendMessage(msg);
    return true;
  } else return processPending(id, details, sendMessage);
};

const processPending = async (
  id: number,
  details: ProposalDetail,
  sendMessage: (s: string) => void
): Promise<boolean> => {
  const { createdAt, message, parameters, stage } = details;
  if (stage === "Finalized") return processActive(id, details, sendMessage);
  const votingEndsAt = createdAt + parameters.votingPeriod.toNumber();
  const msg = `Proposal ${id} <b>created</b> at block ${createdAt}.\r\n${message}\r\nYou can vote until block ${votingEndsAt}.`;
  sendMessage(msg);
  return true;
};

export const proposals = async (
  api: Api,
  prop: Proposals,
  sendMessage: (msg: string) => void
): Promise<Proposals> => {
  let { current, last, active, pending } = prop;

  for (let id: number = last++; id <= current; id++) active.push(id);

  for (const id of active)
    if (processActive(id, await proposalDetail(api, id), sendMessage))
      active = active.filter((e: number) => e !== id);

  for (const id of pending)
    if (processPending(id, await proposalDetail(api, id), sendMessage))
      pending = pending.filter((e: number) => e !== id);

  return { current, last: current, active, pending };
};

export const formatProposalMessage = (data: string[]): string => {
  const [id, title, type, stage, result, handle] = data;
  return `<b>Type</b>: ${type}\r\n<b>Proposer</b>:<a href="${domain}/#/members/${handle}"> ${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
};
