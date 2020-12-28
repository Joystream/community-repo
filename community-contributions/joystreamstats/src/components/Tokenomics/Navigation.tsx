import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="d-flex flex-row justify-content-center">
      <Link to={`/`}>
        <Button variant="secondary" className="p-1 m-1">
          Back
        </Button>
      </Link>

      <Link to={`/councils`}>
        <Button variant="secondary" className="p-1 m-1">
          Previous Councils
        </Button>
      </Link>
    </div>
  );
};

export default Navigation;
