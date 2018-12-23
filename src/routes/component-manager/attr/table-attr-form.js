import React, { Component } from 'react';
import { Modal } from 'antd';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';
import fetch from '../../../utils/fetch';
import uuid from '../../../utils/uuid';

const options = [
  { label: 'default', value: 'default' },
  { label: 'middle', value: 'middle' },
  { label: 'small', value: 'small' },
];

@connect(({ components }) => ({
  components,
}))
class TableAttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formItems: [
        {
          label: 'ref',
          key: 'props.refName',
          type: 'input',
          tooltip: '组件的引用，通过这个属性，可以用代码访问组件。',
        },
        {
          label: 'url',
          onChange: this.urlChange,
          key: 'props.url',
          type: 'interface',
          tooltip: 'url',
        },
        {
          label: 'border',
          key: 'props.bordered',
          type: 'switch',
          tooltip: '是否展示外边框和列边框',
        },
        { label: 'size', key: 'props.size', type: 'select', options: options, tooltip: '表格大小' },
        { label: 'pagination', key: 'props.pagination', type: 'switch', tooltip: '是否分页' },
        { label: 'onRowClick', key: 'events.onRowClick', type: 'method', tooltip: '行点击事件' },
      ],
    };
  }

  showConfirm = async () => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title: '是否自动产生搜索框？',
        content: '会根据接口配置，自动产生搜索条件。',
        onOk() {
          resolve(true);
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  };

  urlChange = async (key, value) => {
    const {
      components: { selectedId },
      dispatch,
    } = this.props;

    fetch
      .get('/api/interfaceResponse/query?isEnabled=true&page=0&size=999&interfaceId=' + value)
      .then(res => {
        res.map(item => {

          if (!item.visibled) return;

          let typeCode = "";

          if (item.respType == "date") {
            typeCode = "date";
          }

          let box = {
            type: 'column',
            id: uuid(),
            props: {},
            text: '',
            parent: selectedId,
            title: item.name,
            dataIndex: item.keyCode,
            typeCode
          };

          dispatch({
            type: 'components/addComponent',
            payload: box,
          });
        });
      });

    dispatch({
      type: 'components/updateComponent',
      payload: {
        id: selectedId,
        value,
        key,
      },
    });
  };

  render() {
    const {
      components: { selectedId },
      components: { components },
    } = this.props;
    return (
      <CommonAttrForm
        formItems={this.state.formItems}
        selectedId={selectedId}
        components={components}
      />
    );
  }
}

export default TableAttrForm;
