import { handleRequest } from "../../server/index.js";

export default function generateCaseHandler(req, res) {
  return handleRequest(req, res);
}
