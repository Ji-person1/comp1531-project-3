import { getData, setData } from './datastore';

export function clear(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.sessions = [];
  data.bin = [];

  setData(data);
  return {};
}
