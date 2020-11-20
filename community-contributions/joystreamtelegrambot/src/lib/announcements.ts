import {
  Api,
  Block,
  Council,
  Member,
  ProposalDetail,
  Proposals,
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
  proposalDetail,
} from "./getters";
import moment from "moment";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// query API repeatedly to ensure a result
const query = async (test: string, cb: () => Promise<any>): Promise<any> => {
  let result = await cb();
  for (let i: number = 0; i < 10; i++) {
    if (result[test] !== "") return result;
    result = await cb();
    await sleep(5000);
  }
};

// announce latest channels
export const channels = async (
  api: Api,
  channels: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = channels;
  const messages: string[] = [];

  for (let id: number = +last + 1; id <= current; id++) {
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

// announce council change

export const council = async (
  api: Api,
  council: Council,
  currentBlock: number,
  sendMessage: (msg: string) => void
): Promise<Council> => {
  const round: number = await api.query.councilElection.round();
  const stage: any = await api.query.councilElection.stage();
  const stageObj = JSON.parse(JSON.stringify(stage));
  let stageString = stageObj ? Object.keys(stageObj)[0] : "";
  let msg = "";

  if (!stage || stage.toJSON() === null) {
    stageString = "elected";
    const councilEnd: BlockNumber = await api.query.council.termEndsAt();
    const termDuration: BlockNumber = await api.query.councilElection.newTermDuration();
    const block = councilEnd.toNumber() - termDuration.toNumber();
    if (currentBlock - block < 2000) {
      const remainingBlocks: number = councilEnd.toNumber() - currentBlock;
      const endDate = moment()
        .add(remainingBlocks * 6, "s")
        .format("DD/MM/YYYY");

      const handles: string[] = await Promise.all(
        (await api.query.council.activeCouncil()).map(
          async (seat: { member: string }) =>
            await memberHandleByAccount(api, seat.member)
        )
      );
      const members = handles.join(", ");

      msg = `${members} have been elected for <a href="${domain}/#/council/members">council ${round}</a>. Congratulations!\nNext election starts on ${endDate}.`;
    }
  } else {
    if (stageString === "Announcing") {
      const announcingPeriod: BlockNumber = await api.query.councilElection.announcingPeriod();
      msg = `Announcing election for round ${round} started.<a href="${domain}/#/council/applicants">Apply now!</a>`;
    } else if (stageString === "Voting") {
      const votingPeriod: BlockNumber = await api.query.councilElection.votingPeriod();
      msg = `Voting stage for council election started. <a href="${domain}/#/council/applicants">Vote now!</a>`;
    } else if (stageString === "Revealing") {
      const revealingPeriod: BlockNumber = await api.query.councilElection.revealingPeriod();
      msg = `Revealing stage for council election started. <a href="${domain}/#/council/votes">Don't forget to reveal your vote!</a>`;
    } else console.log(`[council] unrecognized stage: ${stageString}`);
  }

  if (round !== council.round && stageString !== council.last) sendMessage(msg);
  return { round, last: stageString };
};

// forum
// announce latest categories
export const categories = async (
  api: Api,
  category: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const messages: string[] = [];

  for (let id: number = +category[0] + 1; id <= category[1]; id++) {
    const cat: Category = await query("title", () => categoryById(api, id));
    const msg = `Category ${id}: <b><a href="${domain}/#/forum/categories/${id}">${cat.title}</a></b>`;
    messages.push(msg);
  }

  sendMessage(messages.join("\r\n\r\n"));
  return category[1];
};

// announce latest posts
export const posts = async (
  api: Api,
  posts: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = posts;
  const messages: string[] = [];

  for (let id: number = +last + 1; id <= current; id++) {
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

// announce latest threads
export const threads = async (
  api: Api,
  threads: number[],
  sendMessage: (msg: string) => void
): Promise<number> => {
  const [last, current] = threads;
  const messages: string[] = [];

  for (let id: number = +last + 1; id <= current; id++) {
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
  return current;
};

// announce latest proposals
export const proposals = async (
  api: Api,
  prop: Proposals,
  block: number,
  sendMessage: (msg: string) => void
): Promise<Proposals> => {
  let { current, last, active, executing } = prop;

  for (let id: number = +last + 1; id <= current; id++) {
    const proposal: ProposalDetail = await proposalDetail(api, id);
    const { createdAt, finalizedAt, message, parameters, result } = proposal;
    const votingEndsAt = createdAt + parameters.votingPeriod.toNumber();
    const msg = `Proposal ${id} <b>created</b> at block ${createdAt}.\r\n${message}\r\nYou can vote until block ${votingEndsAt}.`;
    sendMessage(msg);
    active.push(id);
  }

  for (const id of active) {
    const proposal: ProposalDetail = await proposalDetail(api, id);
    const { finalizedAt, message, parameters, result, stage } = proposal;
    if (stage === "Finalized") {
      let label: string = result;
      if (result === "Approved") {
        const executed = parameters.gracePeriod.toNumber() > 0 ? false : true;
        label = executed ? "Executed" : "Finalized";
        if (!executed) executing.push(id);
      }
      const msg = `Proposal ${id} <b>${label}</b> at block ${finalizedAt}.\r\n${message}`;
      sendMessage(msg);
      active = active.filter((a) => a !== id);
    }
  }

  for (const id of executing) {
    const proposal = await proposalDetail(api, id);
    const { exec, finalizedAt, message, parameters } = proposal;
    const executesAt = +finalizedAt + parameters.gracePeriod.toNumber();
    if (block < executesAt) continue;
    const execStatus = exec ? Object.keys(exec)[0] : "";
    const label = execStatus === "Executed" ? "has been" : "failed to be";
    const msg = `Proposal ${id} <b>${label} executed</b> at block ${executesAt}.\r\n${message}`;
    sendMessage(msg);
    executing = executing.filter((e) => e !== id);
  }

  return { current, last: current, active, executing };
};

// heartbeat

const getAverage = (array: number[]): number =>
  array.reduce((a: number, b: number) => a + b, 0) / array.length;

export const heartbeat = (
  api: Api,
  blocks: Block[],
  timePassed: string,
  proposals: Proposals,
  sendMessage: (msg: string) => void
): [] => {
  const durations = blocks.map((b) => b.duration);
  const blocktime = getAverage(durations) / 1000;

  const stake = blocks.map((b) => b.stake);
  const avgStake = getAverage(stake) / 1000000;
  const issued = blocks.map((b) => b.issued);
  const avgIssued = getAverage(issued) / 1000000;
  const percent = ((100 * avgStake) / avgIssued).toFixed(2);

  const noms = blocks.map((b) => b.noms);
  const vals = blocks.map((b) => b.vals);
  const avgVals = getAverage(vals);
  const totalReward = blocks.map((b) => b.reward);
  const avgReward = getAverage(totalReward);
  const reward = (avgReward / avgVals).toFixed();

  const active = proposals.active.length;
  const executing = proposals.executing.length;
  const p = (n: number) => (n > 1 ? "proposals" : "proposal");
  let props = active
    ? `\n<a href="${domain}/#/proposals">${active} active ${p(active)}</a> `
    : "";
  if (executing) props += `{executing} ${p(executing)} to be executed.`;

  sendMessage(
    `  ${blocks.length} blocks produced in ${timePassed}h
  Blocktime: ${blocktime.toFixed(3)}s
  Stake: ${avgStake.toFixed(1)} / ${avgIssued.toFixed()} M tJOY (${percent}%)
  Validators: ${avgVals.toFixed()} (${reward} tJOY/h)
  Nominators: ${getAverage(noms).toFixed()}` + props
  );

  return [];
};

export const formatProposalMessage = (data: string[]): string => {
  const [id, title, type, stage, result, handle] = data;
  return `<b>Type</b>: ${type}\r\n<b>Proposer</b>: <a href="${domain}/#/members/${handle}">${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
};
