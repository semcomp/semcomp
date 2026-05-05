import { DEBUGMODE } from "./DebugMode";

export const BASEURL = DEBUGMODE ? "http://localhost:4000" : "https://semcomp.icmc.usp.br";

export default BASEURL + "/api";
