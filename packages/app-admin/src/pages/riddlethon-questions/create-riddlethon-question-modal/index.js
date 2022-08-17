import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import QuestionForm from '../riddlethon-question-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function CreateQuestionModal({onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const formElem = event.currentTarget;
    const index = formElem['index'].value;
    const title = formElem['title'].value;
    const questionString = formElem['question'].value;
    const clue = formElem['clue'].value;
    const answer = formElem['answer'].value;
    const imgUrl = formElem['imgUrl'].value;
    const isLegendary = formElem['isLegendary'].checked;

    if (!index) return toast.error('You must provide am index');
    if (!title) return toast.error('You must provide a title');
    if (!questionString) return toast.error('You must provide a question');
    if (!answer) return toast.error('You must provide an answer');

    const newQuestion = {index, title, question: questionString, clue, answer, imgUrl, isLegendary};

    setIsCreating(true);
    try {
      const response = await API.createRiddlethonQuestion(newQuestion);
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal open onClose={onRequestClose}>
      <div className="w-full h-full p-4 flex justify-center items-center">
        <div className="bg-white rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Criar Pergunta</h1>
          <QuestionForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            buttonLabel='Criar'
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateQuestionModal;
