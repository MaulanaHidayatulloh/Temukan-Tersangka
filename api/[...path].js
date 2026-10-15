import { handleRequest } from "../server/index.js";

// Catch-all untuk endpoint /api/ai, /api/cases/generate, dan /api/health.
export default function apiHandler(req, res) {
  return handleRequest(req, res);
}
