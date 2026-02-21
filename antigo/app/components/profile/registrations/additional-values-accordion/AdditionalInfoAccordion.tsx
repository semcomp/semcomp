import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

function AdditionalInfoAccordion({
  additionalInfoComponent: AdditionalInfoComponent,
  ...args
}) {
  return (
    <Accordion>
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
        <AdditionalInfoComponent {...args} />
      </AccordionDetails>
    </Accordion>
  );
}

export default AdditionalInfoAccordion;
