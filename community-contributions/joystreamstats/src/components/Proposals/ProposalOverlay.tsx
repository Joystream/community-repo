import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import htmr from "htmr";
import { ProposalParameters } from "@joystream/types/proposals";

const ProposalOverlay = (props: {
  block: number;
  id: number;
  createdAt: number;
  parameters: ProposalParameters;
  title: string;
  message: string;
  description: string;
}) => {
  const { block, createdAt, parameters } = props;

  const remainingBlocks = +createdAt + +parameters.votingPeriod - block;
  const remainingTime = remainingBlocks * 6;
  const days = Math.floor(remainingTime / 86400);
  const hours = Math.floor((remainingTime - days * 86400) / 3600);

  return (
    <OverlayTrigger
      key={createdAt}
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip id={props.title}>
          <div>
            Time to vote: {remainingBlocks} blocks ({days}d {hours}h)
          </div>

          <div className="my-2 p-1 bg-light  text-secondary text-left">
            {props.message.split(/\n/).map((line: string, i: number) => (
              <div key={i}>{htmr(line)}</div>
            ))}
          </div>

          {props.description}
        </Tooltip>
      }
    >
      <div>
        <a href={`https://pioneer.joystreamstats.live/#/proposals/${props.id}`}>
          {props.title}
        </a>
      </div>
    </OverlayTrigger>
  );
};

export default ProposalOverlay;
