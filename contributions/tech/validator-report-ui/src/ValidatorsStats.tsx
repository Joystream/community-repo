import { Button, Card, CardActions, CardContent, makeStyles, Typography } from '@material-ui/core';
import { ActiveEra } from './Types';

const useStyles = makeStyles({
  root: {
    minWidth: '98%',
    textAlign: 'left'
  },
  title: {
    fontSize: 18,
  },
  pos: {
    marginBottom: 12,
    marginTop: 12,
  },
});

export const ValidatorsStats = (props: { stash: String, activeEras: ActiveEra[]; }) => {
  const classes = useStyles();
  let sortedByBlock = props.activeEras
  let noDataLabel = 'No Data Available'
  let firstBlock: ActiveEra | undefined = undefined
  let lastBlock: ActiveEra | undefined = undefined
  let scoringPeriodText = ''

  const copyValidatorStatistics = () => navigator.clipboard.writeText(scoringPeriodText)

  if(props.activeEras.length > 0) {
    sortedByBlock = props.activeEras.sort((e1,e2) => e1.block - e2.block)
    firstBlock = sortedByBlock[0];
    lastBlock = sortedByBlock[sortedByBlock.length - 1];
    scoringPeriodText = `Validator Date: ${new Date(firstBlock!.date).toLocaleDateString()}-${new Date(lastBlock!.date).toLocaleDateString()}\nDescription: I was an active validator from era/block ${firstBlock!.era}/${firstBlock!.block} to era/block ${lastBlock!.era}/${lastBlock!.block}\nwith stash account ${props.stash}. (I was active in all the eras in this range and found a total of ? blocks)`
    return (
        <Card className={classes.root}>
          <CardContent>
            <Typography className={classes.title} color="textPrimary" gutterBottom>
              Scoring period text:
            </Typography>
            { scoringPeriodText.split('\n').map((i, key) => <Typography key={key} className={classes.pos} color="textSecondary">{i}</Typography>) }
          </CardContent>
          <CardActions>
            <Button onClick={copyValidatorStatistics} size="small">Copy to clipboard</Button>
          </CardActions>
        </Card>
    );
  } else {
    return (
      <Card className={classes.root}>
        <CardContent>
        <Typography className={classes.pos} color="textSecondary">
            { noDataLabel }
          </Typography>
        </CardContent>
      </Card>
    )
  }
};
