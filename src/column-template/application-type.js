import React from 'react';
import { Divider } from 'antd';

export default {
  options: (value) => {
    return (
      <span>
        <a>编辑</a>
        <Divider type="vertical" />
        <a>公司分配</a>
      </span>
    )
  },
};
