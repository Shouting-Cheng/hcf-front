import React from 'react'
import { Icon, Drawer } from 'antd'
import PropTypes from 'prop-types';


import 'styles/components/slide-frame.scss'


/**
* 侧拉组件，该组件内部组件将自带this.props.close(params)方法关闭侧拉栏
*/
class SlideFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: 'slide-frame animated hide',
      showFlag: false
    };
  }

  /**
   * 组装方法
   * @param content 内部组件
   * @return {*} 给组件添加this.props.close(params)方法,params为返回到最外层的值
   *             同时添加外部传入的props为内部组件可用
   */
  wrapClose = (content) => {
    const newProps = {
      close: this.close,
      params: this.props.params,
      ref: ref => this.content = ref
    };
    return React.createElement(content, Object.assign({}, this.props.params, newProps));
  };

  show = () => {
    this.setState({
      className: 'slide-frame animated slideInRight',
      showFlag: true
    })
  };

  /**
   * 关闭方法，如果内部有params参数，则传出至afterClose方法
   * @param params
   */
  close = (params) => {
    this.setState({
      className: 'slide-frame animated slideOutRight',
      showFlag: false
    });
    setTimeout(() => {
      this.setState({
        className: 'slide-frame animated hide'
      }, () => {
        this.props.afterClose(params);
        try {
          let form = null;
          if (this.content.getWrappedInstance) {
            form = this.content.getWrappedInstance();
            if (form) {
              form.resetFields()
            }
          }
        } catch (e) {

        }
      });
    }, 501)
  };

  /**
   * 根据传入的show值进行判断是否显示
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    nextProps.show !== this.state.showFlag && (nextProps.show ? this.show() : this.close());
  }

  // /**
  //  * 关闭方法，如果内部有params参数，则传出至afterClose方法
  //  * @param params
  //  */
  // close = (params) => {
  //   this.props.onClose && this.props.onClose();
  // };

  render() {
    const { width, show, title } = this.props;
    return (
      <div>
        <div className={this.props.hasMask && this.state.showFlag ? 'slide-mask' : 'hide'} onClick={this.props.onClose} />
        <div className={this.state.className} style={{ width: width || "50vw" }}>
          <div className="slide-title">{this.props.title}<Icon type="close" className="close-icon" onClick={this.props.onClose} /></div>
          <div className={`slide-content ${!this.props.hasFooter && 'no-footer'}`}>
            {this.state.showFlag && this.props.children}
          </div>
        </div>
      </div>
    )
  }
}


SlideFrame.propTypes = {
  width: PropTypes.any,  //宽度
  title: PropTypes.string,  //标题
  show: PropTypes.bool,  //是否显示
  hasMask: PropTypes.bool,  //是否有遮罩层
  onClose: PropTypes.func,  //点击遮罩层或右上方x时触发的事件
  content: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),  //内容component，包裹后的元素添加this.props.close方法进行侧滑关闭
  afterClose: PropTypes.func,  //关闭后触发的事件，用于更新外层的show值
  params: PropTypes.object,  //外部传入内部组件props
  hasFooter: PropTypes.bool  //是否有低端操作区
};

SlideFrame.defaultProps = {
  width: '50vw',
  onClose: () => { },
  okText: '保存',
  cancelText: '取消',
  hasMask: true,
  afterClose: () => { },
  params: {},
  hasFooter: true
};


export default SlideFrame
