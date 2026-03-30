import { Button } from "@mui/material";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";
import SideBar from "../components/sidebar";

const CTSContextPage = () => {
  return (
    <div className="min-h-full w-full flex flex-col">
      <Navbar />
      <SideBar />

      {/* This div is here to allow for the aside to be on the right side of the page */}
      <div className=" m-8 flex flex-col items-center md:w-full md:justify-between md:px-16 md:py-8 md:m-0">
        <main className=" flex flex-col px-0 py-4 lg:w-full">
            
        <h1 style={{ fontSize: "40px", width: "100%", textAlign: "center", margin: "20px 0 20px 0" }}><b>CTS & Context</b></h1>

      <div style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      <div className="lg:w-[900px]">
        <h1 style={{ fontSize: "30px", width: "100%", textAlign: "center", margin: "20px 0 20px 0" }}>CTS</h1>
        <p>
        O CTS - Capture the SEMCOMP é uma competição "Capture the Flag" realizada em parceria entre a SEMCOMP e o GANESH.
        Até três participantes podem se unir (podem ser casas diferentes) para enfrentar desafios na área de segurança da informação até sexta-feira às 13:00.
        <br/>
        <br/>
        Venha testar suas habilidades e salvar a Semcomp!
        
        </p>
        <p>
        <br/>
        <a href="https://forms.gle/RjRmvKEyVpkduRC99" style={{color: "blue", textDecoration: "none"}}>
          <Button
          style={{
            backgroundColor: "#171214",
            color: "white",
          }}
          >
            Inscreva-se agora!
          </Button>

        
        </a>
        </p>
        <br />
        <h1 style={{ fontSize: "30px", width: "100%", textAlign: "center", margin: "20px 0 20px 0" }}>Contest</h1>
        <p>O Contest de Programação é um evento que combina a Maratona de Programação da SEMCOMP em parceria com o GEMA.</p>
        <p>Os participantes têm a opção de competir online ou presencialmente, e o evento ocorre na quinta-feira às 10:00.</p>
        <p>É uma oportunidade incrível para testar suas habilidades de programação e resolver desafios.</p>
        <p>O evento permite grupos de até 3 pessoas e conta com níveis iniciante, intermediário e avançado.</p>
        <p>
          <br/>
          <a href="https://forms.gle/i9MxTGAmWMyJ3ov5A" style={{color: "blue", textDecoration: "none"}}>
          <Button
          style={{
            backgroundColor: "#171214",
            color: "white",
          }}
          >
            Inscreva-se agora!
          </Button> 
          </a></p>          

        <br />
    </div>
    </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CTSContextPage;
