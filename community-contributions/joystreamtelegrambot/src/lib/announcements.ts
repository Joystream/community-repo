import {
  Api,
  Council,
  Member,
  ProposalDetail,
  Proposals,
  Summary
} from "../types";
import { BlockNumber } from "@polkadot/types/interfaces";
import { Channel, ElectionStage } from "@joystream/types/augment";
import { Category, Thread, Post } from "@joystream/types/forum";
import { domain } from "../../config";
import { formatTime } from "./util";
import {
  categoryById,
  memberHandle,
  memberHandleByAccount,
  proposalDetail
} from "./getters";
import moment from "moment";

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

export const council = async (
  api: Api,
  council: Council,
  currentBlock: number,
  sendMessage: (msg: string) => void
): Promise<Council> => {
  const round: number = await api.query.councilElection.round();
  const stage: ElectionStage | null = await api.query.councilElection.stage();
  let msg = "";
  let last = "";
  if (!stage || stage.toJSON() === null) {
    last = "elected";
    const councilEnd: BlockNumber = await api.query.council.termEndsAt();
    const termDuration: BlockNumber = await api.query.councilElection.newTermDuration();
    const block = councilEnd.toNumber() - termDuration.toNumber();
    const remainingBlocks: number = councilEnd.toNumber() - currentBlock;
    const endDate = moment()
      .add(remainingBlocks * 6, "s")
      .format("DD/MM/YYYY HH:mm");
    msg = `<a href="${domain}/#/council/members">Council ${round}</a> elected at block ${block} until block ${councilEnd}. Next election: ${endDate} (${remainingBlocks} blocks)`;
  } else {
    if (stage.isAnnouncing) {
      last = "announcing";
      const announcingPeriod: BlockNumber = await api.query.councilElection.announcingPeriod();
      const block = stage.asAnnouncing.toNumber() - announcingPeriod.toNumber();
      msg = `Announcing election for round ${round} at ${block}.<a href="${domain}/#/council/applicants">Apply now!</a>`;
    } else if (stage.isVoting) {
      last = "voting";
      const votingPeriod: BlockNumber = await api.query.councilElection.votingPeriod();
      const block = stage.asVoting.toNumber() - votingPeriod.toNumber();
      msg = `Voting stage for council election started at block ${block}. <a href="${domain}/#/council/applicants">Vote now!</a>`;
    } else if (stage.isRevealing) {
      last = "revealing";
      const revealingPeriod: BlockNumber = await api.query.councilElection.revealingPeriod();
      const block = stage.asRevealing.toNumber() - revealingPeriod.toNumber();
      msg = `Revealing stage for council election started at block ${block}. <a href="${domain}/#/council/votes">Don't forget to reveal your vote!</a>`;
    } else console.log(`[council] unrecognized stage: ${stage.toJSON()}`);
  }
  if (round !== council.round && last !== council.last) sendMessage(msg);
  return { round, last };
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

export const proposals = async (
  api: Api,
  prop: Proposals,
  sendMessage: (msg: string) => void
): Promise<Proposals> => {
  let { current, last, active, pending } = prop;
  for (let id: number = last + 1; id <= current; id++) {
    const proposal: ProposalDetail = await proposalDetail(api, id);
    const { createdAt, finalizedAt, message, parameters, result } = proposal;
    const votingEndsAt = createdAt + parameters.votingPeriod.toNumber();
    let msg = `Proposal ${id}: <b>Created</b> at block ${createdAt}.\r\n${message}\r\nYou can vote until block ${votingEndsAt}.`;

    if (proposal.stage === "Finalized") {
      let label: string = result;
      if (result === "Approved") {
        const executed = parameters.gracePeriod.toNumber() > 0 ? false : true;
        label = executed ? "Executed" : "Finalized";
      }
      msg = `Proposal ${id}: <b>${label}</b> at block ${finalizedAt}.\r\n${message}`;
    }
    sendMessage(msg);
  }

  return { current, last: current, active, pending };
};

// heartbeat

const getAverage = (array: number[]) =>
  array.reduce((a: number, b: number) => a + b, 0) / array.length;

export const heartbeat = async (
  api: Api,
  summary: Summary,
  timePassed: string,
  accountId: string,
  sendMessage: (msg: string) => void
): Promise<void> => {
  const { blocks, nominators, validators } = summary;
  const avgDuration =
    blocks.reduce((a, b) => a + b.duration, 0) / blocks.length;
  const era: any = await api.query.staking.currentEra();
  const totalStake: any = await api.query.staking.erasTotalStake(parseInt(era));
  const stakers = await api.query.staking.erasStakers(parseInt(era), accountId);
  const stakerCount = stakers.others.length;
  const avgStake = parseInt(totalStake.toString()) / stakerCount;

  console.log(`
  Blocks produced during ${timePassed}h in era ${era}: ${blocks.length}
  Average blocktime: ${Math.floor(avgDuration) / 1000} s
  Average stake: ${avgStake / 1000000} M JOY (${stakerCount} stakers)
  Average number of nominators: ${getAverage(nominators)}
  Average number of validators: ${getAverage(validators)}
`);
};

export const formatProposalMessage = (data: string[]): string => {
  const [id, title, type, stage, result, handle] = data;
  return `<b>Type</b>: ${type}\r\n<b>Proposer</b>: <a href="${domain}/#/members/${handle}">${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
};

// providers

export const provider = (
  id: number,
  address: string,
  status: string,
  sendMessage: (msg: string) => void
): void => {
  const msg = `[${formatTime()}] Storage Provider ${id} (${address}) is ${status}`;
  sendMessage(msg);
};

export const opening = (id: number, sendMessage: (msg: string) => void) => {
  const msg = `New opening: <b>Storage Provider</b> <a href="${domain}/#/working-groups/opportunities/curators/${id}">more</a>`;
  sendMessage(msg);
};
