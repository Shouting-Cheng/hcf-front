import React from 'react';
import { Divider } from 'antd';
import store from "../index"
import { routerRedux } from 'dva/router';


const distributionCompany = ({ id }) => {
  store.dispatch(routerRedux.push({
    pathname: '/application-type/distribution-company/' + id
  }))
}

const edit = (record) => {
  window.instances.slide.show();
  window.setTimeout(() => {
    window.instances.form.setValues(record);
  }, 1000)
}


export default {
  options: (value, record) => {
    return (
      <span>
        <a onClick={() => edit(record)}>编辑</a>
        <Divider type="vertical" />
        <a onClick={() => distributionCompany(record)}>公司分配</a>
      </span>
    )
  },
  dimension: (value) => {
    return (
      <a>维度设置</a>
    )
  }
};
