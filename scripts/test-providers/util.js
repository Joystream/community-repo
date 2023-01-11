const fs = require("fs");
const axios = require("axios");
const moment = require("moment");

const query = `query { storageBags(limit:10000){ id objects{id} storageBuckets {id operatorMetadata{nodeEndpoint}} distributionBuckets{id operators{metadata{nodeEndpoint}}} }}`;

const gb = (bytes) => (bytes / 1024 ** 3).toFixed(1);
const ch = (id) => id.split(":")[2];
const time = () => `[` + moment().format(`HH:mm:ss`) + `]`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const printBagBuckets = ({ id, storageBuckets, distributionBuckets }) => {
  const sb = storageBuckets.map((b) => b.id).join(", ");
  const db = distributionBuckets.map((b) => b.id).join(", ");
  console.log(time(), `${ch(id)} storage: [ ${sb} ] distribution: [ ${db} ]`);
};

const logChannel = ({ id, size, title, description }) =>
  console.log(`${id} ${gb(size)}gb [${title}] ${description}`);

const sendResult = (result, url) =>
  axios
    .post(url, result)
    .then(({ data }) => data.error && console.error(time(), data.error))
    .catch((e) => console.error(time(), e.message));

const loadResults = (file) => {
  try {
    fs.stat(file);
    require(file);
  } catch {
    return [];
  }
};

const headAsset = (objectId, endpoint, url) => {
  const start = new Date();
  return axios
    .head(url)
    .then(({ data }) => {
      const timestamp = new Date();
      const latency = moment(timestamp).diff(start);
      const status = data || `success`;
      return { objectId, endpoint, url, timestamp, latency, status };
    })
    .catch((e) => {
      const timestamp = new Date();
      const latency = moment(timestamp).diff(start);
      const status = e.message + e.response?.data;
      return { objectId, endpoint, url, timestamp, latency, status };
    });
};

// channel sizes

const printFailed = (list) => list.map((r) => r.url).join(` `);

const addRow = ({ id, size, title, description }) =>
  `| ${id} | ${gb(size)} | ${title} | ${description
    ?.split("\n")
    .join(" ")
    .slice(0, 60)} |`;

const writeTable = (channels) => {
  const rows = channels
    .map((channel) => {
      let size =
        channel.videos?.reduce(
          (sum, video) => (sum += +video.media?.size),
          0
        ) || 0;
      return { ...channel, size };
    })
    .filter(({ size }) => size > 0.1 * 1024 ** 3)
    .sort((a, b) => b.size - a.size)
    .map((c) => addRow(c));

  const table =
    `| # | GB | Title | Description |\n|---|---|---|---|\n` + rows.join(`\n`);
  fs.writeFileSync("channels.md", table);
  console.log(`wrote channels.md`);
};

module.exports = {
  query,
  ch,
  sleep,
  time,
  loadResults,
  headAsset,
  sendResult,
  printFailed,
  writeTable,
};
