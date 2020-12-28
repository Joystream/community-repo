import React from "react";
import { Button, OverlayTrigger, Tooltip, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Member, ProposalDetail } from "../../types";
import LeaderBoard from "./Leaderboard";

// TODO fetch from chain
const announcingPeriod = 28800;
const votingPeriod = 14400;
const revealingPeriod = 14400;
const termDuration = 144000;
const cycle = termDuration + announcingPeriod + votingPeriod + revealingPeriod; // 201600

const Back = () => {
  return (
    <Button variant="secondary" className="btn btn-secondary p-1 m-0">
      <Link to={`/tokenomics`}>back</Link>
    </Button>
  );
};

const Rounds = (props: {
  members: Member[];
  councils: number[][];
  proposals: any;
}) => {
  const { councils, members, proposals } = props;
  return (
    <div className="w-100">
      <Table className="w-100 text-light">
        <thead>
          <tr>
            <th>Round</th>
            <th>Announced</th>
            <th>Voted</th>
            <th>Revealed</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {councils.map((council, i: number) => (
            <tr key={i} className="">
              <td>{i + 1}</td>
              <td>{1 + i * cycle}</td>
              <td>{28801 + i * cycle}</td>
              <td>{43201 + i * cycle}</td>
              <td>{57601 + i * cycle}</td>
              <td>{57601 + 201600 + i * cycle}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <LeaderBoard
        cycle={cycle}
        councils={councils}
        members={members}
        proposals={proposals}
      />

      <h2 className="w-100 text-center text-light">Votes per Proposal</h2>
      {councils.map((council, i: number) => (
        <CouncilVotes
          key={i}
          round={i + 1}
          council={council}
          members={props.members}
          proposals={props.proposals.filter(
            (p: ProposalDetail) =>
              p &&
              p.createdAt > 57601 + i * cycle &&
              p.createdAt < 57601 + (i + 1) * cycle
          )}
        />
      ))}
    </div>
  );
};

const CouncilVotes = (props: {
  round: number;
  council: number[];
  members: Member[];
  proposals: ProposalDetail[];
}) => {
  const { council, members, proposals, round } = props;

  let councilMembers: Member[] = [];
  council.forEach((id) => {
    const member = members.find((m) => m.id === id);
    councilMembers.push(
      member || { id, handle: String(id), account: String(id) }
    );
  });

  const fail = "btn btn-outline-danger";
  const styles: { [key: string]: string } = {
    Approved: "btn btn-outline-success",
    Rejected: fail,
    Canceled: fail,
    Expired: fail,
    Pending: "btn btn-outline-warning",
  };

  return (
    <Table className="text-light text-center">
      <thead>
        <tr>
          <th className={`text-left`}>Round {round}</th>
          {councilMembers.map((member) => (
            <th key={member.handle}>{member.handle}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {proposals
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((p) => (
            <tr key={p.id} className={`text-left`}>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id={`tooltip-${p.id}`}>
                    <div>{p.result}</div>
                  </Tooltip>
                }
              >
                <td className={`text-left p-1 ${styles[p.result]}`}>
                  {p.title} ({p.id})
                </td>
              </OverlayTrigger>

              {p.votesByMemberId &&
                council.map((memberId) => (
                  <td key={memberId}>
                    <Vote votes={p.votesByMemberId} memberId={memberId} />
                  </td>
                ))}
            </tr>
          ))}
        <tr>
          <td className="text-center" colSpan={7}>
            <Back />
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

const Vote = (props: {
  votes?: { vote: string; memberId: number }[];
  memberId: number;
}) => {
  const { votes, memberId } = props;

  if (!votes) return <div></div>;
  const v = votes.find((v) => v.memberId === memberId);
  if (!v) return <div></div>;

  const styles: { [key: string]: string } = {
    Approve: "btn btn-success",
    Reject: "btn btn-outline-danger",
    Abstain: "btn btn-outline-light",
  };

  return (
    <div style={{ width: 100 }} className={`text-center p-1 ${styles[v.vote]}`}>
      {v.vote}
    </div>
  );
};

export default Rounds;
