import React from 'react';
import ReactDOM from 'react-dom';
import TweenOne from 'rc-tween-one';
import QueueAnim from 'rc-queue-anim';
import PropTypes from 'prop-types';

//参考用法
//https://motion.ant.design/exhibition/demo/list-sort
//https://github.com/ant-design/ant-motion/blob/master/src/edit/template/components/ListSort.jsx

//用法示例
//<div className="list-drag-wrap">
//  list-drag-wrap用来布局
//  overflow: hidden;
//  position: relative;
// <div className="list-drag-inner-wrap">
//   list-drag-inner-wrap用来布局
//   position: relative;
//   height: 305px;


        //   <ListSort
        //     onChange={this.handleSortCategory}
        //     dragClassName="list-drag-selected"
        //   >
        //     <div key={1} className="list-drag-item">可以拖拽的item1</div>
        //     <div key={2} className="list-drag-item">可以拖拽的item2</div>
        //     <div key={3} className="list-drag-item">可以拖拽的item3</div>
        //   </ListSort>


//</div>
//</div>
function toArrayChildren(children) {
  const ret = [];
  React.Children.forEach(children, (c) => {
    ret.push(c);
  });
  return ret;
}

function findChildInChildrenByKey(children, key) {
  let ret = null;
  if (children) {
    children.forEach((c) => {
      if (ret || !c) {
        return;
      }
      if (c.key === key) {
        ret = c;
      }
    });
  }
  return ret;
}

function mergeChildren(prev, next) {
  const ret = [];
  // 保存更改后的顺序，新增的在新增时的位置插入。
  prev.forEach((c) => {
    if (!c) {
      return;
    }
    const newChild = findChildInChildrenByKey(next, c.key);
    if (newChild) {
      ret.push(newChild);
    }
  });

  next.forEach((c, i) => {
    if (!c) {
      return;
    }
    const newChild = findChildInChildrenByKey(prev, c.key);
    if (!newChild) {
      ret.splice(i, 0, c);
    }
  });
  return ret;
}

/**
 * 列表排序组件
 * 内部应为reactDom数组，生成后的数组可自由拖拽排序
 * 列表项的进场与出场使用了quere-anim进行了动效
 * 注意列表项外部必须使用一个已有position属性的容器，不然最后一个元素会计算错误
 */
export default class ListSort extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      children: this.props.children,
      style: {},
      childStyle: [],
      animation: [],
    };
    this.index = null;
    this.swapIndex = null;
    this.mouseXY = null;
    this.childStyle = [];
    this.children = [];
    this.isDrage = false;
  }

  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this);

    if (window.addEventListener) {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('touchmove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchend', this.onMouseUp);
    } else {
      window.attachEvent('onmousemove', this.onMouseMove);
      window.attachEvent('ontouchmove', this.onMouseMove);
      window.attachEvent('onmouseup', this.onMouseUp);
      window.attachEvent('ontouchend', this.onMouseUp);
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentChildren = this.state.children;
    const nextChildren = nextProps.children;
    const newChildren = mergeChildren(currentChildren, nextChildren);
    this.setState({ children: newChildren });
  }

  componentWillUnmount() {
    if (window.addEventListener) {
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('touchmove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('touchend', this.onMouseUp);
    } else {
      window.detachEvent('onmousemove', this.onMouseMove);
      window.detachEvent('ontouchmove', this.onMouseMove);
      window.detachEvent('onmouseup', this.onMouseUp);
      window.detachEvent('ontouchend', this.onMouseUp);
    }
  }

  onMouseDown = (i, e) => {
    if (this.isDrage) {
      return;
    }
    const rect = this.dom.getBoundingClientRect();
    document.body.style.overflow = 'hidden';
    this.props.onEventChange(e, 'down');
    const style = {
      height: `${rect.height}px`,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
    };
    this.children = Array.prototype.slice.call(this.dom.children);
    this.childStyle = [];
    const childStyle = this.children.map((item, ii) => {
      const cItem = this.children[ii + 1];
      let marginHeight;
      let marginWidth;
      if (cItem) {
        marginHeight = cItem.offsetTop - item.offsetTop - item.clientHeight;
        marginWidth = cItem.offsetLeft - item.offsetLeft - item.clientWidth;
      } else {
        const parentHeight = item.parentNode.clientHeight -
          parseFloat(getComputedStyle(item.parentNode).getPropertyValue('padding-bottom'));
        const parentWidth = item.parentNode.clientWidth -
          parseFloat(getComputedStyle(item.parentNode).getPropertyValue('padding-right'));
        marginHeight = parentHeight - item.offsetTop - item.clientHeight;
        marginWidth = parentWidth - item.offsetLeft - item.clientWidth;
      }
      const d = {
        width: item.clientWidth,
        height: item.clientHeight,
        top: item.offsetTop,
        left: item.offsetLeft,
        margin: 'auto',
        marginHeight,
        marginWidth,
        position: 'absolute',
        zIndex: ii === i ? 1 : 0,
      };
      this.childStyle.push({ ...d });
      return d;
    });
    const animation = this.children.map((item, ii) =>
      i === ii && (!this.props.dragClassName ?
      { scale: 1.2, boxShadow: '0 10px 10px rgba(0,0,0,0.15)' } : null) || null);
    this.index = i;
    this.swapIndex = i;
    this.mouseXY = {
      startX: e.touches === undefined ? e.clientX : e.touches[0].clientX,
      startY: e.touches === undefined ? e.clientY : e.touches[0].clientY,
      top: childStyle[i].top,
      left: childStyle[i].left,
    };
    if (this.props.dragClassName) {
      this.listDom = e.currentTarget;
      this.listDom.className = `${this.listDom.className
        .replace(this.props.dragClassName, '').trim()} ${this.props.dragClassName}`;
    }
    this.isDrage = true;
    this.setState({
      style,
      childStyle,
      animation,
    });
  };

  onMouseUp = (e) => {
    if (!this.mouseXY) {
      return;
    }
    this.mouseXY = null;
    document.body.style.overflow = null;
    this.props.onEventChange(e, 'up');
    const animation = this.state.animation.map((item, i) => {
      if (this.index === i) {
        const animate = {};
        let height = 0;
        if (this.props.animType === 'y') {
          if (this.swapIndex > this.index) {
            const start = this.index + 1;
            const end = this.swapIndex + 1;
            this.childStyle.slice(start, end).forEach((_item) => {
              height += _item.height + _item.marginHeight;
            });
            animate.top = height + this.childStyle[this.index].top;
          } else {
            animate.top = this.childStyle[this.swapIndex].top;
          }
        }
        const dragScale = !this.props.dragClassName &&
          ({
            scale: 1,
            boxShadow: '0 0px 0px rgba(0,0,0,0)',
          });
        return {
          ...dragScale,
          ...animate,
          onComplete: () => {
            const children = this.sortArray(this.state.children, this.swapIndex, this.index);
            const callbackBool = this.index !== this.swapIndex;
            this.index = null;
            this.childStyle = [];
            this.swapIndex = null;
            this.setState({
              style: {},
              childStyle: [],
              children,
              animation: [],
            }, () => {
              this.isDrage = false;
              if (callbackBool) {
                this.props.onChange(children);
              }
            });
          },
        };
      }
      return item;
    });
    if (this.props.dragClassName) {
      this.listDom.className = `${this.listDom.className
        .replace(this.props.dragClassName, '').trim()}`;
    }
    this.setState({ animation });
  };

  onMouseMove = (e) => {
    if (!this.mouseXY) {
      return;
    }
    this.mouseXY.x = e.touches === undefined ? e.clientX : e.touches[0].clientX;
    this.mouseXY.y = e.touches === undefined ? e.clientY : e.touches[0].clientY;
    const childStyle = this.state.childStyle;
    let animation = this.state.animation;


    if (this.props.animType === 'x') {
      // 懒得写现在没用。。。做成组件后加
      childStyle[this.index].left = this.mouseXY.x - this.mouseXY.startX + this.mouseXY.left;
    } else {
      childStyle[this.index].top = this.mouseXY.y - this.mouseXY.startY + this.mouseXY.top;
      this.swapIndex = childStyle[this.index].top < this.childStyle[this.index].top ?
        0 : this.index;
      this.swapIndex = childStyle[this.index].top >
      this.childStyle[this.index].top + this.childStyle[this.index].height ?
        childStyle.length - 1 : this.swapIndex;

      const top = childStyle[this.index].top;
      this.childStyle.forEach((item, i) => {
        const cTop = item.top;
        const cHeight = item.height + item.marginHeight;
        if (top > cTop && top < cTop + cHeight) {
          this.swapIndex = i;
        }
      });
      animation = animation.map((item, i) => {
        // 到顶端
        let height = this.childStyle[this.index].height;
        if (this.index < this.swapIndex) {
          if (i > this.index && i <= this.swapIndex && this.swapIndex !== this.index) {
            const start = this.index + 1;
            const end = i;
            height = 0;
            this.childStyle.slice(start, end).forEach((_item) => {
              height += _item.height + _item.marginHeight;
            });
            return { top: this.childStyle[this.index].top + height };
          } else if ((i > this.swapIndex || this.swapIndex === this.index) && i !== this.index) {
            return { top: this.childStyle[i].top };
          }
        } else if (this.index > this.swapIndex) {
          if (i < this.index && i >= this.swapIndex && this.swapIndex !== this.index) {
            height = this.childStyle[this.index].height + this.childStyle[this.index].marginHeight;
            return { top: this.childStyle[i].top + height };
          } else if ((i < this.swapIndex || this.swapIndex === this.index) && i !== this.index) {
            return { top: this.childStyle[i].top };
          }
        }
        if (i !== this.index) {
          return { top: this.childStyle[i].top };
        }
        return item;
      });
    }
    this.setState({ childStyle, animation });
  };

  getChildren = (item, i) => {
    const onMouseDown = this.onMouseDown.bind(this, i);
    const style = { ...this.state.childStyle[i] };
    return React.createElement(
      TweenOne,
      {
        ...item.props,
        onMouseDown,
        onTouchStart: onMouseDown,
        style: { ...item.style, ...style },
        key: item.key,
        animation: this.state.animation[i],
        component: item.type,
      }
    );
  };

  sortArray = (_array, nextNum, num) => {
    const current = _array[num];
    const array = _array.map(item => item);
    array.splice(num, 1);
    array.splice(nextNum, 0, current);
    return array;
  };

  render() {
    const childrenToRender = toArrayChildren(this.state.children).map(this.getChildren);
    const props = { ...this.props };
    [
      'component',
      'animType',
      'dragClassName',
      'appearAnim',
      'onEventChange',
    ].forEach(key => delete props[key]);
    if (this.props.appearAnim) {
      return React.createElement(QueueAnim, {
        ...props,
        ...this.props.appearAnim,
        style: { ...this.state.style },
      }, childrenToRender);
    }
    return React.createElement(this.props.component, {
      ...props,
      style: { ...this.state.style },
    }, childrenToRender);
  }
}

ListSort.propTypes = {
  component: PropTypes.any,  //列表元素的html类型
  children: PropTypes.any,  //内部的元素数组，或直接写如元素内部
  animType: PropTypes.string,  //动画方向 x / y，目前只支持y，x之后加
  onChange: PropTypes.any,  //排序后触发的方法，返回排序后的reactDom数组
  dragClassName: PropTypes.string,  //拖拽时的元素class
  appearAnim: PropTypes.object,  //列表进出场时的QueueAnim动画配置，详细见 https://motion.ant.design/api/queue-anim
  onEventChange: PropTypes.any  //触发动作事件时回调的方法，返回对应事件
};

ListSort.defaultProps = {
  component: 'div',
  animType: 'y',
  onChange: () => {
  },
  onEventChange: () => {
  },
};
