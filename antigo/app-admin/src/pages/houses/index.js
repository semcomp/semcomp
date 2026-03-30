import React from 'react';

import MUIDataTable from 'mui-datatables';
import {toast} from 'react-toastify';
// import {withStyles} from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
import HomeIcon from '@material-ui/icons/Home';
import IconButton from '@material-ui/core/Button';
// import MenuItem from '@material-ui/core/MenuItem';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import useFecthData from '../../libs/hooks/fetch-data';
import TableExpandedRow from '../../components/layout/table-expanded-row';
import NewButton from '../../components/reusable/new-button';
import CreateHouseModal from './create-house-modal';
import UpdateHouseModal from './update-house-modal';
// import VerticalTableRow from '../../components/layout/vertical-table-row';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

// const Input = withStyles((theme) => ({
//   root: {
//     margin: `${theme.spacing(1)}px 0`,
//   },
// }))(TextField);

const columns = [
  {name: 'score', label: 'Score', options: {filter: true, sort: false}},
  {name: 'name', label: 'Name', options: {filter: true, sort: false}},
];

/**
 * @return {object}
 */
function Houses() {
  const [isLoading, setIsLoading] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(null);
  const [selectedHouse, setSelectedHouse] = React.useState(null);
  // const [achievements, setAchievements] = React.useState([]);

  const {
    isFetching: isFetchingHouses,
    data: houses,
    setData: setHouses,
  } = useFecthData(API.getHouses);

  /**
   *
   * @return {void}
   */
  async function fetchAchievements() {
    try {
      const response = await API.getAllAchievements();
      setAchievements(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  React.useEffect(() => {
    fetchAchievements();
  }, []);

  // /**
  //  * @param {object} event
  //  * @param {object} house
  //  *
  //  * @return {object}
  //  */
  // async function handleSubmitAchievement(event, house) {
  //   event.preventDefault();
  //   if (isLoading) return;

  //   const formElem = event.currentTarget;
  //   const achievementId = formElem['achievementId'].value;

  //   if (!achievementId) return toast.error('Nenhuma conquista selecionada');

  //   setIsLoading(true);
  //   try {
  //     await API.addHouseAchievement(house.id, achievementId);
  //     toast.success(`Conquista adicionada`);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // /**
  //  * @param {object} e
  //  * @param {object} house
  //  *
  //  * @return {object}
  //  */
  // async function handleSubmit(e, house) {
  //   e.preventDefault();
  //   if (isLoading) return;

  //   const formElem = e.currentTarget;
  //   const points = Number(formElem['points'].value);

  //   if (!points || Number.isNaN(points)) return toast.error('You must provide points');

  //   setIsLoading(true);
  //   try {
  //     await API.addPointToHouse(house.id, points);
  //     toast.success(`Added '${points}' points to house ${house.name} successfuly`);
  //     const newHouses = houses.map((iterationHouse) => {
  //       if (iterationHouse.id === house.id) return {...iterationHouse, score: iterationHouse.score + points};
  //       return iterationHouse;
  //     });
  //     setHouses(newHouses);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  /**
  * @return {object}
  */
  async function assignHouses() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await API.assignHouses();
      toast.success(`Assign houses successfuly`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * @return {object}
   */
  function displayIsCreatingModal() {
    if (!isCreating) return null;

    /**
     * @param {object} newHouse
     */
    function createEventData(newHouse) {
      setHouses([...houses, newHouse]);
      setIsCreating(false);
    }

    return (
      <CreateHouseModal
        onRequestClose={() => setIsCreating(false)}
        onSuccess={createEventData}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayIsUpdatingModal() {
    if (!selectedHouse) return null;

    /**
     * @param {object} newHouse
     */
    function updateHouseData(newHouse) {
      const newHouses = houses.map((house) => {
        if (house.id === selectedHouse.id) return newHouse;
        else return house;
      });
      setHouses(newHouses);
      setSelectedHouse(false);
    }

    return (
      <UpdateHouseModal
        onRequestClose={() => setSelectedHouse(false)}
        onSuccess={updateHouseData}
        house={selectedHouse}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayTable() {
    if (isFetchingHouses) return <Spinner />;

    return (
      <MUIDataTable
        columns={columns}
        title='Houses'
        data={houses}
        options={{
          rowsPerPage: 10,
          customToolbar: () => {
            return (<div>
              <NewButton onClick={() => setIsCreating(true)} />
              <IconButton onClick={() => assignHouses()}>
                Distribuir casas <HomeIcon />
              </IconButton>
            </div>);
          },
          onRowClick: (_, {dataIndex}) => setSelectedHouse(houses[dataIndex]),
          expandableRows: true,
          renderExpandableRow: (_, {dataIndex}) => (
            <TableExpandedRow height={200}>
              {/* <VerticalTableRow name='Adicionar Conquista' value={<>
                <form className="flex flex-col" onSubmit={(e) => handleSubmitAchievement(e, houses[dataIndex])}>
                  <Input
                    label="Conquista"
                    name="achievementId"
                    select
                  >
                    { achievements.map((achievement, index) => {
                      return achievement.type === 'Casa' ? (<MenuItem key={index} value={achievement.id}>{achievement.title}</MenuItem>) : null;
                    }) }
                  </Input>
                  <Button variant="contained" type="submit">
                    Adicionar
                    { isLoading && <Spinner /> }
                  </Button>
                </form>
              </>} />
              <VerticalTableRow name='Adicionar Pontos' value={<>
                <form className="flex flex-col" onSubmit={(e) => handleSubmit(e, houses[dataIndex])}>
                  <TextField name="points" type="number" label='points' />
                  <Button variant="contained" type="submit">
                    Adicionar
                    { isLoading && <Spinner /> }
                  </Button>
                </form>
              </>} />
              <VerticalTableRow name='Conquistas' value={<>
                {houses[dataIndex].achievements.map((achievement, index) => (
                  <div key={index}>
                    <p>{achievement.title}</p>
                  </div>
                ))}
              </>} /> */}
            </TableExpandedRow>
          ),
        }}
      />
    );
  }

  return (
    <div className={styles.root}>
      { displayIsCreatingModal() }
      { displayIsUpdatingModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayTable() }
      </main>
    </div>
  );
}

export default Houses;
