export default (db) => {
  const admins = db.collection('admins');

  return {

    __collection: admins,

    getAdmin: async (auth) => admins.findOne({ auth })

  };
};
