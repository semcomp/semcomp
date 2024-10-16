import { toast } from 'react-toastify';
import { ReactNode, useEffect, useState } from 'react';

import SemcompApi from '../api/semcomp-api';
import util from '../libs/util';
import Game from '../libs/constants/game-enum';
import RequireRootAuth from '../libs/RequireAuth';
import { useAppContext } from '../libs/contextLib';
import DataPage from '../components/DataPage';
import DataTable from '../components/reusable/DataTable';
import Input, { InputType } from '../components/Input';
import EditGameConfigModal from '../components/games/EditGameConfigModal';
import CreateGameConfigModal from '../components/games/CreateGameConfigModal';
import { GameConfigFormData } from '../components/games/GameConfigForm';
import { SemcompApiGameConfig } from '../models/SemcompApiModels';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';

type GameConfigData = {
  "ID": string,
  "Jogo": string,
  "Descrição": string,
  "Regras": string,
  "Data de início": string,
  "Data de fim": string,
  "Tem grupos": ReactNode,
  "Máximo de membros": number,
  "Prefixo": string,
  "Criado em": string,
  "Editado em": string,
}

function GameConfigTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  actions,
}: {
  data: PaginationResponse<SemcompApiGameConfig>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
  actions?: {},
}) {
  const newData: GameConfigData[] = [];
  for (const game of data.getEntities()) {
    const description = game.description.length > 150 ?
      game.description.slice(0, 150) + "..."
    :
      game.description;
      
    const rules = game.rules.length > 150 ?
      game.rules.slice(0, 150) + "..."
    :
      game.rules;

    newData.push({
      "ID": game.id,
      "Jogo": game.game,
      "Descrição": description,
      "Regras": rules,
      "Data de início": util.formatDate(game.startDate),
      "Data de fim": util.formatDate(game.endDate),
      "Tem grupos": <Input onChange={() => {}} disabled={true} value={game.hasGroups} type={InputType.Checkbox}></Input>,
      "Máximo de membros": game.maximumNumberOfMembersInGroup,
      "Prefixo": game.eventPrefix,
      "Criado em": util.formatDate(game.createdAt),
      "Editado em": util.formatDate(game.updatedAt),
    })
  }

  return (<DataTable
    data={new PaginationResponse<GameConfigData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
    actions={actions}
  ></DataTable>);
}

function GameConfigs() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [formData, setFormData] = useState({
    id: null,
    game: Game.HARD_TO_CLICK,
    description: "",
    rules: "",
    startDate: Date.now(),
    endDate: Date.now(),
    hasGroups: false,
    maximumNumberOfMembersInGroup: 0,
  } as GameConfigFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getGameConfig(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRowClick(index: number) {
    
    const games = data.getEntities(); 

    setFormData({
      id: games[index].id,
      game: games[index].game,
      description: games[index].description,
      rules: games[index].rules,
      startDate: games[index].startDate,
      eventPrefix: games[index].eventPrefix,
      endDate: games[index].endDate,
      hasGroups: games[index].hasGroups,
      maximumNumberOfMembersInGroup: games[index].maximumNumberOfMembersInGroup,
    });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  function resetData() {
    setFormData({
      id: null,
      game: Game.HARD_TO_CLICK,
      description: "",
      rules: "",
      eventPrefix: "",
      startDate: Date.now(),
      endDate: Date.now(),
      hasGroups: false,
      maximumNumberOfMembersInGroup: 0,
    });
  }

  async function deleteGameConfig(row: GameConfigData) {
    const confirmed = window.confirm("Tem certeza de que deseja excluir " + row.Jogo + "?");
      if (confirmed) {
        const deleted = await semcompApi.deleteGameConfig(row.ID);
        fetchData();
        toast.success('Configuração de jogo excluída com sucesso!');
      }
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false);
    resetData();
    fetchData();
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    resetData();
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if(data != null){
      setIsLoading(false);
    }
  }, [data]);

  return (<>
    {isCreateModalOpen && (
      <CreateGameConfigModal
        data={formData}
        setData={setFormData}
        onRequestClose={handleCloseCreateModal}
      />
    )}
    {isEditModalOpen && (
      <EditGameConfigModal
        data={formData}
        setData={setFormData}
        onRequestClose={handleCloseEditModal}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Jogos"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >Criar</button>}
          table={<GameConfigTable
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
            actions={{"delete": deleteGameConfig}}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireRootAuth(GameConfigs, "GAMECONFIG");
