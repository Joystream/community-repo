import { Video, OrionVideo, Category, Schedule } from "./types";
import fs from "fs";
import axios from "axios";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();
const orionHeader = process.env.orionHeader;
const orionUrl = `https://orion.joystream.org/graphql`;
const videosFile = "./videos.json";
const scheduleFile = "./schedule.json";

if (!orionHeader) {
  console.log(`Please set orionHeader in .env`);
  process.exit(1);
}

const getDay = (daysFromNow: number = 0) =>
  moment().add(daysFromNow, "days").format("YYYY-MM-DD");

export const getOrionVideo = ({ videoId }: Video): OrionVideo => {
  return {
    videoId,
    videoCutUrl: `https://eu-central-1.linodeobjects.com/atlas-featured-content/category-featured-videos/1/video-cut-${videoId}.mp4`,
  };
};

const loadSchedule = () => require(scheduleFile);

const loadVideos = (): { videos: Video[]; categories: number[] } => {
  // load videos and extract category IDs
  const categories: number[] = [];
  const videos: Video[] = require(videosFile);
  videos.forEach(
    ({ categoryId }) =>
      categories.includes(categoryId) || categories.push(categoryId)
  );
  return { videos, categories };
};

const selectVideos = (videos: Video[], count: number): OrionVideo[] => {
  let selected: OrionVideo[] = [];
  for (let n = 0; n < count; ++n) {
    // remove selected videos
    const available: Video[] = videos.filter(
      ({ videoId }) => !selected.find((v) => v.videoId === videoId)
    );
    // select random video
    const id = Math.floor(Math.random() * available.length);
    if (available.length && available[id])
      selected.push(getOrionVideo(available[id]));
    else break;
  }
  return selected;
};

const generateVideoList = (file: string) => {
  console.log(`Indexing video files ..`);
  const videos = fs
    .readFileSync(`./list`, `utf-8`)
    .split(`\n`)
    .reduce((list: Video[], path: string): Video[] => {
      const match = path.match(/\.\/([^\/]+) (\d+)\/(\d+)-(\d+)\.mp4/);
      if (match) {
        const category = match[1];
        const count = Number(match[2]);
        const categoryId = Number(match[3]);
        const videoId = Number(match[4]);
        const video: Video = { category, count, categoryId, videoId };
        return list.concat(video);
      } else return list;
    }, []);
  fs.writeFileSync(file, JSON.stringify(videos));
  console.log(`Wrote ${videos.length} videos to ${file}`);
};

const generateSchedule = (maxDays: number = 7): Schedule => {
  const loaded = loadVideos();
  const days: number[] = [];
  for (let day = 0; day <= maxDays; ++day) {
    days.push(day);
  }
  const left: Video[][] = [];
  const schedule: Schedule = {};
  days.forEach((day) => {
    schedule[getDay(day)] = {
      categories: loaded.categories.map((categoryId: number) => {
        const available: Video[] = left[categoryId]
          ? left[categoryId]
          : loaded.videos.filter((v) => v.categoryId === categoryId);
        const videos: OrionVideo[] = selectVideos(available, 3); // select n videos
        left[categoryId] = available.filter(
          ({ videoId }) => !videos.find((v) => v.videoId === videoId)
        );
        return { categoryId, videos };
      }),
    };
  });
  return schedule;
};

const getCategoryFeaturedVideos = (): Promise<string> => {
  const data = {
    query:
      "query GetCategoriesFeaturedVideos {\n  allCategoriesFeaturedVideos {\n    categoryId\n    videos {\n      videoId\n      videoCutUrl\n    }\n  }\n}",
  };
  return axios
    .post(orionUrl, data)
    .then(({ data }: any) => {
      fs.writeFileSync(`featured.json`, JSON.stringify(data));
      console.log(`Wrote featured.json`);
      return data;
    })
    .catch((error: any) => error.message + JSON.stringify(error));
};

const setCategoryVideos = (categoryId: number, videos: OrionVideo[]): string =>
  `mutation {
    setCategoryFeaturedVideos(
        categoryId: "${categoryId}"
        videos: ${JSON.stringify(videos)}
    ) {
        videoId
        videoCutUrl
    }
}`.replace(/\n/, "\n");

const setCategoryFeaturedVideos = async (
  categoryId: number,
  videos: OrionVideo[]
) => {
  const headers = { Authorization: orionHeader };
  const data = setCategoryVideos(categoryId, videos);
  return console.log(`request`, data); // TODO remove after fixing request
  axios
    .post(orionUrl, { headers, data })
    .then(async (res: any) => {
      console.log(`sent post request to orion (${orionUrl})`, res);
      getCategoryFeaturedVideos();
    })
    .catch((error: any) => {
      console.error(
        `Failed to set featured videos for category ${categoryId}: ${JSON.stringify(
          error
        )}`
      );
    });
};

const main = async (args: string[]) => {
  switch (args[0]) {
    case "get":
      getCategoryFeaturedVideos();
      break;
    case "set":
      try {
        const schedule: Schedule = require(scheduleFile);
        //console.log(getDay(), Object.keys(schedule));
        if (!schedule || !schedule[getDay()]) {
          console.error(`Current day not found in schedule. Run update again.`);
          process.exit(1);
        }
        const { categories } = schedule[getDay()];
        categories
          .sort((a, b) => a.categoryId - b.categoryId)
          .map(({ categoryId, videos }) =>
            setCategoryFeaturedVideos(categoryId, videos)
          );
      } catch (e) {
        console.warn(`Did you run: yarn run schedule`);
      }
      break;
    case "schedule":
      fs.writeFileSync(scheduleFile, JSON.stringify(generateSchedule()));
      console.log(`Wrote schedule to ${scheduleFile}.`);
      break;
    case "update":
      generateVideoList(videosFile);
      break;
    default:
      console.log(`Available commands: [get, set, schedule, update]`);
  }
};
main(process.argv.slice(2));
