// import Link from 'next/link'

import NavBar from "../../navbar";
// import Routes from "../../../routes";
// import BackgroundImage from "../../../assets/home-background.png";
// import { useAppContext } from '../../../libs/contextLib';
import Countdown from '../Countdown';

const HomeHeader = () => {
  // const { user } = useAppContext();
  // const isUserLoggedIn = Boolean(user);

  return (
    <header className="home-header" id="home-header">
      {/* <img alt='' src={BackgroundImage} /> */}
      {/* <div className="backdrop" /> */}
      <div className="navbar-container">
        <NavBar />
      </div>
      <div className="main-texts">
        <h1 className="semcomp-edition">SEMCOMP 25</h1>
        <h1 className="beta-text">Em breve</h1>
      </div>
      <div className="text-container">
        <h1>
          A maior semana acadêmica de computação do Brasil!
          {/* <br />
          De 25 de setembro a 01 de outubro */}
        </h1>
        {/* {!isUserLoggedIn && (
          <Link href={Routes.signup}>
            <span className="home-signup-button">
              Inscreva-se
            </span>
          </Link>
        )} */}
        <Countdown/>
        {/* <button className="home-signup-button home-signup-button-disabled">
					Inscrições em breve!
				</button> */}
      </div>
    </header>
  );
};

export default HomeHeader;
