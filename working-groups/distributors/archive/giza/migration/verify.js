const fs = require("fs");
const axios = require("axios");

const oldFilename = `oldChannels.json`;
const newFilename = `newVideos.json`;
const resultsFilename = `migration_result.json`;
const { channels, videos } = require("./ids.js");
console.log(
  `Loaded IDs of ${videos.length} transferred videos in ${channels.length} channels.`
);
//const { channels } = require("./ru.js");
// channels.map((c) => c.id).reduce((id=> axios.head(`${}`))

const oldChannels = `query { channels (limit: 10000) { id createdAt updatedAt createdInBlock
    title category { name } ownerMember {id handle } isCensored isPublic
    coverPhotoAvailability coverPhotoDataObject { joystreamContentId size }
    avatarPhotoAvailability avatarPhotoDataObject { joystreamContentId size }
    videos { id title mediaDataObject {size} mediaAvailability thumbnailPhotoAvailability }
}}`;

const queryVideos = `query { videos (limit:10000) { id channelId language{iso} media { id } }}`;

const queryVideo = (id) => `query { videos(where: {id_eq: "${id}"})  {
  id channelId language{iso} media { id } }}`;

//curl 'https://ipfs.joystreamstats.live/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: https://ipfs.joystreamstats.live' --data-binary '{"query":"query { videos { id channelId language{iso} media { id } }}"}' --compressed

const getOldChannels = () =>
  axios
    .post(`https://hydra-sumer.joystream.org/graphql`, { query: oldChannels })
    .then(({ data }) => {
      fs.writeFileSync(oldFilename, JSON.stringify(data.data.channels));
      return data.data.channels;
    })
    .catch(({ message, response }) => {
      console.log(response.status, message, response.data);
      return [];
    });

const printResults = (results) => {
  const available = results.filter((v) => v.status === `available`);
  console.log(`${available.length} of ${results.length} assets are available.`);
  const notok = results.filter((v) => v.status !== `available`);
  if (!notok.length) return;

  // print table
  const header = `\n### Created Videos without media file\n\n${notok.length} have no content.\n\n| Channel | Video | Asset | Status |\n|---|---|---|---|\n`;
  const row = ({ id, channelId, media, status }) =>
    `| ${channelId} | ${id} | ${media?.id || ``} | ${status || ``} |`;
  const sorted = notok.sort((a, b) => a.channelId - b.channelId);
  console.log(header + sorted.map((video) => row(video)).join(`\n`));
};

const testVideos = async (list, oldResults) => {
  if (!list?.length) return console.log(`empty result from QN`);
  console.log(`Testing availability of ${list.length} videos (~5..15min)`);
  let results = oldResults || [];
  const timer = setInterval(
    () => console.log(`Tested ${results.length} videos.`),
    5000
  );
  for (const video of list) {
    const { id, channelId, language, media } = video;
    if (!videos.find((map) => +map[1] === +id)) continue; // not migrated
    if (!media) {
      console.log(`Skipping video ${id}: no media info.`);
      results.push({ ...video, status: `no media` });
      continue;
    }
    const status = await axios
      .head(`https://storage-1.joystream.org/argus/api/v1/assets/${media.id}`)
      .then(({ status, statusText }) =>
        status === 200 ? `available` : `${status} ${statusText}`
      )
      .catch((error) => error.message);
    if (status !== "available") console.log(`Not available:`, video);
    results.push({ ...video, status });
  }
  fs.writeFileSync(resultsFilename, JSON.stringify(results));
  console.log(`Wrote ${resultsFilename}.`);
  printResults(results);
  clearInterval(timer);
};

const countSize = (ids, channels) => {
  let acceptedVideos = 0;
  let channelsSize = 0;
  let sizes = [];
  let notacceptedbuttransferred = [];
  channels
    .filter((c) => ids.find((id) => id[0] === +c.id))
    .map((channel) => {
      if (channel.isCensored) console.log(`channel ${cid} was censored!`);
      if (channel.coverPhotoDataObject)
        channelsSize += channel.coverPhotoDataObject.size;
      if (channel.avatarPhotoDataObject)
        channelsSize += channel.avatarPhotoDataObject.size;
      channel.videos.forEach((v) => {
        if (v.mediaAvailability === "ACCEPTED")
          sizes.push(v.mediaDataObject.size);
        else notacceptedbuttransferred.push(v);
      });
    });
  const bytes = sizes.reduce((a, b) => a + b, 0);
  console.log(
    `${sizes.length} videos were transferred ${bytes} bytes + ${channelsSize} avatars + covers.`
  );
  if (notacceptedbuttransferred) {
    const lines = notacceptedbuttransferred.map(
      (v) =>
        `| ${v.id} | ${v.title} | ${v.mediaDataObject.size} | ${v.mediaAvailability} | ${v.thumbnailPhotoAvailability} |`
    );
    console.log(
      `\n### Migrated ${lines.length} videos with empty source\n\n|ID|Title|Size|Upload|Thumbnail|\n|---|---|---|---|---|\n`,
      lines.join(`\n`)
    );
  }
  return bytes + channelsSize;
};

// load old channels from disk or old QN
fs.stat(oldFilename, async (err, stat) => {
  const oldChannels = !err
    ? JSON.parse(fs.readFileSync(oldFilename, "utf-8"))
    : await getOldChannels();
  console.log(`Loaded info of ${oldChannels.length} old channels.`);
  const size = countSize(channels, oldChannels);

  // find censored
  const censored = oldChannels.filter((c) => c.isCensored);
  if (!censored.length) return;
  console.log(
    `\n### Censored source channels\n\nFound ${censored.length} censored channels in migration set:\n`,
    "```\n" + censored.map((j) => JSON.stringify(j)).join("\n") + "\n```"
  );
});

// load new videos from disk or new QN
fs.stat(newFilename, async (err, stat) => {
  const newVideos = !err
    ? JSON.parse(fs.readFileSync(newFilename, "utf-8"))
    : await axios
        .post(`https://ipfs.joystreamstats.live/graphql`, {
          query: queryVideos,
        })
        .then(({ data }) => {
          fs.writeFileSync(newFilename, JSON.stringify(data.data.videos));
          return data.data.videos;
        })
        .catch((error) => {
          console.log(error.message, error);
          return [];
        });

  // find migrated of all new videos
  const migrated = newVideos.filter((v) =>
    videos.find((ids) => ids[1] === +v.id)
  );
  if (!migrated.length)
    return console.log(
      `Something went wrong. No migrated videos found. Contact your administrator.`
    );
  console.log(`Loaded info of ${migrated.length} migrated videos.`);
  fs.stat(resultsFilename, async (err, stat) => {
    if (err) return testVideos(migrated);
    console.log(`Loading old results.`);
    const results = JSON.parse(fs.readFileSync(resultsFilename, "utf-8"));
    const nottested = videos.filter(
      (i) => !results.find((r) => +r.id === i[1])
    );
    console.log(nottested.length, `not tested before.`);
    if (nottested.length) return testVideos(nottested, results);
    console.log(`Nothing to do. all migrated Videos were tested.`);
    printResults(results);
  });
});
