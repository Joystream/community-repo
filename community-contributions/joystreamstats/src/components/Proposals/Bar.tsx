import React from "react";
import { OverlayTrigger, Tooltip,  } from "react-bootstrap";

const Bar = (props: {
  id: number;
  blocks: number ;
  duration: string;
  period: number;
}) => {
  const { blocks, duration, id, period } = props;
  const percent = 100 * (blocks / period) 
  if (percent <0) return <div>updating ..</div>
  
  return (
    <OverlayTrigger
      key={id}
      placement="right"
      overlay={
        <Tooltip id={String(id)}>
          {Math.floor(percent)}% of {period} blocks
          <br />
          {duration}
        </Tooltip>
      }
    >
      <div
        className="bg-dark mr-2"
        style={{ height: `30px`, width: `${percent}%` }}
      ></div>
    </OverlayTrigger>
  );
};

export default Bar