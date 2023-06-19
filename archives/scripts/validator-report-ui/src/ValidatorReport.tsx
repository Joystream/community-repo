import './App.css';
import { getChainState } from './get-status';
import moment from 'moment'
import { Card, CardActions, CardContent, CircularProgress, Container, createStyles, FormControl, Grid, makeStyles, MenuItem, Select, Tab, TextField, Theme, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Edit from '@material-ui/icons/Edit';
import { BootstrapButton } from './BootstrapButton';
import Autocomplete, { AutocompleteChangeDetails } from '@material-ui/lab/Autocomplete';
import { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import axios from 'axios'
import { config } from "dotenv";
import { Report, Reports } from './Types';
import { ColDef, DataGrid, PageChangeParams, ValueFormatterParams } from '@material-ui/data-grid';
import Alert from '@material-ui/lab/Alert';
import Tabs from '@material-ui/core/Tabs';
import Backdrop from '@material-ui/core/Backdrop';
import { AutocompleteChangeReason } from '@material-ui/lab';

config();

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
            position: 'absolute',
            width: '100%'
        },
    }),
);


const ValidatorReport = () => {
    const dateFormat = 'yyyy-MM-DD';
    const [backendUrl, setBackendUrl] = useState(process.env.REACT_APP_BACKEND_URL || "http://localhost:3500");
    const [activeValidators, setActiveValidators] = useState([]);
    const [lastBlock, setLastBlock] = useState(0);
    const [stash, setStash] = useState('5EhDdcWm4TdqKp1ew1PqtSpoAELmjbZZLm5E34aFoVYkXdRW');
    const [dateFrom, setDateFrom] = useState(moment().subtract(14, 'd').format(dateFormat));
    const [dateTo, setDateTo] = useState(moment().format(dateFormat));
    const [startBlock, setStartBlock] = useState('' as unknown as number);
    const [endBlock, setEndBlock] = useState('' as unknown as number);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterTab, setFilterTab] = useState(0 as number);
    const [columns] = useState(
        [
            { field: 'id', headerName: 'Era', width: 150, sortable: true },
            { field: 'stakeTotal', headerName: 'Total Stake', width: 150, sortable: true },
            { field: 'stakeOwn', headerName: 'Own Stake', width: 150, sortable: true },
            { field: 'points', headerName: 'Points', width: 150, sortable: true },
            { field: 'rewards', headerName: 'Rewards', width: 150, sortable: true },
            { field: 'commission', headerName: 'Commission', width: 150, sortable: true, valueFormatter: (params: ValueFormatterParams) => {
                if (isNaN(params.value as unknown as number)) {
                    return `${params.value}%`
                }
                return `${Number(params.value).toFixed(0)}%`
            }},
            { field: 'blocksCount', headerName: 'Blocks Produced', width: 150, sortable: true },
        ]
    );
    const [report, setReport] = useState({
        pageSize: 0,
        totalCount: 0,
        totalBlocks: 0,
        startEra: -1,
        endEra: -1,
        startBlock: -1,
        endBlock: -1,
        startTime: -1,
        endTime: -1,
        report: [] as unknown as Report[]
    } as unknown as Reports );

    const isDateRange = filterTab === 0;
    const isBlockRange = filterTab === 1;

    useEffect(() => {
        updateChainState()
        const interval = setInterval(() => { updateChainState() }, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateChainState = () => {
        getChainState().then((chainState) => {
            setLastBlock(chainState.finalizedBlockHeight)
            setActiveValidators(chainState.validators.validators)
        })
    }

    const handlePageChange = (params: PageChangeParams) => {
        if (report.totalCount > 0) {
            loadReport(params.page)
        }
    }

    const loadReport = (page: number) => {
        setCurrentPage(page)
        setIsLoading(true)
        const blockParam = isBlockRange && startBlock && endBlock ? `&start_block=${startBlock}&end_block=${endBlock}` : ''
        const dateParam = isDateRange && dateFrom && dateTo ? `&start_time=${moment(dateFrom, dateFormat).format(dateFormat)}&end_time=${moment(dateTo, dateFormat).format(dateFormat)}` : ''
        const apiUrl = `${backendUrl}/validator-report?addr=${stash}&page=${page}${blockParam}${dateParam}`
        axios.get(apiUrl).then((response) => {
            if (response.data.report !== undefined) {
                setReport(response.data);
            }
            setIsLoading(false)
            setError(undefined)
        }).catch((err) => {
            setIsLoading(false)
            setError(err)
        })
    }

    const stopLoadingReport = () => {
        setIsLoading(false)
    }

    const canLoadReport = () => stash && ((isBlockRange && startBlock && endBlock) || (isDateRange && dateFrom && dateTo))
    const startOrStopLoading = () => isLoading ? stopLoadingReport() : loadReport(1)
    const updateStartBlock = (e: { target: { value: unknown; }; }) => setStartBlock((e.target.value as unknown as number));
    const updateEndBlock = (e: { target: { value: unknown; }; }) => setEndBlock((e.target.value as unknown as number));
    const updateDateFrom = (e: { target: { value: unknown; }; }) => setDateFrom((e.target.value as unknown as string))
    const updateDateTo = (e: { target: { value: unknown; }; }) => setDateTo((e.target.value as unknown as string));

    const setCurrentPeriodStartBlock = () => {
        const blocksToEndOfDay = moment().endOf('d').diff(moment(), "seconds") / 6
        const twoWeeksBlocks = (600 * 24 * 14);
        return setStartBlock(lastBlock - twoWeeksBlocks - Number(blocksToEndOfDay.toFixed(0)))
    }

    const setCurrentPeriodEndBlock = () => setEndBlock(lastBlock)

    const getButtonTitle = (isLoading: boolean) => {
        if (isLoading) {
            return (<div style={{ display: 'flex', alignItems: 'center' }}>Stop loading <CircularProgress style={ { color: '#fff', height: 20, width: 20, marginLeft: 12 } } /></div>)
        }
        if (isBlockRange) {
            return startBlock && endBlock ? `Load data between blocks ${startBlock} - ${endBlock}` : 'Load data between blocks'
        }
        if (isDateRange) {
            return dateFrom && dateTo ? `Load data between dates ${dateFrom} - ${dateTo}` : 'Load data between dates'
        }
        return 'Choose dates or blocks range'
    }
    const updateStash = (event: ChangeEvent<{}>, value: string | null, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<string> | undefined) => {
        setStash(value || '')
    }
    
    const updateStashOnBlur = (event: FocusEvent<HTMLDivElement> & { target: HTMLInputElement}) => {
        setStash((prev) => prev !== event.target.value ? event.target.value : prev)
    }

    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    <Grid item lg={12}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <h1>Validator Report</h1>
                            <Button style={{ display: 'none', fontSize: 12, alignSelf: 'center'}} onClick={() => setIsModalOpen(true)}><Edit style={{ fontSize: 12, alignSelf: 'center'}} /> Backend</Button>
                        </div>
                        <Dialog style={{ minWidth: 275 }} onClose={() => setIsModalOpen(false)} aria-labelledby="simple-dialog-title" open={isModalOpen}>
                            <DialogTitle id="simple-dialog-title">Change Backend URL</DialogTitle>
                            <FormControl style={ { margin: 12 }}>
                                <Select
                                    labelId="backend-url-label"
                                    id="backend-url"
                                    value={backendUrl}
                                    onChange={(e) => setBackendUrl(e.target.value as unknown as string)}
                                >
                                <MenuItem value={'https://validators.joystreamstats.live'}>validators.joystreamstats.live</MenuItem>
                                <MenuItem value={'https://joystream-api.herokuapp.com'}>joystream-api.herokuapp.com</MenuItem>
                                <MenuItem value={'http://localhost:3500'}>localhost:3500</MenuItem>
                                </Select>
                            </FormControl>
                        </Dialog>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <Autocomplete
                            freeSolo
                            style={{ width: '100%' }}
                            options={activeValidators}
                            onChange={updateStash}
                            onBlur={updateStashOnBlur}
                            value={stash}
                            renderInput={(params) => <TextField {...params} label="Validator stash address" variant="filled" />} />
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <Tabs indicatorColor='primary' value={filterTab} onChange={(e: unknown, newValue: number) => setFilterTab(newValue)} aria-label="simple tabs example">
                            <Tab label="Search by date" />
                            <Tab label="Search by blocks" />
                        </Tabs>
                    </Grid>
                    <Grid hidden={!isDateRange} item xs={6} lg={3}>
                        <TextField fullWidth type="date" onChange={updateDateFrom} id="block-start" InputLabelProps={{ shrink: true }} label="Date From" value={dateFrom} variant="filled" />
                    </Grid>
                    <Grid hidden={!isDateRange} item xs={6} lg={3}>
                        <BootstrapButton size='large' style={{ height: 56 }} fullWidth onClick={() => setDateFrom(moment().subtract(2, 'w').format('yyyy-MM-DD'))}>2 weeks from today</BootstrapButton>
                    </Grid>
                    <Grid hidden={!isDateRange} item xs={6} lg={3}>
                        <TextField fullWidth type="date" onChange={updateDateTo} id="block-end" InputLabelProps={{ shrink: true }} label="Date To" value={dateTo} variant="filled" />
                    </Grid>
                    <Grid hidden={!isDateRange} item xs={6} lg={3}>
                        <BootstrapButton size='large' style={{ height: 56 }} fullWidth onClick={() => setDateTo(moment().format('yyyy-MM-DD'))}>Today</BootstrapButton>
                    </Grid>
                    <Grid hidden={!isBlockRange} item xs={6} lg={3}>
                        <TextField fullWidth type="number" onChange={updateStartBlock} id="block-start" label="Start Block" value={startBlock} variant="filled" />
                    </Grid>
                    <Grid hidden={!isBlockRange} item xs={6} lg={3}>
                        <BootstrapButton size='large' style={{ height: 56 }} fullWidth disabled={!lastBlock} onClick={setCurrentPeriodStartBlock}>{lastBlock ? `2 weeks before latest (${lastBlock - (600 * 24 * 14)})` : '2 weeks from latest'}</BootstrapButton>
                    </Grid>
                    <Grid hidden={!isBlockRange} item xs={6} lg={3}>
                        <TextField fullWidth type="number" onChange={updateEndBlock} id="block-end" label="End Block" value={endBlock} variant="filled" />
                    </Grid>
                    <Grid hidden={!isBlockRange} item xs={6} lg={3}>
                        <BootstrapButton size='large' style={{ height: 56 }} fullWidth disabled={!lastBlock} onClick={setCurrentPeriodEndBlock}>{lastBlock ? `Pick latest block (${lastBlock})` : 'Use latest block'}</BootstrapButton>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <BootstrapButton size='large' style={{ height: 56 }} fullWidth disabled={!canLoadReport()} onClick={startOrStopLoading}>{getButtonTitle(isLoading)}</BootstrapButton>
                        <Alert style={ error !== undefined ? { marginTop: 12 } : { display: 'none'} } onClose={() => setError(undefined)} severity="error">Error loading validator report, please try again.</Alert>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <ValidatorReportCard stash={stash} report={report} />
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <div style={{ height: 400 }}>
                            <Backdrop className={classes.backdrop} open={isLoading}>
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <DataGrid 
                                rows={report.report} 
                                columns={columns as unknown as ColDef[]}
                                rowCount={report.totalCount}
                                pagination
                                paginationMode="server"
                                onPageChange={handlePageChange} 
                                pageSize={report.pageSize}
                                rowsPerPageOptions={[]}
                                disableSelectionOnClick
                                page={currentPage}
                                />
                        </div>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

const ValidatorReportCard = (props: { stash: string, report: Reports }) => {
    const copyValidatorStatistics = () => navigator.clipboard.writeText(scoringPeriodText)
    const [scoringPeriodText, setScoringPeriodText] = useState('')
    const useStyles = makeStyles({
        root: {
            minWidth: '100%',
            textAlign: 'left'
        },
        title: {
            fontSize: 18,
        },
        pos: {
            marginTop: 12,
        },
    });

    const classes = useStyles();

    useEffect(() => {
        updateScoringPeriodText()
    });

    const updateScoringPeriodText = () => {
        if (props.report.report.length > 0) {
            const scoringDateFormat = 'DD-MM-yyyy';
            const report = `Validator Date: ${moment(props.report.startTime).format(scoringDateFormat)} - ${moment(props.report.endTime).format(scoringDateFormat)}\nDescription: I was an active validator from era/block ${props.report.startEra}/${props.report.startBlock} to era/block ${props.report.endEra}/${props.report.endBlock}\nwith stash account ${props.stash}. (I was active in all the eras in this range and found a total of ${props.report.totalBlocks} blocks)`
            setScoringPeriodText(report)
        } else {
            setScoringPeriodText('')
        }
    }

    if (props.report.report.length > 0) {
        return (<Card className={classes.root}>
            <CardContent>
                <Typography className={classes.title} color="textPrimary" gutterBottom>
                    Validator Report:
                </Typography>
                { scoringPeriodText.split('\n').map((i, key) => <Typography key={key} className={classes.pos} color="textSecondary">{i}</Typography>) }
            </CardContent>
            <CardActions>
                <Button onClick={copyValidatorStatistics} size="small">Copy to clipboard</Button>
            </CardActions>
        </Card>)
    }
    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography className={classes.pos} color="textSecondary">
                    No Data Available
                </Typography>
            </CardContent>
        </Card>
    )
}

export default ValidatorReport
