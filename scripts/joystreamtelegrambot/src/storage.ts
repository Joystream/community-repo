import axios from "axios";
import moment from "moment";
import schedule from "node-schedule";
import { statusUrl, dapplookerUrl, reRunCronTimingInHour } from "../config";
import { Db, Status, Storage } from "./types";
import { saveDb } from "./db";

const tb = (bytes: number) => (bytes / 1024 ** 4).toFixed(3) + " TB";

export const scheduleStorageUpdates = (db: Db, channel: any) =>
  schedule.scheduleJob(`0 */${reRunCronTimingInHour} * * *`, () => {
    const oldSize = db.storage?.size;
    updateStorage().then(({ channels, size, files, curators, providers }) => {
      if (oldSize === size) return;
      if (!channel)
        return console.warn(`scheduleStorageUpdates: empty channel`);
      channel.send(`Current storage size: ${tb(size)} TB`);
    });
  });

export const generateStorageMsg = async (
  db: Db,
  msg: any,
  user: any,
  dm?: boolean
) =>
  getOrUpdateStorage(db, dm).then(
    ({ channels, curators, files, providers, size }: Storage) =>
      msg.edit(`<@${user}>, Current storage:
    Size: ${tb(size)}
    Files: ${files}
    Channels: ${channels}
    Curators: ${curators}
    Providers: ${providers}`)
  );

const getOrUpdateStorage = (db: Db, dm?: boolean): Promise<Storage> =>
  !db.storage || dm || isCacheOld(db)
    ? updateStorage()
    : Promise.resolve(db.storage);

const getDapplookerSize = () =>
  axios
    .get(dapplookerUrl)
    .then((response: { data: { data: { rows: any } } }) => {
      if (!response?.data?.data?.rows[0]) {
        console.warn(`Malformed response from dapplooker`, response);
        return;
      }
      return Math.round(response?.data?.data?.rows[0][0] * 1024 ** 2);
    })
    .catch((e) => null);

const updateStorage = (): Promise<Storage> =>
  axios
    .get(statusUrl)
    .then(async ({ data }: { data: Status }) => {
      const { activeCurators, channels, media_files, size } = data.media;
      const dapplookerSize = await getDapplookerSize();
      const storage: Storage = {
        size: dapplookerSize || size,
        files: media_files,
        curators: activeCurators,
        channels: channels,
        providers: data.roles.storage_providers,
        timeStamp: moment.utc().format(),
      };
      saveDb({ storage });
      return storage;
    })
    .catch((error: { message: string }) => {
      console.log("Status API failed", error.message);
      return updateStorage(); // TODO risk for stack too deep
    });

//returns true if the timestamp is older than 2 hours
const isCacheOld = (db: Db) => {
  let lastTime = db.storage?.timeStamp;
  if (lastTime) {
    const today = moment();
    const diff = today.diff(lastTime, "minutes");
    return diff > 120;
  }
  return true;
};
