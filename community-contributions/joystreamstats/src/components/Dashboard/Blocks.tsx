import { Block } from "../../types";
import moment from "moment";

const Blocks = (props: { blocks: Block[] }) => {
  const blocks: Block[] = Array.from(new Set(props.blocks))
    .sort((a: Block, b: Block) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="box overflow-hidden" style={{ height: "13em" }}>
      <h3>previous blocks</h3>
      <div>
        {blocks.map((b) => (
          <div key={b.id}>
            {moment(b.timestamp).format("DD/MM/YYYY HH:mm:ss")}: {b.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blocks;
