import React, { useState, useEffect } from "react";
import { Nav, NavItem, NavLink } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./high-contrast-actions.css";
import "./high-contrast-backgrounds.css";
import "./high-contrast-forms.css";
import "./high-contrast-images.css";
import "./high-contrast-texts.css";
import "./style.css";

const storageKey = 'isAtHighContrast'
const cssContrastClass = 'contrast'

const A11yHeader = () => {
  // NOTE: HC = High Contrast

  (function() {
    const Contrast = {
      isAtHC: false,
      toggle: function () {
        this.setContrast(!this.isAtHC);
      },
      setContrast: function (isAtHighContrast) {
        localStorage[storageKey] = '' + isAtHighContrast;
        this.isAtHC = isAtHighContrast;
        this.updateSiteBody();
      },
      updateSiteBody: function () {
        const body = document.body;
        if (!body) return;
        
        this.isAtHC = this.isAtHC || localStorage[storageKey] === 'true';
        
        if (this.isAtHC) {
          body.classList.add(cssContrastClass);
        }
        else {
          body.classList.remove(cssContrastClass);
        }
      }
    }

    window.toggleContrast = function () {
      Contrast.toggle(); 
    };

    Contrast.updateSiteBody();
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
        <NavLink 
          class="nav-link" 
          href="#altocontraste" 
          id="altocontraste" 
          accesskey="3" 
          onClick={() => { window.toggleContrast() }}
          onKeyDown={() => { window.toggleContrast() }}
        >Alto contraste [Alt + 3]</NavLink>
      </NavItem>
    </Nav>
  );
};

export default A11yHeader;
