import axios from "axios";

export const api = axios.create({
  baseURL: `https://9anime.to/`
});
