import React, { ReactElement } from 'react';
import {
  HeaderProps,
  useTable,
  usePagination,
  useSortBy,
  useFilters,
  useGlobalFilter,
  FilterValue,
  IdType,
  Row,
} from 'react-table';
import { Menu, Table as UiTable } from 'semantic-ui-react';
import cn from 'classnames';
import { TableProperties } from './table-types';

const DefaultHeader: React.FC<HeaderProps<any>> = ({ column }) => (
  <>{column.id}</>
);

function DefaultColumnFilter<T extends object>() {
  return null;
}

const defaultColumn = {
  Filter: DefaultColumnFilter,
  Header: DefaultHeader,
};

export function fuzzyTextFilter<T extends object>(
  rows: Array<Row<T>>,
  id: IdType<T>,
  filterValue: FilterValue
) {
  return null;
}

const filterTypes = {
  fuzzyText: fuzzyTextFilter,
};

const defaultPropGetter = () => ({});

function Table<T extends object>({
  columns,
  data,
  initSortBy = [],
  striped = false,
  getRowProps = defaultPropGetter,
}: TableProperties<T>): ReactElement {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable<T>(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 100,
        sortBy: initSortBy,
      },
      defaultColumn,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <>
      <UiTable
        {...getTableProps()}
        className={cn('Table', {
          Table: striped,
        })}
        striped
      >
        <UiTable.Header celled>
          {headerGroups.map((headerGroup: any) => (
            <UiTable.Row {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <UiTable.HeaderCell {...column.getHeaderProps()}>
                  <div {...column.getSortByToggleProps()}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </div>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </UiTable.HeaderCell>
              ))}
            </UiTable.Row>
          ))}
        </UiTable.Header>
        <UiTable.Body {...getTableBodyProps()}>
          {page.map((row: any, i: any) => {
            prepareRow(row);
            return (
              <UiTable.Row {...row.getRowProps(getRowProps(row))}>
                {row.cells.map((cell: any) => {
                  if (cell.column.id === 'index') {
                    return <td>{row.index + 1}</td>;
                  }

                  return (
                    <UiTable.Cell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </UiTable.Cell>
                  );
                })}
              </UiTable.Row>
            );
          })}
        </UiTable.Body>
      </UiTable>
      <Menu floated="right" pagination>
        <Menu.Item onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </Menu.Item>{' '}
        <Menu.Item onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </Menu.Item>{' '}
        <Menu.Item onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </Menu.Item>{' '}
        <Menu.Item
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          {'>>'}
        </Menu.Item>{' '}
        <Menu.Item>
          Page&nbsp;
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </Menu.Item>
        <Menu.Item>
          Go to page:&nbsp;&nbsp;
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '50px' }}
          />
        </Menu.Item>
        <Menu.Item>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[100, 1000].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Menu.Item>
      </Menu>
    </>
  );
}
export default Table;
