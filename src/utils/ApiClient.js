import fetch from 'isomorphic-fetch';
import config from '../client-config';

export default class ApiClient {
  /**
   * @param {Hapi Request} (optional) the request the server received for a full
   *        server-rendered page. The request may include cookies or other user
   *        identifying information to correctly make API calls on behalf of
   *        the requesting user
   */
  constructor(serverReq) {
    this.cookies = {
      headers: {}
    };

    if (__SERVER__) {
      // console.log(serverReq);
      // this.cookies = ...
      // TODO: Make cookies go through when rendering server side
    }
  }

  get(path) {
    const options = {
      ...this.cookies
    };
    return this.performFetch(path, options);
  }

  post(path, data) {
    const options = {
      ...this.cookies,
      method: 'post',
      body: JSON.stringify(data)
    };
    options.headers['Accept'] = 'application/json'; // eslint-disable-line dot-notation
    options.headers['Content-Type'] = 'application/json';

    return this.performFetch(path, options);
  }

  delete(path) {
    const options = {
      ...this.cookies,
      method: 'delete'
    };
    return this.performFetch(path, options);
  }

  performFetch(path, options) {
    const url = this.formatUrl(path);
    return fetch(url, options).then((data) => {
      return data.json();
    });
  }

  formatUrl(path) {
    const adjustedPath = path[0] !== '/' ? '/' + path : path;
    return config.apiPath + adjustedPath;
  }
}
