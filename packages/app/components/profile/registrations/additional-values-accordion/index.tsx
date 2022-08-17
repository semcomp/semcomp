import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

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
