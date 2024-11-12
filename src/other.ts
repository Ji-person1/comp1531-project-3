import { getData, setData } from './datastore';

export function clear(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.sessions = [];
  data.bin = [];
  data.quizSession = [];
  data.players = [];
  data.chat = [];

  setData(data);
  return {};
}
