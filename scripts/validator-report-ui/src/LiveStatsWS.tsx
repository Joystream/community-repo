import './App.css';
import { getValidatorStatistics, getChainState } from './get-status';
import { Container, FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import { BootstrapButton } from './BootstrapButton';
import { LinearProgressWithLabel } from './LinearProgressWithLabel';
import { ActiveEra } from './Types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useEffect, useState } from 'react';
import { ValidatorsStats } from './ValidatorsStats';

const LiveStatsWS = () => {
  const [shouldStop, setShouldStop] = useState(false);
  const [searchOptimized, setSearchOptimized] = useState(true);
  const [activeEras, setActiveEras] = useState([] as ActiveEra[]);
  const [columns] = useState(
    [
      { field: 'era', headerName: 'Era', width: 100, sortable: true },
      { field: 'block', headerName: 'Block', width: 100, sortable: true },
      { field: 'date', headerName: 'Date', width: 200, sortable: true },
      { field: 'points', headerName: 'Points', width: 100, sortable: true },
      { field: 'hash', headerName: 'Block Hash', width: 500, sortable: false },
    ]
  );
  const [stash, setStash] = useState('5EhDdcWm4TdqKp1ew1PqtSpoAELmjbZZLm5E34aFoVYkXdRW');
  const [startBlock, setStartBlock] = useState(1274283);
  const [endBlock, setEndBlock] = useState(1274383);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBlock, setLastBlock] = useState(0);
  const [progress, setProgress] = useState({
    value: 0,
    min: 0,
    max: 0
  });
  const [activeValidators, setActiveValidators] = useState([]);

  useEffect(() => {
    updateChainState()
    const interval = setInterval(() => { updateChainState() }, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateChainState = async () => {
    const chainState = await getChainState();
    setLastBlock(chainState.finalizedBlockHeight)
    setActiveValidators(chainState.validators.validators)
  }
  const nextBlockHeight = (currentBlock: number, isValidInCurrentEra: boolean) => {
    if (Number(startBlock) < Number(endBlock)) {
      if (searchOptimized && isValidInCurrentEra) {
        if ((currentBlock + 600) < Number(endBlock)) {
          return currentBlock + 600
        }
        return Number(endBlock)
      }
      return searchOptimized ? currentBlock + 10 : currentBlock + 1;
    } else {
      if (searchOptimized && isValidInCurrentEra) {
        if ((currentBlock - 600) < Number(endBlock)) {
          return currentBlock - 600
        }
        return Number(endBlock)
      }
      return searchOptimized ? currentBlock - 10 : currentBlock - 1;
    }
  }

  const startingBlockHeight = () => {
    if (Number(startBlock) < Number(endBlock)) {
      return searchOptimized ? (Number(startBlock) - 600 < 0) ? 0 : Number(startBlock) - 600 : Number(startBlock)
    }
    return searchOptimized ? Number(startBlock) + 600 : Number(startBlock)
  }

  const fetchBlocksData = async () => {
    resetDataBeforeLoading();
    let isValidInCurrentEra = false
    for (let blockHeight = startingBlockHeight(); ; blockHeight = nextBlockHeight(blockHeight, isValidInCurrentEra)) {
      let shouldStopLoading = false
      setShouldStop(prev => {
        shouldStopLoading = prev
        return shouldStopLoading
      })
      if (shouldStopLoading) {
        resetProgress();
        break;
      }
      isValidInCurrentEra = await fetchBlockData(Number(blockHeight));
      if (blockHeight === Number(endBlock)) {
        stopFetchingBlocksData()
      }
    }
  }

  const stopFetchingBlocksData = () => {
    if (!shouldStop) {
      setShouldStop(true)
      setIsLoading(false)
    }
  }

  const resetProgress = () => {
    setShouldStop(false)
    setIsLoading(false)
    setProgress({ value: 0, min: 0, max: 0 })
  }

  const fetchBlockData = async (blockHeight: number): Promise<boolean> => {
    updateProgress(blockHeight);
    let result = await getValidatorStatistics(stash, blockHeight);
    const isActiveBlock = result && result.status && activeEras.indexOf(result.status) < 0;
    if (isActiveBlock) {
      setActiveEras((prevEras) => [...prevEras, result.status])
    }
    stopLoadingOnLastBlock(blockHeight);
    return isActiveBlock
  }

  const stopLoadingOnLastBlock = (blockHeight: number) => {
    if (blockHeight.toString() === endBlock.toString()) {
      setIsLoading(false)
    }
  }

  const updateProgress = (blockHeight: number) => {
    setProgress({ value: blockHeight, min: (searchOptimized ? startBlock - 600 : startBlock), max: endBlock })
  }

  const resetDataBeforeLoading = () => {
    setIsLoading(true)
    setActiveEras([])
  }

  const shouldDisableButton = !stash || !startBlock || !endBlock;
  const endBlockLabel = lastBlock > 0 ? `End Block (Last block: ${lastBlock})` : 'End Block';

  const updateStartBlock = (e: { target: { value: unknown; }; }) => setStartBlock((e.target.value as unknown as number));
  const updateEndblock = (e: { target: { value: unknown; }; }) => setEndBlock((e.target.value as unknown as number));
  const startOrStopLoading = () => isLoading ? stopFetchingBlocksData() : fetchBlocksData();
  const updateSearchOptimized = (event: React.ChangeEvent<HTMLInputElement>) => setSearchOptimized(event.target.checked);

  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={2}
      >
        <Grid item xs={12} lg={12}>
          <h1>Live Stats</h1>
        </Grid>
        <Grid item xs={12} lg={12}>
          <Autocomplete
            fullWidth
            freeSolo
            options={activeValidators}
            onChange={(e, value) => setStash(value || '')}
            value={stash}
            renderInput={(params) => <TextField {...params} label="Validator stash address" variant="filled" />} />
        </Grid>
        <Grid item xs={4} lg={5}>
          <TextField fullWidth type="number" onChange={updateStartBlock} id="block-start" label="Start Block" value={startBlock} variant="filled" />
        </Grid>
        <Grid item xs={4} lg={2}>
          <FormControlLabel
            control={
              <Switch
                checked={searchOptimized}
                onChange={updateSearchOptimized}
                name="searchOptimized"
                color="primary"
              />
            }
            disabled={isLoading}
            label={searchOptimized ? "Optimized search" : "Full search"}
          />
        </Grid>
        <Grid item xs={4} lg={5}>
          <TextField fullWidth type="number" onChange={updateEndblock} id="block-end" label={endBlockLabel} value={endBlock} variant="filled" />
        </Grid>
        <Grid item xs={12} lg={12}>
          <BootstrapButton size='large' style={{ minHeight: 56 }} disabled={shouldDisableButton} fullWidth onClick={startOrStopLoading} color="primary">{isLoading ? 'Stop loading' : 'Load data'}</BootstrapButton>
        </Grid>
        <Grid item xs={12} lg={12}>
          <LinearProgressWithLabel {...progress} />
        </Grid>
        <Grid item xs={12} lg={12}>
          <ValidatorsStats stash={stash} activeEras={activeEras} />
        </Grid>
        <Grid item xs={12} lg={12}>
          <div style={{ height: 600 }}>
            <DataGrid rows={activeEras} columns={columns as unknown as ColDef[]} pageSize={50} />
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default LiveStatsWS