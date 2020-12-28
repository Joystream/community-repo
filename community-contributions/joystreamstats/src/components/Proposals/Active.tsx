import React from "react";
import Proposal from "./ProposalOverlay";
import { ProposalDetail } from "../../types";
import Loading from "../Loading";

const ActiveProposals = (props: {
  block: number;
  proposals: ProposalDetail[];
}) => {
  const { block, proposals } = props;
  const active = proposals.filter((p) => p && p.stage === "Active");

  if (!proposals.length) return <Loading />;
  if (!active.length) return <div className="box">No active proposals.</div>;

  return (
    <div>
      {active.map((p, key: number) => (
        <Proposal key={key} block={block} {...p} />
      ))}
    </div>
  );
};

export default ActiveProposals;
