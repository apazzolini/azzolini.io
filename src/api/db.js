import pmongo from 'promised-mongo';
import config from 'config';

// const auth = `${config.get('mongo.user')}:${config.get('mongo.pass')}`;
// const db = pmongo(`${auth}@${config.get('mongo.host')}/${config.get('mongo.db')}`);

const db = pmongo('localhost/andreazzolini');
export default db;
