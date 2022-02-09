import { apiUrl, statusEndpoint } from "../config";
import { Options, Proposals, MemberHandles, ProposalVotes } from "./types";
import { getCouncil, getMemberHandle, getMemberIdByAccount } from "./lib/api";
import moment from "moment";
import axios from "axios";

//types
import { ApiPromise } from "@polkadot/api";
import { AccountId } from "@polkadot/types/interfaces";

export const parseArgs = (args: string[]): Options => {
  const inArgs = (term: string): boolean => {
    return args.find((a) => a.search(term) > -1) ? true : false;
  };

  const options: Options = {
    verbose: inArgs("--verbose") ? 2 : inArgs("--quiet") ? 0 : 1,
    channel: inArgs("--channel"),
    council: inArgs("--council"),
    forum: inArgs("--forum"),
    proposals: inArgs("--proposals"),
  };

  if (options.verbose > 1) console.debug("args", args, "\noptions", options);
  return options;
};

export const printStatus = (
  opts: Options,
  data: {
    block: number;
    chain: string;
    posts: number[];
    proposals: Proposals;
  }
): void => {
  if (opts.verbose < 1) return;

  const { block, chain, proposals, posts } = data;
  const date = formatTime();
  let message = `[${date}] Chain:${chain} Block:${block} `;

  if (opts.forum) message += `Post:${posts[1]} `;

  if (opts.proposals)
    message += `Proposals:${proposals.current} (Active:${proposals.active.length} Pending:${proposals.executing.length}) `;

  console.log(message);
};

// time
export const formatTime = (time?: any, format = "H:mm:ss"): string =>
  moment(time).format(format);

export const passedTime = (start: number, now: number): string => {
  const passed = moment.utc(moment(now).diff(start)).valueOf();
  const format =
    passed > 86400000
      ? "d:HH:mm:ss[d]"
      : passed > 3600000
      ? "H:mm:ss[h]"
      : "mm:ss[m]";
  return formatTime(passed, format);
};

// status endpoint
const formatPrice = (price: number) =>
  `${Math.floor(price * 100000000) / 100} $`;

export const fetchTokenValue = (): Promise<string> =>
  axios
    .get(statusEndpoint[0])
    .then(({ data }) => formatPrice(+data.price))
    .catch(async () => {
      const { data } = await axios.get(statusEndpoint[1]);
      if (data && !data.error) return formatPrice(+data.price);
      console.log(`Failed to fetch status.`);
      return `?`;
    });

// member handles (tg, discord, github)
export const getMemberHandles = async (): Promise<MemberHandles[]> => {
  console.debug(`Fetching user handles`);
  const rawUrl = `https://raw.githubusercontent.com/Joystream/community-repo/master/council/guides/council_member_discord_usernames.md`;
  return await axios
    .get(rawUrl)
    .then(({ data }) => {
      const rows = data
        .split(`\n`)
        .filter((line: string) => line.includes(`|`))
        .slice(2);
      return rows.map((row: string) => {
        const [, handle, discord, id, telegram, github] = row
          .split(`|`)
          .map((s) => s.trim());
        return { handle, discord: { handle: discord, id }, telegram, github };
      });
    })
    .catch((error) => {
      console.error(`Fetch user handles.`, error.message);
      return [];
    });
};

// find handle from account
export const getMemberHandlesByAccount = async (
  api: ApiPromise,
  handles: MemberHandles[],
  account: AccountId
): Promise<MemberHandles> => {
  const memberId = await getMemberIdByAccount(api, account);
  const handle = await getMemberHandle(api, memberId);
  const member = handles.find((m) => m.handle === handle);
  return { ...member, handle, memberId };
};

export const getCouncilHandles = async (
  api: ApiPromise
): Promise<MemberHandles[]> => {
  const seats = await getCouncil(api);
  const handles: MemberHandles[] = await getMemberHandles();
  return await Promise.all(
    seats.map((seat) => getMemberHandlesByAccount(api, handles, seat.member))
  );
};

// jstats
export const getProposals = async (): Promise<ProposalVotes[]> => {
  console.debug(`Fetching proposals`);
  const { data } = await axios.get(apiUrl + `/v1/proposals`);
  return data;
};
