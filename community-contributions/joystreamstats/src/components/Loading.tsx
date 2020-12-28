import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = () => {
  return (
    <div className="h-100 d-flex flex-column flex-grow-1 align-items-center justify-content-center">
      <Spinner
        animation="grow"
        variant="light"
        title="Connecting to Websocket"
      />
    </div>
  );
};

export default Loading;
