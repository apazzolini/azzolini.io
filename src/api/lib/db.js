import pmongo from 'promised-mongo';
import config from 'config';

let con = '';
if (config.has('mongo.user')) {
  con = config.get('mongo.user') + ':' + config.get('mongo.pass') + '@';
}
con += config.get('mongo.host') + '/' + config.get('mongo.db');

const db = pmongo(con);

export default {
  db,
  docs: db.collection('docs')
};
