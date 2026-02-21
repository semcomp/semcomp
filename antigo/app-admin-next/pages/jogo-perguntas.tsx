import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiGameQuestion, SemcompApiGetGameQuestionsResponse } from '../models/SemcompApiModels';
import CreateGameQuestionModal from '../components/game-questions/CreateGameQuestionModal';
import EditGameQuestionModal from '../components/game-questions/EditGameQuestionModal';
import DataPage from '../components/DataPage';
import { GameQuestionFormData } from '../components/game-questions/GameQuestionForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import Game from '../libs/constants/game-enum';
import util from '../libs/util';

type GameQuestionData = {
  "ID": string,
  "Jogo": Game,
  "Indice": number,
  "Título": string,
  "Pergunta": string,
  "Dica": string,
  "Resposta": string,
  "Criado em": string,
};

function mapData(data: SemcompApiGameQuestion[]): GameQuestionData[] {
  const newData: GameQuestionData[] = [];
  for (const gameQuestion of data) {
    newData.push({
      "ID": gameQuestion.id,
      "Jogo": gameQuestion.game,
      "Indice": gameQuestion.index,
      "Título": gameQuestion.title,
      "Pergunta": gameQuestion.question,
      "Dica": gameQuestion.clue,
      "Resposta": gameQuestion.answer,
      "Criado em": util.formatDate(gameQuestion.createdAt),
    })
  }

  return newData;
}

function GameQuestionsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiGameQuestion>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  return (<DataTable
    data={new PaginationResponse<GameQuestionData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function GameQuestions() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetGameQuestionsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as GameQuestionFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getGameQuestions(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData(data.getEntities()[index]);
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (<>
    {isCreateModalOpen && (
      <CreateGameQuestionModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {isEditModalOpen && (
      <EditGameQuestionModal
        initialValue={selectedData}
        onRequestClose={() => {
          fetchData();
          setIsEditModalOpen(false);
        }}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Jogo - Perguntas"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Criar
          </button>}
          table={<GameQuestionsTable
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(GameQuestions, "GAMEQUESTIONS");
