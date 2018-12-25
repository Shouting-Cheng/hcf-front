import React, { Component } from 'react';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';

const options = [
  { label: 'default', value: 'default' },
  { label: 'middle', value: 'middle' },
  { label: 'small', value: 'small' },
];

@connect(({ components }) => ({
  components,
}))

class SearchFormAttr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formItems: [
        {
          label: 'ref',
          key: 'props.refName',
          type: 'input',
          tooltip: '组件的引用，通过这个属性，可以用代码访问组件。'
        },
        { label: 'search', key: 'events.search', type: 'method', tooltip: '搜索触发的事件' }
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

export default SearchFormAttr;
