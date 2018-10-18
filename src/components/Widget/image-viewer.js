import React from 'react'
import { connect } from 'dva'
import ReactDOM from 'react-dom';
import { Modal, Icon } from 'antd'
import 'styles/financial-management/finance-audit/image-audit.scss'
import 'styles/components/image-viewer.scss'
import PropTypes from 'prop-types';

/**
 * 图片查看组件，支持放大、缩小、旋转操作
 */
class ImageViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      nowIndex: 0,
    };
    this.moving = false;  //图片移动状态
    this.startXY = {};  //图片移动前时记录xy值
  }

  componentDidMount(){
  }

  componentWillReceiveProps(nextProps) {
    this.setState({nowIndex: nextProps.defaultIndex})
  }

  onMouseMove = (e) => {
    e.stopPropagation();
    if(this.moving){
      let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
      //与记录值的偏移量
      let offsetX = e.clientX - this.startXY.X;
      let offsetY = e.clientY - this.startXY.Y;
      let originLeft = 0;
      let originTop = 0;
      let imageLeft = imageDom.style.left;
      let imageTop = imageDom.style.top;
      //取得原本left、top值
      if(imageLeft){
        originLeft = Number(imageLeft.substr(0, imageLeft.indexOf('px')));
      }
      if(imageTop){
        originTop = Number(imageTop.substr(0, imageTop.indexOf('px')));
      }
      imageDom.style.left = (originLeft + offsetX) + 'px';
      imageDom.style.top = (originTop + offsetY) + 'px';
      //设置后重制记录值
      this.startXY = {X: e.clientX, Y: e.clientY};
    }
  };

  onMouseUp = (e) => {
    e.stopPropagation();
    this.moving = false;
  };

  onMouseDown = (e) => {
    e.stopPropagation();
    this.startXY = {X: e.clientX, Y: e.clientY};
    this.moving = true;
  };

  componentWillUnmount(){

  }

  initialImageStyle = () => {
    let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
    imageDom.style.transform = '';
    imageDom.style.top = '0px';
    imageDom.style.left = '0px';
  };

  handleSelectAttachment = (index) => {
    this.setState({ nowIndex: index }, this.initialImageStyle);
  };

  handleOperateImage = (operate) => {
    let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
    let transformStyle = imageDom.style.transform;
    let rotateZ = 0, scale = 1;
    //得到rotateZ值
    transformStyle.replace(/rotateZ\(((\d+)|(-\d+))deg\)/, (target,$1) => {rotateZ = Number($1); return target});
    //得到scale值
    transformStyle.replace(/scale\(((\d+.\d+)|(\d+))\)/, (target,$1) => {scale = Number($1); return target});
    switch(operate){
      //放大，最大2
      case 'plus': {
        if(scale < 2)
          scale += 0.2;
        break;
      }
      //缩小，最小1
      case 'minus': {
        if(scale > 1)
          scale -= 0.2;
        break;
      }
      //向左旋转
      case 'left': {
        rotateZ -= 90;
        break;
      }
      //向又旋转
      case 'right': {
        rotateZ += 90;
        break;
      }
    }
    imageDom.style.transform = `rotateZ(${rotateZ}deg) scale(${scale})`
  };

  render() {
    const { nowIndex } = this.state;
    const { visible, afterClose, onCancel, attachments, urlKey, valueKey, thumbnailUrlKey } = this.props;
    return (
      <Modal className="image-view"
             visible={visible}
             afterClose={afterClose}
             footer={null}
             onCancel={onCancel}
             width={1092}>
        <div className="attachment-area">
          <img src={attachments[nowIndex][urlKey]} ref="imageRef"
               draggable={false}
               onMouseDown={this.onMouseDown}
               onMouseMove={this.onMouseMove}
               onMouseUp={this.onMouseUp}/>
        </div>
        <div className="attachment-operate">
          {nowIndex + 1}/{attachments.length}
          <div className="attachment-operate-icon">
            <Icon type="plus" onClick={() => this.handleOperateImage('plus')}/>
            <Icon type="minus" onClick={() => this.handleOperateImage('minus')}/>
            <Icon type="swap-left" onClick={() => this.handleOperateImage('left')}/>
            <Icon type="swap-right" onClick={() => this.handleOperateImage('right')}/>
          </div>
        </div>
        <div className="attachment-list">
          <div className="attachment-list-box">
            {attachments.map((file, index) => (
              <img src={file[thumbnailUrlKey]?file[thumbnailUrlKey]:file[urlKey]}
                   key={file[valueKey]}
                   className={`${index === nowIndex && 'selected-attachment'}`}
                   onClick={() => this.handleSelectAttachment(index)}/>
            ))}
          </div>
        </div>
      </Modal>
    )
  }
}

ImageViewer.propTypes = {
  visible: PropTypes.bool.isRequired,
  attachments: PropTypes.array.isRequired,
  afterClose: PropTypes.func,
  onCancel: PropTypes.func,
  urlKey: PropTypes.string,  //url字段
  thumbnailUrlKey: PropTypes.string,//缩略图URL字段
  valueKey: PropTypes.string,  //key值字段
  defaultIndex: PropTypes.number,  //默认预览图片的index
};

ImageViewer.defaultProps = {
  visible: false,
  attachments: [],
  urlKey: 'url',
  thumbnailUrlKey: 'thumbnailUrl',
  valueKey: 'uid',
  defaultIndex: 0
};

function mapStateToProps(state) {
  return {

  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ImageViewer)
