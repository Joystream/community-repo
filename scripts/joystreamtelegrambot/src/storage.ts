import axios from "axios";
import moment from "moment";
import fs from "fs";
import path, { join } from "path";
import dotenv from "dotenv";
import schedule from "node-schedule";
dotenv.config();

// defaults
interface Db {
  config: { dataURL: string; reRunCronTimingInHour: number };
  timeStamp: string;
  size: string;
}
const config = {
  dbFile: join(path.resolve(), "db.json"),
  dataURL:
    "https://analytics.dapplooker.com/api/public/dashboard/c70b56bd-09a0-4472-a557-796afdc64d3b/card/155",
  reRunCronTimingInHour: 5,
};

// DB
const loadDb = (): Db => {
  try {
    fs.statSync(config.dbFile);
  } catch (e) {
    writeDb({ config });
  }
  return require(config.dbFile);
};
const writeDb = (data = {}) => {
  fs.writeFileSync(config.dbFile, JSON.stringify(data));
  return data;
};
const db = loadDb();

export const scheduleStorageUpdates = (channel: any) =>
  schedule.scheduleJob(`0 */${db.config.reRunCronTimingInHour} * * *`, () =>
    getSize().then((size) => channel.send(`Current storage size: ${size}`))
  );

export const generateStorageMsg = async (msg: any, user: any) =>
  getSize().then((size) =>
    msg?.edit(`<@${user}>, Current storage size: ${size}`)
  );

const getSize = (): Promise<string> =>
  isCacheOld() ? getSizeFromAPI() : Promise.resolve(db.size);

const getSizeFromAPI = async (): Promise<string> =>
  axios
    .get(db.config.dataURL)
    .then((response: { data: { data: { rows: any } } }) => {
      if (!response?.data?.data?.rows[0]) {
        console.warn(`Malformed response  `);
      }
      const res = Math.round(response?.data?.data?.rows[0][0]) + "GB";
      db.size = `${res}`;
      db.timeStamp = moment.utc().format();
      writeDb(db);
      return res;
    })
    .catch((error: { message: string }) => {
      console.log("Storage API failed", error.message);
      return `?`;
    });

const isCacheOld = () => {
  //returns true if the timestamp is older than 2 hours
  let lastTime = db.timeStamp;
  if (lastTime) {
    const today = moment();
    const diff = today.diff(lastTime, "minutes");
    console.log("Cache is old", diff, "minutes");
    return diff > 120;
  }
  return true;
};
