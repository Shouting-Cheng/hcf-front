import React, { Component } from 'react';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';


@connect(({ components }) => ({
  components,
}))

class FormItemAttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commonFormItems: [
        {
          type: 'input',
          key: 'label',
          label: 'label',
          tooltip: '标题',
        },
        {
          type: 'input',
          key: 'dataIndex',
          label: 'dataIndex',
          tooltip: '绑定后台字段',
        },
        {
          type: 'input',
          key: 'visible',
          label: 'visible',
          tooltip: '显示或隐藏',
        },
        {
          type: 'input',
          key: 'defaultValue',
          label: 'defaultValue',
          tooltip: '默认值',
        },
        {
          type: 'switch',
          key: 'required',
          label: 'required',
          tooltip: '是否必填',
        },
        {
          type: 'input',
          key: 'disabled',
          label: 'disabled',
          tooltip: '是否禁用',
        },
        {
          type: 'input',
          key: 'message',
          label: 'message',
          tooltip: '校验失败提示',
        },
        {
          type: 'method',
          key: 'onChange',
          label: 'onChange',
          tooltip: '值改变事件',
        },
      ],
      selectFormItems: [
        {
          type: 'switch',
          key: 'allowClear',
          label: 'allowClear',
          tooltip: '是否支持清除',
        },
        {
          type: 'interface',
          key: 'url',
          label: 'url',
          tooltip: '下拉框数据源',
        },
        {
          type: 'input',
          key: 'labelKey',
          label: 'labelKey',
          tooltip: '绑定显示的字段',
        },
        {
          type: 'input',
          key: 'valueKey',
          label: 'valueKey',
          tooltip: '绑定选中的字段',
        },
        {
          type: 'json',
          key: 'dataSource',
          label: 'dataSource',
          tooltip: '默认下拉框数据源，当配置了这个属性，url就不会生效。',
        }
      ],
      customChooserItems: [
        {
          type: 'input',
          key: 'chooserType',
          label: 'chooserType',
          tooltip: 'chooserdata里面的key',
        },
        {
          type: 'input',
          key: 'labelKey',
          label: 'labelKey',
          tooltip: '绑定显示的字段',
        },
        {
          type: 'input',
          key: 'valueKey',
          label: 'valueKey',
          tooltip: '绑定选中的字段',
        },
      ],
      formItems: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.components.selectedId != this.props.components.selectedId) {
      let selected = nextProps.components.components.find(
        o => o.id == nextProps.components.selectedId
      );

      const { commonFormItems, selectFormItems, customChooserItems } = this.state;
      let formItems = [...commonFormItems];
      if (selected.text == 'select') {
        formItems = [...formItems, ...selectFormItems];
      } else if (selected.text == 'custom-chooser' || selected.text == 'permissions-allocation') {
        formItems = [...formItems, ...customChooserItems];
      }

      this.setState({ formItems });
    }
  }

  componentDidMount() {
    const {
      components: { selectedId },
      components: { components }
    } = this.props;

    let selected = components.find(o => o.id == selectedId);

    const { commonFormItems, selectFormItems, customChooserItems } = this.state;
    let formItems = [...commonFormItems];

    if (selected.text == 'select') {
      formItems = [...formItems, ...selectFormItems];
    } else if (selected.text == 'custom-chooser' || selected.text == 'permissions-allocation') {
      formItems = [...formItems, ...customChooserItems];
    }

    this.setState({ formItems });
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

    // let item = parent.props.formItems[index];

    // item[key] = value;

    // dispatch({
    //   type: 'components/updateComponent',
    //   payload: {
    //     id: selected.parent,
    //     value: [...parent.props.formItems],
    //     key: 'props.formItems',
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

export default FormItemAttrForm;
// Export the wrapped component:
// export default ComponentManager;
