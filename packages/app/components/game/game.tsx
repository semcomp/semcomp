import { useEffect, useState } from "react";

import TextField from '@mui/material/TextField';
import {
  Done,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import API from "../../api";
import Spinner from "../spinner";
import GameConfig from "../../libs/game-config";
import End from "./end";
import { Button } from "@mui/material";
import LoadingButton from "../loading-button";

const styles = {
  root: "w-full h-full flex justify-center text-center",
  container: "p-4 max-w-4xl",
  title: "text-3xl",
  teamName: "",
  progressTracker: "",
  toolbar: "flex justify-center items-center",

  questionRoot:
    "w-full backdrop-brightness-95 backdrop-blur rounded-lg shadow p-4 rounded-lg text-justify flex flex-col items-center font-secondary",
  questionForm: "flex flex-col items-end mt-4 w-full",
  questionButton: "",
};

function Question({
  setTeam,
  socket,
  gameConfig,
  token,
  questionIndex,
}: {
  setTeam: any,
  socket: any,
  gameConfig: GameConfig,
  token: string,
  questionIndex: any,
}
) {
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const wasCorrectlyAnswered = question && Boolean(question.answer);

  useEffect(() => {
    async function fetchQuestion() {
      setIsFetchingQuestion(true);
      setInputValue("");
      try {
        console.log(gameConfig.getEventPrefix(), questionIndex);
        const { data: question } = await API.game.getQuestion(
          gameConfig.getEventPrefix(),
          questionIndex + 1
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    if (isSubmitting) return;
    event.preventDefault();

    const value = inputValue.trim().toLowerCase();
    if (!value) return toast.error("Você deve fornecer uma resposta");

    setIsSubmitting(true);
    try {
      socket.emit(`${gameConfig.getEventPrefix()}-try-answer` , {token: token, index: question.index, answer: value});
      await socket.once(`${gameConfig.getEventPrefix()}-try-answer-result`, ({ index, isCorrect, group }) => {
        if (!isCorrect) {
          toast.error("Resposta incorreta");
        } else {
          setTeam(group);
          toast.success("Resposta correta!");
        }
      });
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
            className="max-w-full w-[500px] h-full object-contain py-4"
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
            style={{backgroundColor: "white", borderRadius: "0.5rem"}}
          />
          <LoadingButton
          isLoading={isSubmitting}
          className="w-full text-white py-3 px-6 bg-primary rounded-lg my-6"
          type="submit"
        >
         Enviar!
        </LoadingButton>
        </form>
      </>
    );
  }

  return <div className={styles.questionRoot}>{renderQuestion()}</div>;
}

export default function Game({
  team, setTeam, socket, token, gameConfig
}: {
  team: any, setTeam: any, socket: any, token: string, gameConfig: GameConfig
}) {
  
  const completedQuestions = team.completedQuestions;
  console.log(completedQuestions);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <>
        {  
            gameConfig &&
            // completedQuestions.length >= gameConfig.getNumberOfQuestions() ?
            //   <End gameConfig={gameConfig}/>
            // : 
            gameConfig.verifyIfIsHappening() ?
            <Question
              setTeam={setTeam}
              socket={socket}
              gameConfig={gameConfig}
              token={token}
              questionIndex={completedQuestions.length}
            />
            : <p>Fora do tempo!</p>
          }
        </>
      </div>
    </div>
  );
}
