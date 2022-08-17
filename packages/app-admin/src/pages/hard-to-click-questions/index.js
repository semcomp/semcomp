import React from 'react';

import MUIDataTable from 'mui-datatables';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import useFecthData from '../../libs/hooks/fetch-data';
import useDeleteConfirmationModal from '../../libs/hooks/delete-confirmation-modal';
import NewButton from '../../components/reusable/new-button';
import CreateHardToClickQuestionModal from './create-hard-to-click-question-modal';
import UpdateHardToClickQuestionModal from './update-hard-to-click-question-modal';
import TableRowTruncated from '../../components/layout/table-row-truncated';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full min-w-full flex',
  main: 'w-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = [
  {name: 'index', label: 'Index', options: {filter: false, sort: true}},
  {name: 'id', label: 'id', options: {filter: false, sort: false, display: false}},
  {
    name: 'question',
    label: 'Pergunta',
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => <TableRowTruncated value={value} />,
    },
  },
  {
    name: 'answer',
    label: 'Resposta',
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => <TableRowTruncated value={value} />,
    },
  },
];

/**
 * @return {object}
 */
function HardToClickQuestions() {
  const {
    data: questions,
    isFetching: isFetchingQuestions,
    setData: setQuestions,
  } = useFecthData(API.getHardToClickQuestions);

  const {
    deleteConfirmationModalElement,
    handleTableDeleteEvent,
  } = useDeleteConfirmationModal({
    data: questions,
    setData: setQuestions,
    idExtractor: (question) => question.id,
    nameExtractor: (question) => question.index,
    deleteDataFunction: API.deleteHardToClickQuestions,
  });

  const [isCreating, setIsCreating] = React.useState();
  const [updatingQuestion, setUpdatingQuestion] = React.useState();

  /**
   * @return {object}
   */
  function displayIsCreatingModal() {
    if (!isCreating) return null;

    /**
     * @param {object} newQuestion
     */
    function createQuestion(newQuestion) {
      setQuestions([...questions, newQuestion]);
      setIsCreating(false);
    }

    return (
      <CreateHardToClickQuestionModal
        onSuccess={createQuestion}
        onRequestClose={() => setIsCreating(false)}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayIsUpdatingModal() {
    if (!updatingQuestion) return null;

    /**
     * @param {object} newQuestion
     */
    function updateQuestionData(newQuestion) {
      const newQuestions = questions.map((question) => {
        if (question.id === updatingQuestion.id) return newQuestion;
        else return question;
      });
      setQuestions(newQuestions);
      setUpdatingQuestion(false);
    }

    return (
      <UpdateHardToClickQuestionModal
        onRequestClose={() => setUpdatingQuestion(false)}
        onSuccess={updateQuestionData}
        question={updatingQuestion}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayTable() {
    if (isFetchingQuestions) return <Spinner />;
    else {
      return (
        <MUIDataTable
          columns={columns}
          title='Duro de Clicar - Perguntas'
          data={questions}
          options={{
            rowsPerPage: 10,
            customToolbar: () => <NewButton onClick={() => setIsCreating(true)} />,
            onRowClick: (_, {dataIndex}) => setUpdatingQuestion(questions[dataIndex]),
            onRowsDelete: handleTableDeleteEvent,
          }}
        />
      );
    }
  }

  return (
    <div className={styles.root}>
      { deleteConfirmationModalElement }
      { displayIsCreatingModal() }
      { displayIsUpdatingModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayTable() }
      </main>
    </div>
  );
}

export default HardToClickQuestions;
