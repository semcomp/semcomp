import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import SaleForm, { SaleFormData } from "./SaleForm";
import { SaleType } from "../../models/SemcompApiModels";
import ProductsItems from "../../libs/constants/products-items-enum";

function CreateSaleModal({
  data,
  setData,
  saleItems,
  onRequestClose,
}: {
  data?: SaleFormData;
  setData: (data: SaleFormData) => void;
  saleItems: SaleFormData[];
  onRequestClose: any;
}) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!data.name) return toast.error('Você deve fornecer um nome');
    if (!data.type) return toast.error('Você deve fornecer um tipo');
    if (data.type === SaleType.SALE && data.items.length === 0) return toast.error('Você deve fornecer itens');
    if (data.quantity < 0) return toast.error('Você deve fornecer uma quantidade válida');
    
    const purchaseItems = data.items.map(item => {
      const obj = saleItems.find(sale => sale.name === item);
      return obj;
    });

    let quantity = data.quantity;
    let hasKit = data.hasKit;
    let hasTShirt = data.hasTShirt;
    if (data.type === SaleType.ITEM) {
      data.items = [];
    } else if (data.type === SaleType.SALE) {
      purchaseItems.forEach(item => {
        if (item.hasKit) {
          hasKit = true;
        }

        if (item.hasTShirt) {
          hasTShirt = true;
        }

        if (item.quantity < quantity) {
          quantity = item.quantity;
        }
      });
    }

    const type = Object.entries(SaleType).find(([_, val]) => val === data.type)[0];
    const items = data.items.map(item => {
      const key = saleItems.find(sale => sale.name === item)?.id;
      return key;
    });

    let newData: SaleFormData = {
      id: "",
      name: "",
      type: "",
      quantity: 0,
      hasTShirt: false,
      hasKit: false,
      items: [],
      price: 0
    };

    if (data.type === SaleType.ITEM) {
      newData = { ...data, items: items, type: type, quantity: quantity };
    } else {
      newData = { ...data, items: items, type: type, quantity: quantity, hasKit: hasKit, hasTShirt: hasTShirt };
    }
    
    try {
      setIsLoading(true);
      const response = await semcompApi.editSale(newData.id, newData);
      toast.success('Venda editado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro no servidor!');
    } finally {
      setIsLoading(false);
      onRequestClose();
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        Editar produto de venda
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <SaleForm
          data={data}
          setData={setData}
          saleItems={saleItems}
        ></SaleForm>
      </div>
      <div className="w-full px-6">
        <LoadingButton
          isLoading={isLoading}
          className="w-full text-white py-3 px-6"
          onClick={handleSubmit}
        >
          Enviar
        </LoadingButton>
        <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default CreateSaleModal;