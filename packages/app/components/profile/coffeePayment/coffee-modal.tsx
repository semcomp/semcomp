import { useState, useEffect } from "react";
import cloneDeep from 'lodash/cloneDeep';
import { toast } from "react-toastify";

import Modal from "../../Modal";
import Stepper from "../../stepper/Stepper";
import CoffeeStep1 from "./coffee-step-1";
import CoffeeStep2, { TShirtSize, FoodOption } from "./coffee-step-2";
import CoffeeStep3 from "./coffee-step-3";
import handler from "../../../api/handlers";
import { useAppContext } from "../../../libs/contextLib";
import Spinner from "../../spinner";

export type CoffeePaymentData = {
  withSocialBenefit: boolean;
  socialBenefitFile: File;
  tShirtSize: TShirtSize | string;
  foodOption: FoodOption;
  saleOption: string[];
  price: number;
  sale: {id: string, name: string, price: number, hasTShirt: boolean, items: string[]}[];
  qrCodeBase64: string;
  qrCode: string;
};


function CoffeePayment({ onRequestClose, allSales, dataOpenStep3, userPayments }) {
  const [coffeeStep, setCoffeeStep] = useState(0);
  const [data, setData] = useState({
    withSocialBenefit: false,
    socialBenefitFile: null,
    price: 0,
    tShirtSize: "",
    foodOption: FoodOption.NONE,
  } as CoffeePaymentData);
  const [availableSales, setAvailableSales] = useState(null);
  const [filteredSales, setFilteredSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppContext();
  
  function SemcompButton({ onClick, children, className, ...props }: any) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          `rounded bg-${user.house.name} text-white shadow-md px-6 py-3 ` + className
        }
        {...props}
      >
        {children}
      </button>
    );
  }
  
  function nextCoffeeStep(){
    if (coffeeStep + 1 === 1) {
      if (!data.saleOption || data.saleOption.length === 0) {
        toast.error("Selecione uma opção!");
        return;
      } else {
        const saleItems = data.sale.map((option) => option.items).flat();
        const newSales = new Set(saleItems);
        if (saleItems.length !== newSales.size) {
          toast.error("Você possui opções duplicadas, por favor, selecione novamente.");
          return;
        }
      }
    } else if (coffeeStep + 1 === 2) {
      if (data.withSocialBenefit && !data.socialBenefitFile) {
        toast.error("Informe um arquivo!");
        return;
      } else if (data.withSocialBenefit) {
        if (data.withSocialBenefit && !data.socialBenefitFile.name.endsWith(".pdf")) {
          toast.error("O arquivo precisa ser um pdf");
          return;
        }
      } else if (data.sale.find(sale => sale.hasTShirt === true) && data.tShirtSize === "") {
        toast.error("Informe um tamanho!");
        return;
      }
    }
    
    setCoffeeStep(coffeeStep + 1);
  }

  async function fetchAvailableSales() {
    const sales = await handler.sales.getAvailableSales().then((res) => res.data);
    setAvailableSales(cloneDeep(sales));
  }

  function removeDuplicatedItems(allSales: {id: string, items: string[]}[], paymentInfo: [], findFilteredSales: {name: string, id: string, items: string[]}[]) {
    const items = paymentInfo.map((payment: { saleOption: string[]; }) => {
      if (payment.saleOption.length > 0) {
        return payment.saleOption.map((option: string) => {
          const sale = allSales.find((sale) => sale.id === option);

          if (sale) {
            return sale.items;
          }

          return null;
        }).filter((array) => array !== null);
      }
    }).flat();
    
    const paymentSaleItems = items.flat();

    // Remove vendas que já foram compradas
    if (paymentInfo.length > 0) {
      paymentInfo.forEach((payment: { saleOption: string[]; }) => {
        const indexFiltered = findFilteredSales.findIndex((sale) => payment.saleOption.includes(sale.id));
        if (indexFiltered !== -1) {
          findFilteredSales.splice(indexFiltered, 1);
        }
      }
    )}

    // Remove vendas que possuem items que já foram comprados
    const itemsToRemove = new Set(paymentSaleItems);
    const filteredSales = findFilteredSales.filter(sale => {
      return !sale.items.some(item => itemsToRemove.has(item));
    });

    findFilteredSales.length = 0;
    findFilteredSales.push(...filteredSales);
  }

  async function getInfo() {
    if (dataOpenStep3) {
      setData({...dataOpenStep3, id: 1});
      setCoffeeStep(2);
      setLoading(false);
      return;
    }

    try {
      const paymentInfo = cloneDeep(userPayments);
      const findFilteredSales = cloneDeep(availableSales);

      // Filtra os dados de vendas e redireciona para a etapa de pagamento se não houver mais vendas disponíveis
      if(paymentInfo) {
        removeDuplicatedItems(allSales, paymentInfo, findFilteredSales);
        
        // Verifica se ainda há compras
        const pendingPayment = paymentInfo.filter((payment: { status: string; }) => payment.status === "pending");
        if (findFilteredSales && findFilteredSales.length === 0 && pendingPayment.length > 0) {
          const sales = [];

          pendingPayment[0].salesOption.forEach((option: string) => {
            const sale = availableSales.find((sale) => sale.id === option);
            if (sale) {
              sales.push(sale);
            }
          });

          // Envia os dados do primeiro pagamento pendente para a etapa 3 (pagamento) 
          setData({...data, ...(pendingPayment[0]), sale: sales, id: 1});
          setCoffeeStep(2);
        }
      }

      setFilteredSales(findFilteredSales);
      setLoading(false);
      return paymentInfo;
    } catch (error) {
      toast.error("Erro ao buscar informações de pagamento. Tente novamente mais tarde.");
      console.error(error);
    }
  } 

  useEffect(() => {
    fetchAvailableSales();
    console.log(user)
  }, []);

  useEffect(() => {
    if (availableSales) {
      getInfo();
    }
  }, [availableSales]);

  const stepComponent = [
    <CoffeeStep1 key={0} data={data} setData={setData} availableSales={filteredSales}/>,
    <CoffeeStep2 key={1} data={data} setData={setData} />,
    <CoffeeStep3 key={2} data={data}/>,
  ];

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className={`w-full bg-${user.house.name} text-white text-center text-xl p-6`}>
        Compra Kit e Coffee da Semcomp!
      </div>
      { !loading ? 
        (
          <div className="max-h-lg w-full overflow-y-scroll p-6">
            { availableSales && availableSales.length > 0 &&
              <Stepper numberOfSteps={3} activeStep={coffeeStep} onStepClick={null} activeColor={user.house.name} unactiveColor={"white"} />
            }
            {stepComponent[coffeeStep]}
            <div className="flex justify-between w-full">
              <SemcompButton className="bg-[#F24444]" onClick={onRequestClose}>
                Fechar
              </SemcompButton>
              {coffeeStep < 2 && (filteredSales && filteredSales.length > 0) ? (
                <SemcompButton onClick={nextCoffeeStep}>
                  Próximo
                </SemcompButton>
              ) : <></>}
            </div>
          </div>
        ) : (
          <div className="my-5">
            <Spinner />
          </div>
        )
      }
    </Modal>
  );
}

export default CoffeePayment;
