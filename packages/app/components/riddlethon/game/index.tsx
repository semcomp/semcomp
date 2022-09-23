import { useCallback, useEffect, useState } from "react";

import TextField from '@mui/material/TextField';
import {
  Done,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import API from "../../../api";
import Spinner from "../../spinner";
import { useSocket, useTeam, RiddlethonRoutes } from "../../../pages/game";
import { useRouter } from 'next/router';
import {
  NUMBER_OF_QUESTIONS,
  EVENTS_PREFIX,
} from "../../../constants/riddlethon";

const styles = {
  root: "w-full h-full flex justify-center text-center",
  container: "p-4 max-w-xl",
  title: "text-3xl",
  teamName: "",
  progressTracker: "",
  toolbar: "flex justify-center items-center",

  questionRoot:
    "w-full bg-white shadow p-4 rounded-lg text-justify flex flex-col items-center",
  questionForm: "flex items-end mt-4 w-full",
  questionButton: "",
};

function Question({ questionIndex, onCorrectAnswer }) {
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const socket = useSocket();

  const wasCorrectlyAnswered = question && Boolean(question.answer);

  useEffect(() => {
    async function fetchQuestion() {
      setIsFetchingQuestion(true);
      setInputValue("");
      try {
        const { data: question } = await API.riddlethon.getQuestion(
          questionIndex
        );
        setQuestion(question);
      } catch (e) {
        console.error(e);
        setQuestion(null);
      } finally {
        setIsFetchingQuestion(false);
      }
    }
    fetchQuestion();
  }, [questionIndex]);

  async function submit(event) {
    if (isSubmitting) return;
    event.preventDefault();

    const value = inputValue.trim().toLowerCase();
    if (!value) return toast.error("Você deve fornecer uma resposta");

    setIsSubmitting(true);
    try {
      socket.send(`${EVENTS_PREFIX}try-answer`, question.index, value);
      const { correct } = await socket.once(`${EVENTS_PREFIX}correct-answer`);
      if (!correct) toast.error("Resposta incorreta");
      else {
        toast.success("Resposta correta!");
        onCorrectAnswer();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderTextFieldAdornment() {
    if (isSubmitting)
      return (
        <Spinner
          size="small"
          strokeWidth={2}
          color="#115079"
          className="mr-2"
        />
      );
    else if (wasCorrectlyAnswered) {
      return <Done className="mr-2" htmlColor="#28a745" />;
    } else return null;
  }

  function handleChange(event) {
    if (wasCorrectlyAnswered) return;
    setInputValue(event.target.value);
  }

  function renderQuestion() {
    if (isFetchingQuestion) return <Spinner size="large" className="pt-4" />;

    if (!question) return <div>Houve um erro buscando a pergunta</div>;

    return (
      <>
        <h1 className="text-2xl text-center mb-4">{question.title}</h1>
        {question.imgUrl && (
          <img
            src={question.imgUrl}
            alt=""
            className="max-w-xs w-full h-full object-contain py-4"
          />
        )}
        <div>{question.question}</div>
        <form className={styles.questionForm} onSubmit={submit}>
          <TextField
            fullWidth
            onChange={handleChange}
            label="Resposta"
            disabled={wasCorrectlyAnswered}
            value={question.answer || inputValue}
            InputProps={{ startAdornment: renderTextFieldAdornment() }}
          />
        </form>
      </>
    );
  }

  return <div className={styles.questionRoot}>{renderQuestion()}</div>;
}

function Riddlethon() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const { team, setTeam } = useTeam();

  const completedQuestions = team && team.completedQuestions;

  function nextQuestion() {
    const nextIndex = Math.min(
      currentQuestionIndex + 1,
      NUMBER_OF_QUESTIONS - 1
    );
    setCurrentQuestionIndex(nextIndex);
  }

  function prevQuestion() {
    const prevIndex = Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(prevIndex);
  }

  function canRenderNavicationNextArrow() {
    if (!team) return false;
    return currentQuestionIndex < completedQuestions.length;
  }

  function canRenderNavicatioPrevArrow() {
    if (!team) return false;
    return currentQuestionIndex > 0;
  }

  const win = useCallback(
    function () {
      router.push(RiddlethonRoutes.end);
    },
    [router]
  );

  function handleCorrectAnswer() {
    setTeam({
      ...team,
      completedQuestions: [
        ...completedQuestions,
        currentQuestionIndex,
      ],
    });
    if (currentQuestionIndex + 1 === NUMBER_OF_QUESTIONS) {
      win();
      return;
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  useEffect(() => {
    if (!team) return;
    if (completedQuestions.length >= NUMBER_OF_QUESTIONS) {
      win();
    }
    setCurrentQuestionIndex(completedQuestions.length);
  }, [team, completedQuestions, win]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          {canRenderNavicatioPrevArrow() ? (
            <NavigateBefore
              onClick={prevQuestion}
              className="cursor-pointer mr-4"
            />
          ) : (
            <span style={{ width: 24, height: 24 }} className="ml-4" />
          )}
          <p className={styles.progressTracker}>
            {currentQuestionIndex + 1}/{NUMBER_OF_QUESTIONS}
          </p>
          {canRenderNavicationNextArrow() ? (
            <NavigateNext
              onClick={nextQuestion}
              className="cursor-pointer ml-4"
            />
          ) : (
            <span style={{ width: 24, height: 24 }} className="mr-4" />
          )}
        </div>
        <Question
          questionIndex={currentQuestionIndex}
          onCorrectAnswer={handleCorrectAnswer}
        />
      </div>
    </div>
  );
}

export default Riddlethon;
