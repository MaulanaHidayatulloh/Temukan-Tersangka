import { handleRequest } from "../server/index.js";

export default function healthHandler(req, res) {
  return handleRequest(req, res);
}
