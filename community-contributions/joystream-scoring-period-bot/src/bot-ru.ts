import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import axios from "axios";
import moment from "moment";

dotenv.config();

const tgApiKey = process.env.TG_API_KEY_RU || "";
const bot = new TelegramBot(tgApiKey, { polling: true });
moment.locale("ru");

const loadScoringPeriodData = async () => {
  const url =
    "https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json";
  const { data } = await axios.get(url);
  return data.scoringPeriodsFull;
};

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

let nextSyncDate = moment();
let scoringData = {} as ScoringPeriodData;
let lastGradedPeriod = null as number | null;
const messageDeletionTimeout = 30000; // 30 seconds

bot.on("message", async (msg: TelegramBot.Message) => {
  if (nextSyncDate.isBefore(moment())) {
    scoringData = await loadScoringPeriodData();
    lastGradedPeriod = scoringData.lastPeriod.scoringPeriodId;
    nextSyncDate = moment.parseZone(scoringData.currentScoringPeriod.ends);
  }
  if (msg && msg.from) {
    console.log(msg.chat);
    const chatId = msg.chat.id;
    const username = `${msg.from.first_name} ${
      msg.from.last_name || ""
    }`.trim();

    const userParsed = `[${username}](tg://user?id=${msg.from.id})`;
    const leaderboardLink = `[Проверить баллы](https://t.me/JoystreamLeaderboardBot)`;
    const options: SendMessageOptions = { parse_mode: "Markdown" };

    if (msg.text?.startsWith("/scoring")) {
      const startDate = moment.parseZone(
        scoringData.currentScoringPeriod.started
      );
      const endDate = moment.parseZone(scoringData.currentScoringPeriod.ends);
      const duration = moment.duration(endDate.diff(moment()));
      const daysDuration = duration.asDays().toFixed();
      let dayText = "дней";
      if (daysDuration === "1") {
        dayText = "день";
      } else if (
        daysDuration === "2" ||
        daysDuration === "3" ||
        daysDuration === "4"
      ) {
        dayText = "дня";
      }
      const daysLeft = `***${duration
        .asDays()
        .toFixed()} ${dayText} в ${endDate.format(
        "dddd DD MMM"
      )} в ${endDate.format("HH:mm")}***`;
      const deadline = endDate.add(5, "d").format("dddd DD MMM HH:mm");
      const prevDeadline = startDate.add(5, "d").format("dddd DD MMM HH:mm");
      const hello = `Приветствую ${userParsed}!\n`;
      const currentPeriodId = scoringData.currentScoringPeriod.scoringPeriodId;
      const prevPeriodId = scoringData.currentScoringPeriod.scoringPeriodId - 1;
      const currentScoring = `Текущий отчетный период ***#${currentPeriodId}*** заканчивается через ${daysLeft}\n`;
      const currentDeadline = `Успей подать отчет за период ***#${currentPeriodId}*** до окончания срока подачи ***${deadline}***\n`;
      const isLastScoringClosed = endDate
        .add(5, "d")
        .subtract(2, "w")
        .isAfter(moment());
      const previousPeriodDeadline = isLastScoringClosed
        ? `Подача отчетов за прошлый период ***#${prevPeriodId}*** окончена\n`
        : `Подача отчетов за прошлый период ***#${prevPeriodId}*** открыта до ***${prevDeadline}***\n`;
      const latestGradedPeriod = `Последний период с начисленными баллами - ***#${lastGradedPeriod}***\n${leaderboardLink}`;
      const messageContent = `${hello}${currentScoring}${currentDeadline}${previousPeriodDeadline}${latestGradedPeriod}`;
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
