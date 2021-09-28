import axios from 'axios';

let cachedFmInfo: any = null;
let lastUpdateFmDate = 0;

export default async function getFmInfo() {
  if (!cachedFmInfo || new Date().getTime() - lastUpdateFmDate > 1000 * 600) {
    console.log('get new fmData');
    cachedFmInfo = await axios.get(
      'https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json'
    );
    lastUpdateFmDate = new Date().getTime();
  }

  return cachedFmInfo;
}
