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

type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Status do pagamento": string,
  "Tamanho da camiseta": TShirtSize,
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
      console.log(user.payment.status);
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

function getCoffees(data: SemcompApiUser[]) : number {
  let numberOfCoffees: number;

  numberOfCoffees = 0;
  for (const user of data) {
    if (user.payment.status) {
      numberOfCoffees++;
    }
  }

  console.log(numberOfCoffees);

  return numberOfCoffees;
}


function getInfoData(data: SemcompApiUser[]) : InfoData[] {
  const infoData: InfoData[] = [];

  console.log(data);

  // Total of subs 
  infoData.push({ 
    "infoTitle": "Inscritos",
    "infoValue": data.length,
  })

  // Coffees
  let coffees = getCoffees(data);
  infoData.push({ 
    "infoTitle": "Coffees",
    "infoValue": coffees,
  })

  infoData.push({ 
    "infoTitle": "Kits",
    "infoValue": coffees,
  })

  infoData.push({ 
    "infoTitle": "Kits + Coffee",
    "infoValue": coffees,
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
  console.log(allData);
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
