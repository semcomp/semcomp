import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import Modal from "../../Modal";
import Stepper from "../../stepper/Stepper";
import CoffeeStep1, { KitOption } from "./coffee-step-1";
import CoffeeStep2, { TShirtSize, FoodOption } from "./coffee-step-2";
import CoffeeStep3 from "./coffee-step-3";
import handler from "../../../api/handlers";
import { useAppContext } from "../../../libs/contextLib";

export type CoffeePaymentData = {
  withSocialBenefit: boolean;
  socialBenefitFile: File;
  tShirtSize: TShirtSize;
  foodOption: FoodOption;
  kitOption: KitOption;
};

function SemcompButton({ onClick, children, className, ...props }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded bg-primary text-white shadow-md px-6 py-3 " + className
      }
      {...props}
    >
      {children}
    </button>
  );
}



function CoffeePayment({ onRequestClose, userHasPaid }) {
  const [coffeeStep, setCoffeeStep] = useState(0);
  const [data, setData] = useState({
    withSocialBenefit: false,
    socialBenefitFile: null,
    tShirtSize: TShirtSize.M,
    kitOption: KitOption.NONE,
    foodOption: FoodOption.NONE,
  } as CoffeePaymentData);
  
  const { user } = useAppContext();

  function nextCoffeeStep(){
    if(coffeeStep + 1 === 1){
      if(data.kitOption === KitOption.NONE){
        toast.error("Selecione uma opção!");
        return;
      }
    } else if(coffeeStep + 1 === 2){
      if(data.withSocialBenefit && !data.socialBenefitFile){
        toast.error("Informe um arquivo!");
        return;
      }else if(data.withSocialBenefit){
        if(data.withSocialBenefit && !data.socialBenefitFile.name.endsWith(".pdf")){
          toast.error("O arquivo precisa ser um pdf");
          return;
        }
      }
    }
    
    setCoffeeStep(coffeeStep + 1);

  }

  async function getInfo() {
    const paymentInfo = await handler.coffee.getPaymentInfo(user.id).then((res) => res.data);
    
    if(paymentInfo) {
      if (paymentInfo.status === "pending") {
        setCoffeeStep(2);
      }
    }
    return paymentInfo;
  } 
  useEffect(() => {
    const a = getInfo();
  }, []);

  const stepComponent = [
    <CoffeeStep1 key={0} data={data} setData={setData}/>,
    <CoffeeStep2 key={1} data={data} setData={setData} />,
    <CoffeeStep3 key={2} data={data} />,
  ][coffeeStep];

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="w-full bg-primary text-white text-center text-xl p-6">
        Pagamento por PIX do Coffee da Semcomp!
      </div>
      <div className="max-h-lg w-full p-6">
        <Stepper numberOfSteps={3} activeStep={coffeeStep} onStepClick={null} />
        {stepComponent}
        <div className="flex justify-between w-full">
          <SemcompButton className="bg-[#F24444]" onClick={onRequestClose}>
            Fechar
          </SemcompButton>
          {coffeeStep >= 2 || userHasPaid ? <></> : (
            <SemcompButton onClick={nextCoffeeStep}>
              Próximo
            </SemcompButton>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CoffeePayment;
