import React from 'react';

import { Form, Upload, Icon, message, Modal } from 'antd';
const Dragger = Upload.Dragger;
import config from 'config';
import ImageViewer from 'widget/image-viewer';
import 'styles/components/image-upload.scss';
import PropTypes from 'prop-types';

import { connect } from 'dva';

/**
 * 图片上传组件
 */
class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: [],
      result: [],
      previewIndex: 0, //预览图片的index
      imgIsUploading: false, //图片是否是正在上传的状态，用来解决 isShowDefault 为true时，上传过程中会出现显示两张图片的情况
    };
  }
  componentDidMount() {
    if (this.props.defaultFileList.length) {
      this.showDefaultFileList(this.props.defaultFileList);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isShowDefault) {
      if (nextProps.defaultFileList.splice && !this.state.imgIsUploading) {
        this.showDefaultFileList(nextProps.defaultFileList);
      }
    }
  }
  //为了显示默认已经上传的图片
  showDefaultFileList = defaultFileList => {
    let fileList = [];
    defaultFileList.map(attachment => {
      fileList.push({
        uid: attachment.attachmentOID,
        name: attachment.fileName,
        status: 'done',
        url: attachment.fileURL,
      });
    });
    this.setState({ fileList, result: defaultFileList });
  };

  handleData = () => {
    return {
      attachmentType: this.props.attachmentType,
    };
  };

  handleChange = info => {
    if (this.props.fileType) {
      //控制上传图片的类型
      let isFileType = false;
      this.props.fileType.map(type => {
        info.file.type === `image/${type}` && (isFileType = true);
      });
      if (!isFileType && info.file.status !== 'removed') {
        //上传失败，图片格式错误
        message.error(this.$t('components.image.upload.err1'));
        return;
      }
    }
    if (this.props.fileSize) {
      //控制上传图片的大小
      const isLtSize = info.file.size / 1024 / 1024 <= this.props.fileSize;
      if (!isLtSize && info.file.status !== 'removed') {
        //上传失败，图片应不大于 {total} M
        message.error(this.$t('components.image.upload.err2', { total: this.props.fileSize }));
        return;
      }
    }
    this.setState({ imgIsUploading: true });

    let fileList = info.fileList;
    fileList.map(file => {
      if (file.thumbUrl) file.url = file.thumbUrl;
    });
    this.setState({ fileList }, () => {
      const status = info.file.status;
      let { result } = this.state;
      if (status === 'done') {
        message.success(`${info.file.name} ${this.$t('upload.success') /*上传成功*/}`);
        result.push(info.file.response);
        this.setState({ result });
        this.props.onChange(result);
      } else if (status === 'error') {
        message.error(`${info.file.name} ${this.$t('upload.fail') /*上传失败*/}`);
      } else if (status === 'removed') {
        result.map((item, index) => {
          if (
            item.attachmentOID ===
              (info.file.response ? info.file.response.attachmentOID : info.file.attachmentOID) ||
            item.attachmentOID === info.file.uid
          )
            result.splice(index, 1);
        });
        this.setState({ result });
        this.props.onChange(result);
      }
      this.setState({ imgIsUploading: false });
    });
  };

  //预览
  handlePreview = file => {
    this.state.fileList.map((item, index) => {
      if (item.uid === file.uid) {
        this.setState({
          previewIndex: index,
          previewVisible: true,
        });
      }
    });
  };

  render() {
    const { previewVisible, fileList, previewIndex } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" style={{ fontSize: 32, color: '#999' }} />
        <div className="ant-upload-text" style={{ marginTop: 8, color: '#666' }}>
          {this.$t('common.upload') /*上传*/}
        </div>
      </div>
    );
    const upload_headers = {
      Authorization: 'Bearer ' + this.props.authToken.access_token,
    };
    return (
      <div className="image-upload">
        <div className="image-container">
          <Upload
            name="file"
            data={this.handleData}
            action={this.props.uploadUrl}
            headers={upload_headers}
            listType="picture-card"
            fileList={fileList}
            showUploadList={{ showRemoveIcon: !this.props.disabled }}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
            accept="image/*"
          >
            {fileList.length >= this.props.maxNum || this.props.disabled ? null : uploadButton}
          </Upload>
        </div>
        {this.props.showMaxNum &&
          !this.props.disabled && (
            <div>
              ({this.$t('common.max.upload.image', {
                max: this.props.maxNum,
              }) /*最多上传 {max} 张图片*/})
            </div>
          )}
        {fileList.length > 0 && (
          <ImageViewer
            visible={previewVisible}
            attachments={fileList}
            defaultIndex={previewIndex}
            onCancel={() => this.setState({ previewVisible: false })}
          />
        )}
      </div>
    );
  }
}

ImageUpload.propTypes = {
  uploadUrl: PropTypes.string, //上传URL
  attachmentType: PropTypes.string.isRequired, //附件类型
  defaultFileList: PropTypes.array, //默认上传的文件列表
  onChange: PropTypes.func, //上传成功后的回调
  maxNum: PropTypes.number, //最大上传文件的数量
  fileType: PropTypes.array, //上传文件的类型
  fileSize: PropTypes.number, //上传文件的大小
  isShowDefault: PropTypes.bool, //是否要进行回显，是否一直允许从父组件接受变化的图片列表
  disabled: PropTypes.bool, //是否禁用
  showMaxNum: PropTypes.bool, //是否显示最多上传多少图片
};

ImageUpload.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  defaultFileList: [],
  onChange: () => {},
  maxNum: 9,
  isShowDefault: false,
  disabled: false,
  showMaxNum: false,
};
function mapStateToProps(state) {
  return {
    authToken: window.localStorage.getItem('token'),
  };
}
// 注意
// defaultFileList里面的对象属性要有
//   attachmentOID,
//   fileName,
//   fileURL

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ImageUpload);
