import Promise from 'bluebird';

export default (db) => {
  const admins = Promise.promisifyAll(db.collection('admins'));

  return {

    __collection: admins,

    getAdmin: async (auth) => admins.findOneAsync({ auth })

  };
};
