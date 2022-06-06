import React from "react";

import "./styles.css";

function CoffeeStep1() {
  return (
    <div className="step1-container">
      <p>O Coffee da Semcomp 25 beta ocorrerá nos dias:</p>
      <ul className="coffee-time">
        <li>Sábado 11/06 às 17h</li>
        <li>Domingo 12/06 às 11h30</li>
      </ul>
      <p>Local: Jardim Secreto do ICMC</p>
      <b>Valor: R$15,00</b>
      <p>OBS: Não esquecer de trazer sua caneca!</p>
      <p>Clique em 'Próximo' para realizar o pagamento via PIX</p>
    </div>
  );
}

export default CoffeeStep1;
