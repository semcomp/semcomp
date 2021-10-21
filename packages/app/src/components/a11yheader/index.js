import React from "react";
import './contrast.js';
import { Nav, NavItem, NavLink } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./high-contrast-actions.css";
import "./high-contrast-backgrounds.css";
import "./high-contrast-forms.css";
import "./high-contrast-images.css";
import "./high-contrast-texts.css";
import "./style.css";

const A11yHeader = () => {
  (function () {
    let Contrast = {
        storage: 'contrastState',
        cssClass: 'contrast',
        currentState: null,
        check: checkContrast,
        getState: getContrastState,
        setState: setContrastState,
        toogle: toogleContrast,
        updateView: updateViewContrast
    };

    window.toggleContrast = function () {
      console.log("TOGGLANDO")
      Contrast.toogle(); 
    };

    Contrast.check();

    function checkContrast() {
        this.updateView();
    }

    function getContrastState() {
        return localStorage.getItem(this.storage) === 'true';
    }

    function setContrastState(state) {
        localStorage.setItem(this.storage, '' + state);
        this.currentState = state;
        this.updateView();
    }

    function updateViewContrast() {
        let body = document.body;
        console.log("CONTRASTANTOOOOOOO", body)
        
        if (!body) {
          console.log("NOBODY")
          return;
        }
        else{
          console.log("YESBODY", this.currentState)
        }

        if (this.currentState === null)
            this.currentState = this.getState();
            console.log("NEW STATE", this.currentState)

        if (this.currentState){
            console.log("CLASSE ADICIONADAAAA =D")
            body.classList.add(this.cssClass);}
        else{
            console.log("CLASSE NÃÃÃÃÃO ADICIONADAAAA T_T")
            body.classList.remove(this.cssClass);
        }
    }

    function toogleContrast() {
        console.log("TOGGLE CONTRAST")
        this.setState(!this.currentState);
    }
  })(); 

  return (
    <Nav className="a11ybar-content justify-content-end">
            <NavItem class="nav-item">
              <NavLink  class="nav-link" href="#about" accesskey="1">Ir para o Conteúdo Principal [Alt + 1]</NavLink>
            </NavItem>
            <NavItem class="nav-item">
              <NavLink  class="nav-link" href="#home-header" accesskey="2">Início do Menu [Alt + 2]</NavLink>
            </NavItem>
            <NavItem class="nav-item">
              <NavLink  class="nav-link" href="#altocontraste" id="altocontraste" accesskey="3" onkeydown={window.toggleContrast()}>Alto contraste [Alt + 3]</NavLink>
            </NavItem>
    </Nav>
  );
};

export default A11yHeader;
