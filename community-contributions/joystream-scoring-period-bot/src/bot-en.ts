import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import axios from "axios";
import moment from "moment";
import { Client, Intents, Options } from "discord.js";

interface ScoringPeriodData {
  currentScoringPeriod: {
    scoringPeriodId: number;
    started: string;
    ends: string;
    referralCode: number;
  };
  lastPeriod: {
    scoringPeriodId: number;
    started: string;
    ends: string;
    referralCode: number;
    totalDirectScore: number;
    totalReferralScore: number;
    highlights: string[];
  };
}

dotenv.config();

const tgApiKey = process.env.TG_API_KEY_EN || "";
const bot = new TelegramBot(tgApiKey, { polling: true });
const discordToken = process.env.DISCORD_TOKEN || "";
const clientOptions = Options.createDefault();
clientOptions.intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES,
];
const client = new Client(clientOptions);

let nextSyncDate = moment();
let scoringData = {} as ScoringPeriodData;
let lastGradedPeriod = null as number | null;
const messageDeletionTimeout = 30000; // 30 seconds

client.login(discordToken);
client.on("ready", async () => {
  if (!client.user) return;
  console.log(`Logged in to discord as ${client.user.tag}!`);
});

moment.locale("en");

const loadScoringPeriodData = async () => {
  const url =
    "https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json";
  const { data } = await axios.get(url);
  return data.scoringPeriodsFull;
};

client.on("message", async (message) => {
  await reloadScoringData();
  if (message.content === "!scoring") {
    const leaderboardLink = `\nCheck scores here: https://t.me/JoystreamLeaderboardBot\nSubmit your report here: https://www.joystream.org/founding-members/form`;
    const submitReportLink = "submit your report";
    const messageContent = generateScoringPeriodMessage(
      message.author.username,
      submitReportLink,
      leaderboardLink
    );
    message.channel.send({content: messageContent}).then( msg => {
      msg.suppressEmbeds(true)
      message.delete()
      setTimeout(() => {
        msg.delete()  
      }, messageDeletionTimeout)
    });
  }
});

bot.on("message", async (msg: TelegramBot.Message) => {
  await reloadScoringData();
  if (msg && msg.from) {
    console.log(msg.chat);
    const chatId = msg.chat.id;
    const username = `${msg.from.first_name} ${
      msg.from.last_name || ""
    }`.trim();

    const userParsed = `[${username}](tg://user?id=${msg.from.id})`;
    const leaderboardLink = ` - [Check scores](https://t.me/JoystreamLeaderboardBot)`;
    const options: SendMessageOptions = {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    };

    if (msg.text?.startsWith("/scoring")) {
      const submitReportLink = "[submit your report](https://www.joystream.org/founding-members/form)";
      const messageContent = generateScoringPeriodMessage(
        userParsed,
        submitReportLink,
        leaderboardLink
      );
      bot.sendMessage(chatId, messageContent, options).then((message) => {
        try {
          bot.deleteMessage(chatId, msg.message_id.toString());
        } catch (e) {}
        setTimeout(() => {
          try {
            bot.deleteMessage(chatId, message.message_id.toString());
          } catch (e) {}
        }, messageDeletionTimeout);
      });
    }
  }
});

const generateScoringPeriodMessage = (
  userParsed: string,
  submitReportLink: string,
  leaderboardLink: string
) => {
  const startDate = moment.parseZone(scoringData.currentScoringPeriod.started);
  const endDate = moment.parseZone(scoringData.currentScoringPeriod.ends);
  const duration = moment.duration(endDate.diff(moment()));
  const daysDuration = duration.asDays().toFixed();
  let dayText = "days";
  if (daysDuration === "1") {
    dayText = "day";
  }
  const daysLeft = `***${duration
    .asDays()
    .toFixed()} ${dayText} on ${endDate.format(
    "dddd DD MMM"
  )} at ${endDate.format("HH:mm")}***`;
  const deadline = endDate.add(5, "d").format("dddd DD MMM HH:mm");
  const prevDeadline = startDate.add(5, "d").format("dddd DD MMM HH:mm");
  const hello = `Hello ${userParsed}!\n`;
  const currentPeriodId = scoringData.currentScoringPeriod.scoringPeriodId;
  const prevPeriodId = scoringData.currentScoringPeriod.scoringPeriodId - 1;
  const currentScoring = `The current scoring period ***#${currentPeriodId}*** ends in ${daysLeft}\n`;
  const currentDeadline = `Please make sure to ${submitReportLink} for period ***#${currentPeriodId}*** before the deadline ***${deadline}***\n`;
  const isLastScoringClosed = endDate
    .add(5, "d")
    .subtract(2, "w")
    .isAfter(moment());
  const previousPeriodDeadline = isLastScoringClosed
    ? `Reports for the previous period ***#${prevPeriodId}*** are closed\n`
    : `Reports for the previous period ***#${prevPeriodId}*** can be submitted before ***${prevDeadline}***\n`;
  const latestGradedPeriod = `Latest graded period - ***#${lastGradedPeriod}***${leaderboardLink}`;
  const messageContent = `${hello}${currentScoring}${currentDeadline}${previousPeriodDeadline}${latestGradedPeriod}`;
  return messageContent;
};
async function reloadScoringData() {
  if (nextSyncDate.isBefore(moment())) {
    scoringData = await loadScoringPeriodData();
    lastGradedPeriod = scoringData.lastPeriod.scoringPeriodId;
    nextSyncDate = moment.parseZone(scoringData.currentScoringPeriod.ends);
  }
}

