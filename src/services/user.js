import request from '../utils/request';
import fetch from '../utils/fetch';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return fetch.get('/api/account');
}
