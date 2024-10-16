import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireRootAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { PaymentStatus, SemcompApiPaymentUser, SemcompApiSale } from '../models/SemcompApiModels';
import CreateTShirtModal from '../components/t-shirt/CreateTShirtModal';
import { TShirtFormData, TShirtSize } from '../components/t-shirt/TShirtForm';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import util from '../libs/util';

type PaymentData = {
  "Compra": string,
  "Preço": number,
  "Status": string,
  "Usuário": string,
  "Email": string,
  "Data criação": string,
  "Data edição": string,
}

function PaymentUserTable({
  data,
  sales,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiPaymentUser>,
  sales: PaginationResponse<SemcompApiSale>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const newData: PaymentData[] = [];
  const allSales = sales.getEntities();

  for (const payment of data.getEntities()) {
    const saleOption = [];
    for (const sale of payment.salesOption) {
      allSales.find((s) => {
        if(s.id == sale){
          saleOption.push(s.name);
        }
      });
    }
  
    let paymentStatus = '';
    if (payment.status === PaymentStatus.APPROVED) {
      paymentStatus = 'Aprovado';
    } else if (payment.status === PaymentStatus.PENDING) {
      paymentStatus = 'Pendente';
    } else {
      paymentStatus = 'Cancelado';
      }

    newData.push({
      "Compra": saleOption.join(", "),
      "Preço": payment.price,
      "Status": paymentStatus,
      "Usuário": payment.userName,
      "Email": payment.userEmail,
      "Data criação": util.formatDate(payment.createdAt),
      "Data edição": payment.updatedAt ? util.formatDate(payment.updatedAt) : '-',
    })
  }

  return (<DataTable
    data={new PaginationResponse<PaymentData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Payments() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [sales, setSales] = useState(null);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getPaymentComplete(pagination);
      const allSales = await semcompApi.getSales(new PaginationRequest(() => fetchData(), 1, 9999));
      setData(response);
      setSales(allSales);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRowClick(index: number) {
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
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
    {
      !isLoading && (
        <DataPage
          title="Pagametos"
          isLoading={isLoading}
          table={
            <PaymentUserTable
              data={data}
              sales={sales}
              pagination={pagination}
              onRowClick={handleRowClick}
              onRowSelect={handleSelectedIndexesChange}
            />
          }
        ></DataPage>
      )
    }
  </>);
}

export default RequireRootAuth(Payments, "PAYMENTS");
