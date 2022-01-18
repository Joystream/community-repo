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
  fetchStorageSize,
} from "./getters";
import moment, { now } from "moment";

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
  api: Api,
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
    member.handle = await memberHandle(api, member.id);
    member.url = `${domain}/#/members/${member.handle}`;
    messages[0].push(
      `<b>Channel <a href="${domain}/#//media/channels/${id}">${id}</a> by <a href="${member.url}">${member.handle} (${member.id})</a></b>`
    );
    messages[1].push(
      `**Channel ${id}** by ${member.handle} (${member.id})\n${domain}/#//media/channels/${id}`
    );
  }
  sendMessage(
    {
      tg: messages[0].join("\r\n\r\n"),
      discord: messages[1].join(`\n\n`),
      tgParseMode: "HTML",
    },
    channel
  );
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
  let msg: string[] = ["", ""];

  if (!stage || stage.toJSON() === null) {
    stageString = "elected";
    const councilEnd: BlockNumber = await api.query.council.termEndsAt();
    const termDuration: BlockNumber =
      await api.query.councilElection.newTermDuration();
    const block = councilEnd.toNumber() - termDuration.toNumber();
    if (currentBlock - block < 2000) {
      const remainingBlocks = councilEnd.toNumber() - currentBlock;
      const m = moment().add(remainingBlocks * 6, "s");
      const endDate = formatTime(m, dateFormat);
      const handles: string[] = await Promise.all(
        (
          await api.query.council.activeCouncil()
        ).map(
          async (seat: { member: string }) =>
            await memberHandleByAccount(api, seat.member)
        )
      );
      const members = handles.join(", ");

      msg[0] = `Council election ended: ${members} have been elected for <a href="${domain}/#/council/members">council ${round}</a>. Congratulations!\nNext election starts on ${endDate}.`;
      msg[1] = `Council election ended: ${members} have been elected for council ${round}. Congratulations!\nNext election starts on ${endDate}.\n${domain}/#/council/members`;
    }
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

  if (
    council.last !== "" &&
    round !== council.round &&
    stageString !== council.last
  ) {
    sendMessage({ tg: msg[0], discord: msg[1], tgParseMode: "HTML" }, channel);
  }
  return { round, last: stageString };
};

export const councilStatus = async (
  api: Api,
  block: Block,
  sendMessage: Send,
  channel: any
): Promise<void> => {
  const currentBlock = block.id;
  const councilTermEndBlock: number = (
    await api.query.council.termEndsAt()
  ).toJSON();
  const announcingPeriod: number = (
    await api.query.councilElection.announcingPeriod()
  ).toJSON();
  const votingPeriod: number = (
    await api.query.councilElection.votingPeriod()
  ).toJSON();
  const revealingPeriod: number = (
    await api.query.councilElection.revealingPeriod()
  ).toJSON();
  const stage: any = await api.query.councilElection.stage();
  const stageObj = JSON.parse(JSON.stringify(stage));
  let stageString = stageObj ? Object.keys(stageObj)[0] : "";

  let stageEndDate = moment();
  if (!stage || stage.toJSON() === null) {
    stageString = "elected";
    const councilEnd: BlockNumber = await api.query.council.termEndsAt();
    const termDuration: BlockNumber =
      await api.query.councilElection.newTermDuration();
    const block = councilEnd.toNumber() - termDuration.toNumber();
    if (currentBlock - block < 2000) {
      const remainingBlocks = councilEnd.toNumber() - currentBlock;
      stageEndDate = moment().add(remainingBlocks * 6, "s");
    }
  } else {
    const remainingBlocks = stage.toJSON()[stageString] - currentBlock;
    stageEndDate = moment().add(remainingBlocks * 6, "second");
  }

  const revealingEndsAt =
    councilTermEndBlock + announcingPeriod + votingPeriod + revealingPeriod;
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
  api: Api,
  category: number[],
  sendMessage: Send,
  channel: any
): Promise<number> => {
  if (category[0] === category[1]) return category[0];
  const messages: string[][] = [[], []];

  for (let id: number = +category[0] + 1; id <= category[1]; id++) {
    const cat: Category = await query("title", () => categoryById(api, id));
    messages[0].push(
      `Category ${id}: <b><a href="${domain}/#/forum/categories/${id}">${cat.title}</a></b>`
    );
    messages[1].push(
      `Category ${id}: **${cat.title}** ${domain}/#/forum/categories/${id}`
    );
  }

  sendMessage(
    {
      tg: messages[0].join("\r\n\r\n"),
      discord: messages[1].join(`\n\n`),
      tgParseMode: "HTML",
    },
    channel
  );
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
  const messages: string[][] = [[], []];

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

  sendMessage(
    {
      tg: messages[0].join("\r\n\r\n"),
      discord: messages[1].join(`\n\n`),
      tgParseMode: "HTML",
    },
    channel
  );
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
    const link = `${domain}/#/proposals/${id}`;
    const tg = `<a href="${link}">Proposal ${id}</a> <b>created</b> at block ${createdAt}.\r\n${message.tg}\r\nYou can <a href="${link}">vote</a> until block ${votingEndsAt} (${endTime} UTC).`;
    const discord = `Proposal ${id} **created** at block ${createdAt}.\n${message.discord}\nVote until block ${votingEndsAt} (${endTime} UTC): ${link}\n`;
    sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
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
      const link = `${domain}/#/proposals/${id}`;
      const tg = `<a href="${link}">Proposal ${id}</a> <b>${label}</b> at block ${finalizedAt}.\r\n${message.tg}`;
      const discord = `Proposal ${id} **${label}** at block ${finalizedAt}.\n${message.discord}\n${link}\n`;
      sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
      active = active.filter((a) => a !== id);
    }
  }

  for (const id of executing) {
    const proposal = await proposalDetail(api, id);
    const { finalizedAt, message, parameters } = proposal;
    const executesAt = +finalizedAt + parameters.gracePeriod.toNumber();
    if (block < executesAt) continue;
    const link = `${domain}/#/proposals/${id}`;
    const tg = `<a href="${link}">Proposal ${id}</a> <b>executed</b> at block ${executesAt}.\r\n${message.tg}`;
    const discord = `Proposal ${id} **executed** at block ${executesAt}.\n${message.discord}\n${link}\n`;
    sendMessage({ tg, discord, tgParseMode: "HTML" }, channel);
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
): Promise<void> => {
  const price = await fetchTokenValue();
  const storageSize = await fetchStorageSize();
  const durations = blocks.map((b) => b.duration);
  console.log(durations);
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
  let proposalString: string[] = pending
    ? [
        `<a href="${domain}/#/proposals">${pending} pending ${p(pending)}</a> `,
        `${pending} active ${p(pending)} ${domain}/#/proposals`,
      ]
    : ["", ""];
  if (finalized)
    proposalString = proposalString.map(
      (s) => (s += `${finalized} ${p(finalized)} in grace period.`)
    );

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
): { tg: string; discord: string } => {
  const [id, title, type, stage, result, handle] = data;
  const tg = `<b>Type</b>: ${type}\r\n<b>Proposer</b>: <a href="${domain}/#/members/${handle}">${handle}</a>\r\n<b>Title</b>: <a href="${domain}/#/proposals/${id}">${title}</a>\r\n<b>Stage</b>: ${stage}\r\n<b>Result</b>: ${result}`;
  const discord = `**Type**: ${type}\n**Proposer**: ${handle}\n**Title**: ${title}\n**Stage**: ${stage}\n**Result**: ${result}`;
  return { tg, discord };
};
