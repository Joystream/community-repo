import fs from "fs";
import { dbFile } from "../config";
import { Db } from "./types";

let path = dbFile;

const read = (file: string = path) =>
  JSON.parse(fs.readFileSync(file, "utf-8"));
const writeToDisk = (db?: Db) => {
  try {
    fs.writeFileSync(path, JSON.stringify(db || {}));
  } catch (e: any) {
    console.warn(`Failed to save ${path}: ${e.message}`);
  }
  return db;
};

export const loadDb = (file?: string): Db => {
  if (file) path = file; // every call of loadDb may change global path
  try {
    fs.statSync(path);
    console.debug(`Loading ${path}`);
  } catch (e: any) {
    console.debug(`Initializing db.`);
    writeToDisk();
  }
  return read(path);
};

export const saveDb = (data: any) => {
  try {
    const db = read(path);
    if (!data) return db;
    const merged = { ...db, ...data };
    writeToDisk(merged);
    return merged;
  } catch (e: any) {
    console.error(`saveDb: Not saved. ${e.message}`);
    return data;
  }
};

export default loadDb();
