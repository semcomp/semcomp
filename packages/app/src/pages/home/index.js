import React from "react";
import "./style.css";
import "./../../components/a11yheader/high-contrast-actions.css";
import "./../../components/a11yheader/high-contrast-backgrounds.css";
import "./../../components/a11yheader/high-contrast-forms.css";
import "./../../components/a11yheader/high-contrast-images.css";
import "./../../components/a11yheader/high-contrast-texts.css";
import { useSelector } from "react-redux";

import About from "./about";
// import AboutBeta from "./about-beta";
import Footer from "../../components/footer";
import A11yHeader from "../../components/a11yheader";
import HomeHeader from "./header";
import Schedule from "./schedule";
import FAQ from "./faq";
import LiveNow from "./live-now";
import Sponsors from "./sponsors";
// import Stats from "./stats";

//import VLibras from "@djpfs/react-vlibras";

function Home() {
  const user = useSelector((state) => state.auth.user);
  return (
    <main className="home" role="main">
      <div>
        <A11yHeader/>
        {/* <LiveNow /> */}
        <HomeHeader user={user} />
        {/* <Stats /> */}
        <About />
        <Schedule />
        {/* <AboutBeta /> */}
        <Sponsors />
        <FAQ />
        <Footer />
        {/* <VLibras /> */}
      </div>
    </main>
  );
}
export default Home;
