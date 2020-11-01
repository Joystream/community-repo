import { Options } from "../types";
import { Proposals } from "../types";
import moment from "moment";

export const parseArgs = (args: string[]): Options => {
  const inArgs = (term: string): boolean => {
    return args.find(a => a.search(term) > -1) ? true : false;
  };

  const options: Options = {
    verbose: inArgs("--verbose") ? 2 : inArgs("--quiet") ? 0 : 1,
    channel: inArgs("--channel"),
    council: inArgs("--council"),
    forum: inArgs("--forum"),
    proposals: inArgs("--proposals")
  };

  if (options.verbose > 1) console.debug("args", args, "\noptions", options);
  return options;
};

export const printStatus = (
  opts: Options,
  data: {
    block: number;
    cats: number[];
    chain: string;
    posts: number[];
    proposals: Proposals;
    threads: number[];
  }
): void => {
  if (opts.verbose < 1) return;

  const { block, chain, proposals, cats, posts, threads } = data;
  const date = moment().format("L HH:mm:ss");
  let message = `[${date}] Chain:${chain} Block:${block} `;

  if (opts.forum)
    message += `Post:${posts[1]} Cat:${cats[1]} Thread:${threads[1]} `;

  if (opts.proposals)
    message += `Proposals:${proposals.current} (Active:${proposals.active.length} Pending:${proposals.pending.length}) `;

  console.log(message);
};

export const exit = (log: (s: string) => void) => {
  log("\nNo connection, exiting.\n");
  process.exit();
};
