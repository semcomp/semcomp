import { useState } from "react";

import Modal from "../../Modal";
import { AppBar, Box, Tab, Tabs, Tooltip, Typography } from "@mui/material";

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
        return (
          <Tooltip
            key={conquista.id}
            arrow
            enterTouchDelay={0}
            title={
              <button className="tootip">
              <h3>{conquista.title}</h3>
              {conquista.isEarned && conquista.description.length > 1 && <a href={conquista.description} className="underline text-lg">veja mais detalhes sobre essa conquista.</a>}
            </button>
            }
          >
            <img
              className={
                conquista.isEarned ? "img-conquistada" : "img-nao-conquistada"
              }
              tabIndex={0}
              key={conquista.id}
              src={conquista.imageBase64}
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
  const [tab, setTab] = useState(0);

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
        <h1 className={`bg-black text-white w-full h-fit text-xl text-white py-8 flex items-center justify-center text-center`}>Conquistas</h1>
      <AppBar style={{ backgroundColor: "transparent" }} position="static">
        <Tabs
          className="tab-events"
          value={tab}
          onChange={handleChange}
          variant="fullWidth"
        >
        { conquistasIndividual.length > 0 && <Tab className="event" label="Individual" {...a11yProps(0)} /> }
        { conquistaCasa.length > 0 && <Tab className="event" label="Casa" {...a11yProps(1)} />}
        </Tabs>
      </AppBar>
      {conquistasIndividual.length > 0 && <TabPanel className="phone:overflow-y-scroll items-center justify-center" value={tab} index={0}>
        <AchievementsContainer data={conquistasIndividual} />
      </TabPanel>}
      {conquistaCasa.length > 0 && <TabPanel className="phone:overflow-y-scroll items-center justify-center" value={tab} index={1}> 
        <AchievementsContainer data={conquistaCasa} />
      </TabPanel>}
      <button className="cancel" type="button" onClick={onRequestClose}>
        Fechar
      </button>
    </Modal>
  );
}
