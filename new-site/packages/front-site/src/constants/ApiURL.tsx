const IS_DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "true";

const ACTUAL_URL = IS_DEBUG_MODE
  ? "http://localhost:4000"
  : "https://semcomp.icmc.usp.br/api";

console.log(ACTUAL_URL);

export const BASEURL = ACTUAL_URL;
export default ACTUAL_URL;
