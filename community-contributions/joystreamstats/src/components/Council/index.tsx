import React from "react";
import { Link } from "react-router-dom";
import ElectionStatus from "./ElectionStatus";
import User from "../User";
import Loading from "../Loading";

const Member = (props: { id: number; findHandle: (id: number) => string }) => {
  const handle = props.findHandle(props.id);
  return (
    <div className="col">
      <User id={handle} handle={handle} />
    </div>
  );
};

const Council = (props: {
  findHandle: (id: number) => string;
  council: number[];
  councilElection?: any;
  block: number;
}) => {
  const { findHandle, council, block, councilElection } = props;
  const half = Math.floor(council.length / 2);
  const show = council.length;

  return (
    <div className="box">
      <ElectionStatus show={show} block={block} {...councilElection} />
      <h3>Council</h3>

      {(show && (
        <div className="d-flex flex-column">
          <div className="d-flex flex-row">
            {council.slice(0, half).map((id) => (
              <Member key={String(id)} id={id} findHandle={findHandle} />
            ))}
          </div>
          <div className="d-flex flex-row">
            {council.slice(half).map((id) => (
              <Member key={String(id)} id={id} findHandle={findHandle} />
            ))}
          </div>
        </div>
      )) || <Loading />}
      <hr />

      <Link to={`/tokenomics`}>Reports</Link>
    </div>
  );
};

export default Council;
