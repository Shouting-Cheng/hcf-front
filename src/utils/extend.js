import React from 'react';
import app from '../index';

React.Component.prototype.$t = (id, values = {}) => {
  if (!app) return '';

  let result = app.getState().languages.languages[id];

  //#代表没找到
  if (result === undefined) {
    return id;
  }
  //匹配 {*} 格式
  result = result.replace(/\{(.*?)\}/g, (target, $1) => {
    let replacement = false;
    //values内寻找是否有值，否则不替换
    Object.keys(values).map(key => {
      if (key === $1) replacement = values[key];
    });
    return replacement === undefined ? target : replacement;
  });
  return result;
};
