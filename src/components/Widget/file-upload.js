import React from 'react';

import { Form, Upload, Icon, message, Modal, Button, Row, Col } from 'antd';
const Dragger = Upload.Dragger;
import config from 'config';
import ImageViewer from 'widget/image-viewer';
import 'styles/components/file-upload.scss';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import baseService from 'share/base.service';
import excelImage from 'images/file-type/excel.png';
import pdfImage from 'images/file-type/pdf.png';
import pptImage from 'images/file-type/ppt.png';
import txtImage from 'images/file-type/txt.png';
import wordImage from 'images/file-type/word.png';
import unknownImage from 'images/file-type/unknown.png';
import httpFetch from 'share/httpFetch';
import FileSaver from 'file-saver';

/**
 * 图片上传组件
 */
class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: [],
      result: [],
      previewIndex: 0, //预览图片的index
      modalShow: false,
      info: null,
      imageList: []
    };
  }
  componentDidMount() {
    if (this.props.defaultFileList.splice) {
      this.showDefaultFileList(this.props.defaultFileList);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isShowDefault) {
      if (nextProps.defaultFileList.splice) {
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
        url: attachment.thumbnailUrl,
        thumbnailUrl: attachment.thumbnailUrl
      });
    });
    this.setState({ fileList, result: defaultFileList });
  };

  handleData = () => {
    let date = this.props.data ? this.props.data : { attachmentType: this.props.attachmentType };
    return date;
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
        //您上传的附件已超出大小限制，请重新上传！
        message.error(
          this.$t('components.file.upload.err1', {
            name: info.file.name,
            total: this.props.fileSize,
          })
        );
        return;
      }
    }
    let fileList = info.fileList;
    fileList.map(file => {
      if (file.thumbUrl) file.url = file.thumbUrl;
    });
    this.setState({ fileList }, () => {
      const status = info.file.status;
      let { result } = this.state;
      if (status === 'done') {
        message.success(`${info.file.name} ${this.$t('upload.success' /*上传成功*/)}`);
        this.props.setResult(result, info);
        if (!fileList.some(item => item.status !== 'done')) {
          this.setState({ result });
          this.props.onChange(result);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} ${this.$t('upload.fail' /*上传失败*/)}`);
      }
    });
  };
  // 预览
  handlePreview = file => {

    let { isPreViewCallBack, handlePreViewCallBack } = this.props;

    file = file.response || file;

    if (isPreViewCallBack) {
      handlePreViewCallBack(file);
      return;
    }

    if (this.isImage(file)) {
      let imageList = [file];
      this.setState({
        previewIndex: 0,
        previewVisible: true,
        imageList
      });
    } else {
      httpFetch
        .get(`${config.baseUrl}/api/attachments/download/${file.attachmentOID}?access_token=${sessionStorage.getItem('token')}`, {}, {}, { responseType: 'arraybuffer' })
        .then(res => {
          let b = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          let name = file.fileName;
          FileSaver.saveAs(b, `${name}`);
        })
        .catch(() => {
          message.error(this.$t('importer.download.error.info') /*下载失败，请重试*/);
        });
    }
  };

  getImage = file => {
    let sections = file.fileName.split('.');
    let extension = sections[sections.length - 1];
    let imageExtension = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    let wordExtension = ['doc', 'docx'];
    let pptExtension = ['ppt', 'pptx'];
    let excelExtension = ['xls', 'xlsx'];
    let txtExtension = ['txt'];
    let pdfExtension = ['pdf'];
    if (imageExtension.has(extension)) return file.thumbnailUrl ? file.thumbnailUrl : file.fileURL;
    if (wordExtension.has(extension)) return wordImage;
    if (pptExtension.has(extension)) return pptImage;
    if (excelExtension.has(extension)) return excelImage;
    if (txtExtension.has(extension)) return txtImage;
    if (pdfExtension.has(extension)) return pdfImage;
    return unknownImage;
  };

  isImage = file => {
    let sections = (file.fileName || file.name).split('.');
    let extension = sections[sections.length - 1];
    let imageExtension = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    return imageExtension.has(extension);
  };

  closeModal = () => {
    this.setState({ modalShow: false });
  };

  deleteImage = () => {
    let { result, info, fileList } = this.state;
    let required = false;
    let attachmentOid = info.response
      ? info.response.attachmentOID
        ? info.response.attachmentOID
        : info.response.attachmentDTO.attachmentOID
      : info.attachmentOID;
    result.map((item, index) => {
      if (item.attachmentOID === attachmentOid || item.attachmentOID === info.uid) {
        required = this.props.handleDelete(item.id);
        required && result.splice(index, 1);
      }
    });
    if (required) {
      let currentFile = fileList.filter(item => item === info)[0];
      fileList.splice(fileList.indexOf(currentFile), 1);
    }
    this.setState({ result, info: null, modalShow: false, fileList });
    this.props.onChange(result);
  };

  remove = info => {
    this.setState({ modalShow: true, info: info });
    return false;
  };

  render() {
    const { previewVisible, fileList, previewIndex, result, modalShow, imageList } = this.state;
    const uploadButton = (
      <Button>
        <Icon type="upload" /> {this.$t('common.upload') /*上传*/}
      </Button>
    );

    const upload_headers = {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    };
    // let imageList = [];
    // result.map(item => this.isImage(item) && imageList.push(item));
    let size = this.props.fileSize ? this.props.fileSize : 10;
    return (
      <div className="file-upload">
        {
          <div>
            <Upload
              name="file"
              data={this.handleData}
              action={this.props.uploadUrl}
              headers={upload_headers}
              fileList={this.props.showFileName ? fileList : []}
              showUploadList={{ showRemoveIcon: !this.props.disabled }}
              onPreview={this.handlePreview}
              onChange={this.handleChange}
              onRemove={this.remove}
            >
              {fileList.length >= this.props.maxNum || this.props.disabled ? null : uploadButton}
            </Upload>
          </div>
        }
        {this.props.showMaxNum &&
          !this.props.disabled && (
            <div>
              ({this.$t('common.max.upload.attachment', {
                max: this.props.maxNum,
              }) /*最多上传 {max} 个附件*/})
            </div>
          )}
        {!this.props.disabled && (
          <div>
            <div>{this.$t('upload.size', { total: size })}</div>
          </div>
        )}
        {/* <Row type="flex" style={{ marginTop: 10 }}>
          {result.map((attachment, index) => (
            <Col
              className="attachment-block"
              key={index}
              onClick={() => this.handlePreview(attachment)}
            >
              <img src={this.getImage(attachment)} />
            </Col>
          ))}
        </Row> */}
        {imageList.length > 0 && (
          <ImageViewer
            visible={previewVisible}
            attachments={imageList}
            defaultIndex={previewIndex}
            onCancel={() => this.setState({ previewVisible: false })}
            urlKey="thumbnailUrl"
            valueKey="attachmentOID"
          />
        )}
        <Modal
          onOk={this.deleteImage}
          onCancel={this.closeModal}
          okText={this.$t('common.ok')}
          cancelText={this.$t('common.cancel')}
          visible={modalShow}
          title={this.$t('components.file.upload.operate')}
        >
          <p style={{ textAlign: 'center', fontSize: '20px', margin: '10px 0px' }}>
            {this.$t('components.file.upload.ensureDelete')}
          </p>
        </Modal>
      </div>
    );
  }
}

FileUpload.propTypes = {
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
  data: PropTypes.object, //上传接口的参数
  handleDelete: PropTypes.func, //删除附件的回调
  setResult: PropTypes.func, //上传接口返回结果保存
  showFileName: PropTypes.bool, // 是否显示文件列表名称
  isPreViewCallBack: PropTypes.bool, // 附件是否预览回调
  handlePreViewCallBack: PropTypes.func, //附件预览回调
};

FileUpload.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  defaultFileList: [],
  onChange: () => { },
  maxNum: 9,
  isShowDefault: false,
  disabled: false,
  showMaxNum: false,
  isPreViewCallBack: false,
  handleDelete: () => {
    return true;
  },
  setResult: (result, info) => {
    result.push(info.file.response);
  },
  showFileName: true,
};
function mapStateToProps(state) {
  return {

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
)(FileUpload);
