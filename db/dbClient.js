import {MongoClient} from "mongodb";

const uri = process.env.CHECK_HEALTH_DB_HOST;

export const dbClient = new MongoClient(uri);

export const db = dbClient.db('sample_mflix');
