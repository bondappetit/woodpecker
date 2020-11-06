import axios, { AxiosRequestConfig } from "axios";

export interface Options {
  request: AxiosRequestConfig;
}

export function httpRequest({ request }: Options, next: Function) {
  return async () => {
    const res = await axios.request(request);

    return next(res.data);
  };
}
