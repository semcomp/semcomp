import React, { useEffect, useState } from "react";
import Input, { InputType } from "../../Input";
import Modal from "../../Modal";
import Image from "next/image";
import FundacaoEstudarLogo from "../../../assets/sponsors/FundacaoEstudar.png";

function FundEstudarForm({ onRequestClose }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let status = localStorage.getItem("checkbox");
    if (!status || status === "false") {
      setOpen(true);
      localStorage.setItem("checkbox", "false");
    }
  }, []);

  if (!open) return null;

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="flex flex-col items-center p-4">
        <div className="relative h-16 w-24">
          <Image
            alt="Logo Fundacao Estudar"
            src={FundacaoEstudarLogo}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h1 className="text-center pb-2">Pesquisa Fundação Estudar</h1>
        <p className="text-sm xxs:text-base">
          Quer se destacar em processos seletivos dos nossos patrocinadores e
          apoiadores? Realize o teste exclusivo da Semcomp em parceria com a
          Fundação Estudar. Esse processo contém testes de personalidade, estilo
          de trabalho, valores, interesses e de programação. Ao realizá-lo, você
          se compromete a compartilhar seus resultados com as empresas. <br />
          <br /> A Fundação Estudar é uma organização sem fins lucrativos que
          acredita que o Brasil será um país melhor se tivermos mais pessoas
          jovens determinadas a seguir uma trajetória de impacto. Por isso,
          disseminam uma cultura de excelência e alavancam os estudos e a
          carreira de universitários, universitárias e recém-formados e
          recém-formadas.
        </p>
        <a
          target="_blank"
          className="underline text-blue"
          href="https://perfil.napratica.org.br/e/pt-BR/processos/semana-de-computacao-do-icmc-usp-2dd6366b-14e8-4732-8ea6-7180f64e47ed/inscricao/nova"
        >
          Acesse aqui!
        </a>
        <div className="flex items-center">
          <Input
            type={InputType.Checkbox}
            // checked={checked}
            onChange={() => {
              if (checked === true) {
                setChecked(false);
                localStorage.setItem("checkbox", "false");
              }
              if (checked === false) {
                console.log(checked);
                setChecked(true);
                localStorage.setItem("checkbox", "true");
              }
            }}
          />
          <p>Nao quero mais ver isso</p>
        </div>
        <button
          className="bg-orange text-white p-4 m-2 rounded-xl"
          type="button"
          onClick={onRequestClose}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default FundEstudarForm;
