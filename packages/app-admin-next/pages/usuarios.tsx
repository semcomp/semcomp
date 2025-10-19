import jszip from 'jszip';
import QRCode from "qrcode";
import { toast } from "react-toastify";
import { ReactElement, useEffect, useMemo, useRef, useState, MutableRefObject } from "react";

import DataPage from "../components/DataPage";
import { Modal } from '../components/reusable/Modal';
import { DataTable as NewDataTable } from "../components/reusable/NewDataTable";
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
  SemcompApiSale,
  SaleType,
  SemcompApiUser as BaseSemcompApiUser,
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

// Estrutura de dados completa retornada pelo novo endpoint de Aggregation
type EnrichedSemcompApiUser = BaseSemcompApiUser & {
    house: {
        name: string,
    },
    payment: {
        status: PaymentStatus[],
        tShirtSize: TShirtSize,
        foodOption?: string,
        saleOption: string[][],
    },
    disabilities: any[]
};

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
  data: EnrichedSemcompApiUser[],
  allSales: (SemcompApiSale & {usedQuantity:number})[],
  handleOpenKitModal?: () => void,
  handleOpenSaleModal?: (saleOption: string[], paymentStatus: string[]) => void,
  updateUser?: (id: string, gotKit: boolean, gotTagName: boolean) => any,
  exportToCsv?: boolean,
): UserData[] {
  const newData: UserData[] = [];
  for (let index = 0; index < data.length; index++) {
    const user = data[index];

    const paymentStatus: string[] = [];
    const allSalesObj: { [key: string]: SemcompApiSale & { usedQuantity: number } } = {};
    allSales.forEach((sale) => {
      allSalesObj[sale.id] = sale;
    });
    let saleOption: string[] = [];
    let hasKit = false;
    let tShirtSize: TShirtSize | null = null;

    if (user.payment.tShirtSize && TShirtSize[user.payment.tShirtSize] !== TShirtSize.NONE) {
      tShirtSize = user.payment.tShirtSize;
    }
    
    for (let i = 0; i < user.payment.status.length; i++) {
      let name = '';
      const currentStatus = user.payment.status[i];
      const currentSaleOptionIds = user.payment.saleOption[i];
      
      if (currentStatus === PaymentStatus.APPROVED) {
        currentSaleOptionIds.forEach(saleId => {
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
        currentSaleOptionIds.forEach(saleId => {
          if (allSalesObj.hasOwnProperty(saleId)) {
            const sale = allSalesObj[saleId];
            if (sale) {
              name = name.concat(sale.name, ', ');
            }
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

function getInfoData(data: EnrichedSemcompApiUser[], allSales: (SemcompApiSale & { usedQuantity: number })[]): InfoData[] {
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
  onRowSelect,
  allData,
  updateUser,
  allSales,
  dataTableRef,
}: {
  onRowSelect: (selectedIndexes: number[]) => void;
  allData: PaginationResponse<EnrichedSemcompApiUser> | null;
  updateUser: (id: string, gotKit: boolean, gotTagName: boolean) => any,
  allSales?: (SemcompApiSale & { usedQuantity: number })[];
  dataTableRef: MutableRefObject<any>;
}) {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  
  const initialInfoData = allData ? getInfoData(allData.getEntities(), allSales) : [];
  const [infoData, setInfoData] = useState<InfoData[]>(initialInfoData);

  useEffect(() => {
    if (allData) {
      setInfoData(getInfoData(allData.getEntities(), allSales));
    }
  }, [allData, allSales]);

  const [isSaleModalOpen, setSaleModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<EnrichedSemcompApiUser | null>(null);
  const [userSaleOption, setUserSaleOption] = useState<string[]>([]);
  const [userStatusPayment, setUserStatusPayment] = useState<string[]>([]);

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

  const handleToggleGotKitStatus = async (userRow: EnrichedSemcompApiUser, updateRow: (fields: Partial<EnrichedSemcompApiUser>) => void) => {
    const newGotKit = !userRow.gotKit;
    const newGotTagName = userRow.gotTagName;

    const updatedUser = await updateUser(userRow.id, newGotKit, newGotTagName);
    
    if (updatedUser) {
      // Atualiza infoData localmente
      const updatedInfoData = infoData.map(item => {
        if (item.infoTitle === "Kits Retirados") {
          return {
            ...item, 
            infoValue: item.infoValue + (newGotKit ? 1 : -1)
          };
        }
        return item; 
      });
      setInfoData(updatedInfoData);
      
      // Atualiza a linha no datatable
      updateRow({ gotKit: newGotKit });
    }
  }

  const handleToggleTagNameStatus = async (userRow: EnrichedSemcompApiUser, updateRow: (fields: Partial<EnrichedSemcompApiUser>) => void) => {
    const newGotKit = userRow.gotKit;
    const newGotTagName = !userRow.gotTagName; 

    const updatedUser = await updateUser(userRow.id, newGotKit, newGotTagName);

    // Atualiza a linha no datatable
    if (updatedUser) {
      updateRow({ gotTagName: newGotTagName });
    }
  };

  const getUserSales = (user: EnrichedSemcompApiUser) => {
    const paymentStatus: string[] = [];
    const saleOption: string[] = [];
    const allSalesObj: { [key: string]: SemcompApiSale & { usedQuantity: number } } = {};
    allSales.forEach((sale) => {
      allSalesObj[sale.id] = sale;
    });

    for (let i = 0; i < user.payment.status.length; i++) {
      let name = '';
      const isApproved = user.payment.status[i] === PaymentStatus.APPROVED;

      user.payment.saleOption[i].forEach(saleId => {
        const sale = allSalesObj[saleId];
        if (sale) {
          name = name.concat(sale.name, ', ');
        }
      });

      if (name !== '') {
        name = name.slice(0, -2);
        saleOption.push(name);
        paymentStatus.push(isApproved ? "Aprovado" : "Pendente");
      }
    }
    return { saleOption, paymentStatus };
  }

  const columns = useMemo(() => [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'house.name', label: 'Casa', value: (row: EnrichedSemcompApiUser) => row.house.name },
    { 
      key: 'payment.tShirtSize', 
      label: 'Tamanho Camiseta', 
      value: (row: EnrichedSemcompApiUser) =>
        row.payment.tShirtSize != null && row.payment.tShirtSize !== TShirtSize.NONE
          ? row.payment.tShirtSize
          : '-'
    },
    { 
      key: 'sales_details',
      label: 'Detalhes',
      render: (row: EnrichedSemcompApiUser) => {
        const { saleOption, paymentStatus } = getUserSales(row);
        
        if (saleOption.length > 0) {
          return (
            <RemoveRedEyeIcon 
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSaleModal(saleOption, paymentStatus);
              }}
            />
          );
        }
        return '-';
      }
    },
    { 
      key: 'gotKit',
      label: 'Retirou kit',
      render: (row: EnrichedSemcompApiUser, updateRow) => (
        <Input
          onChange={() => {
              handleToggleGotKitStatus(row, updateRow);
          }}
          value={row.gotKit}
          type={InputType.Checkbox}
        />
      )
    },
    { 
      key: 'gotTagName',
      label: 'Retirou crachá',
     
      render: (row: EnrichedSemcompApiUser, updateRow) => (
        <Input
          onChange={() => {
              handleToggleTagNameStatus(row, updateRow);
          }}
          value={row.gotTagName}
          type={InputType.Checkbox}
        />
      )
    },
    { 
      key: 'wantNameTag',
      label: 'Quer crachá?',
      render: (row: EnrichedSemcompApiUser) => (
        <Input
          value={row.wantNameTag}
          type={InputType.Checkbox}
          disabled={true}
        />
      )
    },
    { key: 'createdAt', label: 'Criado em', value: (row: EnrichedSemcompApiUser) => new Date(row.createdAt).toLocaleDateString('pt-BR'), }
  ], [getUserSales, handleToggleGotKitStatus, handleToggleTagNameStatus, handleOpenSaleModal]);

  return (<>
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
            
    <NewDataTable
      ref={dataTableRef}
      fetchData={async ({ page, limit, search, sort }) => {
        return await semcompApi.getFilteredUsers(new PaginationRequest(() => {}, page, limit), sort, search) as PaginationResponse<EnrichedSemcompApiUser>
      }}
      columns={columns as any}
      
      onRowClick={(user: EnrichedSemcompApiUser) => { 
        setSelected(user);
      }}
      onRowSelect={onRowSelect}
    />
  </>);
}

function Users() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  
  const [statsData, setStatsData] = 
    useState<PaginationResponse<EnrichedSemcompApiUser> | null>(null);
  
  async function fetchStatsData() {
    try {
      const response = await fetchFullDataParse(paginationComplete);
      setStatsData(response);
    } catch (error) {
      console.error(error);
    }
  }

  const [paginationComplete, setPaginationComplete] = useState(
    new PaginationRequest(() => fetchStatsData(), 1, 9999)
  );
  const [allSales, setAllSales] = useState<SemcompApiSale[]>([]);
  
  async function getSales() {
    const sales = await semcompApi.getSales(new PaginationRequest(null, 0, 9999));
    setAllSales(sales ? sales.getEntities() : []);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const downloadBtnHeight = '48px';
  
  async function fetchFullDataParse(paginationComplete: PaginationRequest): Promise<PaginationResponse<EnrichedSemcompApiUser>> {
    return await semcompApi.getFilteredUsers(paginationComplete, null, null) as PaginationResponse<EnrichedSemcompApiUser>;
  }

  async function fetchDownloadData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getFilteredUsers(
        new PaginationRequest(null, 1, 9999), null, null
      ) as PaginationResponse<EnrichedSemcompApiUser>;
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
      const response = await semcompApi.getFilteredUsers(
        new PaginationRequest(() => {}, 1, 9999), null, null
      ) as PaginationResponse<EnrichedSemcompApiUser>;
      
      const users = response.getEntities().filter(user => user.wantNameTag);
      const zip = new jszip();
      
      try {
        for (const user of users) {
            const qrCodeText = user.id;
            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeText);

            const imgData = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
            zip.file(`${user.name}-${user.house.name}.png`, imgData, { base64: true });
        }

        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
          const url = window.URL.createObjectURL(content);

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
  
  async function updateUser(id: string, gotKit: boolean, gotTagName: boolean): Promise<any> {
    try {
      const response = await semcompApi.updateKitStatus(id, {gotKit: gotKit, gotTagName: gotTagName});

      toast.success(`Status de ${response.name} atualizado com sucesso`);
      return response;
    } catch (error) {
      toast.error('Erro ao atualizar status do kit, atualize a página e tente novamente');
      console.error(error);
      return null;
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchStatsData();
    getSales();
    
    setIsLoading(false); 
    
  }, []);
  

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  const dataTableRef = useRef<any>(null);

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
                  <UsersTable
                    onRowSelect={handleSelectedIndexesChange}
                    allData={statsData!}
                    updateUser={updateUser}
                    allSales={allSales}
                    dataTableRef={dataTableRef}
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
