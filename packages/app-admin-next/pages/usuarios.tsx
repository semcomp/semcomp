import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { PaymentStatus, SemcompApiUser } from '../models/SemcompApiModels';
import DataPage from '../components/DataPage';
import { TShirtSize } from '../components/t-shirt/TShirtForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import exportToCsv from '../libs/DownloadCsv';
import InfoCards from '../components/reusable/InfoCards';

enum KitOption {
  COMPLETE = "Kit e Coffee", 
  KIT = "Kit",
  COFFEE = "Coffee",
}

type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Status do pagamento": string,
  "Tamanho da camiseta": TShirtSize,
  "Opção de compra": KitOption,
  "Permite divulgação?": string,
  "Criado em": string,
}

type InfoData = {
  "infoTitle": string,
  "infoValue": number,
}

function mapData(data: SemcompApiUser[]): UserData[] {
  const newData: UserData[] = [];
  for (const user of data) {
    let paymentStatus = "";
    if (user.payment.status) {
      paymentStatus = user.payment.status === PaymentStatus.APPROVED ? "Aprovado" : "Pendente";
    }

    newData.push({
      "ID": user.id,
      "E-mail": user.email,
      "Nome": user.name,
      "Curso": user.course,
      "Telegram": user.telegram,
      "Casa": user.house.name,
      "Status do pagamento": paymentStatus,
      "Tamanho da camiseta": user.payment.tShirtSize,
      "Opção de compra": user.payment.kitOption,
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": new Date(user.createdAt).toLocaleString("pt-br", 
      {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
    })
  }

  return newData;
}

function countKitOption(kitOption: KitOption, data: SemcompApiUser[]) : number {
  let count: number;

  count = 0;
  for (const user of data) {
    if(kitOption == KitOption.COMPLETE || kitOption == KitOption.KIT){
      if (user.payment.status === PaymentStatus.APPROVED || user.payment.status === PaymentStatus.PENDING) {
        if(user.payment.kitOption === kitOption){
          count++;
        }
      }
    }else{
      if (user.payment.status === PaymentStatus.APPROVED) {
        if(user.payment.kitOption === kitOption){
          count++;
        }
      }
    }
  }

  return count;
}


function getInfoData(data: SemcompApiUser[]) : InfoData[] {
  const infoData: InfoData[] = [];

  // Total of subs 
  infoData.push({ 
    "infoTitle": "Inscritos",
    "infoValue": data.length,
  })
  
  let coffees = countKitOption(KitOption.COFFEE, data);
  infoData.push({ 
    "infoTitle": "Coffee",
    "infoValue": coffees,
  })
  
  let kits = countKitOption(KitOption.KIT, data);
  infoData.push({ 
    "infoTitle": "Kit",
    "infoValue": kits,
  })
  
  let complete = countKitOption(KitOption.COMPLETE, data);
  infoData.push({ 
    "infoTitle": "Kits + Coffee",
    "infoValue": complete,
  })

  infoData.push({ 
    "infoTitle": "Coffees Vendidos",
    "infoValue": complete + coffees,
  })

  infoData.push({ 
    "infoTitle": "Total",
    "infoValue": complete + coffees + kits,
  })
  
  return infoData;
}

function UsersTable({
  data,
  pagination,
  onRowSelect,
  allData,
}: {
  data: PaginationResponse<SemcompApiUser>,
  pagination: PaginationRequest,
  onRowSelect: (selectedIndexes: number[]) => void,
  allData: PaginationResponse<SemcompApiUser>,
}) {
  const infoData: InfoData[] = getInfoData(allData.getEntities());
  

  return (<>
    <InfoCards
      infoData={infoData}
    />
    <DataTable
      data={new PaginationResponse<UserData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
      pagination={pagination}
      onRowClick={(index: number) => console.log(index)}
      onRowSelect={onRowSelect}
    ></DataTable>
  </>);
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as PaginationResponse<SemcompApiUser>);
  const [allData, setAllData] = useState(null as PaginationResponse<SemcompApiUser>);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchTableData()));
  const [paginationComplete, setPaginationComplete] = useState(new PaginationRequest(() => fetchAllData(), 1, 9999));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [aux, setAux] = useState();

  async function fetchData(pagination: PaginationRequest) {
    return await semcompApi.getUsers(pagination);
  }

  async function fetchAllDataParse(paginationComplete: PaginationRequest) {
    return await semcompApi.getUsers(paginationComplete);
  }

  async function fetchTableData() {
    try {
      if(data == null){
        const response = await fetchData(pagination);
        setData(response);
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchDownloadData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getUsers(new PaginationRequest(null, 1, 9999));
      exportToCsv(mapData(response.getEntities()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAllData() {
    try {
      if(allData == null){
        const response = await fetchAllDataParse(paginationComplete);
        setAllData(response);
      }
    } catch (error) {
      console.error(error);
    }

  }
  
  // Get all data about users
  useEffect(() => {
    setIsLoading(true);
    fetchTableData();
    fetchAllData();
  }, []);

  useEffect(() => {
    // If all the data is finnaly fetched, then the isLoading is false
    if(data != null && allData != null){
      setIsLoading(false);
    }

  }, [allData, data])

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  return (<>
    {
      !isLoading && (<>
        <DataPage
          title="Usuários"
          isLoading={isLoading}
          table={
      
            <UsersTable
            data={data}
            pagination={pagination}
            onRowSelect={handleSelectedIndexesChange}
            allData={allData}
            />
          }
        ></DataPage>
        <button
          className="w-full bg-black text-white py-3 px-6"
          type='button'
          onClick={fetchDownloadData}
        >
          Baixar Planilha
        </button>
      </>)
    }
  </>);
}

export default RequireAuth(Users);
