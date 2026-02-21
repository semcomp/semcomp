import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import EventForm from '../event-form';

/**
 * @param {object} param0
 *
 * @return {object}
 */
function CreateEventModal({onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const formElem = event.currentTarget;
    const name = formElem['name'].value;
    const description = formElem['description'].value;
    const speaker = formElem['speaker'].value;
    const link = formElem['link'].value;
    const maxOfSubscriptions = +formElem['maxOfSubscriptions'].value;
    const startDate = new Date(formElem['start-date'].value).getTime();
    const endDate = new Date(formElem['end-date'].value).getTime();
    const type = formElem['type'].value;
    const isInGroup = formElem['isInGroup'].checked;
    const showOnSchedule = formElem['showOnSchedule'].checked;
    const showOnSubscribables = formElem['showOnSubscribables'].checked;
    const showStream = formElem['showStream'].checked;
    const needInfoOnSubscription = formElem['needInfoOnSubscription'].checked;

    if (!name) return toast.error('You must provide a name');
    if (!description) return toast.error('You must provide a description');
    if (!link) return toast.error('You must provide a link');
    if (!startDate) return toast.error('You must provide a start date');
    if (!endDate) return toast.error('You must provide an end date');
    if (!type) return toast.error('You must provide a type');

    const newEvent = {
      name,
      description,
      speaker,
      link,
      maxOfSubscriptions,
      startDate,
      endDate,
      type,
      isInGroup,
      showOnSchedule,
      showOnSubscribables,
      showStream,
      needInfoOnSubscription,
    };

    setIsCreating(true);
    try {
      const response = await API.createEvent(newEvent);
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal style={{height: '100%', overflowY: 'auto'}} open onClose={onRequestClose}>
      <div className="w-full p-4 flex justify-center items-center">
        <div className="bg-white h-full rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Criar Evento</h1>
          <EventForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            buttonLabel='Create'
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateEventModal;
