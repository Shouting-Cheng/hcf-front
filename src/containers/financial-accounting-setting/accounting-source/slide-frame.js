import React from 'react'
import {Icon} from 'antd'

import 'styles/components/slide-frame.scss'

/**
 * 侧拉组件，该组件内部组件将自带this.props.close(params)方法关闭侧拉栏
 */
class SlideFrame extends React.Component{
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
  wrapClose = (content) =>{
    const newProps = {
      close : this.close,
      setParams:this.setParams,
      params: this.props.params
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
    setTimeout(()=>{
      this.setState({
        className: 'slide-frame animated hide'
      }, () => {
        this.props.afterClose(params);
      });
    }, 501)
  };

  /**
   * 如果内部有params参数，则传出至afterClose方法
   * @param params
   */
  setParams = (params) => {
        this.props.afterClose(params);
  };

  /**
   * 根据传入的show值进行判断是否显示
   * @param nextProps
   */
  componentWillReceiveProps(nextProps){
    nextProps.show !== this.state.showFlag && (nextProps.show ? this.show() : this.close());
  }

  render(){
    return (
      <div>
        <div className={this.props.hasMask && this.state.showFlag ? 'slide-mask' : 'hide'} onClick={this.props.onClose}/>
        <div className={this.state.className} style={{width: this.props.width}}>
          <div className="slide-title">{this.props.title}<Icon type="close" className="close-icon" onClick={this.props.onClose}/></div>
          <div className="slide-content">
            {this.wrapClose(this.props.content)}
          </div>
        </div>
      </div>
    )
  }
}

SlideFrame.propTypes = {
  width: React.PropTypes.string,  //宽度
  title: React.PropTypes.string,  //标题
  show: React.PropTypes.bool,  //是否显示
  hasMask: React.PropTypes.bool,  //是否有遮罩层
  onClose: React.PropTypes.func,  //点击遮罩层或右上方x时触发的事件
  content: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.string]),  //内容component，包裹后的元素添加this.props.close方法进行侧滑关闭
  afterClose: React.PropTypes.func,  //关闭后触发的事件，用于更新外层的show值
  params: React.PropTypes.object  //外部传入内部组件props
};

SlideFrame.defaultProps = {
  onClose: ()=>{},
  okText: '保存',
  cancelText: '取消',
  hasMask: true,
  afterClose: ()=>{},
  params: {}
};

export default SlideFrame
