import axios from "axios";

export const API = axios.create({
  baseURL: "https://whack-a-mole-server.onrender.com/",
});
