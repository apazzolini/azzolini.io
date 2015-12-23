import pmongo from 'promised-mongo';
import config from 'config';

let con = '';
if (config.has('mongo.user')) {
  con = config.get('mongo.user') + ':' + config.get('mongo.pass') + '@';
}
con += config.get('mongo.host') + '/' + config.get('mongo.db');

export const db = pmongo(con);
export const docs = db.collection('docs');
export const admins = db.collection('admins');
