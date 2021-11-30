const fs = require("fs");

const outfile = `videos.json`

const videos = fs
  .readFileSync(`./list`, `utf-8`)
  .split(`\n`)
  .map((path) => {
    // ./Howto _ Style 11/12-2066.mp4
    const match = path.match(/\.\/([^\/]+) (\d+)\/(\d+)-(\d+)\.mp4/);
    if (match) {
      const category = match[1];
      const count = match[2];
      const categoryId = match[3];
      const videoId = match[4];
      return { category, count, categoryId, videoId };
    }
  }).filter(v=>v)
fs.writeFileSync(outfile, JSON.stringify(videos));
console.log(`Wrote ${videos.length} videos to ${outfile}`);
