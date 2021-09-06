import { CacheEvent } from "../types";
import { Mint, MintId } from "@joystream/types/mint";
import { Moment } from "@polkadot/types/interfaces";

export const getPercent = (value1: number, value2: number): number => {
  if (value1 == 0) return value2 > 0 ? Infinity : 0;
  return Number(((value2 * 100) / value1 - 100).toFixed(2));
};

export const momentToString = (moment: Moment) =>
  new Date(moment.toNumber()).toLocaleDateString("en-US");

export const getTotalMinted = (mint: Mint) =>
  Number(mint.getField("total_minted").toString());

export const eventStats = (blockEventsCache: Map<number, CacheEvent[]>) => {
  let sections: {
    [key: string]: { [key: string]: [{ key: number; data: any }] };
  } = {};
  for (let [key, blockEvents] of blockEventsCache) {
    blockEvents.map(({ section, method, data }) => {
      if (!sections[section]) sections[section] = {};
      if (sections[section][method])
        sections[section][method].push({ key, data });
      else sections[section][method] = [{ key, data }];
      if (section === "system" && method === "ExtrinsicSuccess") return;
      if (section === "imOnline" && method === "HeartbeatReceived") return;
      if (section === "imOnline" && method === "AllGood") return;
      if (section === "utility" && method === "BatchCompleted") return;
      if (section === "grandpa" && method === "NewAuthorities") return;
      if (section === "session" && method === "NewSession") return;
      //console.log(section, method, data);
    });
  }
  console.log(`Events:`);
  Object.keys(sections).map((section: string) =>
    Object.keys(sections[section]).map((method: string) =>
      console.log(` ${section}.${method}: ${sections[section][method].length}`)
    )
  );
};
