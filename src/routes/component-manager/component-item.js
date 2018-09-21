import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import styles from './component-item.less';

/**
 * Implements the drag source contract.
 */
const cardSource = {
  beginDrag(props) {
    return {
      text: props.text,
    };
  },
  endDrag(props) {
    return {
      text: props.text,
    };
  },
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}

const propTypes = {
  text: PropTypes.string.isRequired,

  // Injected by React DnD:
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

class ComponentItem extends Component {
  render() {
    const { isDragging, connectDragSource, text, connectDragPreview } = this.props;
    return connectDragPreview(
      <div>{connectDragSource(<div className={styles.item}>{text}</div>)}</div>
    );
  }
}

ComponentItem.propTypes = propTypes;

// Export the wrapped component:
export default DragSource('box', cardSource, collect)(ComponentItem);
