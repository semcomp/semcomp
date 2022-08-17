import React from 'react';

import MUIDataTable from 'mui-datatables';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import RenderDate from '../../components/reusable/render-date';
import TableExpandedRow from '../../components/layout/table-expanded-row';
import VerticalTableRow from '../../components/layout/vertical-table-row';
import TableRowTruncated from '../../components/layout/table-row-truncated';
import useFecthData from '../../libs/hooks/fetch-data';
import useDeleteConfirmationModal from '../../libs/hooks/delete-confirmation-modal';
import NewButton from '../../components/reusable/new-button';
import CreateAchievementModal from './create-achievement-modal';
import UpdateAchievementModal from './update-achievement-modal';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full min-w-full flex',
  main: 'w-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = (achievement) => [
  {name: 'id', label: 'id', options: {filter: false, sort: false, display: false}},
  {name: 'title', label: 'Título', options: {filter: false, sort: true}},
  {
    name: 'description',
    label: 'Descrição',
    options: {
      display: false,
      filter: false,
      sort: true,
      customBodyRender: (value) => <TableRowTruncated value={value} />,
    },
  },
  {name: 'type', label: 'Tipo', options: {filter: true, sort: false}},
  {
    name: 'startDate',
    label: 'Início',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={achievement[dataIndex].startDate} />,
    },
  },
  {
    name: 'endDate',
    label: 'Término',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={achievement[dataIndex].endDate} />,
    },
  },
];

/**
 * @return {object}
 */
function Achievements() {
  const {
    data: achievements,
    isFetching: isFetchingAchievements,
    setData: setAchievements,
  } = useFecthData(API.getAllAchievements);

  const {
    deleteConfirmationModalElement,
    handleTableDeleteAchievements,
  } = useDeleteConfirmationModal({
    data: achievements,
    setData: setAchievements,
    idExtractor: (achievement) => achievement.id,
    nameExtractor: (achievement) => achievement.name,
    deleteDataFunction: API.deleteAchievement,
  });

  const [isCreating, setIsCreating] = React.useState();
  const [updatingAchievement, setUpdatingAchievement] = React.useState();
  const [events, setEvents] = React.useState([]);

  /**
   *
   * @return {void}
   */
  async function fetchEvents() {
    try {
      const response = await API.getAllEvents();
      setEvents(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  React.useEffect(() => {
    fetchEvents();
  }, []);

  /**
   * @return {object}
   */
  function displayIsCreatingModal() {
    if (!isCreating) return null;

    /**
     * @param {object} newAchievement
     */
    function createAchievementData(newAchievement) {
      setAchievements([...achievements, newAchievement]);
      setIsCreating(false);
    }

    return (
      <CreateAchievementModal
        onRequestClose={() => setIsCreating(false)}
        onSuccess={createAchievementData}
        events={events}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayIsUpdatingModal() {
    if (!updatingAchievement) return null;

    /**
     * @param {object} newAchievement
     */
    function updateAchievementData(newAchievement) {
      const newAchievements = achievements.map((achievement) => {
        if (achievement.id === updatingAchievement.id) return newAchievement;
        else return achievement;
      });
      setAchievements(newAchievements);
      setUpdatingAchievement(false);
    }

    return (
      <UpdateAchievementModal
        onRequestClose={() => setUpdatingAchievement(false)}
        onSuccess={updateAchievementData}
        achievement={updatingAchievement}
        events={events}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayAchievementsTable() {
    if (isFetchingAchievements) return <Spinner />;

    return (
      <MUIDataTable
        columns={columns(achievements)}
        title='Conquistas'
        data={achievements}
        options={{
          rowsPerPage: 10,
          customToolbar: () => <NewButton onClick={() => setIsCreating(true)} />,
          onRowClick: (_, {dataIndex}) => setUpdatingAchievement(achievements[dataIndex]),
          expandableRows: true,
          onRowsDelete: handleTableDeleteAchievements,
          renderExpandableRow: (_, {dataIndex}) => {
            const achievement = achievements[dataIndex];
            return <TableExpandedRow>
              <VerticalTableRow name='Descrição' value={achievement.description} />
            </TableExpandedRow>;
          },
        }}
      />
    );
  }

  return (
    <div className={styles.root}>
      { deleteConfirmationModalElement }
      { displayIsCreatingModal() }
      { displayIsUpdatingModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayAchievementsTable() }
      </main>
    </div>
  );
}

export default Achievements;
