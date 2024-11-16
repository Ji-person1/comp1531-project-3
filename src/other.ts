import { createClient } from '@vercel/kv';
import { DataStore } from './interfaces';

const KV_REST_API_URL = "https://communal-ray-28417.upstash.io";
const KV_REST_API_TOKEN = "AW8BAAIjcDFmZDczY2VhYTE2OTc0NDQ3ODJiNzI2YTE1ZmM4ZWVmZnAxMA";

const database = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

export async function clear(): Promise<Record<string, never>> {
  const defaultData: DataStore = {
    users: [],
    quizzes: [],
    sessions: [],
    bin: [],
    quizSession: [],
    players: [],
    chat: [],
  };
  
  try {
    await database.hset('datastore', defaultData as unknown as Record<string, unknown>);
    return {};
  } catch (error) {
    console.error('Error clearing datastore:', error);
    throw new Error('Failed to clear datastore');
  }
  
}
