const projectRoot = process.cwd();
const sourceRoot = `${projectRoot}/src`;

module.exports = {
  verbose: false,

  html: {
    head: sourceRoot + '/views/_app/Head.js'
  },

  redux: {
    middleware: sourceRoot + '/redux/middleware/index.js'
  }
};
