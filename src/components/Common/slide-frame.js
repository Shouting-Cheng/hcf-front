import React, { Component } from 'react';
import { Card } from 'antd';
import { DragSource, DropTarget } from 'react-dnd';

import { connect } from 'react-redux';
import uuid from '../../utils/uuid';

const cardSource = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return;

    let item = monitor.getItem();

    let box = {
      type: item.text,
      id: uuid(),
      props: {},
      text: '',
      parent: props.id,
    };

    props.dispatch({
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

class SlideFrame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      methods: [
        {
          name: 'show',
          remark: '显示',
        },
        {
          name: 'close',
          remark: '隐藏',
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }

    window.refs = window.refs || {};
    if (this.props.refName) {
      window.refs[this.props.refName] = this;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refName != this.props.refName) {
      if (window.refs && this.props.refName && window.refs[this.props.refName]) {
        delete window.refs[this.props.refName];
      }
      window.refs = window.refs || {};

      if (nextProps.refName) {
        window.refs[nextProps.refName] = this;
      }
    }
  }

  render() {
    const { columns, connectDropTarget, title } = this.props;

    return (
      connectDropTarget &&
      connectDropTarget(
        <div className={this.props.className} style={this.props.style || {}}>
          <Card title={this.$t(title)}>{this.props.children}</Card>
        </div>
      )
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(DropTarget('box', cardSource, collect, { withRef: true })(SlideFrame));
