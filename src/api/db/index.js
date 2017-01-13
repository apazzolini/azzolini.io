import mongo from 'mongojs';
import config from 'config';

if (!config.has('mongo.url')) {
  throw new Error('Must provide mongo.url config option');
}

const con = config.get('mongo.url');
export const db = mongo(con);

export const docs = require('./docs').default(db);
export const admins = require('./admins').default(db);
