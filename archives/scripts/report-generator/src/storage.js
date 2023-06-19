const hydraLocation = "https://hydra.joystream.org/graphql";
const axios = require("axios");
const fs = require("fs");

const getAssets = async () => {
  const query = {
    query: `\nquery {
  videos (limit:1000000, orderBy:createdAt_DESC){
    id
    title
    updatedAt
    createdAt
    createdInBlock
    mediaDataObject {
      joystreamContentId
      liaisonJudgement
      ipfsContentId
      liaison {
        workerId
        metadata
        isActive
      }
    }
  }
}\n`,
  };
  console.debug(`Fetching data IDs from ${hydraLocation}`);
  return axios.post(hydraLocation, query).then(({ data }) => data.data.videos);
};

const getVideosPerProvider = (assets) => {
  const providers = {};
  assets.forEach((a) => {
    if (!a.mediaDataObject?.liaison) return;
    const liaison = a.mediaDataObject.liaison;
    const worker = liaison.workerId;

    if (!providers[worker])
      providers[worker] = { first: a.createdAt, ...liaison, videos: [] };

    providers[worker].videos.push(a);

    if (providers[worker].first > a.createdAt)
      providers[worker].first = a.createdAt;
  });

  const lastProviderAdded = Object.values(providers).reduce(
    (max, provider) => (max > provider.first ? max : provider.first),
    Object.values(providers)[0].first
  );

  return Object.values(providers)
    .map((p) => {
      // find liaisons after last proivder was added
      const recent = p.videos.filter((v) => v.createdAt > lastProviderAdded);
      return { ...p, recent };
    })
    .sort((a, b) => b.recent.length - a.recent.length);
};

const writeTable = (providers) => {
  let table = `| WorkerId | Metadata | Videos | First Liaison | Recent* | Pending |\n|---|---|---|---|---|---|\n`;
  providers.forEach((p) => {
    const date = p.first.split("T")[0];
    table += `| ${p.workerId} | ${p.metadata} | ${p.videos.length} | ${date} | ${p.recent.length} |\n`;
  });
  return table + `\n* Since last provider was added.`;
};

getAssets().then((assets) => {
  const liaisons = getVideosPerProvider(assets);
  fs.writeFileSync("liaisons.md", writeTable(liaisons));
  fs.writeFileSync("liaisons.json", JSON.stringify(liaisons));
  console.log("Wrote liaisons.md and liaisons.json");
});
