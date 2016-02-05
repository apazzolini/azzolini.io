/*
 * This configuration file is intended to be used by the React app,
 * whether it's rendering on the server or the client. Therefore,
 * no values in this file should have any expectation of privacy.
 *
 * Do NOT store keys or passwords of any sort in here.
 */
module.exports = {

  development: {
    isProduction: false,
    apiPath: 'http://localhost:3000/api',
    gaId: 'UA-26694937-1'
  },

  production: {
    isProduction: true,
    apiPath: 'https://azzolini.io/api',
    gaId: 'UA-26694937-1'
  }

}[process.env.NODE_ENV || 'development'];
