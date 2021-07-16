export interface EraStatus {
  status: ActiveEra;
}

export interface ActiveEra {
  id: number,
  era: number,
  hash: string,
  block: number,
  date: string,
  points: number
}

export interface Reports { 
  pageSize: number,
  totalCount: number,
  totalBlocks: number,
  startEra: number,
  endEra: number,
  startBlock: number,
  endBlock: number,
  startTime: number,
  endTime: number,
  report: Array<Report>
};

export interface Report { 
  id: number,
  stakeTotal: number,
  stakeOwn: number,
  points: number,
  rewards: number,
  commission: number,
  blocksCount: number
}