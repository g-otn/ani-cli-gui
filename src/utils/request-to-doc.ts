import {
  Body,
  Client,
  getClient,
  RequestOptions,
  ResponseType,
} from '@tauri-apps/api/http';
import { agent } from './constants';

export const getDoc = async (url: string, options: RequestOptions = {}) => {
  const client = await getClient();

  console.log('get', url);
  return client
    .get<string>(url, {
      headers: { 'User-Agent': agent, ...(options?.headers || {}) },
      responseType: ResponseType.Text,
      ...options,
    })
    .then((res) => new DOMParser().parseFromString(res.data, 'text/html'))
    .catch(console.error);
};

export const postDoc = async (
  url: string,
  body?: Body,
  options: RequestOptions = {}
) => {
  const client = await getClient();

  console.log('post', url);
  return client
    .post<string>(url, body, {
      headers: { 'User-Agent': agent, ...(options?.headers || {}) },
      responseType: ResponseType.Text,
      ...options,
    })
    .then((res) => new DOMParser().parseFromString(res.data, 'text/html'))
    .catch(console.error);
};
