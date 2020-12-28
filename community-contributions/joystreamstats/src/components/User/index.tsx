import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { domain } from "../../config";

const shortName = (name: string) => {
  return `${name.slice(0, 5)}..${name.slice(+name.length - 5)}`;
};

const User = (props: { id: string; handle?: string }) => {
  const { id, handle } = props;
  const href = `${domain}/#/members/${handle || ``}`;
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip id={id}>{id}</Tooltip>}
    >
      <div className="user mx-1">
        <a href={href}>{handle ? handle : shortName(id)}</a>
      </div>
    </OverlayTrigger>
  );
};

export default User;
