import { Client } from "discord.js";

import axios from "axios";
import moment from "moment";
import path, { join } from "path";
import { Low, JSONFile } from "lowdb";
import dotenv from "dotenv";
import schedule from "node-schedule";
dotenv.config();

const __dirname = path.resolve();
// Use JSON file for storage
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);
const client = new Client();
// Read data from JSON file, this will set db.data content
await db.read();

// Initialize local DB
if (db.data === null) {
  // Set default data
  db.data = { config: {} };
  db.write();
}

//INIT

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  _init();
});

const _init = async () => {
  const storageProviderChannel = client.channels.cache.find(
    (channel) => channel.name === db?.data?.storageProviderChannelName
  );
  schedule.scheduleJob(
    `0 */${db?.data?.reRunCronTimingInHour} * * *`,
    async function () {
      const response = await generateSize();
      storageProviderChannel.send(`Current storage size: ${response}`);
    }
  );
};

//UTILS

const generateSize = async () => {
  if (isCacheOld()) {
    return await getSizeFromAPI();
  }
  return Promise.resolve(db?.data?.config?.size);
};

const generateMsg = async (msg = "", user = "") => {
  let size = await generateSize();
  msg.edit(`<@${user.id}>, Current storage size: ${size}`);
};

const getSizeFromAPI = async () => {
  return axios
    .get(db.data?.dataURL)
    .then((response) => {
      const res = Math.round(response?.data?.data?.rows[0][0]) + "GB";
      db.data.config = { timeStamp: moment.utc().format(), size: `${res}` };
      db.write();
      return res;
    })
    .catch((error) => {
      console.log("API failed", error);
    });
};

const isCacheOld = () => {
  //returns true if the timestamp is older than 2 hours
  let lastTime = db.data?.config?.timeStamp;
  if (lastTime) {
    const today = moment();
    const diff = today.diff(lastTime, "minutes");
    console.log("Cache is old", diff, "minutes");
    return diff > 120;
  }
  return true;
};

// COMMANDS

client.on("message", async (msg) => {
  const user = msg.author;
  if (msg.content === "/storagesize") {
    msg
      .reply("Calculating... ")
      .then(async (oldMessage) => {
        generateMsg(oldMessage, user);
      })
      .catch((error) => {
        console.log("Not able to send message", error);
      });
  }
});

client.login(process.env.TOKEN);
