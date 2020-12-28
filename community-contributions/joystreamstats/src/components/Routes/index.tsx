import { Switch, Route } from "react-router-dom";
import { Councils, Dashboard, Proposals, Proposal, Tokenomics } from "..";
import { IState } from "../../types";

const Routes = (props: IState) => {
  const { reports, tokenomics } = props;
  return (
    <Switch>
      <Route
        path="/tokenomics"
        render={() => <Tokenomics reports={reports} tokenomics={tokenomics} />}
      />
      <Route
        path="/proposals/:id"
        render={(routeprops) => <Proposal {...routeprops} {...props} />}
      />
      <Route path="/proposals" render={() => <Proposals {...props} />} />
      <Route path="/councils" render={() => <Councils {...props} />} />

      <Route path="/" render={() => <Dashboard {...props} />} />
    </Switch>
  );
};

export default Routes;
