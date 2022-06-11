import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import Modal from "../../../components/modal";
import LoadingButton from "../../../components/loading-button";
import API from "../../../api";

import {
  AppBar,
  Tabs,
  Tab,
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

import ReactLinkify from "react-linkify";

import "./style.css";

import AdditionalValuesAccordion from "./additional-values-accordion";
import ContestRegistration from "./additional-values-accordion/contest-registration";
import NickRegistration from "./additional-values-accordion/nick-registration";
import { ExpandMore } from "@mui/icons-material";

const zeroPad = (num, places) => String(num).padStart(places, "0");

function formatDate(startDate, endDate) {
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

  return `${zeroPad(start.getDate(), 2)}/${zeroPad(
    start.getMonth() + 1,
    2
  )} | ${startTime} às ${endTime}`;
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Options({ item, type, fetchEvents }) {
  const [value, setValue] = React.useState("0");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [formValue, setFormValue] = React.useState({});

  function validateAdditionalValues() {
    const {
      teamName,
      scholarship,
      category,
      technicalExp,
      resolutionExp,
      contestExp,
    } = formValue;

    if (
      item.events[value].type === "Contest" &&
      item.events[value].needInfoOnSubscription
    ) {
      if (item.events[value].isInGroup && !teamName)
        return toast.error("Forneça um nome para sua equipe!");
      if (!scholarship || scholarship === "")
        return toast.error("Informe sua escolaridade!");
      if (!technicalExp || !resolutionExp || !contestExp)
        return toast.error(
          "Responda às perguntas de nivelamento para selecionar uma categoria!"
        );
      if (!category)
        return toast.error("Informe a categoria que deseja participar!");
    }

    if (item.events[value].type === "Game Night") {
      const { nick } = formValue;
      if (!nick)
        return toast.error("Você deve fornecer os nicks dos jogadores!");
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const err = validateAdditionalValues();
    if (err) return err;

    let info;
    if (item.events[value].type === "Game Night") {
      info = {
        nick: formValue.nick,
      };
    }
    if (item.events[value].type === "Contest") {
      info = {
        teamName: formValue.teamName,
        scholarship: formValue.scholarship,
        course: formValue.course,
        entrance: formValue.entrance,
        technicalExp: formValue.technicalExp,
        resolutionExp: formValue.resolutionExp,
        contestExp: formValue.contestExp,
        category: formValue.category,
      };
    }

    setIsUpdating(true);
    try {
      await API.events.subscribe(item.events[value].id, info);
      fetchEvents();
      toast.success("Inscrição realizada com sucesso!");
    } catch (e) {
      console.error(e);
      return toast.error("Vagas esgotadas!");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(eventId) {
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

  const handleValue = (event) => {
    setValue(event.target.value);
  };

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  return (
    <form onSubmit={handleSubmit}>
      {item.events.map((occasion, j) => (
        <Accordion>
          <AccordionSummary
            className="item-title"
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>
              {/* talvez precise remover o occasion.name se tiver mais de 1 evento no mesmo horario */}
              {formatDate(item.startDate, item.endDate)} - {occasion.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography component={"span"}>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="topico"
                  name="topico"
                  value={value}
                  onChange={handleValue}
                >
                  {/* {item.events.map((occasion, j) => ( */}
                  <div key={j} className="item-radio">
                    {occasion.isSubscribed ? (
                      <div>
                        <FormControlLabel
                          value={`${j}`}
                          control={<Radio />}
                          label={occasion.name}
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
                            onDelete={() => handleDelete(occasion.id)}
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <FormControlLabel
                          value={`${j}`}
                          control={<Radio />}
                          label={occasion.name}
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
                    <p className="item-description">
                      {occasion.type === "Minicurso" && (
                        <>
                          <strong>Ministrante: </strong>
                          {occasion.speaker}
                          <br />
                          <br />
                        </>
                      )}
                      <ReactLinkify>{occasion.description}</ReactLinkify>
                    </p>
                    {occasion.type === "Contest" &&
                      occasion.needInfoOnSubscription && (
                        <AdditionalValuesAccordion
                          additionalValuesComponent={ContestRegistration}
                          updateFormValue={updateFormValue}
                          registerTeam={occasion.isInGroup}
                        />
                      )}
                    {occasion.type === "Game Night" && (
                      <AdditionalValuesAccordion
                        additionalValuesComponent={NickRegistration}
                        updateFormValue={updateFormValue}
                        registerTeam={occasion.isInGroup}
                      />
                    )}
                  </div>
                  {/* // ))} */}
                </RadioGroup>
              </FormControl>
            </Typography>
          </AccordionDetails>
          {!item.events.find((event) => event.isSubscribed) && (
            <AccordionActions>
              <LoadingButton
                className="item-register"
                type="submit"
                isLoading={isUpdating}
              >
                Inscrever-se
              </LoadingButton>
            </AccordionActions>
          )}
        </Accordion>
      ))}
    </form>
  );
}

function Registrations({ onRequestClose }) {
  const [tab, setTab] = React.useState(0);
  const [events, setEvents] = React.useState([]);

  async function fetchEvents() {
    try {
      const response = await API.events.getSubscribables();
      setEvents(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="title">Inscrições</div>
      <div className="w-full">
        <AppBar style={{ backgroundColor: "transparent" }} position="static">
          <Tabs variant="scrollable" value={tab} onChange={handleChange}>
            {events.map((event, i) => (
              <Tab
                key={i}
                className="event"
                label={event.type}
                {...a11yProps(i)}
              />
            ))}
          </Tabs>
        </AppBar>
        {events.map((event, i) => (
          <TabPanel key={i} className="tab-options" value={tab} index={i}>
            {event.items.map((item, j) => (
              <Options
                key={j}
                item={item}
                type={event.type}
                fetchEvents={fetchEvents}
              ></Options>
            ))}
          </TabPanel>
        ))}
      </div>
      <button className="cancel" type="button" onClick={onRequestClose}>
        Fechar
      </button>
    </Modal>
  );
}

export default Registrations;
