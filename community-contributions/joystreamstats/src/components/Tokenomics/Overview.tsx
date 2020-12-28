import React from "react";
import { Table } from "react-bootstrap";

import { Tokenomics } from "../../types";

const Overview = (props: Tokenomics) => {
  const { price, totalIssuance, validators } = props;

  return (
    <Table>
      <tbody>
        <tr>
          <td>Total Issuance</td>
          <td>{totalIssuance} JOY</td>
        </tr>
        <tr>
          <td>Validator Stake</td>
          <td>{validators.total_stake} JOY</td>
        </tr>
        <tr>
          <td>Price</td>
          <td>{Math.floor(+price * 100000000) / 100} $ / 1 M JOY</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default Overview;
