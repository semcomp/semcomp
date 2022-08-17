import React from 'react';

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';

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
import CreateEventModal from './create-event-modal';
import UpdateEventModal from './update-event-modal';
import QrCodeReaderModal from './qr-code-reader-modal';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full min-w-full flex',
  main: 'w-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = (event) => [
  {name: 'id', label: 'id', options: {filter: false, sort: false, display: false}},
  {name: 'name', label: 'Nome', options: {filter: false, sort: true}},
  {name: 'speaker', label: 'Facilitador', options: {filter: false, sort: true}},
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
  {name: 'attendancesCount', label: 'Pessoas Presentes', options: {filter: false, sort: false}},
  {name: 'subscribersCount', label: 'Pessoas Inscritas', options: {filter: false, sort: false}},
  {name: 'maxOfSubscriptions', label: 'Máximo de Inscritos', options: {filter: false, sort: false}},
  {
    name: 'link',
    label: 'Link',
    options: {
      filter: false,
      sort: false,
      display: false,
      customBodyRender: (value) => <TableRowTruncated value={value} />,
    },
  },
  {
    name: 'startDate',
    label: 'Início',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={event[dataIndex].startDate} />,
    },
  },
  {
    name: 'endDate',
    label: 'Término',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={event[dataIndex].endDate} />,
    },
  },
];

/**
 * @return {object}
 */
function Events() {
  const {
    data: events,
    isFetching: isFetchingEvents,
    setData: setEvents,
  } = useFecthData(API.getAllEvents);

  const {
    deleteConfirmationModalElement,
    handleTableDeleteEvent,
  } = useDeleteConfirmationModal({
    data: events,
    setData: setEvents,
    idExtractor: (event) => event.id,
    nameExtractor: (event) => event.name,
    deleteDataFunction: API.deleteEvent,
  });

  const [isCreating, setIsCreating] = React.useState();
  const [updatingEvent, setUpdatingEvent] = React.useState();
  const [scanning, setScanning] = React.useState(null);
  const [formatedEvents, setFormatedEvents] = React.useState([]);

  React.useEffect(() => {
    if (!events) {
      return;
    }

    setFormatedEvents(events.map((event) => {
      const attendancesCount = (event.attendances && event.attendances.length) || 0;
      const subscribersCount = (event.subscribers && event.subscribers.length) || 0;
      return {...event, attendancesCount, subscribersCount};
    }));
  }, [events]);

  /**
   * @return {object}
   */
  function displayIsCreatingModal() {
    if (!isCreating) return null;

    /**
     * @param {object} newEvent
     */
    function createEventData(newEvent) {
      setEvents([...events, newEvent]);
      setIsCreating(false);
    }

    return (
      <CreateEventModal
        onRequestClose={() => setIsCreating(false)}
        onSuccess={createEventData}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayIsUpdatingModal() {
    if (!updatingEvent) return null;

    /**
     * @param {object} newEvent
     */
    function updateEventData(newEvent) {
      const newEvents = events.map((event) => {
        if (event.id === updatingEvent.id) return newEvent;
        else return event;
      });
      setEvents(newEvents);
      setUpdatingEvent(false);
    }

    return (
      <UpdateEventModal
        onRequestClose={() => setUpdatingEvent(false)}
        onSuccess={updateEventData}
        event={updatingEvent}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayScanningModal() {
    if (!scanning) return null;

    return (
      <QrCodeReaderModal
        onRequestClose={() => setScanning(null)}
        onSuccess={() => setScanning(null)}
        event={scanning}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayUsersTable() {
    if (isFetchingEvents) return <Spinner />;

    return (
      <MUIDataTable
        columns={columns(formatedEvents)}
        title='Eventos'
        data={formatedEvents}
        options={{
          rowsPerPage: 10,
          customToolbar: () => <NewButton onClick={() => setIsCreating(true)} />,
          onRowClick: (_, {dataIndex}) => setUpdatingEvent(formatedEvents[dataIndex]),
          expandableRows: true,
          onRowsDelete: handleTableDeleteEvent,
          renderExpandableRow: (_, {dataIndex}) => {
            const event = formatedEvents[dataIndex];
            return <TableExpandedRow>
              <VerticalTableRow name='Descrição' value={event.description} />
              <VerticalTableRow name='Máximo de Inscritos' value={event.maxOfSubscriptions} />
              <VerticalTableRow name='Link' value={event.link} />
              <VerticalTableRow name='Pessoas Inscritas' value={<>
                {event.subscribers && event.subscribers.map((subscriber, index) => {
                  return <div className="py-4" key={index}>
                    <p>{subscriber.email}</p>
                    <p>{subscriber.name}</p>
                  </div>;
                })}
              </>} />
              <VerticalTableRow name='Pessoas Presentes' value={<>
                {event.attendances && event.attendances.map((attendance, index) => (
                  <div className="py-4" key={index}>
                    <p>{attendance.email}</p>
                    <p>{attendance.name}</p>
                  </div>
                ))}
              </>} />
              <VerticalTableRow name='Marcar Presença' value={<>
                <Button variant="contained" onClick={() => setScanning(event)}>
                  Ler QrCode
                </Button>
              </>} />
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
      { displayScanningModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayUsersTable() }
      </main>
    </div>
  );
}

export default Events;
