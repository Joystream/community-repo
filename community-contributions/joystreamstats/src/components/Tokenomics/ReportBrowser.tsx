import React from "react";
import Markdown from "react-markdown";
import gfm from "remark-gfm";

interface IProps {
  reports: { [key: string]: string };
}
interface IState {
  selected: string;
}

const selected = "Alexandria-Council-Leaderboard";

class ReportBrowser extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { selected } as IState;
    this.select = this.select.bind(this);
  }
  select(e: { target: { value: string } }) {
    this.setState({ selected: e.target.value });
  }

  render() {
    const { selected } = this.state;
    const { reports } = this.props;
    const options = Object.keys(reports).sort();

    return (
      <div className="h-100 d-flex flex-column">
        <select
          name="selected"
          value={selected}
          onChange={this.select}
          className="form-control"
        >
          <option>Select a report</option>
          {options.map((key: string) => (
            <option key={key}>{key}</option>
          ))}
        </select>

        <Markdown
          plugins={[gfm]}
          className="mt-1 overflow-auto text-left"
          children={reports[selected]}
        />
      </div>
    );
  }
}

export default ReportBrowser;
