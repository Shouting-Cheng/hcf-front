import React, { Component } from 'react';

import { Row, Col, Collapse, Card, Input, Tree, Form, Select, Icon } from 'antd';
const Panel = Collapse.Panel;
const TreeNode = Tree.TreeNode;
const FormItem = Form.Item;
const Option = Select.Option;

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
class SlideFrameAttr extends Component {
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
          label: 'title',
          key: 'props.title',
          type: 'title',
          tooltip: '标题',
        },
        {
          label: 'show',
          key: 'events.onShow',
          type: 'method',
          tooltip: '显示事件',
        },
        {
          label: 'close',
          key: 'events.onClose',
          type: 'method',
          tooltip: '关闭事件',
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

export default SlideFrameAttr;
// Export the wrapped component:
// export default ComponentManager;
