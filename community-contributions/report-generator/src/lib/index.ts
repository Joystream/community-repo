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
