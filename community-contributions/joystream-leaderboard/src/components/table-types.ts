import {
  Column,
} from 'react-table';

export interface TableProperties<T extends object> {
  id: string;
  data: Array<T>;
  columns: Array<Column<T>>;
  initSortBy?: Array<{
    id: string;
    desc: boolean;
  }>;
  striped?: boolean;
  getRowProps?: Function;
}
