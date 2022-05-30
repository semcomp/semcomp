import React from "react";
import "./style.css";
import { useSelector } from "react-redux";

import About from "./about";
import AboutBeta from "./about-beta";
import Footer from "../../components/footer";
import HomeHeader from "./header";
// import Schedule from "./schedule";
import FAQ from "./faq";
import LiveNow from "./live-now";
// import Sponsors from "./sponsors";
// import Stats from "./stats";

function Home() {
  const user = useSelector((state) => state.auth.user);
  return (
    <main className="home">
      <div>
        {/* <LiveNow /> */}
        <HomeHeader user={user} />
        {/* <Stats /> */}
        {/* <About /> */}
        {/* <Schedule /> */}
        <AboutBeta />
        {/* <Sponsors /> */}
        {/* <FAQ /> */}
        <Footer />
      </div>
    </main>
  );
}
export default Home;
