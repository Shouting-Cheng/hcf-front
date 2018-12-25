import React, { Component } from 'react';

import { Form } from 'antd';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';

const types = [
  {
    label: 'default',
    value: 'default',
  },
  {
    label: 'primary',
    value: 'primary',
  },
  {
    label: 'dashed',
    value: 'dashed',
  },
  {
    label: 'danger',
    value: 'danger',
  },
];

@connect(({ components }) => ({
  components,
}))
class ButtonAttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formItems: [
        {
          label: 'text',
          key: 'text',
          type: 'title',
          tooltip: '标题',
        },
        {
          label: 'code',
          key: 'code',
          type: 'input',
          tooltip: '分配权限时用到，不填默认不做权限控制。',
        },
        {
          label: 'type',
          key: 'props.type',
          type: 'select',
          tooltip: '类型',
          options: types,
        },
        {
          label: 'icon',
          key: 'props.icon',
          type: 'icon',
          tooltip: '图标',
        },
        {
          label: 'click',
          key: 'events.onClick',
          type: 'method',
          tooltip: '点击事件',
        },
      ],
    };
  }

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

export default Form.create()(ButtonAttrForm);
// Export the wrapped component:
// export default ComponentManager;
