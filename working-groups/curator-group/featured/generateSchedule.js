const fs = require("fs");

const outfile = "schedule.txt";

// load videos and extract category IDs
const categories = [];
const videos = require("./videos.json");
videos.forEach(
  ({ categoryId }) =>
    categories.includes(categoryId) || categories.push(categoryId)
);

const selectVideos = (list, count) => {
  let selected = [];
  for (let n = 0; n < count; ++n) {
    // remove selected videos
    const available = list.filter((v) => !selected.includes(v));
    // select random video
    const id = Math.floor(Math.random() * available.length);
    selected.push(available[id].videoId);
  }
  return selected;
};

// generate schedule
let schedule = ``;
categories.forEach((categoryId) => {
  const list = videos.filter((v) => v && v.categoryId === categoryId);
  const name = list[0].category;
  schedule += `\nCategory ${categoryId}: ${name} (${list.length} videos):\n`;

  // trim list to IDs for easier filtering
  const available = list.map(({ videoId }) => videoId);

  for (let day = 1; day <= 7; ++day) {
    const featured = selectVideos(list, 3); // select n videos
    const left = available.filter(({ videoId }) => !featured.includes(videoId));
    schedule += `- Day ${day}: [ ${featured.join(", ")} ]\n`;
  }
});
fs.writeFileSync(outfile, schedule);
console.log(`Wrote schedule to ${outfile}`, schedule);
