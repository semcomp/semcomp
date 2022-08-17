import React from 'react';

import MUIDataTable from 'mui-datatables';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import TableExpandedRow from '../../components/layout/table-expanded-row';
import VerticalTableRow from '../../components/layout/vertical-table-row';
import useDeleteConfirmationModal from '../../libs/hooks/delete-confirmation-modal';
import useFecthData from '../../libs/hooks/fetch-data';
import RenderDate from '../../components/reusable/render-date';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full min-w-full flex',
  main: 'w-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = (groups) => [
  {name: 'id', label: 'id', options: {filter: false, sort: false, display: false}},
  {name: 'userEmail', label: 'Email', options: {filter: false, sort: true}},
  {name: 'availableClues', label: 'Dicas disponíveis', options: {filter: false, sort: false}},
  {name: 'availableSkips', label: 'Pulos disponíveis', options: {filter: false, sort: false}},
  {
    name: 'completedQuestionsIndexes',
    label: 'Questões Feitas',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <p>{groups[dataIndex].completedQuestionsIndexes.length}</p>,
    },
  },
  {
    name: 'createdAt',
    label: 'Criação',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={groups[dataIndex].createdAt} />,
    },
  },
];

/**
 * @return {object}
 */
function RiddleGroups() {
  const {
    data: groups,
    isFetching: isFetchingGroups,
    setData: setGroups,
  } = useFecthData(API.getRiddleGroups);

  const {
    deleteConfirmationModalElement,
    handleTableDeleteEvent,
  } = useDeleteConfirmationModal({
    data: groups,
    setData: setGroups,
    idExtractor: (group) => group.id,
    nameExtractor: (group) => group.name,
    deleteDataFunction: API.deleteRiddleGroup,
  });

  /**
   * @return {object}
   */
  function displayTable() {
    if (isFetchingGroups) return <Spinner />;
    else {
      const newGroups = groups.map((group) => {
        return {...group, userEmail: group.members.map((user) => user.email), numberOfMembers: group.members.length};
      });

      return (
        <MUIDataTable
          columns={columns(newGroups)}
          title='Riddle - Grupos'
          data={newGroups}
          options={{
            selectableRowsHeader: false,
            rowsPerPage: 10,
            onRowsDelete: handleTableDeleteEvent,
            expandableRows: true,
            renderExpandableRow: (_, {dataIndex}) => {
              const question = newGroups[dataIndex];
              return <TableExpandedRow>
                <VerticalTableRow name='Membros' value={<>
                  {question.members.map((user, index) => (
                    <div className="py-4" key={index}>
                      <p>Nome: {user.name}</p>
                      <p>Email: {user.email}</p>
                      <p>Discord: {user.discord}</p>
                    </div>
                  ))}
                </>} />
                <VerticalTableRow name='Perguntas Respondidas' value={<>
                  {question.completedQuestionsIndexes.map((completedQuestionsIndex, index) => (
                    <div className="py-4" key={index}>
                      <p>{completedQuestionsIndex.index}</p>
                      <p><RenderDate date={completedQuestionsIndex.createdAt} /></p>
                    </div>
                  ))}
                </>} />
                <VerticalTableRow name='Dicas Utilizadas' value={<>
                  {question.usedClueIndexes.map((usedClueIndex, index) => (
                    <div className="py-4" key={index}>
                      <p>{usedClueIndex}</p>
                    </div>
                  ))}
                </>} />
                <VerticalTableRow name='Pulos Utilizadas' value={<>
                  {question.usedSkipIndexes.map((usedSkipIndex, index) => (
                    <div className="py-4" key={index}>
                      <p>{usedSkipIndex}</p>
                    </div>
                  ))}
                </>} />
              </TableExpandedRow>;
            },
          }}
        />
      );
    }
  }

  return (
    <div className={styles.root}>
      { deleteConfirmationModalElement }
      <Sidebar />
      <main className={styles.main}>
        { displayTable() }
      </main>
    </div>
  );
}

export default RiddleGroups;
