import { DataStore } from './interfaces';
import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;



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
    const res = request('PUT', `${SERVER_URL}/data`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });

    if (res.statusCode >= 400) {
      throw new Error(`Failed to set data: ${res.statusCode} - ${res.body.toString()}`);
    }

    JSON.parse(res.body.toString());
  } catch (e) {
    throw e;
  }
};
