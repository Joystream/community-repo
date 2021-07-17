import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Input } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Column } from 'react-table';

import Table from './components/table';

import './App.css';

interface Member {
  memberHandle: string;
  directScores: number[];
  memberId: number;
  totalDirectScore: number;
  totalReferralScore: number;
  totalScore: number;
}

function useDebounce(func: Function, delay: number = 500) {
  let timer: any = null;

  const debounce = useCallback(
    (...args: any) => {
      clearTimeout(timer);

      timer = setTimeout(() => func(...args), delay);
    },
    [func]
  );

  return debounce;
}

export default function App() {
  const [rawData, setData] = useState<Member[]>([]);
  const [search, setSearch] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const result: any = await axios.get(
        'https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json'
      );

      setData(result.data.scores.totalScores);
    }

    fetchData();
  }, []);

  const columns: Column[] = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'index',
      },
      {
        Header: 'ID',
        accessor: 'memberId',
      },
      {
        Header: 'Member handle',
        accessor: 'memberHandle',
      },
      {
        Header: 'Direct Score',
        accessor: 'totalDirectScore',
      },
      {
        Header: 'Referral Score',
        accessor: 'totalReferralScore',
      },
      {
        Header: 'Total Score',
        accessor: 'totalScore',
      },
      ...(rawData[0]?.directScores.map((score, index) => ({
        Header: `Period ${index}`,
        accessor: `period_${index}`,
      })) || []),
    ],
    [rawData]
  );

  const data = useMemo(
    () =>
      rawData
        ? rawData
            .filter((d: Member) =>
              search ? d.memberHandle.includes(search) : true
            )
            .map((d: Member) => ({
              ...d,
              ...d.directScores.reduce(
                (prev, curr, index) => ({
                  ...prev,
                  [`period_${index}`]: curr,
                }),
                {}
              ),
            }))
        : [],
    [rawData, search]
  );

  const handleSearch = useDebounce((e: any, data: any) =>
    setSearch(data.value)
  );

  return (
    <React.StrictMode>
      <Input placeholder="Search handle..." onChange={handleSearch} />
      <Table id="TableTradesHistory" columns={columns} data={data} />
    </React.StrictMode>
  );
}
