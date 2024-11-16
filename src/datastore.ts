import { DataStore } from './interfaces';
import request from 'sync-request';

export const getData = (): DataStore => {
  try {
    const res = request('GET', `https://h-15b-eggs.vercel.app/data`, {});
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
    const res = request('PUT', `https://h-15b-eggs.vercel.app/data`, {
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
