import { Box, LinearProgress, LinearProgressProps, Typography } from '@material-ui/core';

export function normalise(value: number, min: number, max: number) {
  return (Number(value) - Number(min)) * 100 / (Number(max) - Number(min));
}

export function LinearProgressWithLabel(props: LinearProgressProps & { value: number; min: number; max: number; }) {
  return props.value > 0 ? (
      <div style={{ width: '98%' }}>
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress variant="determinate" value={normalise(props.value, props.min, props.max)} />
          </Box>
          <Box minWidth={35} style={{ whiteSpace: "nowrap" }}>
            <Typography variant="body2" color="textSecondary">
              {`${Math.round(normalise(props.value, props.min, props.max))}% (${props.value}/${props.max})`}
            </Typography>
          </Box>
        </Box>
      </div>
  ) : null;
}
