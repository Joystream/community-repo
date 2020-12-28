import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface IProps {
  data: { [x: string]: any }[];
  x: string;
  y: string;
  pixels: number;
  scaleY?: boolean;
  xLabel?: string;
  yLabel?: string;
  barStyle?: (o: any) => string;
}

const Chart = (props: IProps) => {
  const { barStyle, data, x, y, pixels, scaleY, xLabel, yLabel } = props;

  if (!data.length) return <div>No data.</div>;

  const sorted = data.sort((a, b) => a[x] - b[x]).filter((e) => e[y] > 0);

  let yMin = scaleY ? sorted[0][y] : 0;
  let yMax = sorted[0][y];

  data.forEach((d) => {
    if (d[y] > yMax) yMax = d[y];
    if (d[y] < yMin) yMin = d[y];
  });

  const width = (pixels || 400) / sorted.length;
  const color = `bg-danger`;

  return (
    <div className="d-flex flex-column">
      <div
        className={`d-flex flex-row align-items-baseline`}
        style={{ height: `100px`, borderBottom: `0.01px solid black` }}
      >
        <div
          className={color}
          style={{ height: `100%`, borderRight: `0.01px solid black` }}
        />
        {sorted.map((d, i) => (
          <OverlayTrigger
            key={`overlay${i}`}
            placement="top"
            overlay={
              <Tooltip id={`tooltip${i}`}>
                <div>
                  {xLabel}: {d[x]}: {d[y]} {yLabel}
                </div>
              </Tooltip>
            }
          >
            <div
              key={i}
              className={barStyle ? barStyle(d) : color}
              style={{
                border: `1px solid teal`,
                width,
                height: `${(90 * d[y]) / yMax}%`,
              }}
            />
          </OverlayTrigger>
        ))}
      </div>
    </div>
  );
};

export default Chart;
