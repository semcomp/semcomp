import React from "react";

import "./style.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@material-ui/core";
import ExpandMore from "@material-ui/icons/ExpandMore";

function AdditionalValuesAccordion({
  additionalValuesComponent: AdditionalValues,
  ...args
}) {
  return (
    <Accordion className="contest-registration-accordion">
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>
          Este evento requer informações adicionais para inscrição
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className="content">
          <AdditionalValues {...args} />
        </div>
      </AccordionDetails>
    </Accordion>
  );
}

export default AdditionalValuesAccordion;
