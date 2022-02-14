import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import {
  Announcing,
  ElectionStage,
  Revealing,
  Seats,
  Voting,
} from "@joystream/types/council";
import { Null, Option, u32 } from "@polkadot/types";
import {
  CouncilData,
  CouncilMemberData,
  Participant,
  VoterData,
} from "./interfaces";
import { getParticipantAt } from "./functions";
import { BalanceOf, BlockNumber, Hash } from "@polkadot/types/interfaces";
import { Mint, MintId } from "@joystream/types/mint";

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("ws://127.0.0.1:9944");

  //If you want to play around on our staging network, go ahead and connect to this staging network instead.
  //const provider = new WsProvider('wss://testnet-rpc-2-singapore.joystream.org');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider, types });
  // made this example with historical data, so you can check different councils/stages
  const blocks: number[] = [259200, 259201];

  // discounting this voter
  const joystreamVoter = "5CJzTaCp5fuqG7NdJQ6oUCwdmFHKichew8w4RZ3zFHM8qSe6";

  const councils: CouncilData[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const councilMembers: CouncilMemberData[] = [];
    const blockHash = (await api.rpc.chain.getBlockHash(blocks[i])) as Hash;
    const electionStatus = (await api.query.councilElection.stage.at(
      blockHash
    )) as Option<ElectionStage>;
    const electionRound = +((await api.query.councilElection.round.at(
      blockHash
    )) as u32);
    console.log(`
      at block: ${blocks[i]},
      the election stage was: ${electionStatus.value.toString()},
      of election round: ${electionRound}
    `);
    if (electionStatus.value instanceof ElectionStage) {
      const electionStage = electionStatus.unwrap();
      if (electionStage.value instanceof Announcing) {
        console.log(
          "In 'Announcing' stage - ends at block",
          +electionStage.value
        );
      } else if (electionStage.value instanceof Voting) {
        console.log("In 'Voting' stage - ends at block", +electionStage.value);
      } else if (electionStage.value instanceof Revealing) {
        console.log(
          "In 'Revealing' stage - ends at block",
          +electionStage.value
        );
      } else {
      }
    }
    const activeCouncil = (await api.query.council.activeCouncil.at(
      blockHash
    )) as Seats;
    if (!activeCouncil.isEmpty) {
      const elected: Participant[] = [];
      for (let member of activeCouncil) {
        let otherStake = 0;
        let jsgStake = 0;
        const councilMemberId = await getParticipantAt(
          api,
          member.member,
          blockHash
        );
        const voters: VoterData[] = [];
        elected.push(councilMemberId);
        for (let backer of member.backers) {
          const voterId = await getParticipantAt(api, backer.member, blockHash);
          const voter: VoterData = {
            voterId,
            voterStake: +backer.stake,
            stakeRatioExJSGvotes: 0,
            kpiRewardRatio: 0,
          };
          otherStake += +backer.stake;
          if (backer.member.toString() === joystreamVoter) {
            jsgStake += +backer.stake;
          }
          voters.push(voter);
        }
        const ownStake = +member.stake;
        const totalStakeExJSGvotes = +member.stake + otherStake - jsgStake;
        const totalStake = +member.stake + otherStake;
        const councilMember: CouncilMemberData = {
          councilMemberId,
          totalStake,
          totalStakeExJSGvotes,
          ownStake,
          otherStake,
          otherStakeExJSGvotes: otherStake - jsgStake,
          stakeRatioExJSGvotes: ownStake / totalStakeExJSGvotes,
          voters,
        };
        councilMembers.push(councilMember);
      }
      let totalStakes = 0;
      let totalStakesExJSGvotes = 0;
      let ownStakes = 0;
      let otherStakes = 0;
      let otherStakesExJSGvotes = 0;

      for (let councilMember of councilMembers) {
        totalStakes += councilMember.totalStake;
        totalStakesExJSGvotes += councilMember.totalStakeExJSGvotes;
        ownStakes += councilMember.ownStake;
        otherStakes += councilMember.otherStake;
        otherStakesExJSGvotes += councilMember.otherStakeExJSGvotes;
      }
      for (let councilMember of councilMembers) {
        councilMember.kpiRewardRatio =
          councilMember.ownStake / totalStakesExJSGvotes;
        for (let voter of councilMember.voters) {
          if (voter.voterId.accountId != joystreamVoter) {
            voter.stakeRatioExJSGvotes =
              voter.voterStake / councilMember.totalStakeExJSGvotes;
            voter.kpiRewardRatio = voter.voterStake / totalStakesExJSGvotes;
          }
        }
      }
      const termEnd = +((await api.query.council.termEndsAt.at(
        blockHash
      )) as BlockNumber);
      const announcing = +((await api.query.councilElection.announcingPeriod.at(
        blockHash
      )) as BlockNumber);
      const voting = +((await api.query.councilElection.votingPeriod.at(
        blockHash
      )) as BlockNumber);
      const revealing = +((await api.query.councilElection.votingPeriod.at(
        blockHash
      )) as BlockNumber);
      const term = +((await api.query.councilElection.newTermDuration.at(
        blockHash
      )) as BlockNumber);

      // this will not always be correct...
      const electedAtBlock = termEnd - term;
      const newCouncilStartsAt = termEnd + announcing + voting + revealing;
      const electedHash = (await api.rpc.chain.getBlockHash(
        electedAtBlock
      )) as Hash;
      const getRewardInterval = (await api.query.council.payoutInterval.at(
        electedHash
      )) as Option<BlockNumber>;

      const councilMint = (await api.query.council.councilMint.at(
        electedHash
      )) as MintId;
      const mintAtStart = (await api.query.minting.mints.at(
        electedHash,
        councilMint
      )) as Mint;
      const mintCapacityAtStart = +mintAtStart.capacity;

      let rewardInterval = 3600;
      if (!(getRewardInterval.value instanceof Null)) {
        rewardInterval = +getRewardInterval.unwrap();
      }

      const rewardamountPerPayout =
        +((await api.query.council.amountPerPayout.at(
          electedHash
        )) as BalanceOf);
      const expectedIndividualRewards =
        (rewardamountPerPayout * term) / rewardInterval;

      const council: CouncilData = {
        electionCycle: +electionRound,
        electedAtBlock,
        mintCapacityAtStart,
        rewardamountPerPayout,
        rewardInterval,
        termEnd: termEnd,
        expectedIndividualRewards,
        newCouncilStartsAt,
        totalStakes,
        totalStakesExJSGvotes,
        ownStakes,
        otherStakes,
        otherStakesExJSGvotes,
        elected,
        electionData: councilMembers,
      };
      const bestHeight = +(await api.derive.chain.bestNumber());
      if (bestHeight > newCouncilStartsAt) {
        const endHash = (await api.rpc.chain.getBlockHash(
          newCouncilStartsAt
        )) as Hash;
        const mintAtEnd = (await api.query.minting.mints.at(
          endHash,
          councilMint
        )) as Mint;
        council.mintCapacityAtEnd = +mintAtEnd.capacity;
        council.councilSpending =
          +mintAtEnd.total_minted - +mintAtStart.total_minted;
      }
      councils.push(council);
    }
  }
  console.log("councils", JSON.stringify(councils, null, 4));
  api.disconnect();
}

main();
