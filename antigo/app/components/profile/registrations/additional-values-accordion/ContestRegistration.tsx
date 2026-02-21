import { useState } from "react";

import Input, { InputType } from "../../../Input";

const SCHOLARSHIP = [
  "Ensino fundamental incompleto",
  "Ensino fundamental completo",
  "Ensino médio incompleto",
  "Ensino médio completo",
  "Ensino superior incompleto",
  "Ensino superior completo",
  "Pós-graduação incompleta",
];

const TECHNICAL_EXPERIENCE = [
  "Até 2 assuntos",
  "De 3 a 6 assuntos",
  "Acima de 7 assuntos",
];

const RESOLUTION_EXPERIENCE = [
  "Não sei nada ou sei pouco",
  "Tenho alguma experiência",
  "Tenho bastante experiência",
];

const CONTEST_EXPERIENCE = [
  "Não, vai ser minha primeira vez",
  "Já, uma ou duas vezes",
  "Já, pelo menos três vezes",
];

const CATEGORY_EXPERIENCE = [
  "Just 4 fun",
  "Iniciante",
  "Intermediário",
  "Profissional",
];

export type ContestRegistrationInfo = {
  teamName: string;
  scholarship: string;
  course: string;
  entrance: string;
  technicalExperience: string;
  resolutionExperience: string;
  contestExperience: string;
  categoryExperience: string;
}

function ContestRegistration({ updateFormValue, isInGroup }) {
  const [teamName, setTeamName] = useState("");
  function handleTeamNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTeamName(value);
    updateFormValue({ teamName: value });
  };

  const [scholarship, setScholarship] = useState("");
  function handleScholarshipChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setScholarship(value);
    updateFormValue({ scholarship: value });
  };

  const [course, setCourse] = useState("");
  function handleCourseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCourse(value);
    updateFormValue({ course: value });
  };

  const [entrance, setEntrance] = useState("");
  function handleEntranceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEntrance(value);
    updateFormValue({ entrance: value });
  };

  const [technicalExperience, setTechnicalExperience] = useState("");
  function handleTechnicalExperienceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTechnicalExperience(value);
    updateFormValue({ technicalExperience: value });
  };

  const [resolutionExperience, setResolutionExperience] = useState("");
  function handleResolutionExperienceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setResolutionExperience(value);
    updateFormValue({ resolutionExperience: value });
  };

  const [contestExperience, setContestExperience] = useState("");
  function handleContestExperienceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setContestExperience(value);
    updateFormValue({ contestExperience: value });
  };

  const [categoryExperience, setCategoryExperience] = useState("");
  function handleCategoryExperienceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCategoryExperience(value);
    updateFormValue({ categoryExperience: value });
  };

  return (<>
    {isInGroup && (
      <Input
        className="my-3"
        label="Qual o nome da sua equipe? (Todos os três integrantes precisam colocar o mesmo nome da equipe!)"
        value={teamName}
        onChange={handleTeamNameChange}
        type={InputType.Text}
      />
    )}
    <Input
      className="my-3"
      label="Qual a sua escolaridade?"
      value={scholarship}
      onChange={handleScholarshipChange}
      choices={SCHOLARSHIP}
      type={InputType.Select}
    />
    <Input
      className="my-3"
      label="Se você está na universidade ou já se formou, qual o seu curso?"
      value={course}
      onChange={handleCourseChange}
      type={InputType.Text}
    />
    <Input
      className="my-3"
      label="Se você está na universidade, qual o seu ano de ingresso no seu curso atual?"
      value={entrance}
      onChange={handleEntranceChange}
      type={InputType.Text}
    />
    <Input
      className="my-3"
      label="Quantos desses assuntos você conhece e sabe o que é? (Pilha, Fila, Lista Ligada, Árvore Binária de Busca, Hashmap, Programação Dinâmica, Algoritmo de Ordenação, BFS/DFS, Dijkstra, Manipulação de Strings, Recursão/Backtracking, Teoria dos Números)"
      value={technicalExperience}
      onChange={handleTechnicalExperienceChange}
      choices={TECHNICAL_EXPERIENCE}
      type={InputType.Select}
    />
    <Input
      className="my-3"
      label="Qual o seu nível de experiência com resolução de problemas de programação competitiva?"
      value={resolutionExperience}
      onChange={handleResolutionExperienceChange}
      choices={RESOLUTION_EXPERIENCE}
      type={InputType.Select}
    />
    <Input
      className="my-3"
      label="Já participou de algum outro desafio/maratona de programação?"
      value={contestExperience}
      onChange={handleContestExperienceChange}
      choices={CONTEST_EXPERIENCE}
      type={InputType.Select}
    />
    <Input
      className="my-3"
      label="Baseado nas suas respostas, você se qualifica para as seguintes categorias. Em qual delas você gostaria de se inscrever?"
      value={categoryExperience}
      onChange={handleCategoryExperienceChange}
      choices={CATEGORY_EXPERIENCE}
      type={InputType.Select}
    />
  </>);
}

export default ContestRegistration;
