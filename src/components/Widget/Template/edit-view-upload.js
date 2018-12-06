import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import SearchArea from 'widget/search-area';
import moment from 'moment';
import PropTypes from 'prop-types';

import { Upload, Modal, Affix, Button, Icon, message } from 'antd';
class EditViewUpload extends Component {
  /**
   * 初始化
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      //上传文件list
      fileList: this.props.defaultFileList,
      //预览
      previewVisible: false,
      previewImage: '',
    };
  }
  componentWillReceiveProps = nextProps => {
    if (this.props.visible === true && nextProps.visible === false) {
      this.setState({ fileList: [] });
    }
    if (this.props.visible === false && nextProps.visible === true) {
      //在每次打开附件弹窗时，获取附件数据
      //判断附件数据是否有uid，如果没有的话，就自己拼接所需数据
      let tempFileList = [];
      nextProps.defaultFileList.map(item => {
        if (!item.uid) {
          // item.response = item;
          item.uid = item.attachmentOID;
          item.name = item.fileName;
          item.status = 'done';
          item.type = item.fileType;
          item.thumbUrl = item.thumbnailUrl;
          tempFileList.push(item);
        } else {
          tempFileList.push(item);
        }
      });
      this.setState({ fileList: nextProps.defaultFileList });
    }
  };
  /**
   * 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。注意：IE9 不支持该方法。
   */
  beforeUpload = file => {
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error(this.$t({ id: 'upload.isLt3M' }));
    }
    return isLt3M;
  };
  /**
   * onChange
   * 每次附件数据有变，则把新添加的附件数据加到fileList里
   */
  onUploadChange = info => {
    this.setState({
      fileList: info.fileList,
    });
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 附件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 附件上传失败`);
    }
  };
  /**
   * 确定事件
   * 把当前的fileList传回给调用附件弹窗的组件，以供使用
   */
  onUploadOk = () => {
    this.props.onOk({ fileList: this.state.fileList });
  };
  /**
   * 预览事件
   */
  onUploadPreview = file => {
    //判断该文件是什么类型的
    if (file.type.slice(0, 5).toLowerCase() === 'image') {
      this.setState({
        previewVisible: true,
        previewImage: file.thumbnailUrl ? file.thumbnailUrl : file.response.thumbnailUrl,
      });
    } else {
      this.a.href = `${config.baseUrl}/api/attachments/download/${
        file.attachmentOID ? file.attachmentOID : file.response.attachmentOID
        }?access_token=${sessionStorage.getItem('token')}`;
      this.a.click();
    }
  };
  /**
   * 预览取消
   */
  previewCancel = () => {
    this.setState({
      previewVisible: false,
    });
  };
  /**
   * 渲染
   */
  render() {
    //弹窗
    const { visible, onCancel } = this.props;
    //附件
    const {
      uploadUrl,
      multiple,
      attachmentType,
      disabled,
      listType,
      name,
      showUploadList,
      defaultFileList,
    } = this.props;
    const upload_headers = {
      //JSON.parse(localStorage.getItem('hly.token')).access_token
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    };
    const { fileList } = this.state;
    const footer = disabled ? { footer: ' ' } : {};
    //预览
    const { previewImage, previewVisible } = this.state;
    return (
      <Modal
        title="附件"
        bodyStyle={{ height: '50vh' }}
        visible={visible}
        onOk={this.onUploadOk}
        onCancel={onCancel}
        {...footer}
        className="list-selector"
      >
        <Upload
          action={uploadUrl}
          headers={upload_headers}
          data={{ attachmentType: attachmentType }}
          multiple={multiple}
          disabled={disabled}
          name={name}
          listType={listType}
          beforeUpload={this.beforeUpload}
          showUploadList={showUploadList}
          onChange={this.onUploadChange}
          fileList={fileList}
          onPreview={this.onUploadPreview}
        >
          <Affix
            style={{
              marginTop: '15px',
              width: '88%',
              position: 'absolute',
              top: '50px',
              zIndex: '1',
            }}
            offsetTop={0}
          >
            <Button disabled={disabled}>
              <Icon type="upload" />上传附件
            </Button>
          </Affix>
        </Upload>
        <a ref={a => (this.a = a)} />
        <Modal
          bodyStyle={{ height: '50vh' }}
          visible={previewVisible}
          footer={null}
          onCancel={this.previewCancel}
          closable={false}
        >
          <img alt="pictures" style={{ width: '100%', height: '100%' }} src={previewImage} />
        </Modal>
      </Modal>
    );
  }
}
/**
 * defaultProps
 */
EditViewUpload.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/static/attachment`,
  defaultFileList: [],
  onChange: () => { },
  maxNum: 9,
  multiple: false,
  disabled: false,
  listType: 'picture',
  name: 'file',
  showUploadList: true,
};
/**
 * PropTypes
 */
EditViewUpload.propTypes = {
  //弹窗
  visible: PropTypes.bool, //对话框是否可见
  onCancel: PropTypes.func, //点击取消后的回调
  //附件上传
  multiple: PropTypes.bool, //是否可以一次选择多个文件
  attachmentType: PropTypes.string.isRequired, //附件类型
  disabled: PropTypes.bool, //附件上传按钮是否禁用,控制是编辑附件还是查看附件
  listType: PropTypes.string, //上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card
  name: PropTypes.string, //发到后台的文件参数名
  showUploadList: PropTypes.bool, //是否展示 uploadList
  defaultFileList: PropTypes.array, //默认已经上传的文件列表
};
/**
 * router
 */

/**
 * redux
 */
function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(EditViewUpload);
