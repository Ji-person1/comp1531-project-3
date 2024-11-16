import { DataStore } from './interfaces';
import request, { HttpVerb } from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let json = {};
  let qs = {};
  if (['POST', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  const res = request(method, "https://h-15b-eggs.vercel.app/" + path, { qs, json, timeout: 20000 });
  return JSON.parse(res.body.toString());
};


export const getData = (): DataStore => {
  try {
    const res = request('GET', `${SERVER_URL}/data`, {});
    return JSON.parse(res.body.toString());
  } catch (e) {
    console.error('Error fetching data:', e);
    return {
      users: [],
      quizzes: [],
      sessions: [],
      bin: [],
      quizSession: [],
      players: [],
      chat: []
    };
  }
};


export const setData = (newData: DataStore): void => {
  try {
    const res = request('PUT', `${SERVER_URL}/data`, {});
    return JSON.parse(res.body.toString());
  } catch (e) {
    console.error('Error setting data:', e);
    throw e;
  }
};
