import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import axios from "axios";
import moment from "moment";
import { Client } from "discord.js";
// import { Client, Intents, Options } from "discord.js";

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

const tgApiKey = process.env.TG_API_KEY_RU || "";
const bot = new TelegramBot(tgApiKey, { polling: true });
const discordToken = process.env.DISCORD_TOKEN_RU || "";
const client = new Client();

let nextSyncDate = moment();
let scoringData = {} as ScoringPeriodData;
let lastGradedPeriod = null as number | null;
const messageDeletionTimeout = 60000;

client.login(discordToken);
client.on("ready", async () => {
  if (!client.user) return;
  console.log(`Logged in to discord as ${client.user.tag}!`);
});

moment.locale("ru");

const loadScoringPeriodData = async () => {
  const url =
    "https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json";
  const { data } = await axios.get(url);
  return data.scoringPeriodsFull;
};

client.on("message", async (message) => {
  await reloadScoringData();
  if ((message.content === "!help") || (message.content === "!start")) {
    const helpMessage = `Приветвтвую, ${message.author.username}, я вывожу очки за оценочные периоды в Joystream!\n*Если это сообщение будет выведено в группе, оно удалится через 30 секунд. Диалоговые сообщения не удаляются.*\nПоддерживаемые команды:\n!scoring - Получить информацию о периоде оценки\n!help - Получить помощь`;
    message.channel.send({ content: helpMessage }).then((msg: { delete: () => void; }) => {
      if (message.channel.type !== "dm") {
        message.delete()
        setTimeout(() => {
          msg.delete()
        }, messageDeletionTimeout)
      }
    });
  }
  if (message.content === "!scoring") {
    const leaderboardLink = `\nПосмотреть количество очков здесь: https://t.me/JoystreamLeaderboardBot\nПредоставить отчет сюда: https://www.joystream.org/founding-members/form`;
    const submitReportLink = "Предоставьте отчет";
    const messageContent = generateScoringPeriodMessage(
      message.author.username,
      submitReportLink,
      leaderboardLink,
    );
    message.channel.send({ content: messageContent }).then((msg: { suppressEmbeds: (arg0: boolean) => void; delete: () => void; }) => {
      msg.suppressEmbeds(true)
      if (message.channel.type !== "dm") {
        message.delete()
        setTimeout(() => {
          msg.delete()
        }, messageDeletionTimeout)
      }
    });
  }
});

bot.on("message", async (msg: TelegramBot.Message) => {
  await reloadScoringData();
  if (msg && msg.from) {
    console.log(msg.chat);
    const chatId = msg.chat.id;
    const username = `${msg.from.first_name} ${msg.from.last_name || ""
      }`.trim();

    const userParsed = `[${username}](tg://user?id=${msg.from.id})`;
    const leaderboardLink = ` - [Посмотреть количество очков](https://t.me/JoystreamLeaderboardBot)`;
    const options: SendMessageOptions = {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    };
    if (msg.text?.startsWith("/help") || msg.text?.startsWith("/start")) {
      const helpMessage = `Приветствую, ${userParsed}, я вывожу очки за оценочные периоды в Joystream!\n*Если это сообщение будет выведено в группе, оно удалится через 30 секунд. Диалоговые сообщения не удаляются.*\nПоддерживаемые команды:\n/scoring - Получить информацию о периоде оценки\n/help - Получить помощь`;
      // const helpMessage = `${msg.chat.type}`;
      bot.sendMessage(chatId, helpMessage, options).then((message) => {
        if (message.chat.type !== "private") {
          try {
            bot.deleteMessage(chatId, msg.message_id.toString());
          } catch (e) { }

          setTimeout(() => {
            try {
              bot.deleteMessage(chatId, message.message_id.toString());
            } catch (e) { }
          }, messageDeletionTimeout);
        }
      });
    }
    if (msg.text?.startsWith("/scoring")) {
      const submitReportLink = "[Подайте отчет](https://www.joystream.org/founding-members/form)";
      const messageContent = generateScoringPeriodMessage(
        userParsed,
        submitReportLink,
        leaderboardLink,
      );
      bot.sendMessage(chatId, messageContent, options).then((message) => {
        if (message.chat.type !== "private") {
          try {
            bot.deleteMessage(chatId, msg.message_id.toString());
          } catch (e) { }
          setTimeout(() => {
            try {
              bot.deleteMessage(chatId, message.message_id.toString());
            } catch (e) { }
          }, messageDeletionTimeout);
        }
      });
    }
  }
});

const generateScoringPeriodMessage = (
  userParsed: string,
  submitReportLink: string,
  leaderboardLink: string,
) => {
  const startDate = moment.parseZone(scoringData.currentScoringPeriod.started);
  const endDate = moment.parseZone(scoringData.currentScoringPeriod.ends);
  const duration = moment.duration(endDate.diff(moment()));
  const daysDuration = duration.asDays().toFixed();
  let dayText = "дня";                                                // 2, 3, 4
  if (["5", "6", "7", "8", "9"].includes(daysDuration.slice(-1))) {   // 5, 6, 7, 8, 9
    dayText = "дней";
  } else if (daysDuration.slice(-1) === "1") {                        // 1
    dayText = "день";
  }
  const daysLeft = `***${duration
    .asDays()
    .toFixed()} ${dayText} ${endDate.format(
      "(" + "dddd DD MMM"
    )} ${endDate.format("HH:mm")}***` + ")";
  const deadline = endDate.add(5, "d").format("dddd DD MMM HH:mm");
  const prevDeadline = startDate.add(5, "d").format("dddd DD MMM HH:mm");
  const hello = `Приветствую, ${userParsed}!\n`;
  const currentPeriodId = scoringData.currentScoringPeriod.scoringPeriodId;
  const prevPeriodId = scoringData.currentScoringPeriod.scoringPeriodId - 1;
  const currentScoring = `Текущий отчетный период ***#${currentPeriodId}*** заканчивается через ${daysLeft}\n`;
  const currentDeadline = `${submitReportLink} за период ***#${currentPeriodId}*** до окончания следующего срока: ***${deadline}***\n`;
  const isLastScoringClosed = endDate
    .add(5, "d")
    .subtract(2, "w")
    .isAfter(moment());
  const previousPeriodDeadline = isLastScoringClosed
    ? `Подача отчетов за прошлый период ***#${prevPeriodId}*** окончена\n`
    : `Подача отчетов за прошлый период ***#${prevPeriodId}*** открыта до: ***${prevDeadline}***\n`;
  const latestGradedPeriod = `Последний период с начисленными баллами - ***#${lastGradedPeriod}*** - ${leaderboardLink}`;
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

