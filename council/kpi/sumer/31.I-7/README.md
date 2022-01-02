# [31.I-7 - Joystream Node Issues](https://blog.joystream.org/sumer-kpis/#31.I-7)

1. See [Offences](Offences.md)

2. [Rewards](Rewards.md) (generate as described in [Verfify](#verify) below)

3. [Offences](Offences.md) shows no significant irregularities around blocks `#2661218` and `#2661813`. Only `5CSbnQLeemPiiLBx99CPu3rRSxJqSiFcECygVegdH42Yf6De` was offline before and after. However between era blocks `#2661121` and `#2661218` lie 97 blocks, 3 less than the usual 100 blocks, indicating that some blocks were delayed (possibly due to inresponsive validator(s)).

[Rewards](Rewards.md): Comparing the validator sets  in blocks `#2661074` (69 validators) and `#2661282` (68 validators) revealed that `5FcKL1644dNevezrVCHmNEfPTX35LxqcwCAvEswp94iURA41` went offline at the time of the first incident at block `#2661218`. The next payout after `#2661813` at `#2662531` rewarded only 60 validators.

At `2664121` (60) and `2664127` (36) all points were divided between two addresses: `5FZ8vJhCLm8veh6MeqGmXMD19gVW3zjBaTqHaC7T4FyYhti5` and `5FYu2adiXmhpLzJr1hZsJeFLMxjJKcfd82WTm2WyyjCGV11u`. This pattern repeated at several occations and can be confirmed inspecting the raw [blocks.json](blocks.json).

## Verify

Download and extract [block_events.tar.xz](https://joystreamstats.live/static/events-antioch-sumer.tar.xz) to `contributions/tech/report-generator/cache` (or generate your own).

```
$ cd council/kpi/sumer/31.I-7
$ yarn
$ node filter_events.js ../../../../contributions/tech/report-generator/cache/2*
Loaded 1094389 blocks.
```
