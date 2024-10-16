import { ReactNode, useEffect, useState } from 'react';

import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import { SemcompApiSale, SaleType } from '../models/SemcompApiModels';

import { useAppContext } from '../libs/contextLib';
import RequireRootAuth from '../libs/RequireAuth';

import SemcompApi from '../api/semcomp-api';

import { SaleFormData } from '../components/sales/SaleForm';
import CreateSaleModal from '../components/sales/CreateSaleModal';
import EditSaleModal from '../components/sales/EditSaleModal';
import DataTable from '../components/reusable/DataTable';
import DataPage from '../components/DataPage';
import util from '../libs/util';
import Input, { InputType } from '../components/Input';

type SalesData = {
  "Tipo": string,
  "Nome": string,
  "Items": string,
  "Quantidade": number,
  "Quantidade comprada": number,
  "Tem camisa": ReactNode,
  "Tem kit": ReactNode,
  "Tem coffee": ReactNode,
  "Criado em": string,
  "Editado em": string,
  "Preço": number,
}

function SalesTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiSale>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const newData: SalesData[] = [];

  const allSales = data.getEntities();
  for (const product of allSales) {
    const items = product.items.map((item) => allSales.find(sale => sale.id === item)?.name).join(", ");

    newData.push({
      "Tipo": SaleType[product.type],
      "Nome": product.name,
      "Items": items,
      "Quantidade": product.quantity,
      "Quantidade comprada": product.usedQuantity,
      "Preço": product.price,
      "Tem camisa": <Input onChange={() => {}} disabled={true} value={product.hasTShirt} type={InputType.Checkbox}></Input>,
      "Tem kit": <Input onChange={() => {}} disabled={true} value={product.hasKit} type={InputType.Checkbox}></Input>,
      "Tem coffee": <Input onChange={() => {}} disabled={true} value={product.hasCoffee} type={InputType.Checkbox}></Input>,
      "Criado em": util.formatDate(product.createdAt),
      "Editado em": util.formatDate(product.updatedAt),
    })
  }

  return (<DataTable
    data={new PaginationResponse<SalesData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Sales() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [productItems, setProductItems] = useState([]);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData(), 1, 100));
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: SaleType.ITEM,
    quantity: 0,
    hasKit: false,
    hasTShirt: false,
    hasCoffee: false,
    items: [],
    price: 0,
  } as SaleFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getSales(pagination);
      setProductItems(response.getEntities().filter((p: SemcompApiSale) => SaleType[p.type] === SaleType.ITEM));
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRowClick(index: number) {
    const sales = data.getEntities();
    const items = sales[index].items.map((item: SaleFormData) => productItems.find(sale => sale.id === item)?.name);

    setFormData({
      id: sales[index].id,
      name: sales[index].name,
      type: SaleType[sales[index].type],
      items: items,
      hasTShirt: sales[index].hasTShirt,
      hasKit: sales[index].hasKit,
      hasCoffee: sales[index].hasCoffee,
      quantity: sales[index].quantity,
      price: sales[index].price,
  });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  function handleCloseModal() {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({
      id: undefined,
      name: "",
      type: SaleType.ITEM,
      items: [],
      hasTShirt: false,
      hasKit: false,
      hasCoffee: false,
      quantity: 0,
      price: 0,
    });
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
      <CreateSaleModal
        data={formData}
        setData={setFormData}
        saleItems={productItems}
        onRequestClose={handleCloseModal}
      />
    )}
    {isEditModalOpen && (
      <EditSaleModal
        data={formData}
        setData={setFormData}
        saleItems={productItems}
        onRequestClose={handleCloseModal}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Vendas"
          isLoading={isLoading}
          buttons={
                    <button
                      className="bg-black text-white py-3 px-6"
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                        Criar
                    </button>
                  }
          table={<SalesTable
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

export default RequireRootAuth(Sales, "SALES");
