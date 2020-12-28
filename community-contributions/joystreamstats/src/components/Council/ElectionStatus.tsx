import React from "react";
import { domain } from "../../config";

const ElectionStage = (props: any) => {
  const { block, stage, termEndsAt } = props;

  if (!stage) {
    if (!block) return <div />;
    const blocks = termEndsAt - block;
    const seconds = blocks * 6;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds - days * 86400) / 3600);
    const minutes = Math.floor(seconds / 60);
    const counter = days ? `${days}d` : hours ? `${hours}h` : `${minutes}min`;
    return <div>Next election in {counter}</div>;
  }

  let stageString = Object.keys(JSON.parse(JSON.stringify(stage)))[0];

  if (stageString === "Announcing")
    return <a href={`${domain}/#/council/applicants`}>Apply now!</a>;

  if (stageString === "Voting")
    return <a href={`${domain}/#/council/applicants`}>Vote now!</a>;

  if (stageString === "Revealing")
    return <a href={`${domain}/#/council/votes`}>Reveal your vote!</a>;

  return <div>{JSON.stringify(stage)}</div>;
};

const ElectionStatus = (props: {
  councilElection?: { termEndsAt: number; round: number; stage: any };
  block: number;
}) => {
  const { councilElection, block } = props;

  if (!councilElection) return <div></div>;

  return (
    <div className="position-absolute text-left text-light">
      <ElectionStage block={block} {...councilElection} />
    </div>
  );
};

export default ElectionStatus;
