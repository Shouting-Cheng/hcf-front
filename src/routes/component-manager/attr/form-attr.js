import React, { Component } from 'react';

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
class FormAttr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formItems: [
        {
          label: 'ref',
          key: 'refName',
          type: 'input',
          tooltip: '组件的引用，通过这个属性，可以用代码访问组件。',
        },
        {
          label: 'url',
          onChange: this.urlChange,
          key: 'props.url',
          type: 'interface',
          tooltip: '提交的url',
        },
        {
          label: 'onSubmit',
          key: 'events.onSubmit',
          type: 'method',
          tooltip: '提交事件，如果此选项有值，不会自动提交。',
        },
        {
          label: 'onCancel',
          key: 'events.onCancel',
          type: 'method',
          tooltip: '取消事件回调',
        },
        {
          label: 'onSuccess',
          key: 'events.onSuccess',
          type: 'method',
          options: options,
          tooltip: '提交成功回调',
        },
        { label: 'onError', key: 'events.onError', type: 'method', tooltip: '提交失败回调' },
      ],
    };
  }

  urlChange = (key, value) => {
    const {
      components: { selectedId },
      components: { components },
      dispatch,
    } = this.props;

    fetch.get('/auth/api/interfaceRequest/query?page=0&size=999&interfaceId=' + value).then(res => {
      res.map(item => {

        let box = {
          type: 'form-item',
          id: uuid(),
          props: {},
          text: '',
          parent: selectedId,
          label: item.name,
          dataIndex: item.keyCode,
        };

        dispatch({
          type: 'components/addComponent',
          payload: box,
        });
      });

      // dispatch({
      //   type: 'components/updateComponent',
      //   payload: {
      //     id: selectedId,
      //     value: formItems,
      //     key: 'props.formItems',
      //   },
      // });
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

export default FormAttr;
