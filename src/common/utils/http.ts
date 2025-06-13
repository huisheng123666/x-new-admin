import axios from "axios";
import { getStorage } from ".";

// axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

const http = axios.create({
  baseURL: import.meta.env.DEV ? "/dev-api" : "/prod-api",
});

http.interceptors.request.use(
  (config) => {
    config.headers.Authorization = "Bearer " + (getStorage("token") || "");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (res) => {
    if (res.config.responseType === 'blob') {
      return Promise.resolve(res.data)
    }
    if (res.data.code !== 200) {
      // message.error(res.data.msg);
      return Promise.reject(res.data);
    }
    return res.data;
  },
  () => {
    // message.error("网络错误，请稍后再试");
    return Promise.reject({ msg: "网络错误，请稍后再试" });
  }
);

export default http;
