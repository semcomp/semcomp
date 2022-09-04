import { useState } from "react";

import Input, { InputType } from "../../../Input";

export type NicksRegistrationInfo = {
  nicks: string;
}

function NicksRegistration({ updateFormValue, isInGroup }) {
  const [nicks, setNicks] = useState("");
  function handleNicksChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setNicks(value);
    updateFormValue({ nicks: value });
  };

  const labelText = isInGroup ? "Nicks dos participantes, todos separados por vírgula" : "Nick do participante";

  return (<>
    <Input
      className="my-3"
      label={labelText}
      value={nicks}
      onChange={handleNicksChange}
      type={InputType.Text}
    />
  </>);
}

export default NicksRegistration;
