import React from "react";
import { useHistory } from "react-router-dom";

import {
  Done,
  NavigateNextSharp,
  NavigateBeforeSharp,
} from "@mui/icons-material";
import { Button, TextField } from "@mui/material";
import { toast } from "react-toastify";

import API from "../../../api";
import Spinner from "../../../components/spinner";
import { useSocket, useTeam, RiddleRoutes } from "..";
import { NUMBER_OF_QUESTIONS, EVENTS_PREFIX } from "../../../constants/riddle";

import "./style.css";

const styles = {
  root: "w-full h-full flex justify-center text-center",
  container: "p-4 max-w-xl",
  title: "text-3xl",
  teamName: "",
  progressTracker: "",
  toolbar: "flex justify-center items-center",

  questionRoot:
    "w-full bg-black shadow p-4 rounded-lg text-justify flex flex-col items-center",
  questionForm: "flex items-end mt-4 w-full",
  questionButton: "",
};

function Question({ questionIndex, onCorrectAnswer }) {
  const [isFetchingQuestion, setIsFetchingQuestion] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [question, setQuestion] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const socket = useSocket();
  const { team, setTeam, isFetchingTeam } = useTeam();

  const wasCorrectlyAnswered = question && Boolean(question.answer);

  async function fetchQuestion() {
    if (
      isFetchingTeam ||
      isFetchingQuestion ||
      questionIndex === null ||
      Number.isNaN(questionIndex)
    )
      return;

    setIsFetchingQuestion(true);
    setInputValue("");
    try {
      const { data: question } = await API.riddle.getQuestion(questionIndex);
      setQuestion(question);
    } catch (e) {
      console.error(e);
      setQuestion(null);
    } finally {
      setIsFetchingQuestion(false);
    }
  }
  React.useEffect(() => {
    fetchQuestion();
  }, [questionIndex]);

  React.useEffect(() => {
    async function handleItemUsed(group) {
      setTeam(group);
      await fetchQuestion();
    }

    socket.on(`${EVENTS_PREFIX}item-used`, handleItemUsed);

    return () => {
      socket.off(`${EVENTS_PREFIX}item-used`, handleItemUsed);
    };
  }, [team]);

  async function submit(event) {
    if (isSubmitting) return;
    event.preventDefault();

    const value = inputValue.trim().toLowerCase();
    if (!value) return toast.error("Você deve fornecer uma resposta");

    setIsSubmitting(true);
    try {
      socket.send(`${EVENTS_PREFIX}try-answer`, question.index, value);
      const { correct, group } = await socket.once(
        `${EVENTS_PREFIX}correct-answer`
      );
      if (!correct) {
        toast.error("Resposta incorreta");
      } else {
        toast.success("Resposta correta!");
        onCorrectAnswer(group);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function clue(event) {
    event.preventDefault();
    if (isFetchingQuestion) return;

    setIsFetchingQuestion(true);
    try {
      await socket.send(`${EVENTS_PREFIX}use-clue`);
      await fetchQuestion();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingQuestion(false);
    }
  }

  async function skip(event) {
    event.preventDefault();
    if (isFetchingQuestion) return;

    setIsFetchingQuestion(true);
    try {
      await socket.send(`${EVENTS_PREFIX}use-skip`);
      await fetchQuestion();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingQuestion(false);
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
      return <DoneIcon className="mr-2" htmlColor="#28a745" />;
    } else return null;
  }

  function handleChange(event) {
    if (wasCorrectlyAnswered) return;
    setInputValue(event.target.value);
  }

  function renderQuestion() {
    if (isFetchingQuestion || isFetchingTeam)
      return <Spinner size="large" className="pt-4" />;

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
            className="Riddle-page__answer"
            onChange={handleChange}
            label="Resposta"
            disabled={wasCorrectlyAnswered}
            value={question.answer || inputValue}
            InputProps={{ startAdornment: renderTextFieldAdornment() }}
          />
        </form>
        {question.clue && (
          <div>
            <b>Dica:</b> {question.clue}
          </div>
        )}
        {!question.answer && (
          <div style={{ display: "flex" }}>
            {!question.isLegendary &&
              team.availableClues > 0 &&
              !team.usedClueIndexes.includes(question.index) && (
                <Button
                  onClick={clue}
                  style={{
                    backgroundColor: "#045079",
                    color: "white",
                    margin: "16px 8px",
                    padding: "8px 32px",
                  }}
                >
                  Dica ({team.availableClues})
                </Button>
              )}
            {question.isLegendary ||
            (team.availableSkips > 0 &&
              !team.usedSkipIndexes.includes(question.index)) ? (
              <Button
                onClick={skip}
                style={{
                  backgroundColor: "#045079",
                  color: "white",
                  margin: "16px 8px",
                  padding: "8px 32px",
                }}
              >
                Pular{" "}
                {!question.isLegendary && (
                  <React.Fragment>({team.availableSkips})</React.Fragment>
                )}
              </Button>
            ) : null}
          </div>
        )}
      </>
    );
  }

  return <div className={styles.questionRoot}>{renderQuestion()}</div>;
}

function Riddle() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(null);
  const history = useHistory();
  const { team, setTeam } = useTeam();

  const win = React.useCallback(
    function () {
      history.push(RiddleRoutes.end);
    },
    [history]
  );

  function handleCorrectAnswer(group) {
    setTeam(group);
  }

  React.useEffect(() => {
    if (!team) return;
    let teamCurrentQuestionIndex = 0;
    if (team.completedQuestionsIndexes.length > 0) {
      teamCurrentQuestionIndex =
        team.completedQuestionsIndexes.reduce((a, b) =>
          a.index > b.index ? a : b
        ).index + 1;
    }
    if (teamCurrentQuestionIndex >= NUMBER_OF_QUESTIONS) {
      win();
    }
    setCurrentQuestionIndex(teamCurrentQuestionIndex);
  }, [team, win]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <p className={styles.progressTracker}>{currentQuestionIndex + 1}</p>
        </div>
        <Question
          questionIndex={currentQuestionIndex}
          onCorrectAnswer={handleCorrectAnswer}
        />
      </div>
    </div>
  );
}

export default Riddle;
