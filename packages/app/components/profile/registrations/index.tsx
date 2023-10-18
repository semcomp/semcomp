import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { AppBar, Tabs, Tab, Typography } from "@mui/material";

import Modal from "../../Modal";
import API from "../../../api";
import Options from "./Options";

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
        <Typography component={"span"}>{children}</Typography>
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

function Registrations({ onRequestClose }) {
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState([]);

  async function fetchEvents() {
    try {
      const response = await API.events.getSubscribables();
      if(response.data)
        setEvents(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="w-full bg-tertiary text-white text-center text-xl font-bold p-6">
        Inscrições
      </div>
      <div className="h-96 overflow-y-scroll p-6">
        <AppBar style={{ backgroundColor: "transparent" }} position="static">
          <Tabs variant="scrollable" value={tab} onChange={handleChange}>
            {Object.keys(events).map((type, index) => (
              <Tab
                key={index}
                className="event"
                label={type}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </AppBar>
        {Object.keys(events).map((type, index) => (
          <TabPanel key={index} value={tab} index={index}>
            {events[type].map((item, itemIndex) => (
              <Options
                key={itemIndex}
                item={item}
                fetchEvents={fetchEvents}
              ></Options>
            ))}
          </TabPanel>
        ))}
      </div>
      <button
        className="bg-orange text-white py-3 px-6 m-4 rounded-xl"
        type="button"
        onClick={onRequestClose}
      >
        Fechar
      </button>
    </Modal>
  );
}

export default Registrations;
