import React from "react";

// import { Container } from './styles';

function ContestRegistration({ updateFormValue, registerTeam }) {
  const teamNameRef = React.useRef();
  const scholarshipRef = React.useRef();
  const courseRef = React.useRef();
  const entranceRef = React.useRef();

  const technicalExpRef = React.useRef();
  const resolutionExpRef = React.useRef();
  const contestExpRef = React.useRef();
  const categoryRef = React.useRef();

  const [category, setCategory] = React.useState(0);
  const [categoryDisabled, setCategoryDisabled] = React.useState(true);

  function handleFormUpdate() {
    // Get the input's values from their refs.
    const teamName = teamNameRef.current?.value;
    const scholarship = scholarshipRef.current.value;
    const course = courseRef.current.value;
    const entrance = entranceRef.current.value;

    const technicalExp = technicalExpRef.current.value;
    const resolutionExp = resolutionExpRef.current.value;
    const contestExp = contestExpRef.current.value;
    const category = categoryRef.current.value;

    // Define user's categories from their experience
    setCategory(
      Math.floor(
        (parseInt(technicalExp) +
          parseInt(resolutionExp) +
          parseInt(contestExp)) /
          3
      )
    );

    // Only enable category combobox after user answering all levelling questions
    setCategoryDisabled(!technicalExp || !resolutionExp || !contestExp);

    updateFormValue({
      teamName,
      scholarship,
      course,
      entrance,
      technicalExp,
      resolutionExp,
      contestExp,
      category,
    });
  }

  return (
    <div className="contest-registration-container">
      {registerTeam && (
        <label>
          <p>
            Qual o nome da sua equipe?
            <br />
            <span className="information">
              Todos os três integrantes precisam colocar o mesmo nome da equipe!
            </span>
          </p>
          <input type="text" ref={teamNameRef} onChange={handleFormUpdate} />
        </label>
      )}
      <label>
        <p>Qual a sua escolaridade?</p>
        <select ref={scholarshipRef} onChange={handleFormUpdate}>
          <option value=""></option>
          <option value="Ensino fundamental incompleto">
            Ensino fundamental incompleto
          </option>
          <option value="Ensino fundamental completo">
            Ensino fundamental completo
          </option>
          <option value="Ensino médio incompleto">
            Ensino médio incompleto
          </option>
          <option value="Ensino médio completo">Ensino médio completo</option>
          <option value="Ensino superior incompleto">
            Ensino superior incompleto
          </option>
          <option value="Ensino superior completo">
            Ensino superior completo
          </option>
          <option value="Pós-graduação incompleta">
            Pós-graduação incompleta
          </option>
          <option value="Pós-graduação completa">Pós-graduação completa</option>
        </select>
      </label>
      <label>
        <p>Se você está na universidade ou já se formou, qual o seu curso?</p>
        <input type="text" ref={courseRef} onChange={handleFormUpdate} />
      </label>
      <label>
        <p>
          Se você está na universidade, qual o seu ano de ingresso no seu curso
          atual?
        </p>
        <input type="text" ref={entranceRef} onChange={handleFormUpdate} />
      </label>

      <label>
        <p>
          Quantos desses assuntos você conhece e sabe o que é?
          <br />
          <span className="information">
            Pilha, Fila, Lista Ligada, Árvore Binária de Busca, Hashmap,
            Programação Dinâmica, Algoritmo de Ordenação, BFS/DFS, Dijkstra,
            Manipulação de Strings, Recursão/Backtracking, Teoria dos Números
          </span>
        </p>
        <select ref={technicalExpRef} onChange={handleFormUpdate}>
          <option value=""></option>
          <option value="1">Até 2 assuntos</option>
          <option value="2">De 3 a 6 assuntos</option>
          <option value="3">Acima de 7 assuntos</option>
        </select>
      </label>
      <label>
        <p>
          Qual o seu nível de experiência com resolução de problemas de
          programação competitiva?
        </p>
        <select ref={resolutionExpRef} onChange={handleFormUpdate}>
          <option value=""></option>
          <option value="1">Não sei nada ou sei pouco</option>
          <option value="2">Tenho alguma experiência</option>
          <option value="3">Tenho bastante experiência</option>
        </select>
      </label>
      <label>
        <p>Já participou de algum outro desafio/maratona de programação?</p>
        <select ref={contestExpRef} onChange={handleFormUpdate}>
          <option value=""></option>
          <option value="1">Não, vai ser minha primeira vez!</option>
          <option value="2">Já, uma ou duas vezes</option>
          <option value="3">Já, pelo menos três vezes</option>
        </select>
      </label>
      <label>
        <p>
          Baseado nas suas respostas, você se qualifica para as seguintes
          categorias. Em qual delas você gostaria de se inscrever?
        </p>
        <select
          className={categoryDisabled ? "disabled" : ""}
          ref={categoryRef}
          onChange={handleFormUpdate}
          disabled={categoryDisabled}
        >
          <option value=""></option>
          <option value="Just 4 fun">
            Just 4 fun - Categoria casual, sem restrição de nível de
            conhecimento
          </option>
          {category <= 1 && <option value="Iniciante">Iniciante</option>}
          {category <= 2 && (
            <option value="Intermediário">Intermediário</option>
          )}
          {category <= 3 && <option value="Profissional">Profissional</option>}
        </select>
      </label>
    </div>
  );
}

export default ContestRegistration;
