import { ParseMode } from "node-telegram-bot-api";

import {
  getBlockHash,
  getCouncil,
  getCouncilRound,
  getCouncilElectionStatus,
  getPost,
  getThread,
  getCategory,
  getMemberHandle,
  getMemberHandleByAccount,
  getProposal,
} from "./lib/api";
import { fetchTokenValue, formatTime } from "./util";
import moment, { now } from "moment";

// types
import { Block, Council, Member, MemberHandles, Send } from "./types";
import { Proposals, ProposalVotes } from "./types";
import { ProposalDetail } from "./lib/types";
import { ApiPromise } from "@polkadot/api";
import { AccountId, BlockNumber } from "@polkadot/types/interfaces";
import { Channel, ElectionStage } from "@joystream/types/augment";
import { Seats } from "@joystream/types/council";
import { Category, Thread, Post } from "@joystream/types/forum";
import { DiscussionPost } from "@joystream/types/proposals";

// config
import { domain, suppressedThreads } from "../config";
const dateFormat = "DD-MM-YYYY HH:mm (UTC)";
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
  api: ApiPromise,
  channels: number[],
  sendMessage: Send,
  channel: any
): Promise<void> => {
  const [last, current] = channels;
  const messages: string[][] = [[], []];

  for (let id: number = +last + 1; id <= current; id++) {
    const channel: Channel = await query("title", () =>
      api.query.contentWorkingGroup.channelById(id)
    );
    const member: Member = { id: channel.owner.asMember, handle: "", url: "" };
    member.handle = await getMemberHandle(api, member.id);
    member.url = `${domain}/#/members/${member.handle}`;
    messages[0].push(
      `<b>Channel <a href="${domain}/#//media/channels/${id}">${id}</a> by <a href="${member.url}">${member.handle} (${member.id})</a></b>`
    );
    messages[1].push(
      `**Channel ${id}** by ${member.handle} (${member.id})\n${domain}/#//media/channels/${id}`
    );
  }
  const tg = messages[0].join("\r\n\r\n");
  const discord = messages[1].join(`\n\n`);
  sendMessage({ tg, tgParseMode: "HTML", discord }, channel);
};

// announce council change

export const council = async (
  api: ApiPromise,
  council: Council,
  currentBlock: number,
  sendMessage: Send,
  channel: any
): Promise<Council> => {
  const hash = await getBlockHash(api, currentBlock);
  const election = await getCouncilElectionStatus(api, hash);
  const { round, stage, termEndsAt, stageEndsAt, durations } = election;
  const stageObj = JSON.parse(JSON.stringify(stage));
  let stageString = stageObj ? Object.keys(stageObj)[0] : "";
  let msg: string[] = ["", ""];

  if (!stage || stage.toJSON() === null) {
    stageString = "elected";
    const remainingBlocks = termEndsAt - currentBlock;
    const m = moment().add(remainingBlocks * 6, "s");
    const endDate = formatTime(m, dateFormat);
    const councilEnd = await api.query.council.termEndsAt();
    const termDuration = await api.query.councilElection.newTermDuration();
    const membersDc = council.seats.map((s) => `<${s.discord}>`).join(" ");
    const membersTg = council.seats.map((s) => s.telegram).join(" ");

    msg[0] = `Council election ended: ${membersDc} have been elected for <a href="${domain}/#/council/members">council ${round}</a>. Congratulations!\nNext election starts on ${endDate}.`;
    msg[1] = `Council election ended: ${membersTg} have been elected for council ${round}. Congratulations!\nNext election starts on ${endDate}.\n${domain}/#/council/members`;
  } else {
    const remainingBlocks = stage.toJSON()[stageString] - currentBlock;
    const m = moment().add(remainingBlocks * 6, "second");
    const endDate = formatTime(m, dateFormat);

    const link = `${domain}/#/council/`;
    if (stageString === "announcing") {
      msg[0] = `Council election started. You can <b><a href="${link}applicants">announce your application</a></b> until ${endDate}`;
      msg[1] = `Council election started. You can **announce your application** until ${endDate} ${link}applicants`;
    } else if (stageString === "voting") {
      msg[0] = `Council election: <b><a href="${link}applicants">Vote</a></b> until ${endDate}`;
      msg[1] = `Council election: **Vote* until ${endDate} ${link}applicants`;
    } else if (stageString === "revealing") {
      msg[0] = `Council election: <b><a href="${link}votes">Reveal your votes</a></b> until ${endDate}`;
      msg[1] = `Council election: **Reveal your votes** until ${endDate} ${link}votes`;
    }
  }
  const notFirst = council.last.length;
  const isChanged = round !== council.round && stageString !== council.last;
  if (notFirst && isChanged)
    sendMessage({ tg: msg[0], discord: msg[1], tgParseMode: "HTML" }, channel);

  return { ...council, round, last: stageString };
};

export const councilStatus = async (
  api: ApiPromise,
  block: Block,
  sendMessage: Send,
  channel: any
): Promise<void> => {
  const currentBlock = block.id;
  const hash = await getBlockHash(api, currentBlock);
  const election = await getCouncilElectionStatus(api, hash);
  const { round, stage, termEndsAt, stageEndsAt, durations } = election;
  const stageObj = JSON.parse(JSON.stringify(stage));
  let stageString = stageObj ? Object.keys(stageObj)[0] : "";

  let stageEndDate = moment();
  if (!stage || stage.toJSON() === null) {
    stageString = "elected";
    const remainingBlocks = termEndsAt - currentBlock;
    stageEndDate = moment().add(remainingBlocks * 6, "s");
  } else {
    const remainingBlocks = stage.toJSON()[stageString] - currentBlock;
    stageEndDate = moment().add(remainingBlocks * 6, "second");
  }

  const revealingEndsAt = termEndsAt + durations[4] - durations[3];
  const termBlocksRemaining = revealingEndsAt - currentBlock;
  let councilEndDate = moment().add(termBlocksRemaining * 6, "seconds");
  let councilEndDateString = formatTime(councilEndDate, dateFormat);
  let councilDaysLeft = councilEndDate.diff(moment(), "d");
  let councilDurationSuffix = "day(s)";
  if (councilDaysLeft <= 0) {
    councilDaysLeft = councilEndDate.diff(moment(), "h");
    councilDurationSuffix = "hour(s)";
  }
  if (councilDaysLeft <= 0) {
    councilDaysLeft = councilEndDate.diff(moment(), "m");
    councilDurationSuffix = "minute(s)";
  }

  let stageEndDateString = formatTime(stageEndDate, dateFormat);
  let stageDaysLeft = stageEndDate.diff(moment(), "d");
  let stageDurationSuffix = "day(s)";
  if (stageDaysLeft <= 0) {
    stageDaysLeft = stageEndDate.diff(moment(), "h");
    stageDurationSuffix = "hour(s)";
  }
  if (stageDaysLeft <= 0) {
    stageDaysLeft = stageEndDate.diff(moment(), "m");
    stageDurationSuffix = "minute(s)";
  }

  const msgTg = `It is block number *#${currentBlock}* \nCouncil ends in *${councilDaysLeft} ${councilDurationSuffix}* on *${councilEndDateString}* \nCurrent stage *${stageString}* ends in *${stageDaysLeft} ${stageDurationSuffix}* on *${stageEndDateString}*.`;
  const msgDs = `It is block number **#${currentBlock}** \nCouncil ends in **${councilDaysLeft} ${councilDurationSuffix}** on *${councilEndDateString}* \nCurrent stage **${stageString}** ends in *${stageDaysLeft} ${stageDurationSuffix}* on *${stageEndDateString}*.`;
  sendMessage({ tg: msgTg, discord: msgDs, tgParseMode: "Markdown" }, channel);
};

// forum
// announce latest categories
export const categories = async (
  api: ApiPromise,
  category: number[],
  sendMessage: Send,
  channel: any
): Promise<number> => {
  if (category[0] === category[1]) return category[0];
  const messages: string[][] = [[], []];

  for (let id: number = +category[0] + 1; id <= category[1]; id++) {
    const cat: Category = await query("title", () => getCategory(api, id));
    messages[0].push(
      `Category ${id}: <b><a href="${domain}/#/forum/categories/${id}">${cat.title}</a></b>`
    );
    messages[1].push(
      `Category ${id}: **${cat.title}** ${domain}/#/forum/categories/${id}`
    );
  }
  const tg = messages[0].join("\r\n\r\n");
  const discord = messages[1].join(`\n\n`);
  sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
  return category[1];
};

// announce latest posts
export const posts = async (
  api: ApiPromise,
  posts: number[],
  sendMessage: Send,
  channel: any
): Promise<number> => {
  const [last, current] = posts;
  if (current === last) return last;
  const messages: string[][] = [[], []];

  for (let id: number = +last + 1; id <= current; id++) {
    const post: Post = await query("current_text", () => getPost(api, id));
    const replyId: number = post.nr_in_thread.toNumber();
    const threadId: number = post.thread_id.toNumber();
    const thread: Thread = await query("title", () => getThread(api, threadId));
    if (suppressedThreads.includes(threadId)) continue;

    const category: Category = await query("title", () =>
      getCategory(api, thread.category_id.toNumber())
    );
    const handle = await getMemberHandleByAccount(api, post.author_id);

    const s = {
      content: post.current_text.substring(0, 250),
      link: `${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}`,
    };

    messages[0].push(
      `<u><a href="${domain}/#/forum/categories/${category.id}">${category.title}</a></u> <b><a href="${domain}/#/members/${handle}">${handle}</a></b> posted in <b><a href="${domain}/#/forum/threads/${threadId}?replyIdx=${replyId}">${thread.title}</a></b>:\n\r<i>${s.content}</i> <a href="${s.link}">more</a>`
    );
    messages[1].push(
      `**[${category.title}]** ${handle} posted in **${thread.title}**:\n*${s.content}*\nMore: ${s.link}`
    );
  }
  const tg = messages[0].join("\r\n\r\n");
  const discord = messages[1].join(`\n\n`);
  sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
  return current;
};

export const proposalCreated = (
  proposal: ProposalDetail,
  sendMessage: Send,
  channel: any
): void => {
  if (!proposal) return;
  const { id, created, finalizedAt, message, result } = proposal;
  if (!created) return console.warn(`proposalCreated: wrong data`, proposal);
  const { votingPeriod } = JSON.parse(proposal.parameters);
  const votingEndsAt = created + votingPeriod;
  const endTime = moment()
    .add(6 * votingPeriod, "second")
    .format("DD/MM/YYYY HH:mm");
  const link = `${domain}/#/proposals/${id}`;
  const tg = `<a href="${link}">Proposal ${id}</a> <b>created</b> at block ${created}.\r\n${message.tg}\r\nYou can <a href="${link}">vote</a> until block ${votingEndsAt} (${endTime} UTC).`;
  const discord = `Proposal ${id} **created** at block ${created}.\n${message.discord}\nVote until block ${votingEndsAt} (${endTime} UTC): ${link}\n`;
  sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
};

export const proposalUpdated = (
  proposal: ProposalDetail,
  blockId: number,
  sendMessage: Send,
  channel: any
): void => {
  if (!proposal) return;
  const { id, finalizedAt, message, result, stage } = proposal;
  const { gracePeriod } = JSON.parse(proposal.parameters);
  const link = `${domain}/#/proposals/${id}`;
  if (stage === "Finalized") {
    let label: string = result.toLowerCase();
    let grace = ``;
    if (result === "Approved") {
      const executesAt = gracePeriod;
      label = executesAt ? "approved" : "executed";
      if (executesAt && blockId < executesAt)
        grace = `and executes at block ${executesAt}`;
    }
    // send announcement
    const tg = `<a href="${link}">Proposal ${id}</a> <b>${label}</b> at block ${finalizedAt}${grace}.\r\n${message.tg}`;
    const discord = `Proposal ${id} **${label}** at block ${finalizedAt}${grace}.\n${message.discord}\n${link}\n`;
    sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
  }
};

export const proposalPost = async (
  post: DiscussionPost,
  author: string,
  proposalId: number,
  sendMessage: Send,
  channel: any
): Promise<void> => {
  const { text, created_at, author_id, thread_id } = post;
  const txt = text.slice(0, 100);
  const link = `${domain}/#/proposals/${proposalId}`;
  const tg = `<b>${author}</b> commented on <b><a href="${link}">Proposal ${proposalId}</a></b>: ${txt}`;
  const discord = `**${author}** commented on **Proposal ${proposalId}**: ${txt} $link`;
  sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
};

// heartbeat

const getAverage = (array: number[]): number =>
  array.reduce((a: number, b: number) => a + b, 0) / array.length;

export const heartbeat = async (
  api: ApiPromise,
  blocks: Block[],
  timePassed: string,
  proposals: Proposals,
  sendMessage: Send,
  channel: any
): Promise<void> => {
  const price = await fetchTokenValue();
  const storageSize = `temporarily disabled`; // TODO merge storagesizebot await fetchStorageSize();
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
  let proposalString: string[] = [
    `<a href="${domain}/#/proposals">Active proposals</a> `,
    `Active proposals: ${domain}/#/proposals`,
  ];

  const msg = `  ${blocks.length} blocks produced in ${timePassed}
  Blocktime: ${blocktime.toFixed(3)}s
  Price: ${price} / 1 M tJOY
  Stake: ${avgStake.toFixed(1)} / ${avgIssued.toFixed()} M tJOY (${percent}%)
  Validators: ${avgVals.toFixed()} (${reward} tJOY/h)
  Nominators: ${getAverage(noms).toFixed()}
  Volume: ${storageSize}\n`;
  const tg = msg + proposalString[0];
  const discord = msg + proposalString[1];
  sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
};

export const formatProposalMessage = (
  data: string[]
): { discord: string; tg: string; tgParseMode: ParseMode } => {
  const [id, title, type, stage, result, handle] = data;
  const tg = `<b>Type</b>: ${type}\r\n<b>Proposer</b>: <a href="${domain}/#/members/${handle}">${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
  const discord = `**Type**: ${type}\n**Proposer**: ${handle}\n**Title**: ${title}\n**Stage**: ${stage}\n**Result**: ${result}`;
  return { tg, discord, tgParseMode: "HTML" };
};

export const missingProposalVotes = async (
  proposals: ProposalVotes[],
  council: Council
): Promise<{ discord: string; tg: string; tgParseMode: ParseMode }> => {
  const messages = ["", ""]; // discord, telegram

  proposals.map(({ id, title, votes }) => {
    if (!title) return;
    const notifyMembers: string[][] = [[], []];
    // find members that are did not vote
    const needToVote = council.seats
      .filter(
        ({ memberId }) => !votes.find((vote) => +vote.memberId === +memberId)
      )
      .map((consul) => {
        if (consul.discord) {
          //const who = `<${consul.discord.id}> `; // TODO let bot mention users
          const who = consul.discord.handle;
          if (!notifyMembers[0].includes(who)) notifyMembers[0].push(who);
        } else if (consul.telegram?.length)
          notifyMembers[1].push(consul.telegram);
        else notifyMembers[0].push(consul.handle);
      });
    const selected = [notifyMembers[0].join(" "), notifyMembers[1].join(" ")];
    if (selected[0].length)
      messages[0] += `- ${id} **${title}** ${selected[0]} ${domain}/#/proposals/${id}\n`;
    if (selected[1].length)
      messages[1] += `- ${id} <a href="${domain}/#/proposals/${id}}">${title}</a>: ${selected[1]}\n`;
  });
  const prefix = `*Active Proposals*\n`;
  return {
    tg: messages[1].length ? messages[1] : ``,
    tgParseMode: "Markdown",
    discord: messages[0].length ? (prefix + messages[0]).slice(0, 2000) : ``,
  };
};
