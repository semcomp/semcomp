import { Step, StepLabel, Stepper } from "@mui/material";
import React from "react";

const fases = [
  {
    id: 0,
    title: "Introdução e regras",
  },
  {
    id: 1,
    title: "Fase 1: Nome da fase 1",
  },
  {
    id: 2,
    title: "Fase 2: Nome da fase 2",
  },
  {
    id: 3,
    title: "Fase 3: Nome da fase 3",
  },
  {
    id: 4,
    title: "Fase 4: Nome da fase 4",
  },
  {
    id: 5,
    title: "Fase 5: Nome da fase 5",
  },
  {
    id: 6,
    title: "Fase 6: Nome da fase 6",
  },
  {
    id: 7,
    title: "Fase 7: Nome da fase 7",
  },
  {
    id: 8,
    title: "Fase 8: Nome da fase 8",
  },
  {
    id: 9,
    title: "Fase 9: Nome da fase 9",
  },
  {
    id: 10,
    title: "Fase 1: Nome da fase 10",
  },
];

export default function VerticalStepper({ collapseButton }) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  return (
    <>
      {collapseButton ? (
        <Stepper
          style={{ marginRight: "2rem", padding: "0" }}
          orientation="vertical"
        >
          {fases.map((fase) => {
            return (
              <Step key={fase.id}>
                <StepLabel>{fase.title}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      ) : (
        <div></div>
      )}
    </>
  );
}
