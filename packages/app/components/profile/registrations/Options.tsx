import { useState } from "react";
import PropTypes from "prop-types";

import {
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import ReactLinkify from "react-linkify";
import { toast } from "react-toastify";

import LoadingButton from "../../loading-button";
import API from "../../../api";
import EventTypes from "../../../libs/constants/event-types-enum";
import AdditionalValuesAccordion from "./additional-values-accordion/AdditionalInfoAccordion";
import ContestRegistration, {
  ContestRegistrationInfo,
} from "./additional-values-accordion/ContestRegistration";
import NickRegistration, {
  NicksRegistrationInfo,
} from "./additional-values-accordion/NicksRegistration";
import TeamRegistration, {
  TeamRegistrationInfo,
} from "./additional-values-accordion/TeamRegistration";
import { useAppContext } from "../../../libs/contextLib";

const zeroPad = (num, places) => String(num).padStart(places, "0");

function formatDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const week = [
    "Domingo",
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
  ];

  const DayOfTheWeek = `${start.getDay()}`;

  return `${week[DayOfTheWeek]}, ${zeroPad(start.getDate(), 2)}/${zeroPad(
    start.getMonth() + 1,
    2
  )}`;
}

function formatTime(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startTime = `${zeroPad(start.getHours(), 2)}:${zeroPad(
    start.getMinutes(),
    2
  )}`;
  const endTime = `${zeroPad(end.getHours(), 2)}:${zeroPad(
    end.getMinutes(),
    2
  )}`;

  return `${startTime} às ${endTime}`;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function Options({ item, fetchEvents }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAppContext();

  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const handleSelectEvent = (event) => {
    setSelectedEventIndex(+event.target.value);
  };

  const [formValue, setFormValue] = useState(null);

  function validateAdditionalValues() {
    const selectedEvent = item.events[selectedEventIndex];
    if (!selectedEvent.needInfoOnSubscription) {
      return null;
    }

    if (selectedEvent.type === EventTypes.CONTEST) {
      const {
        teamName,
        scholarship,
        technicalExperience,
        resolutionExperience,
        contestExperience,
        categoryExperience,
      } = formValue as ContestRegistrationInfo;

      if (selectedEvent.isInGroup && !teamName) {
        return toast.error("Forneça um nome para sua equipe!");
      }
      if (!scholarship || scholarship === "") {
        return toast.error("Informe sua escolaridade!");
      }
      if (!technicalExperience || !resolutionExperience || !contestExperience) {
        return toast.error(
          "Responda às perguntas de nivelamento para selecionar uma categoria!"
        );
      }
      if (!categoryExperience) {
        return toast.error("Informe a categoria que deseja participar!");
      }
    }

    if (selectedEvent.type === EventTypes.GAME_NIGHT) {
      const { nicks } = formValue as NicksRegistrationInfo;
      if (!nicks) {
        return toast.error("Você deve fornecer os nicks dos jogadores!");
      }
    }

    if (selectedEvent.type === EventTypes.HACKATHON) {
      const { names } = formValue as TeamRegistrationInfo;
      if (!names) {
        return toast.error("Você deve fornecer os nomes dos participantes!");
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const err = validateAdditionalValues();
    if (err) return err;

    const selectedEvent = item.events[selectedEventIndex];

    let info;
    if (
      selectedEvent.type === EventTypes.CONTEST ||
      selectedEvent.type === EventTypes.GAME_NIGHT ||
      selectedEvent.type === EventTypes.HACKATHON
    ) {
      info = formValue;
    }

    setIsUpdating(true);
    try {
      await API.events.subscribe(item.events[selectedEventIndex].id, info);
      fetchEvents();
      toast.success("Inscrição realizada com sucesso!");
    } catch (e) {
      console.error(e.data.message[0]);
      return toast.error(e.data.message[0]);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUnsubscribe(eventId) {
    setIsUpdating(true);
    try {
      await API.events.unsubscribe(eventId);
      fetchEvents();
      toast.success("Inscrição removida com sucesso!");
    } catch (e) {
      console.error(e);
      return toast.error(
        e.data.message || "Não foi possível remover a inscrição!"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  function getAdditionalInfoComponent(eventType: EventTypes) {
    if (eventType === EventTypes.CONTEST) {
      return ContestRegistration;
    }
    if (eventType === EventTypes.GAME_NIGHT) {
      return NickRegistration;
    }
    if (eventType === EventTypes.HACKATHON) {
      return TeamRegistration;
    }

    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{formatDate(item.startDate, item.endDate)}</Typography>
          {item.events.length > 1 ? (
            <Chip
              label={`${item.events.length} minicursos`}
              variant="outlined"
              className="ml-2 cursor-pointer"
            />
          ) : (
            <></>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <div className="h-full w-full grid grid-cols-1 gap-2">
            {item.events.map((occasion, index) => (
              <div className="w-full p-4">
                <RadioGroup
                  aria-label="topico"
                  name="topico"
                  value={selectedEventIndex}
                  onChange={handleSelectEvent}
                >
                  <div className="item-radio">
                    {occasion.isSubscribed ? (
                      <div>
                        <FormControlLabel
                          value={`${index}`}
                          control={<Radio />}
                          label={occasion.name}
                          className="mx-2"
                        />
                        {occasion.type === "Game Night" && (
                          <Chip
                            label={
                              occasion.isInGroup ? "Em grupo" : "Individual"
                            }
                            variant="outlined"
                          />
                        )}
                        {occasion.type === "Contest" ? (
                          <Chip
                            label="Inscrito"
                            color="secondary"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Inscrito"
                            onDelete={() => handleUnsubscribe(occasion.id)}
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <FormControlLabel
                          value={`${index}`}
                          control={<Radio />}
                          label={occasion.name}
                          className="mx-2"
                        />
                        {occasion.type === "Game Night" && (
                          <Chip
                            label={
                              occasion.isInGroup ? "Em grupo" : "Individual"
                            }
                            variant="outlined"
                          />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="mt-4">
                          {
                            occasion.speaker &&
                            <div> 
                              <strong>Ministrante: </strong>
                              {occasion.speaker}
                            </div>
                          }
                          { occasion.startDate && occasion.endDate &&
                            <div>
                              <strong>Horário: </strong>
                              {formatTime(occasion.startDate, occasion.endDate)}  
                            </div>
                          }
                          { occasion.description &&
                            <div className="mt-4">
                            <ReactLinkify>
                              {occasion.description}
                            </ReactLinkify>
                          </div>
                          }
                      </div>
                    </div>
                    {occasion.needInfoOnSubscription && (
                      <AdditionalValuesAccordion
                        additionalInfoComponent={getAdditionalInfoComponent(
                          occasion.type
                        )}
                        updateFormValue={updateFormValue}
                        isInGroup={occasion.isInGroup}
                      />
                    )}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </AccordionDetails>
        {item.events.find((event) => !event.isSubscribed) && (
          <AccordionActions>
            <LoadingButton
              className={`bg-${user.house.name} hover:bg-[#a9a9a9] text-white w-full py-3 shadow rounded-lg`}
              type="submit"
              isLoading={isUpdating}
            >
              Inscrever-se
            </LoadingButton>
          </AccordionActions>
        )}
      </Accordion>
    </form>
  );
}

export default Options;
