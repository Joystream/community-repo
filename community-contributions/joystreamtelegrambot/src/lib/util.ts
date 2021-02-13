import { Api, Options, Proposals } from "../types";
import moment from "moment";

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

export const exit = (log: (s: string) => void) => {
  log("\nNo connection, exiting.\n");
  process.exit();
};
