import React from "react";
import { Button } from "react-bootstrap";

const VoteButton = (props: { show: boolean; url: string }) => {
  const { show, url } = props;
  if (!show) return <div />;

  return (
    <Button variant="danger">
      <a href={url}>Vote!</a>
    </Button>
  );
};

export default VoteButton;
