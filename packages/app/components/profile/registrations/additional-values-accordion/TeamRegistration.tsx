import { useState } from "react";

import Input, { InputType } from "../../../Input";

export type TeamRegistrationInfo = {
  names: string;
}

function TeamRegistration({ updateFormValue }) {
  const [names, setNames] = useState("");
  function handleNamesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setNames(value);
    updateFormValue({ names: value });
  };

  return (<>
    <Input
      className="my-3"
      label="Nomes dos participantes, todos separados por vírgula (Todos devem se inscrever)"
      value={names}
      onChange={handleNamesChange}
      type={InputType.Text}
    />
  </>);
}

export default TeamRegistration;
