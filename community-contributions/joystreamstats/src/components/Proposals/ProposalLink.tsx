import React from "react";
import {Link} from "react-router-dom"

const ProposalLink = (props: any) => {
  return (
    <div>
      <Link to={`/proposal/${props.id}`}>
        {props.title}
      </Link>
    </div>
  );
};

export default ProposalLink;
