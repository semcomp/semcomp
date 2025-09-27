import { useEffect, useState, useCallback } from "react";

import TextField from '@mui/material/TextField';
import {
  Lightbulb,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { Tooltip, IconButton } from "@mui/material";

import API from "../../api";
import Spinner from "../spinner";
import GameConfig from "../../libs/game-config";
import End from "./end";
import { Button } from "@mui/material";
import { useSocket } from "../../libs/hooks/useSocket";
import { useDebounce } from "../../libs/hooks/useDebounce";

const styles = {
  root: "w-full h-full flex justify-center text-center",
  container: "p-4 max-w-4xl",
  title: "text-3xl",
  teamName: "",
  progressTracker: "",
  toolbar: "flex justify-center items-center",

  questionRoot:
    "w-full bg-white text-primary phone:mt-24 mobile:mt-10 rounded-2xl shadow-xl border border-gray-100 p-8 text-justify flex flex-col items-center font-secondary",
  questionForm: "flex flex-col items-end mt-6 w-full",
  questionButton: "",
  clueSection: "w-full mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm",
  clueButton: "flex items-center justify-center gap-2",
  clueChip: "mb-2",
};

function Question({
  setTeam,
  gameConfig,
  token,
  questionIndex,
  refreshTrigger,
}: {
  setTeam: any,
  gameConfig: GameConfig,
  token: string,
  questionIndex: any,
  refreshTrigger: number,
}
) {
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isUsingClue, setIsUsingClue] = useState(false);
  const [showClue, setShowClue] = useState(false);

  const { emit, once, isConnected } = useSocket();

  async function fetchQuestion() {
    setIsFetchingQuestion(true);
    try {
      const { data: question } = await API.game.getQuestion(
        gameConfig.getEventPrefix(),
        questionIndex
      );
      setQuestion(question);
      setIsUsingClue(question?.clue);
      setShowClue(question?.clue);
    } catch (e) {
      console.error(e);
      setQuestion(null);
    } finally {
      setIsFetchingQuestion(false);
    }
  }

  useEffect(() => {
    async function init() {
      setInputValue("");
      setShowClue(false);
      await fetchQuestion();
    }
    init();
  }, [questionIndex, gameConfig, refreshTrigger]);

  async function useClue() {
    if (isUsingClue || showClue) return;
    setIsUsingClue(true);
    try {
      // Emite evento via WebSocket em vez de usar API REST
      emit(`${gameConfig.getEventPrefix()}-use-clue`, { token });
      
      // Aguarda a confirmação do servidor
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for clue result'));
        }, 5000);

        const handleClueResult = ({ type, data }) => {
          clearTimeout(timeout);
          if (type === 'clue-used') {
            setShowClue(true);
            toast.success("Dica utilizada com sucesso!");
            // Atualiza as informações do grupo se necessário
            if (data.group) {
              setTeam(data.group);
            }
          }
          resolve({ type, data });
        };

        once(`${gameConfig.getEventPrefix()}-group-update`, handleClueResult);
      });
      
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao usar dica");
    } finally {
      setIsUsingClue(false);
    }
  }

  const handleSubmit = useCallback(async (value: string) => {
    if (isSubmitting || !isConnected) return;

    const trimmedValue = value.trim().toLowerCase();
    if (!trimmedValue) {
      toast.error("Você deve fornecer uma resposta");
      return;
    }

    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    setIsSubmitting(true);
    try {
      emit(`${gameConfig.getEventPrefix()}-try-answer`, { 
        token: token, 
        index: question.index, 
        answer: trimmedValue 
      });
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for answer result'));
        }, 10000);

        const handleAnswerResult = ({ index, isCorrect, group }) => {
          clearTimeout(timeout);
          if (!isCorrect) {
            toast.error("Resposta incorreta");
          } else {
            setTeam(group);
            toast.success("Resposta correta!");
          }
          resolve({ index, isCorrect, group });
        };

        once(`${gameConfig.getEventPrefix()}-try-answer-result`, handleAnswerResult);
      });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao processar resposta");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isConnected, emit, once, gameConfig, token, question, setTeam]);

  const debouncedSubmit = useDebounce(handleSubmit, { delay: 1000, maxWait: 5000 });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value) {
      toast.error("Você deve fornecer uma resposta");
      return;
    }
    
    debouncedSubmit(value);
  }

  function renderTextFieldAdornment() {
    if (isSubmitting)
      return (
        <Spinner
          size="medium"
          strokeWidth={2}
          color="#115079"
          className="mr-2"
        />
      );
    else return (
      <Button
        type="submit"
        disabled={isSubmitting || !isConnected}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        size="small"
      >
        Enviar
      </Button>
    );
  }

  function handleChange(event) {
    setInputValue(event.target.value);
  }

  function renderClueSection() {
    if (!question?.clue) return null;

    return (
      <div className={styles.clueSection}>
        <div className="flex items-start gap-3">
            <p className="text-sm text-yellow-700 leading-relaxed">
              <Lightbulb /> {question.clue}
            </p>
        </div>
      </div>
    );
  }

  function renderQuestion() {
    if (isFetchingQuestion) return <Spinner size="large" />;

    if (!question) return <div className="text-red-500 text-center p-8">Houve um erro buscando a pergunta</div>;

    return (
      <div className={styles.questionRoot}>
        {/* Header com título e botão de dica */}
        <div className="relative w-full flex items-center justify-center mb-6">
          <h1 className="text-3xl font-bold text-center px-10 text-gray-800 leading-tight">
            {question.title}
          </h1>
          {question?.hasClue && (
            <Tooltip title="Usar dica" placement="left" arrow>
              <IconButton
                onClick={useClue}
                disabled={isUsingClue || !isConnected}
                className="!absolute right-0 top-1/2 -translate-y-1/2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 transition-all duration-200"
                size="small"
              >
                <Lightbulb />
              </IconButton>
            </Tooltip>
          )}
        </div>

        {/* Imagem da questão */}
        {question.imgUrl && (
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <img
              src={question.imgUrl}
              alt=""
              className="max-w-full w-[500px] h-full object-contain"
            />
          </div>
        )}

        {/* Texto da questão */}
        <div className="mb-6 text-lg text-gray-700 leading-relaxed text-center max-w-3xl">
          {question.question}
        </div>
        
        {/* Seção de dicas */}
        {showClue && renderClueSection()}
        
        <form className={styles.questionForm} onSubmit={submit}>
          <TextField
            fullWidth
            onChange={handleChange}
            value={inputValue}
            placeholder="Digite sua resposta aqui..."
            InputProps={{
              endAdornment: renderTextFieldAdornment(),
            }}
            className="mb-4"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                }
              }
            }}
          />
        </form>
      </div>
    );
  }

  return <>{renderQuestion()}</>;
}

export default function Game({
  team, setTeam, token, gameConfig
}: {
  team: any, setTeam: any, token: string, gameConfig: GameConfig
}) {
  
  const { on, off } = useSocket();
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(null);
  const [refreshQuestion, setRefreshQuestion] = useState(0);
  
  async function getNumberOfQuestions(){
    try {
      const result = await API.game.getNumberOfQuestions(gameConfig.getName());
      
      if(result.data && result.data.encrypted && result.data.key){
        const encryptedValue = parseInt(Buffer.from(result.data.encrypted, 'base64').toString('utf8'));
        const key = result.data.key;
        
        const questionCount = ((encryptedValue - 42) / 3 - key) / 7;
        setNumberOfQuestions(Math.floor(questionCount));  
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  useEffect(() => {
    getNumberOfQuestions();
  }, [])

  useEffect(() => {
    if(team){
      setCompletedQuestions(team.completedQuestions);
    }
  }, [team])

  useEffect(() => {
    // Listener para atualizações do grupo (incluindo uso de dicas)
    const handleGroupUpdate = ({ type, data }) => {
      if (type === 'clue-used') {
        if (data.group) {
          setTeam(data.group);
        }
        toast.info(`${data.usedBy} usou uma dica! Dicas restantes: ${data.availableClues}`);
        // Força a atualização da questão
        setRefreshQuestion(prev => prev + 1);
      }
    };

    on(`${gameConfig.getEventPrefix()}-group-update`, handleGroupUpdate);

    return () => {
      off(`${gameConfig.getEventPrefix()}-group-update`, handleGroupUpdate);
    };
  }, [gameConfig, setTeam, on, off]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <>
        {   team &&
            gameConfig &&
            numberOfQuestions && 
            completedQuestions &&
            completedQuestions.length == numberOfQuestions ?
              <End gameConfig={gameConfig}/>
            : 
            gameConfig.verifyIfIsHappening() ?
            completedQuestions && <Question
              setTeam={setTeam}
              gameConfig={gameConfig}
              token={token}
              questionIndex={completedQuestions.length}
              refreshTrigger={refreshQuestion}
            />
            : 
            <div className='flex content-center'>
            <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
              <p className='pb-4'>Fora do tempo!</p>
            </div>
          </div>
          }
        </>
      </div>
    </div>
  );
}
