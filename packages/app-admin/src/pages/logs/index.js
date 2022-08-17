import React from 'react';

import MUIDataTable from 'mui-datatables';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import useFecthData from '../../libs/hooks/fetch-data';
import RenderDate from '../../components/reusable/render-date';
import RenderJSON from '../../components/reusable/render-json';
import TableExpandedRow from '../../components/layout/table-expanded-row';
import VerticalTableRow from '../../components/layout/vertical-table-row';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = (logs) => [
  {name: 'type', label: 'Type', options: {filter: true, sort: false}},
  {name: 'collectionName', label: 'Collection Name', options: {filter: true, sort: false}},
  {name: 'user', label: 'User ID', options: {filter: true, sort: false}},
  {name: 'id', label: 'id', options: {filter: false, sort: true, display: false}},
  {name: 'objectBefore', label: 'Object Before', options: {filter: false, sort: true, display: false}},
  {name: 'objectAfter', label: 'Object After', options: {filter: false, sort: true, display: false}},
  {
    name: 'createdAt',
    label: 'Created At',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={logs[dataIndex].createdAt} />,
    },
  },
];

/**
 * @return {object}
 */
function Logs() {
  const {
    isFetching: isFetchingLogs,
    data: logs,
  } = useFecthData(API.getAllLogs);

  /**
   * @return {object}
   */
  function displayTable() {
    if (isFetchingLogs) return <Spinner />;
    return (
      <MUIDataTable
        columns={columns(logs)}
        title='Logs'
        data={logs}
        options={{
          rowsPerPage: 10,
          expandableRows: true,
          renderExpandableRow: (_, {dataIndex}) => (
            <TableExpandedRow>
              <VerticalTableRow
                name='Object Before'
                value={<RenderJSON data={JSON.parse(logs[dataIndex].objectBefore)} />}
              />
              <VerticalTableRow
                name='Object After'
                value={<RenderJSON data={JSON.parse(logs[dataIndex].objectAfter)} />}
              />
            </TableExpandedRow>
          ),
        }}
      />
    );
  }

  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        { displayTable() }
      </main>
    </div>
  );
}

export default Logs;
