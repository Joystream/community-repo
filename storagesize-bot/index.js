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

// If file.json doesn't exist, db.data will be null
// Set default data
// db.data |= { config: [] };
// db.write();

//INIT

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  _init();
});

const _init = async () => {
  const channel = client.channels.cache.find(
    (channel) => channel.name === "storage-provider"
  );
  const job = schedule.scheduleJob("0 */2 * * *", async function (fireDate) {
    const response = await generateSize();
    channel.send(`Current storage size: ${response}`);
  });
};

//UTILS

const generateSize = async () => {
  let res;
  const isOld = isCacheOld();
  if (isOld) {
    res = await getSizeFromJoystream();
  }
  let size = isOld ? res : db.data.config[0].size;
  return Promise.resolve(size);
};

const generateMsg = async (msg = "", user = "") => {
  let size = await generateSize();
  msg && msg.edit(`<@${user.id}>, Current storage size: ${size}`);
};

const bytesToSize = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

const getSizeFromJoystream = async () => {
  return axios
    .get(
      "https://analytics.dapplooker.com/api/public/dashboard/c70b56bd-09a0-4472-a557-796afdc64d3b/card/155?parameters=%5B%5D"
    )
    .then((response) => {
      // handle success
      // const res = bytesToSize(response.data.media.size);
      const res = Math.round(response.data.data.rows[0][0] / 1000) + "GB";
      db.data.config[0] = { timeStamp: moment.utc().format(), size: `${res}` };
      db.write();
      return res;
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const isCacheOld = () => {
  let lastTime = db.data.config[0].timeStamp;
  console.log(JSON.stringify(lastTime));
  if (lastTime) {
    const today = moment();
    const diff = today.diff(lastTime, "minutes");
    console.log(diff);
    return diff > 120 ? true : false;
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
        console.log(error);
      });
  }
});

client.login(process.env.TOKEN);
