import { DEBUGMODE } from "./DebugMode";

export const BASEURL = DEBUGMODE ? "http://localhost:8080" : "https://semcomp.icmc.usp.br";

export default BASEURL + "/api";
