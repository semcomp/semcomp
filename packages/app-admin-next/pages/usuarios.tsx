import jszip from 'jszip';
import QRCode from "qrcode";
import { toast } from "react-toastify";
import { ReactElement, useEffect, useState } from "react";

import DataPage from "../components/DataPage";
import { Modal } from '../components/reusable/Modal';
import DataTable from "../components/reusable/DataTable";
import InfoCards from "../components/reusable/InfoCards";
import { TShirtSize } from "../components/t-shirt/TShirtForm";
import Input, { InputType } from '../components/Input';
import util from "../libs/util";
import RequireAuth from "../libs/RequireAuth";
import exportToCsv from "../libs/DownloadCsv";
import { useAppContext } from "../libs/contextLib";
import SemcompApi from "../api/semcomp-api";
import {
  PaymentStatus,
  SemcompApiUser,
  SemcompApiSale,
  SaleType,
} from "../models/SemcompApiModels";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Search } from "@mui/icons-material";
import {
  Accordion, AccordionDetails,
  AccordionSummary, InputAdornment,
  TextField 
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


type UserData = {
  "E-mail": string;
  Nome: string;
  Curso: string;
  Telegram: string;
  Casa: string;
  "Retirou kit": ReactElement | string;
  "Retirou crachá": ReactElement | string;
  "Quer crachá": ReactElement | string;
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
  updateUser?: (id: string, gotKit: boolean, gotTagName: boolean) => any,
  exportToCsv?: boolean,
): UserData[] {
  const newData: UserData[] = [];
  for (let index = 0; index < data.length; index++) {
    const user = data[index];

    const paymentStatus = [];
    const allSalesObj = {};
    allSales.forEach((sale) => {
      allSalesObj[sale.id] = sale;
    });
    let saleOption = [];
    let hasKit = false;
    let tShirtSize = null;

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

        if (name !== '') {
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
            // console.log('Venda', saleId, ' não encontrada para usuário', user.name);
          }
        });

        if (name !== '') {
          name = name.slice(0, -2);
          saleOption.push(name);
          paymentStatus.push("Pendente");
        }
      }
    }

    const gotKitInput = hasKit ?
      <Input
        onChange={handleOpenKitModal ? handleOpenKitModal : () => { }}
        value={user.gotKit}
        type={InputType.Checkbox}
      /> : <></>;

    const gotTagNameInput = <Input
        onChange={updateUser ? () => updateUser(user.id, user.gotKit, !user.gotTagName) : () => { }}
        value={user.gotTagName}
        type={InputType.Checkbox}
      />;

    const openSales = handleOpenSaleModal ? 
    <RemoveRedEyeIcon onClick={() => handleOpenSaleModal(saleOption, paymentStatus)}/> : null;
  
    let newDataSales = undefined;
    let newDataGotKit = undefined;
    let newDataGotTagName = undefined;
    let newDataWantTagName = undefined;

    if (exportToCsv) {
      newDataSales = saleOption.length > 0 ? saleOption.join(" - ") : "Nenhuma";
      newDataGotKit = user.gotKit ? "Sim" : "Não";
      newDataGotTagName = user.gotTagName ? "Sim" : "Não";
      newDataWantTagName = user.wantNameTag ? "Sim" : "Não";
    } else {
      newDataSales = openSales && saleOption.length > 0 ? openSales : saleOption.join(", ");
      newDataGotKit = handleOpenKitModal ? gotKitInput : (user.gotKit ? "Sim" : "Não");
      newDataGotTagName = gotTagNameInput;
      newDataWantTagName = <Input type={InputType.Checkbox} disabled={true} value={user.wantNameTag}></Input>;
    }

    newData.push({
      "E-mail": user.email,
      Nome: user.name,
      Curso: user.course,
      Telegram: user.telegram,
      Casa: user.house.name,
      "Tamanho da camiseta": tShirtSize,
      "Compras": newDataSales,
      "Retirou kit": newDataGotKit,
      "Retirou crachá": newDataGotTagName,
      "Quer crachá": newDataWantTagName,
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": util.formatDate(user.createdAt),
    });
  }
  return newData;
}

function getInfoData(data: SemcompApiUser[], allSales: (SemcompApiSale & { usedQuantity: number })[]): InfoData[] {
  const infoData: InfoData[] = [];
  infoData.push({ infoTitle: "Inscritos", infoValue: data.length });

  const numKitStatus = data.reduce((count, item) => count + (item.gotKit ? 1 : 0), 0);
  const numWantNameTag = data.reduce((count, item) => count + (item.wantNameTag ? 1 : 0), 0);

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

  infoData.push({
    "infoTitle": "Crachás solicitados",
    "infoValue": numWantNameTag,
  })

  return infoData;
}

function UsersTable({
  data,
  pagination,
  onRowSelect,
  allData,
  updateUser,
  allSales,
}: {
  data: PaginationResponse<SemcompApiUser>;
  pagination: PaginationRequest;
  onRowSelect: (selectedIndexes: number[]) => void;
  allData: PaginationResponse<SemcompApiUser>;
  updateUser: (id: string, gotKit: boolean, gotTagName: boolean) => any,
  allSales?: (SemcompApiSale & { usedQuantity: number })[];
}) {
  const [infoData, setInfoData] = useState<InfoData[]>(getInfoData(allData.getEntities(), allSales));

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isSaleModalOpen, setSaleModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState(null);
  const [userSaleOption, setUserSaleOption] = useState([]);
  const [userStatusPayment, setUserStatusPayment] = useState([]);
  const [gotTagName, setGotTagName] = useState(false);
  
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

  const handleGotItems = async (index: number, gotTagName: boolean) => {
    const gotKit = !allData.getEntities()[index].gotKit;
    const userGotTagName = allData.getEntities()[index].gotTagName;

    allData.getEntities()[index].gotKit = gotKit;
    allData.getEntities()[index].gotTagName = gotTagName;

    const response = await updateUser(allData.getEntities()[index].id, gotKit, gotTagName);
    
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
    setGotTagName(response.gotTagName);
    setSelected(-1);

    // fechar o modal
    handleCloseKitModal();
  }

  useEffect(() => {
    setGotTagName(allData.getEntities()[selected]?.gotTagName);
  }, [selected]);

  return (<>
    <Modal
      isOpen={isModalOpen}
      hasCloseBtn={false}
      onClose={handleCloseKitModal}
    >
      <div className="flex flex-col gap-5 p-5 border border-gray-300">
        {!allData.getEntities()[selected]?.gotTagName &&
          <Input className='pr-4'
            value={gotTagName}
            label='Retirou crachá?'
            type={InputType.Checkbox}
            onChange={() => setGotTagName(!gotTagName)}
          />
        }

        <div className="text-lg font-semibold mb-2"> Confirmar mudança? </div>
        <div className="flex justify-between">
          <button className="bg-green-600 text-black py-2 px-4 rounded hover:bg-green-700"
            onClick={() => handleGotItems(selected, gotTagName)}>
            Sim
          </button>
          <button className="bg-red-600 text-black py-2 px-4 rounded hover:bg-red-700" onClick={handleCloseKitModal}>
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

    <Accordion className="mb-5" style={{ width: '100%' }}>
      <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id={`accordion-header`}
      >
        Informações detalhadas
      </AccordionSummary>

      <AccordionDetails>
        <InfoCards infoData={infoData} />
      </AccordionDetails>
    </Accordion>
            

    
    <DataTable
      data={new PaginationResponse<UserData>(mapData(data.getEntities(), allSales, handleOpenKitModal, handleOpenSaleModal, updateUser), data.getTotalNumberOfItems())}
      allData={allData}
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
      exportToCsv(mapData(response.getEntities(), allSales, undefined, undefined, undefined, true));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDownloadUserQrCode() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getUsers(new PaginationRequest(() => {}, 1, 9999));
      const users = response.getEntities().filter(user => user.wantNameTag);
      const zip = new jszip();
      let content = null;

      try {
        for (const user of users) {
            const qrCodeText = user.id;
            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeText);

            const imgData = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
            zip.file(`${user.name}-${user.house.name}.png`, imgData, { base64: true });
        }

        // Gera o zip e envia como resposta para download
        zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
          const url = window.URL.createObjectURL(new Blob([content]));

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'qrcodes.zip');

          document.body.appendChild(link);
          setTimeout(() => {
            link.click();
          }, 1000);

          link.parentNode.removeChild(link);
        });
      } catch (error) {
          console.error('Erro ao gerar QR Codes ou ZIP:', error);
          return null;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function updateUser(id: string, gotKit: boolean, gotTagName: boolean) {
    try {
      const index = data.getEntities().findIndex(user => user.id === id);

      const response = await semcompApi.updateKitStatus(id, {gotKit: gotKit, gotTagName: gotTagName});
      fetchAllData();
      fetchTableData();

      toast.success(`Status de ${response.name} atualizado com sucesso`);
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

  function findUsers(searchTerm: string) {
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
  }

  useEffect(() => {
    if (allData != null) {
      findUsers(searchTerm);
      setIsLoading(false);
    }
  }, [allData, data]);

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
                      placeholder="Digite o nome e pressione Enter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          findUsers(searchTerm);
                        }
                      }}
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
                    updateUser={updateUser}
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
            <button
              className="w-full bg-black text-white py-3 px-6"
              type="button"
              style={{ height: downloadBtnHeight }}
              onClick={fetchDownloadUserQrCode}
            >
              Baixar QR Codes
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default RequireAuth(Users, "USERS");
