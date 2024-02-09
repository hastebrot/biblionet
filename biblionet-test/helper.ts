export const defaultWorkspaceTest = "test";

export type Params = Record<string, string>;
export type FetchGetParams = {
  url: string;
  urlParams?: Params;
  headers?: Record<string, string>;
};
export type FetchPostParams = {
  url: string;
  urlParams?: Params;
  bodyParams?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export const fetchGet = ({ url, urlParams, headers }: FetchGetParams) => {
  const urlWithParams = new URL(url + "?" + new URLSearchParams(urlParams));
  return fetch(urlWithParams, {
    method: "GET",
    headers: {
      "x-workspace": defaultWorkspaceTest,
      "cache-control": "no-transform",
      ...headers,
    },
  });
};

export const fetchPost = ({ url, urlParams, bodyParams, headers }: FetchPostParams) => {
  const urlWithParams = new URL(url + "?" + new URLSearchParams(urlParams));
  return fetch(urlWithParams, {
    method: "POST",
    body: JSON.stringify(bodyParams),
    headers: {
      "x-workspace": defaultWorkspaceTest,
      "cache-control": "no-transform",
      ...headers,
    },
  });
};

export const consumeJson = async <T>(response: Response | Promise<Response>): Promise<T> => {
  response = await response;
  if (response.status >= 400) {
    throw Error(`http error, code='${response.status}'`);
  }
  return await response.json();
};

export const dropResponse = async (response: Response | Promise<Response>) => {
  response = await response;
  if (response.status >= 400) {
    throw Error(`http error, code='${response.status}'`);
  }
  return await response.body?.cancel();
};

export const range = (start: number, end: number): number[] => {
  return [...Array(end - start).keys()].map((index) => start + index);
};
