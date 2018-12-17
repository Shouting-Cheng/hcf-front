import React, { Component } from 'react';

import { DragSource, DropTarget } from 'react-dnd';
import styles from './component-container.less';
import { Button, DatePicker, Row } from 'antd';
import { connect } from 'dva';

import CustomTable from 'components/Common/custom-table';
import SearchForm from 'components/Common/search-form';
import SlideFrame from 'components/Common/slide-frame';
import CustomForm from 'components/Common/custom-form';

import uuid from '../../utils/uuid';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const componentList = {
  button: Button,
  table: CustomTable,
  'search-form': SearchForm,
  'slide-frame': SlideFrame,
  form: CustomForm,
  'date-picker': DatePicker,
  'range-picker': RangePicker,
  row: Row
};

/**
 * Implements the drag source contract.
 */
const cardSource = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return;

    let id = uuid();

    var item = monitor.getItem();

    let components = component.props.components.components;

    let box = {
      type: item.text,
      id: id,
      props: {},
      text: '',
      parent: 0,
    };

    component.props.dispatch({
      type: 'components/addComponent',
      payload: box,
    });
  },
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

@connect(({ components, languages }) => ({
  components,
  languages,
}))
@DropTarget('box', cardSource, collect)
class ComponentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      els: [],
      selected: false,
    };
  }

  selected = (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    const { dispatch } = this.props;

    dispatch({
      type: 'components/selectedComponent',
      payload: item.id,
    });
  };

  renderNode = (id = 0) => {
    const {
      components: { components },
      components: { selectedId },
      isOver,
    } = this.props;

    let roots = components.filter(o => o.parent == id);

    return roots.map(item => {
      let Type = componentList[item.type];
      let props = { ...item.props } || {};

      let style = { padding: 10 };

      let className = isOver ? ['over'] : [];

      // let text = messages(item.text) == "#" ? item.text : messages(item.text);

      let children = item.text
        ? [this.$t(item.text), ...this.renderNode(item.id)]
        : [...this.renderNode(item.id)];

      //className = [(selected === item.id && !isOver) ? 'selected' : ""];

      let selectedClass = isOver ? [] : item.id == selectedId ? ['selected'] : [];

      console.log(props);

      return (
        Type && (
          <div
            className={selectedClass}
            style={{
              display: item.isInline ? 'inline-block' : 'block',
              height: item.isHeight ? '100%' : 'auto',
              overflow: 'auto',
            }}
            key={item.id}
            onClick={e => this.selected(e, item)}
          >
            {React.createElement(Type, { ...props, className: className.join(' ') }, children)}
          </div>
        )
      );

      // return (<TreeNode title={item.type} key={item.id}>
      //   {this.renderNode(item.id)}
      // </TreeNode>)
    });
  };

  render() {
    const { connectDropTarget } = this.props;

    return (
      connectDropTarget &&
      connectDropTarget(
        <div ref={ref => (this.container = ref)} className={'container'}>
          {this.renderNode()}
        </div>
      )
    );
  }
}

// Export the wrapped component:
export default ComponentContainer;
