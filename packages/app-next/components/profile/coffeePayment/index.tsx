import { useState } from "react";

import Modal from "../../../components/modal";
import Stepper from "../../../components/stepper";
import CoffeeStep1 from "./step1";
import CoffeeStep2 from "./step2";

function CoffeePayment({ onRequestClose, userHasPaid }) {
  const [coffeeStep, setCoffeeStep] = useState(0);

  const stepComponent = [<CoffeeStep1 key={0} />, <CoffeeStep2 key={1} />][coffeeStep];

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="coffeepayment-card">
        <h1>Pagamento por PIX do Coffee da Semcomp Beta!</h1>
        <div className="stepper-container">
          <Stepper numberOfSteps={2} activeStep={coffeeStep} onStepClick={false} />
        </div>
        {stepComponent}
        <div className="buttons-container">
          <button
            style={{ backgroundColor: "#f44336" }}
            onClick={onRequestClose}
          >
            Fechar
          </button>
          {coffeeStep === 0 ? (
            <></>
          ) : (
            <button type="button" onClick={() => setCoffeeStep(coffeeStep - 1)}>
              Voltar
            </button>
          )}
          {coffeeStep >= 1 || userHasPaid ? (
            <></>
          ) : (
            <button type="button" onClick={() => setCoffeeStep(coffeeStep + 1)}>
              Próximo
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CoffeePayment;
