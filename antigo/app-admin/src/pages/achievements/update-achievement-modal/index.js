import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import AchievementForm from '../achievement-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function UpdateAchievementModal({achievement, events, onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} submitEvent
   *
   * @return {object}
   */
  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const formElem = submitEvent.currentTarget;
    const title = formElem['title'].value;
    const description = formElem['description'].value;
    const startDate = formElem['start-date'].value;
    const endDate = formElem['end-date'].value;
    const type = formElem['type'].value;
    const category = formElem['category'].value;
    const eventId = formElem['eventId'] && formElem['eventId'].value;
    const eventType = formElem['eventType'] && formElem['eventType'].value;
    const minPercentage = formElem['minPercentage'] && +formElem['minPercentage'].value;
    const numberOfPresences = formElem['numberOfPresences'] && +formElem['numberOfPresences'].value;
    const numberOfAchievements = formElem['numberOfAchievements'] && +formElem['numberOfAchievements'].value;

    if (!title) return toast.error('You must provide a title');
    if (!description) return toast.error('You must provide a description');
    if (!startDate) return toast.error('You must provide a start date');
    if (!endDate) return toast.error('You must provide an end date');
    if (!type) return toast.error('You must provide a type');
    if (!category) return toast.error('You must provide a category');

    const newAchievement = {
      title,
      description,
      startDate,
      endDate,
      type,
      category,
      eventId,
      eventType,
      minPercentage,
      numberOfPresences,
      numberOfAchievements,
    };

    setIsCreating(true);
    try {
      await API.updateAchievement(achievement.id, newAchievement);
      toast.success(`Conquista '${achievement.name}' editado com sucesso!`);
      onSuccess(newAchievement);
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
          <h1 className="text-4xl">Atualizar Conquista</h1>
          <AchievementForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            initialData={achievement}
            buttonLabel='Update'
            events={events}
          />
        </div>
      </div>
    </Modal>
  );
}

export default UpdateAchievementModal;
