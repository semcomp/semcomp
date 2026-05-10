import { DEBUGMODE } from "./DebugMode";

const ACTUAL_URL = DEBUGMODE 
  ? "http://localhost:4000" 
  : "https://semcomp.icmc.usp.br/api"; 

export const BASEURL = ACTUAL_URL;
export default ACTUAL_URL;
