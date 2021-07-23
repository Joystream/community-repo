import {
  Api,
  Block,
  Council,
  Member,
  ProposalDetail,
  Proposals,
  Send,
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
  fetchTokenValue,
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
  sendMessage: Send,
  channel: any
): Promise<number> => {
  const [last, current] = channels;
  const messages: string[] = [];

  for (let id: number = +last + 1; id <= current; id++) {
    const channel: Channel = await query("title", () =>
      api.query.contentWorkingGroup.channelById(id)
    );
    const member: Member = { id: channel.owner.asMember, handle: "", url: "" };
    member.handle = await memberHandle(api, member.id);
    member.url = `${domain}/#/members/${member.handle}`;
    messages.push(
      `<b>Channel <a href="${domain}/#//media/channels/${id}">${id}</a> by <a href="${member.url}">${member.handle} (${member.id})</a></b>`
    );
  }
  sendMessage(messages.join("\r\n\r\n"), channel);
  return current;
};

// announce council change

export const council = async (
  api: Api,
  council: Council,
  currentBlock: number,
  sendMessage: Send,
  channel: any
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
      const remainingBlocks = councilEnd.toNumber() - currentBlock;
      const m = moment().add(remainingBlocks * 6, "s");
      const endDate = formatTime(m, "DD/MM/YYYY");

      const handles: string[] = await Promise.all(
        (await api.query.council.activeCouncil()).map(
          async (seat: { member: string }) =>
            await memberHandleByAccount(api, seat.member)
        )
      );
      const members = handles.join(", ");

      msg = `Council election ended: ${members} have been elected for <a href="${domain}/#/council/members">council ${round}</a>. Congratulations!\nNext election starts on ${endDate}.`;
    }
  } else {
    const remainingBlocks = stage.toJSON()[stageString] - currentBlock;
    const m = moment().add(remainingBlocks * 6, "second");
    const endDate = formatTime(m, "DD-MM-YYYY HH:mm (UTC)");

    if (stageString === "Announcing")
      msg = `Council election started. You can <b><a href="${domain}/#/council/applicants">announce your application</a></b> until ${endDate}`;
    else if (stageString === "Voting")
      msg = `Council election: <b><a href="${domain}/#/council/applicants">Vote</a></b> until ${endDate}`;
    else if (stageString === "Revealing")
      msg = `Council election: <b><a href="${domain}/#/council/votes">Reveal your votes</a></b> until ${endDate}`;
  }

  if (
    council.last !== "" &&
    round !== council.round &&
    stageString !== council.last
  )
    sendMessage(msg, channel);
  return { round, last: stageString };
};

// forum
// announce latest categories
export const categories = async (
  api: Api,
  category: number[],
  sendMessage: Send,
  channel: any
): Promise<number> => {
  if (category[0] === category[1]) return category[0];
  const messages: string[] = [];

  for (let id: number = +category[0] + 1; id <= category[1]; id++) {
    const cat: Category = await query("title", () => categoryById(api, id));
    const msg = `Category ${id}: <b><a href="${domain}/#/forum/categories/${id}">${cat.title}</a></b>`;
    messages.push(msg);
  }

  sendMessage(messages.join("\r\n\r\n"), channel);
  return category[1];
};

// announce latest posts
export const posts = async (
  api: Api,
  posts: number[],
  sendMessage: Send,
  channel: any
): Promise<number> => {
  const [last, current] = posts;
  if (current === last) return last;
  const messages: string[] = [];

  for (let id: number = +last + 1; id <= current; id++) {
    const post: Post = await query("current_text", () =>
      api.query.forum.postById(id)
    );
    const replyId: number = post.nr_in_thread.toNumber();
    const threadId: number = post.thread_id.toNumber();
    const thread: Thread = await query("title", () =>
      api.query.forum.threadById(threadId)
    );
    const categoryId = thread.category_id.toNumber();
    if (categoryId === 19 || categoryId === 38) continue; // hide: 19 Media, 38 Russian
    if ([180, 265, 275].includes(threadId)) continue;
    // 180 tokens, 265 faucet, 275 pets

    const category: Category = await query("title", () =>
      categoryById(api, categoryId)
    );
    const handle = await memberHandleByAccount(api, post.author_id.toJSON());

    const s = {
      author: `<a href="${domain}/#/members/${handle}">${handle}</a>`,
      thread: `<a href="${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}">${thread.title}</a>`,
      category: `<a href="${domain}/#/forum/categories/${category.id}">${category.title}</a>`,
      content: `<i>${post.current_text.substring(0, 150)}</i> `,
      link: `<a href="${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}">more</a>`,
    };

    messages.push(
      `<u>${s.category}</u> <b>${s.author}</b> posted in <b>${s.thread}</b>:\n\r${s.content}${s.link}`
    );
  }

  sendMessage(messages.join("\r\n\r\n"), channel);
  return current;
};

// announce latest proposals
export const proposals = async (
  api: Api,
  prop: Proposals,
  block: number,
  sendMessage: Send,
  channel: any
): Promise<Proposals> => {
  let { current, last, active, executing } = prop;

  for (let id: number = +last + 1; id <= current; id++) {
    const proposal: ProposalDetail = await proposalDetail(api, id);
    const { createdAt, finalizedAt, message, parameters, result } = proposal;
    const votingEndsAt = createdAt + parameters.votingPeriod.toNumber();
    const endTime = moment()
      .add(6 * (votingEndsAt - block), "second")
      .format("DD/MM/YYYY HH:mm");
    const msg = `Proposal ${id} <b>created</b> at block ${createdAt}.\r\n${message}\r\nYou can vote until ${endTime} UTC (block ${votingEndsAt}).`;
    sendMessage(msg, channel);
    active.push(id);
  }

  for (const id of active) {
    const proposal: ProposalDetail = await proposalDetail(api, id);
    const { finalizedAt, message, parameters, result, stage } = proposal;
    if (stage === "Finalized") {
      let label: string = result.toLowerCase();
      if (result === "Approved") {
        const executed = parameters.gracePeriod.toNumber() > 0 ? false : true;
        label = executed ? "executed" : "finalized";
        if (!executed) executing.push(id);
      }
      const msg = `Proposal ${id} <b>${label}</b> at block ${finalizedAt}.\r\n${message}`;
      sendMessage(msg, channel);
      active = active.filter((a) => a !== id);
    }
  }

  for (const id of executing) {
    const proposal = await proposalDetail(api, id);
    const { finalizedAt, message, parameters } = proposal;
    const executesAt = +finalizedAt + parameters.gracePeriod.toNumber();
    if (block < executesAt) continue;
    const msg = `Proposal ${id} <b>executed</b> at block ${executesAt}.\r\n${message}`;
    sendMessage(msg, channel);
    executing = executing.filter((e) => e !== id);
  }

  return { current, last: current, active, executing };
};

// heartbeat

const getAverage = (array: number[]): number =>
  array.reduce((a: number, b: number) => a + b, 0) / array.length;

export const heartbeat = async (
  api: Api,
  blocks: Block[],
  timePassed: string,
  proposals: Proposals,
  sendMessage: Send,
  channel: any
): Promise<[]> => {
  const price = await fetchTokenValue();
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

  const pending = proposals.active.length;
  const finalized = proposals.executing.length;
  const p = (n: number) => (n > 1 ? "proposals" : "proposal");
  let proposalString = pending
    ? `<a href="${domain}/#/proposals">${pending} pending ${p(pending)}</a> `
    : "";
  if (finalized)
    proposalString += `${finalized} ${p(finalized)} in grace period.`;

  const msg = `  ${blocks.length} blocks produced in ${timePassed}
  Blocktime: ${blocktime.toFixed(3)}s
  Price: ${price}
  Stake: ${avgStake.toFixed(1)} / ${avgIssued.toFixed()} M tJOY (${percent}%)
  Validators: ${avgVals.toFixed()} (${reward} tJOY/h)
  Nominators: ${getAverage(noms).toFixed()}
  ${proposalString}`;

  sendMessage(msg, channel);
  return [];
};

export const formatProposalMessage = (data: string[]): string => {
  const [id, title, type, stage, result, handle] = data;
  return `<b>Type</b>: ${type}\r\n<b>Proposer</b>: <a href="${domain}/#/members/${handle}">${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
};
