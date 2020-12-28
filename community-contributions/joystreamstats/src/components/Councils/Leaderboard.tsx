import React from "react";
import { Table } from "react-bootstrap";

import { Member, ProposalDetail } from "../../types";

interface CouncilMember {
  handle: string;
  votes: number;
  proposalCount: number;
  percentage: number;
}

interface CouncilVotes {
  proposalCount: number;
  members: CouncilMember[];
}

const LeaderBoard = (props: {
  proposals: ProposalDetail[];
  members: Member[];
  councils: number[][];
  cycle: number;
}) => {
  const { cycle, councils, proposals } = props;

  const summarizeVotes = (id: number, propList: ProposalDetail[]) => {
    let votes = 0;
    propList.forEach((p) => {
      if (!p || !p.votesByMemberId) return;
      const vote = p.votesByMemberId.find((v) => v.memberId === id);
      if (vote && vote.vote !== `Reject`) votes++;
    });
    return votes;
  };

  let councilMembers: Member[] = [];

  const councilVotes: CouncilVotes[] = councils.map(
    (council, i: number): CouncilVotes => {
      const start = 57601 + i * cycle;
      const end = 57601 + (i + 1) * cycle;
      const proposalsRound = proposals.filter(
        (p) => p && p.createdAt > start && p.createdAt < end
      );
      const proposalCount = proposalsRound.length;

      const members: CouncilMember[] = council.map(
        (id: number): CouncilMember => {
          const member = props.members.find((m) => m.id === id);
          if (!member)
            return { handle: ``, votes: 0, proposalCount, percentage: 0 };

          councilMembers.find((m) => m.id === id) ||
            councilMembers.push(member);

          let votes = summarizeVotes(Number(member.id), proposalsRound);
          const percentage = Math.round((100 * votes) / proposalCount);
          return { handle: member.handle, votes, proposalCount, percentage };
        }
      );

      return { proposalCount, members };
    }
  );

  councilMembers = councilMembers
    .map((m) => {
      return { ...m, id: summarizeVotes(Number(m.id), props.proposals) };
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div className={`text-light m-3`}>
      <h2 className="w-100 text-center text-light">Votes per Council Member</h2>
      <Table className={`text-light`}>
        <thead>
          <tr>
            <th>Council Member</th>
            <th>Total Votes</th>
            {councilVotes.map((c, i: number) => (
              <th key={`round-${i + 1}`}>Round {1 + i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {councilMembers.map((member: Member) => (
            <MemberRow
              key={member.handle}
              member={member}
              votes={councilVotes}
            />
          ))}
          <tr>
            <td>Proposals</td>
            <td>{proposals.length}</td>
            {councilVotes.map((round, i: number) => (
              <td key={`round-${i + 1}`}>{round.proposalCount}</td>
            ))}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

const MemberRow = (props: { member: Member; votes: CouncilVotes[] }) => {
  const { votes } = props;
  const { handle } = props.member;
  let totalVotes = 0;
  let totalProposals = 0;

  votes.forEach((c) => {
    const m = c.members.find((member) => member.handle === handle);
    if (!m) return;
    totalVotes += m.votes;
    totalProposals += m.proposalCount;
  });

  const totalPercent = Math.round((100 * totalVotes) / totalProposals);

  return (
    <tr key={handle}>
      <td>{handle}</td>
      <td>
        {totalVotes} / {totalProposals} ({totalPercent}%)
      </td>
      {props.votes.map((c, round: number) => (
        <RoundVotes
          key={`round-${round + 1}-${handle}`}
          member={c.members.find((member) => member.handle === handle)}
        />
      ))}
    </tr>
  );
};

const RoundVotes = (props: {
  member?: { handle: string; votes: number; percentage: number };
}) => {
  if (!props.member || props.member.handle === ``) return <td />;

  const { votes, percentage } = props.member;
  return (
    <td>
      {votes} ({percentage}%)
    </td>
  );
};

export default LeaderBoard;
