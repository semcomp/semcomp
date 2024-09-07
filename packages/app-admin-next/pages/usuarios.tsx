import { useEffect, useState } from "react";
import DataTable from "../components/reusable/DataTable";
import RequireAuth from "../libs/RequireAuth";
import SemcompApi from "../api/semcomp-api";
import { useAppContext } from "../libs/contextLib";
import {
  PaymentStatus,
  SemcompApiUser,
  KitOption as BaseKitOption,
} from "../models/SemcompApiModels";
import DataPage from "../components/DataPage";
import { TShirtSize } from "../components/t-shirt/TShirtForm";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import exportToCsv from "../libs/DownloadCsv";
import InfoCards from "../components/reusable/InfoCards";

//modifiquei aqui pra n mudar o arquivo original
enum KitOption {
  COMPLETE = BaseKitOption.COMPLETE,
  KIT = BaseKitOption.KIT,
  COFFEE = BaseKitOption.COFFEE,
  NONE = "None",
}

type UserData = {
  ID: string;
  "E-mail": string;
  Nome: string;
  Curso: string;
  Telegram: string;
  Casa: string;
  "Status do pagamento": string;
  "Tamanho da camiseta": TShirtSize;
  "Opção de compra": KitOption;
  "Permite divulgação?": string;
  "Criado em": string;
};

type InfoData = {
  infoTitle: string;
  infoValue: number;
};

function mapData(data: SemcompApiUser[]): UserData[] {
  const newData: UserData[] = [];
  for (const user of data) {
    let paymentStatus = "";
    let kitOption = KitOption.NONE;

    if (user.payment && user.payment.status) {
      paymentStatus =
        user.payment.status === PaymentStatus.APPROVED
          ? "Aprovado"
          : "Pendente";
      kitOption = user.payment.kitOption as KitOption;
    }

    newData.push({
      ID: user.id,
      "E-mail": user.email,
      Nome: user.name,
      Curso: user.course,
      Telegram: user.telegram,
      Casa: user.house.name,
      "Status do pagamento": paymentStatus,
      "Tamanho da camiseta": user.payment
        ? user.payment.tShirtSize
        : TShirtSize.M,
      "Opção de compra": kitOption,
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": new Date(user.createdAt).toLocaleString("pt-br", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    });
  }
  return newData;
}

function countKitOption(kitOption: KitOption, data: SemcompApiUser[]): number {
  let count: number = 0;
  for (const user of data) {
    if (user.payment && user.payment.status) {
      if (kitOption === KitOption.COMPLETE || kitOption === KitOption.KIT) {
        if (
          user.payment.status === PaymentStatus.APPROVED ||
          user.payment.status === PaymentStatus.PENDING
        ) {
          if (user.payment.kitOption === kitOption) {
            count++;
          }
        }
      } else if (kitOption === KitOption.COFFEE) {
        if (user.payment.status === PaymentStatus.APPROVED) {
          if (user.payment.kitOption === kitOption) {
            count++;
          }
        }
      }
    }
  }
  return count;
}

function getInfoData(data: SemcompApiUser[]): InfoData[] {
  const infoData: InfoData[] = [];
  infoData.push({ infoTitle: "Inscritos", infoValue: data.length });

  let coffees = countKitOption(KitOption.COFFEE, data);
  infoData.push({ infoTitle: "Coffee", infoValue: coffees });

  let kits = countKitOption(KitOption.KIT, data);
  infoData.push({ infoTitle: "Kit", infoValue: kits });

  let complete = countKitOption(KitOption.COMPLETE, data);
  infoData.push({ infoTitle: "Kits + Coffee", infoValue: complete });

  infoData.push({
    infoTitle: "Coffees Vendidos",
    infoValue: complete + coffees,
  });

  infoData.push({ infoTitle: "Total", infoValue: complete + coffees + kits });

  return infoData;
}

function UsersTable({
  data,
  pagination,
  onRowSelect,
  allData,
  handleKitChange,
  handleCoffeeChange,
}: {
  data: PaginationResponse<UserData>;
  pagination: PaginationRequest;
  onRowSelect: (selectedIndexes: number[]) => void;
  allData: PaginationResponse<SemcompApiUser>;
  handleKitChange: (id: string, hasKit: boolean) => void;
  handleCoffeeChange: (id: string, hasCoffee: boolean) => void;
}) {
  const infoData: InfoData[] = getInfoData(allData.getEntities());

  return (
    <>
      <InfoCards infoData={infoData} />
      <DataTable
        data={data}
        pagination={pagination}
        onRowClick={(index: number) => console.log(index)}
        onRowSelect={onRowSelect}
        renderCell={(column, row) => {
          if (column === "Possui Kit?") {
            return (
              <input
                type="checkbox"
                checked={
                  row["Opção de compra"] === KitOption.KIT ||
                  row["Opção de compra"] === KitOption.COMPLETE
                }
                onChange={(e) => handleKitChange(row.ID, e.target.checked)}
              />
            );
          } else if (column === "Possui Coffee?") {
            return (
              <input
                type="checkbox"
                checked={
                  row["Opção de compra"] === KitOption.COFFEE ||
                  row["Opção de compra"] === KitOption.COMPLETE
                }
                onChange={(e) => handleCoffeeChange(row.ID, e.target.checked)}
              />
            );
          }
          return row[column];
        }}
      />
    </>
  );
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

  async function fetchAllData() {
    try {
      const response = await fetchAllDataParse(paginationComplete);
      setAllData(response);
    } catch (error) {
      console.error(error);
    }
  }

  const [paginationComplete, setPaginationComplete] = useState(
    new PaginationRequest(() => fetchAllData(), 1, 9999)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[] | null>(null);

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
      setFilteredUsers(mapData(response.getEntities()));
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
      exportToCsv(mapData(response.getEntities()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
    fetchTableData();
  }, []);

  useEffect(() => {
    if (allData != null) {
      const mappedData = mapData(allData.getEntities());
      if (searchTerm) {
        setFilteredUsers(
          mappedData.filter((user) =>
            user.Nome.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredUsers(mapData(data?.getEntities() || []));
      }
      setIsLoading(false);
    }
  }, [searchTerm, allData, data]);

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  const handleKitChange = (id: string, hasKit: boolean) => {
    updateUserPayment(id, hasKit, KitOption.KIT);
  };

  const handleCoffeeChange = (id: string, hasCoffee: boolean) => {
    updateUserPayment(id, hasCoffee, KitOption.COFFEE);
  };

  const updateUserPayment = (
    id: string,
    hasItem: boolean,
    optionType: KitOption
  ) => {
    setData((prevData) => {
      if (!prevData) return prevData;

      const updatedUsers: SemcompApiUser[] = prevData
        .getEntities()
        .map((user) => {
          if (user.id === id) {
            const newKitOption = hasItem
              ? user.payment.kitOption === KitOption.KIT &&
                optionType === KitOption.COFFEE
                ? KitOption.COMPLETE
                : optionType
              : user.payment.kitOption === KitOption.COMPLETE
              ? optionType === KitOption.KIT
                ? KitOption.COFFEE
                : KitOption.NONE
              : KitOption.NONE;
            return {
              ...user,
              payment: {
                ...user.payment,
                kitOption: newKitOption as BaseKitOption,
              },
            };
          }
          return user;
        });

      return new PaginationResponse<SemcompApiUser>(
        updatedUsers,
        prevData.getTotalNumberOfItems()
      );
    });
  };

  return (
    <>
      {!isLoading && (
        <>
          <DataPage
            title="Usuários"
            isLoading={isLoading}
            table={
              <>
                <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <UsersTable
                  data={
                    new PaginationResponse<UserData>(
                      filteredUsers || [],
                      data ? data.getTotalNumberOfItems() : 0
                    )
                  }
                  pagination={pagination}
                  onRowSelect={handleSelectedIndexesChange}
                  allData={allData!}
                  handleKitChange={handleKitChange}
                  handleCoffeeChange={handleCoffeeChange}
                />
              </>
            }
          />
          <button
            className="w-full bg-black text-white py-3 px-6"
            type="button"
            onClick={fetchDownloadData}
          >
            Baixar Planilha
          </button>
        </>
      )}
    </>
  );
}

export default RequireAuth(Users, "USERS");
