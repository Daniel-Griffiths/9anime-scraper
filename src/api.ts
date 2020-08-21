import axios from "axios";

import { WEBSITE_URL } from "./constants/9anime";

export const api = axios.create({
  baseURL: `${WEBSITE_URL}/`,
});
