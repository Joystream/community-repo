<p align="center"><img src="/img/bounties_new.svg"></p>

## Bounty Status

| ID | Title                        | Issue | Opened   | Reward | Forum Thread                                             | Status/Grading     | PR  | Proposal                                             |
|----|------------------------------|-------|----------|--------|----------------------------------------------------------|--------------------|-----|------------------------------------------------------|
| 1  | Update Telegram Bot          | #23   | 23.09.20 | $300   | [118](https://testnet.joystream.org/#/forum/threads/118) | $300 - 01.11.20    | #36 | [32](https://testnet.joystream.org/#/proposals/historical/32)   |
| 2  | Testing of 'polkadot-js'     | #32   | 23.09.20 | $200   | [129](https://testnet.joystream.org/#/forum/threads/129) | $200 - 05.01.20    | #67 | [87](https://testnet.joystream.org/#/proposals/historical/87)   |
| 3  | Improve Telegram Bot(s)      | #41   | 08.11.20 | $225   | [130](https://testnet.joystream.org/#/forum/threads/130) | $25 - 05.12.20     | #47 | [49](https://testnet.joystream.org/#/proposals/historical/49)   |
| 4  | Improve Telegram Bot(s)      | #51   | 05.12.20 | $225   | [158](https://testnet.joystream.org/#/forum/threads/158) | Complete    | NA  | NA                                                   |
| 5  | JS Telegram Sticker pack     | #52   | 05.12.20 | $400   | [169](https://testnet.joystream.org/#/forum/threads/169) | $300          | NA  | NA                                                   |
| 6  | Increase Validator Research  | #71   | 17.01.21 | $200   | [186](https://testnet.joystream.org/#/forum/threads/186) | $200 - 13.02.21    | #77 | [116](https://testnet.joystream.org/#/proposals/historical/116) |
| 7  | Joystream Player Loading     | #85   | 15.02.21 | $400   | [214](https://testnet.joystream.org/#/forum/threads/214) | Withdrawn - No interest | NA  | NA                                              |
| 8  | Ledger on Joystream          | #86   | 15.02.21 | $300   | [215](https://testnet.joystream.org/#/forum/threads/215) | $450 - 13.05.21    | #171| [56])(https://testnet.joystream.org/#/proposals/56)  |
| 9  | Repo/Docs Improvements       | #87   | 15.02.21 | $400   | [216](https://testnet.joystream.org/#/forum/threads/216) | Weekly Bounty          | NA  | NA                                                   |
| 10 | Upload Public Domain Content | #88   | 15.02.21 | $5*    | [217](https://testnet.joystream.org/#/forum/threads/217) | Weekly Bounty          | NA  | NA                                                   |
| 11 | Design Community Repo Banner | #89   | 15.02.21 | $250   | [218](https://testnet.joystream.org/#/forum/threads/218) | $300 - 13.05.21    | NA  | NA                                                   |
| 12 | Deploy Reliable Endpoints | #101   | 12.03.21 | $200   | [324](https://testnet.joystream.org/#/forum/threads/324) | Completed       | NA  | NA                                                   |
| 13 | Research Discord Bots | #123   | 12.03.21 | $200   | [326](https://testnet.joystream.org/#/forum/threads/326) | $450          | #131, #133   | NA                                                   |
| 14 | Polkadot/Substrate Videos | #143   | 19.04.21 | $50   | [358](https://testnet.joystream.org/#/forum/threads/358) | Discontinued - Pending Payouts | #157  | [35](https://testnet.joystream.org/#/proposals/35), [37](https://testnet.joystream.org/#/proposals/37), [37](https://testnet.joystream.org/#/proposals/37), [40](https://testnet.joystream.org/#/proposals/40), [41](https://testnet.joystream.org/#/proposals/41) |                                                   |
| 15 | Transcribe Community Updates | #143   | 20.04.21 | $400   | [363](https://testnet.joystream.org/#/forum/threads/363) | $375 - 15.06.2021  | #199 | [166](https://testnet.joystream.org/#/proposals/166)            |
| 17 | Discord Video Bot | #151   | 20.04.21 | $100   | [362](https://testnet.joystream.org/#/forum/threads/362) | Completed   | NA  | NA                         |
| 18 | Original Video Bounty | #162   | 29.05.21 | up to $200  | [422](https://testnet.joystream.org/#/forum/threads/422) | Open   | NA  | NA                         |
| 19 | Validator Logging Tool | #161   | 20.04.21 | $400   | [381](https://testnet.joystream.org/#/forum/threads/381) | Announced          | NA  | NA                         |


## Bounties Management
Part of the job for the Council is to manage these bounties. The tasks associated with that are:
1. Familiarizing themselves with the tasks specified in the issue
2. Seeking further information from Jsgenesis on any ambiguous or missing items
3. Deciding on the format, full workflow and process required
4. Creating a forum thread with:
  - Link to the issue with full description
  - Specify the format and workflow
  - If applicable:
    - list what it takes to be assigned the bounty
    - assign a dedicated manager for the bounty
    - set milestones/timelines
5. Update the [json](/bounties-overview/bounties-status.json) in accordance with the [schema](/bounties-overview/bounties). See explanation [here](#bounties-schema).
6. Assign a community member`*`, and update json
7. Follow up as required
8. Once a non-final spending proposal`**` is made:
  - Ensure it's in line with the workflow set
  - Review the work submitted
  - Approve if appropriate
9. Once the final spending proposal is made:
  - Ensure it's in line with the workflow set out
  - Verify the Jsgenesis requirements are met (eg. a PR is made)
  - Review/grade the work submitted
  - Check if the requested funds matches the expected payout(s)
  - Approve the spending proposal
  - Tag @bhwm and @blrhc to review
10. After the PR is closed, regardless of result, update json


### Bounties Schema
The Bounties displayed on our website [here](https://www.joystream.org/get-started) is read from [this](/bounties-overview/bounties-status.json) json file.

Because of this, it's quite important the Council updates this json as soon as a change occurs, so anyone visiting the website gets the correct information. Making sure the json is updated correctly is even more important, as even a small formatting error will "break" that section of the website. Verifying the json against the [schema](/bounties-overview/bounties.schema.json) can be done [here](https://www.jsonschemavalidator.net/).

Here are some rules:
- As soon as a new issue, with a new Bounty is created, Jsgensis will create a PR (and request permission to merge) updating the json with required properties:
  - `id`
  - `title`
  - `description`
  - `openedDate`
  - `links`
  - `reward`
  - `tags`
- The Council will then create forum thread, and add the new link to the `links` array. Note that this new link must be added before the link to the issue to replace the link on the website. Any other changes that has been made (in agreement with Jsgenesis) can also be made.
- Although it will not change the presentation on the website, the `status` and `format` should also be updated every time it changes.
- Once the Bounty is completed, it should be moved from `activeBounties` to `closedBounties`, in addition to adding `closedDate`.

Note that this schema may change over time, so always verify against the schema, even if you are "sure" it's correct!
