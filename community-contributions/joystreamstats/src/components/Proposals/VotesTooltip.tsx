import React from "react";
import { Table } from "react-bootstrap";
import { Vote } from "../../types";

const VotesTooltip = (props: {
  getHandle: (id: number) => string;
  votes?: Vote[];
}) => {
  const { getHandle } = props;
  let votes;

  if (props.votes)
    votes = props.votes.filter((v) => (v.vote === `` ? false : true));
  if (!votes) return <div>Fetching votes..</div>;
  if (!votes.length) return <div>No votes yet.</div>;

  return (
    <Table className="text-left text-light">
      <tbody>
        {votes.map((v: { memberId: number; vote: string }) => (
          <tr key={`vote-${v.memberId}`}>
            <td>{getHandle(v.memberId)}:</td>
            <td>{v.vote}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default VotesTooltip;
