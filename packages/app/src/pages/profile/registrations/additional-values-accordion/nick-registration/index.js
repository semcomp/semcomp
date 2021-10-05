import React from "react";

// import { Container } from './styles';

function NickRegistration({ updateFormValue, registerTeam }) {
  const infoRef = React.useRef();

  function handleFormUpdate() {
    const nick = infoRef.current.value;
    updateFormValue({ nick });
  }

  return (
    <div>
      <label>
        {}
        <p>
          {!registerTeam
            ? "Nick do participante"
            : "Nicks dos participantes, todos separados por vírgula"}
        </p>
        <input
          name="info"
          ref={infoRef}
          onChange={handleFormUpdate}
          type="text"
        />
      </label>
    </div>
  );
}

export default NickRegistration;
