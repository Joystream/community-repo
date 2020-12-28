import React from "react";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Member, ProposalDetail, ProposalPost } from "../../types";
import Loading from "..//Loading";
import Row from "./Row";

const Proposals = (props: {
  now: number;
  block: number;
  proposals: ProposalDetail[];
  proposalPosts: ProposalPost[];
  members: Member[];
}) => {
  const { proposalPosts, block, now, members } = props;
  const startTime: number = now - block * 6000;

  // prepare proposals

  //  - remove empty
  const proposals = props.proposals
    .filter((p) => p)
    .sort((a, b) => b.id - a.id);

  // - communicate loading state
  if (!proposals.length)
    return (
      <div className="box">
        <h1>Loading</h1>
        <Loading />
      </div>
    );

  // - calculate blocks until finalized
  const durations: any = proposals.map((p) =>
    p.finalizedAt ? p.finalizedAt - p.createdAt : 0
  );

  // - calculate mean voting duration
  const avgBlocks =
    durations.reduce((a: number, b: number) => a + b) / durations.length;
  const avgDays = avgBlocks ? Math.floor(avgBlocks / 14400) : 0;
  const avgHours = avgBlocks
    ? Math.floor((avgBlocks - avgDays * 14400) / 600)
    : 0;

  // - list all proposals
  return (
    <div className="bg-light text-center">
      <Link to={`/`}>
        <Button variant="secondary" className="p-1 m-3">
          back
        </Button>
      </Link>
      <h1>Joystream Proposals</h1>
      <Table>
        <thead>
          <tr className="bg-dark text-light font-weight-bold">
            <td>ID</td>
            <td className="text-right">Description</td>
            <td>Votes</td>
            <td>
              Voting Duration
              <br />
              Average: {avgDays ? `${avgDays}d` : ""}{" "}
              {avgHours ? `${avgHours}h` : ""}
            </td>
            <td className="text-right">Created</td>
            <td className="text-left">Finalized</td>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <Row
              key={p.id}
              {...p}
              block={block}
              members={members}
              startTime={startTime}
              posts={proposalPosts.filter((post) => post.threadId === p.id)}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Proposals;
