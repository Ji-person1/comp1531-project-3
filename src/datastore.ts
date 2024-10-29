import * as fs from 'fs';
const DATA_PATH = './src/data.json';
import { DataStore } from './interfaces';

export function getData(): DataStore {
  const data = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export function setData(data: DataStore): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
