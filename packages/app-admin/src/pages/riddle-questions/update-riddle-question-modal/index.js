import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import QuestionForm from '../riddle-question-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function UpdateQuestionModal({question, onRequestClose, onSuccess}) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  /**
   * @param {object} submitEvent
   *
   * @return {object}
   */
  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const formElem = submitEvent.currentTarget;
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

    const newQuestion = {...question, index, title, question: questionString, clue, answer, imgUrl, isLegendary};

    setIsUpdating(true);
    try {
      await API.updateRiddleQuestion(question.id, newQuestion);
      toast.success(`Pergunta '${question.index}' editada com sucesso!`);
      onSuccess(newQuestion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal open onClose={onRequestClose}>
      <div className="w-full h-full p-4 flex justify-center items-center">
        <div className="bg-white rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Editar Pergunta</h1>
          <QuestionForm
            handleSubmit={handleSubmit}
            isLoading={isUpdating}
            onCancel={onRequestClose}
            initialData={question}
            buttonLabel='Editar'
          />
        </div>
      </div>
    </Modal>
  );
}

export default UpdateQuestionModal;
