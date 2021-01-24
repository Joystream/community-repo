This report has been generated in response to Community Bounty 6 (#71).

Task: Research the costs and parameter changes associated with increasing the Validator count substantially.

# 1. Produce a report estimating the costs, for the validators themselves and other tJOY holders, associated with a larger validator set.
## What is a good estimate of the (current) running costs for a validators? This assumes running a VPS from some of the bigger actors around.

The costs for a VPS to run a reliable and stable validator node range from 5 to 15 $ / month depending on location and hosting provider.
Hardware demands are around 40 to 50% constant CPU load for a 2.5 GHz core and at least 19 GB of disk space.

## What is the weekly "cost" for the platform (in terms of tJOY and USD) the last 4 weeks?

The total reward grew constantly from 18426 two weeks ago up to 20875 JOY per hour which is related to increasing amount staked.

Current costs amount to 157$ per week (3.4 M tJOY).

 time | payout JOY | payout $ | payout $ / validator
-- | -- | -- | --
per hour |    20.7 K  |       0.93  | 0.02
per day |     496.8 K  | 45  | 0.15
per week |    3.4776 M | 157  | 3.7
per month |   13.9 M | 628 | 15

## How much of the returns are not cashed out?

I ran a script to compare validator stakes at present and 50 eras before:
  - 14 were unchanged: rewards are probably cashed out
  - 29 stakes rose: rewards are staked
  - 2 reduced: role changed or stake was cashed out

Hence around 65 to 70 % of rewards are probably not cashed out.

## Have there been any slashes in this period?

Not according to @bwhm:

> AFAIK, there has been no slashes on the current network 🙂
> It used to be way to frequent, but currently, it’s very rare…

This can be verified with a script to gather information about each validator:

`.staking.spanSlash`: Summary per validator
`.staking.slashingSpans`: Result per validator and span
`.staking.validatorSlashInEra`: Result per validator and era
`.staking.nominatorSlashInEra` Result ver validator and era

`api.query.staking.slashingSpans(accountId)` returns an object like `{spanIndex: 2, lastStart: 2793, lastNonzeroSlash: 0, prior: [2, 25]}`. Iterating over all validators none had a `lastNonzeroSlash` unequal 0. Without completely understanding all of the returned properties this seems to indicate that there were indeed no slashes, at least during the last two weeks.

# 2. Proposed parameters for a set of potential 'Max Validator Count' values
## How much would the required returns be (in tJOY and USD) per week for each of the proposed validators counts to stay profitable?

Recently the validator count has been increased from 42 to 45 and the reward per validator dropped from 506 to 470 tJOY per hour. To avoid drastic changes in rewards the amount staked and total issuance need to grow accordingly.

validator count | tJOY /w | $ /w
--|--|--
100 | 8178240 | 351
200 | 16356480 | 701
300 | 24534720 | 1052
500 | 40891200 | 1753

For details see tables on https://joystreamstats.live/mint

## What would the runtime parameters need to be set to to account for this?

IIUIC the total reward (`staking.erasValidatorReward`) which is distributed equally among validators depends on maximum inflation around 25% of total issuance being staked. To keep validator rewards constant while doubling the number of validators, twice as many tokens have to be minted per era. To rise the validator count from 50 to 500 an inflation rate of 1000% would be required.

For details see [Polkadot Iinflation Model](https://research.web3.foundation/en/latest/polkadot/economics/1-token-economics.html#inflation-model)