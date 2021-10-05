import Modal from "../../../components/modal";
import React from "react";
import { AppBar, Box, Tabs, Tooltip, Typography } from "@material-ui/core";
import Tab from "@material-ui/core/Tab";

import "./styles.css";
import AchievementsImages from "../achievements_images";

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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function AchievementsContainer({ data }) {
  return (
    <div className="modal-conquistas-grid">
      {data.map((conquista) => {
        const achievementsImageSrc = AchievementsImages(conquista.image);
        return (
          <Tooltip
            key={conquista._id}
            arrow
            enterTouchDelay={0}
            title={
              <button className="tootip">
                <h3>{conquista.title}</h3>
                <p>{conquista.description}</p>
              </button>
            }
          >
            <img
              className={
                conquista.isEarned ? "img-conquistada" : "img-nao-conquistada"
              }
              tabIndex="0"
              onFocus
              key={conquista._id}
              src={achievementsImageSrc}
              alt={conquista.image}
              style={{
                paddingTop: "1rem",
                paddingRight: "1rem",
                paddingLeft: "1rem",
                maxHeight: "120px",
                borderRadius: "50%",
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}

export default function AchievementsModal({ onRequestClose, conquistasLista }) {
  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const conquistasIndividual = conquistasLista.filter(
    (conquista) => conquista.type === "Individual"
  );
  const conquistaCasa = conquistasLista.filter(
    (conquista) => conquista.type === "Casa"
  );

  return (
    <Modal onRequestClose={onRequestClose}>
      <h1 className="title">Conquistas</h1>
      <AppBar style={{ backgroundColor: "transparent" }} position="static">
        <Tabs
          className="tab-events"
          value={tab}
          onChange={handleChange}
          variant="fullWidth"
        >
          <Tab className="event" label="Individual" {...a11yProps(0)} />
          <Tab className="event" label="Casa" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={tab} index={0}>
        <AchievementsContainer data={conquistasIndividual} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AchievementsContainer data={conquistaCasa} />
      </TabPanel>
      <button className="cancel" type="button" onClick={onRequestClose}>
        Fechar
      </button>
    </Modal>
  );
}
