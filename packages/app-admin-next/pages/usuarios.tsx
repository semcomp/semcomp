import { ReactElement, useEffect, useState } from "react";
import DataTable from "../components/reusable/DataTable";
import RequireAuth from "../libs/RequireAuth";
import SemcompApi from "../api/semcomp-api";
import { useAppContext } from "../libs/contextLib";
import {
  PaymentStatus,
  SemcompApiUser,
  SemcompApiSale,
  SaleType,
} from "../models/SemcompApiModels";
import DataPage from "../components/DataPage";
import { TShirtSize } from "../components/t-shirt/TShirtForm";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import exportToCsv from "../libs/DownloadCsv";
import InfoCards from "../components/reusable/InfoCards";
import Input, { InputType } from '../components/Input';
import { Modal } from '../components/reusable/Modal';
import util from "../libs/util";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { toast } from "react-toastify";
import { InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";


type UserData = {
  ID: string;
  "E-mail": string;
  Nome: string;
  Curso: string;
  Telegram: string;
  Casa: string;
  "Retirou Kit": ReactElement | string;
  "Tamanho da camiseta": TShirtSize;
  "Compras": ReactElement | string;
  "Permite divulgação?": string;
  "Criado em": string;
};

type InfoData = {
  infoTitle: string;
  infoValue: number;
};

function mapData(
  data: SemcompApiUser[],
  allSales: (SemcompApiSale & {usedQuantity:number})[],
  handleOpenKitModal?: () => void,
  handleOpenSaleModal?: (saleOption: string[], paymentStatus: string[]) => void,
): UserData[] {
  const newData: UserData[] = [];
  for (const user of data) {
    const paymentStatus = [];
    const allSalesObj = {};
    allSales.forEach((sale) => {
      allSalesObj[sale.id] = sale;
    });
    let saleOption = [];
    let hasKit = false;
    let tShirtSize = null;

    // TODO: CRIAR HAS_KIT
    for (let i = 0; i < user.payment.status.length; i++) {
      let name = '';
      if (TShirtSize[user.payment.tShirtSize] !== TShirtSize.NONE) {
        tShirtSize = TShirtSize[user.payment.tShirtSize];
      }
      if (user.payment.status[i] === PaymentStatus.APPROVED) {
        user.payment.saleOption[i].forEach(saleId => {
          if (allSalesObj.hasOwnProperty(saleId)) {
            const sale = allSalesObj[saleId];
            if (sale) {
              if (sale.hasKit) {
                hasKit = true;
              }
              name = name.concat(sale.name, ', ');
            }
          }  else {
            toast.error(`Venda ${saleId} não encontrada para usuário ${user.name}`);
          }
        });

        if (name !== '') { // TODO: Arrumar um jeito melhor de exibir esses dados
          name = name.slice(0, -2);
          saleOption.push(name);
          paymentStatus.push("Aprovado");
        }
      } else {
        user.payment.saleOption[i].forEach(saleId => {
          if (allSalesObj.hasOwnProperty(saleId)) {
            const sale = allSalesObj[saleId];
            if (sale) {
              name = name.concat(sale.name, ', ');
            }
          }  else {
            console.log('Venda', saleId, ' não encontrada para usuário', user.name);
          }
        });

        if (name !== '') {
          name = name.slice(0, -2);
          saleOption.push(name);
          paymentStatus.push("Pendente");
        }
      }
    }

    const gotKit = hasKit ?
      <Input
        onChange={handleOpenKitModal ? handleOpenKitModal : () => { }}
        value={user.gotKit}
        type={InputType.Checkbox}
      /> : <></>

    const openSales = handleOpenSaleModal ? 
    <RemoveRedEyeIcon onClick={() => handleOpenSaleModal(saleOption, paymentStatus)}/> : <></>;
  
    newData.push({
      ID: user.id,
      "E-mail": user.email,
      Nome: user.name,
      Curso: user.course,
      Telegram: user.telegram,
      Casa: user.house.name,
      "Tamanho da camiseta": tShirtSize,
      "Compras": openSales && saleOption.length > 0 ? openSales : saleOption.join(", "),
      "Retirou Kit": handleOpenKitModal ? gotKit : (user.gotKit ? "Sim" : "Não"),
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": util.formatDate(user.createdAt),
    });
  }
  return newData;
}

function getInfoData(data: SemcompApiUser[], allSales: (SemcompApiSale & { usedQuantity: number })[]): InfoData[] {
  const infoData: InfoData[] = [];
  infoData.push({ infoTitle: "Inscritos", infoValue: data.length });

  let numKitStatus = data.filter(function (item) {
    return item.gotKit;
  }).length;
  infoData.push({
    "infoTitle": "Kits Retirados",
    "infoValue": numKitStatus,
  })

  let total = 0;
  for (const sale of allSales) {
    if (SaleType[sale.type] === SaleType.ITEM) {
      infoData.push({
        infoTitle: sale.name,
        infoValue: sale.usedQuantity,
      });
      total += sale.usedQuantity;
    } else if (SaleType[sale.type] === SaleType.SALE && sale.items.length > 1) {
      infoData.push({
        infoTitle: sale.name,
        infoValue: sale.usedQuantity,
      });
    }
  }

  infoData.push({ infoTitle: "Total", infoValue: total });

  return infoData;
}

function UsersTable({
  data,
  pagination,
  onRowSelect,
  allData,
  handleKitChange,
  handleCoffeeChange,
  updateKitStatus,
  allSales,
}: {
  data: PaginationResponse<SemcompApiUser>;
  pagination: PaginationRequest;
  onRowSelect: (selectedIndexes: number[]) => void;
  allData: PaginationResponse<SemcompApiUser>;
  handleKitChange: (id: string, hasKit: boolean) => void;
  handleCoffeeChange: (id: string, hasCoffee: boolean) => void;
  updateKitStatus: (id: string, status: boolean, index: number) => any,
  allSales?: (SemcompApiSale & { usedQuantity: number })[];
}) {
  const [infoData, setInfoData] = useState<InfoData[]>(getInfoData(allData.getEntities(), allSales));

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isSaleModalOpen, setSaleModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState(null);
  const [userSaleOption, setUserSaleOption] = useState([]);
  const [userStatusPayment, setUserStatusPayment] = useState([]);

  const handleOpenKitModal = () => {
    setModalOpen(true);
  }
  const handleCloseKitModal = () => {
    setModalOpen(false);
  }

  function handleOpenSaleModal (saleOption: string[], paymentStatus: string[]) {
    setUserSaleOption(saleOption);
    setUserStatusPayment(paymentStatus);
    setTimeout(() => {
      setSaleModalOpen(true);
    }, 500);
  }
  const handleCloseSaleModal = () => {
    setSaleModalOpen(false);
  }

  const handleGotKit = async (index: number) => {
    // caso o usuário clique em "Sim", roda essa função para mudar se o usuário retirou ou não o kit
    data.getEntities()[index].gotKit = !data.getEntities()[index].gotKit;
    const response = await updateKitStatus(data.getEntities()[index].id, data.getEntities()[index].gotKit, index);
    
    // fazer update do valor dos kits retirados.
    const updatedInfoData = infoData.map((item, idx) => {
      if (item.infoTitle === "Kits Retirados") {
        return {
          ...item, 
          infoValue: item.infoValue + (response?.gotKit ? 1 : -1)
        };
      }
      return item; 
    });
    setInfoData(updatedInfoData);
    
    // fechar o modal
    handleCloseKitModal();
  }


  return (<>
    <Modal
      isOpen={isModalOpen}
      hasCloseBtn={false}
      onClose={handleCloseKitModal}>
      <div className="flex flex-col gap-5">
        Confirmar mudança?
        <div className="flex justify-between">
          <button className="bg-green-600 text-white py-2 px-4 hover:bg-green-800"
            onClick={() => handleGotKit(selected)}>
            Sim
          </button>
          <button className="bg-red-600 text-white py-2 px-4 hover:bg-red-800" onClick={handleCloseKitModal}>
            Não
          </button>
        </div>
      </div>
    </Modal>

    {isSaleModalOpen &&
      <Modal
        isOpen={isSaleModalOpen}
        hasCloseBtn={true}
        onClose={handleCloseSaleModal}>
        <div className="flex flex-col gap-5 p-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Opções de Compra</h3>
            <ul className="list-disc list-inside">
              {userSaleOption.map((saleName, index) => {  
                return (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span>{saleName}</span>
                    <span className={`ml-2 px-2 py-1 rounded ${userStatusPayment[index] === "Aprovado" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {userStatusPayment[index]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Modal>
    }

    <InfoCards
      infoData={infoData}
    />
    <DataTable
      data={new PaginationResponse<UserData>(mapData(data.getEntities(), allSales, handleOpenKitModal, handleOpenSaleModal), data.getTotalNumberOfItems())}
      pagination={pagination}
      onRowClick={(index: number) => {
        setSelected(index);
      }}
      onRowSelect={onRowSelect}
    ></DataTable>
  </>);
}

function Users() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const [data, setData] = useState<PaginationResponse<SemcompApiUser> | null>(
    null
  );
  const [allData, setAllData] =
    useState<PaginationResponse<SemcompApiUser> | null>(null);
  const [pagination, setPagination] = useState(
    new PaginationRequest(() => fetchTableData())
  );
  const [paginationComplete, setPaginationComplete] = useState(
    new PaginationRequest(() => fetchAllData(), 1, 9999)
  );
  const [allSales, setAllSales] = useState<SemcompApiSale[]>([]);
  
  async function fetchAllData() {
    try {
      const response = await fetchAllDataParse(paginationComplete);
      setAllData(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function getSales() {
    const sales = await semcompApi.getSales(new PaginationRequest(null, 0, 9999));
    setAllSales(sales ? sales.getEntities() : []);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<SemcompApiUser[] | null>(null);
  const downloadBtnHeight = '48px';

  async function fetchData(pagination: PaginationRequest) {
    return await semcompApi.getUsers(pagination);
  }

  async function fetchAllDataParse(paginationComplete: PaginationRequest) {
    return await semcompApi.getUsers(paginationComplete);
  }

  async function fetchTableData() {
    try {
      const response = await fetchData(pagination);
      setData(response);
      setFilteredUsers(response.getEntities());
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchDownloadData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getUsers(
        new PaginationRequest(null, 1, 9999)
      );
      exportToCsv(mapData(response.getEntities(), allSales));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateKitStatus(id: string, status: boolean, index: number) {
    try {
      const response = await semcompApi.updateKitStatus(id, status);
      data.getEntities()[index].gotKit = response.gotKit;
      allData.getEntities().find(user => user.id === id)!.gotKit = response.gotKit;
      toast.success(`Status do kit de ${data.getEntities()[index].name} atualizado com sucesso`);
      return response;
    } catch (error) {
      toast.error('Erro ao atualizar status do kit, atualize a página e tente novamente');
      console.error(error);
    }
  }

  // Get all data about users
  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
    fetchTableData();
    getSales();
  }, []);

  useEffect(() => {
    if (allData != null) {
      const mappedData = allData.getEntities();
      if (searchTerm) {
        setFilteredUsers(
          mappedData.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredUsers((data?.getEntities() || []));
      }
      setIsLoading(false);
    }
  }, [searchTerm, allData, data]);

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  return (
    <>
      {!isLoading && (
        <>
          <div style={{ height: `calc(100vh - ${downloadBtnHeight})` }}>
            <DataPage
              title="Usuários"
              isLoading={isLoading}
              table={
                <>
                  <div className="mb-4 w-full">
                    <TextField
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      type="text"
                      placeholder="Pesquisar por nome (todos)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-4 p-2 border border-gray-300 rounded w-full"
                    />
                  </div>

                  <UsersTable
                    data={
                      new PaginationResponse<SemcompApiUser>(
                        filteredUsers || [],
                        data ? data.getTotalNumberOfItems() : 0
                      )
                    }
                    pagination={pagination}
                    onRowSelect={handleSelectedIndexesChange}
                    allData={allData!}
                    handleKitChange={() => { }}
                    handleCoffeeChange={() => {}}
                    updateKitStatus={updateKitStatus}
                    allSales={allSales}
                  />
                </>
              }
            />
            <button
              className="w-full bg-black text-white py-3 px-6"
              type="button"
              style={{ height: downloadBtnHeight }}
              onClick={fetchDownloadData}
            >
              Baixar Planilha
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default RequireAuth(Users, "USERS");
