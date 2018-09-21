import React, { Component } from 'react';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';

const types = [
  { label: '日期', value: 'date' },
  { label: '金额', value: 'money' },
  { label: '币种', value: 'currency' },
  { label: '姓名', value: 'name' },
  { label: '单据状态', value: 'progress' },
];

const aligns = [
  { label: '居中', value: 'center' },
  { label: '左对齐', value: 'left' },
  { label: '右对齐', value: 'right' },
];

@connect(({ components }) => ({
  components,
}))
class TableColumnAttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formItems: [
        {
          type: 'input',
          key: 'title',
          label: 'title',
          tooltip: '列的标题',
        },
        {
          type: 'input',
          key: 'dataIndex',
          label: 'dataIndex',
          tooltip: '绑定后台字段',
        },
        {
          type: 'select',
          key: 'typeCode',
          label: 'type',
          tooltip: '类型',
          options: types,
        },
        {
          type: 'select',
          key: 'align',
          label: 'align',
          tooltip: '对齐方式',
          options: aligns,
        },
        {
          type: 'input',
          key: 'width',
          label: 'width',
          tooltip: '宽度',
        },
        {
          type: 'switch',
          key: 'showTooltip',
          label: 'tooltop',
          tooltip: '是否显示气泡',
        },
        {
          type: 'template',
          key: 'template',
          label: 'template',
          tooltip: '列的模版',
        },
      ],
    };
  }

  updateComponent = (key, value) => {
    this.update(key, value);
  };

  update = (key, value, alias) => {
    const {
      components: { selectedId },
      components: { components },
      dispatch,
    } = this.props;

    // let selected = components.find(o => o.id == selectedId);

    // let parent = components.find(o => o.id == selected.parent);

    // let items = components.filter(o => o.parent == selected.parent);

    // let index = items.findIndex(o => o.id === selected.id);

    // let item = parent.props.columns[index];

    // item[key] = value;

    // dispatch({
    //   type: 'components/updateComponent',
    //   payload: {
    //     id: selected.parent,
    //     value: [...parent.props.columns],
    //     key: 'props.columns',
    //   },
    // });

    dispatch({
      type: 'components/updateComponent',
      payload: {
        id: selectedId,
        value: value,
        key: alias || key,
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
        updateComponent={this.updateComponent}
        formItems={this.state.formItems}
        selectedId={selectedId}
        components={components}
      />
    );
  }
}

export default TableColumnAttrForm;
// Export the wrapped component:
// export default ComponentManager;
