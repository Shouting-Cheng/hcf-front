import React from 'react';

import { Form, Upload, Icon, message } from 'antd';
const Dragger = Upload.Dragger;
import PropTypes from 'prop-types';
import config from 'config';
import { connect } from 'dva';

/**
 * 上传附件组件
 * @params extensionName: 附件支持的扩展名
 * @params fileNum: 最大上传文件的数量
 * @params attachmentType: 附件类型
 * @params uploadHandle: 获取上传文件的OID
 */

class UploadFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      OIDs: [],
      defaultListTag: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultFileList.length && this.state.defaultListTag) {
      this.setState(
        {
          fileList: nextProps.defaultFileList,
          OIDs: nextProps.defaultOIDs,
        },
        () => {
          this.setState({ defaultListTag: false });
        }
      );
    }
  }

  handleData = () => {
    return {
      attachmentType: this.props.attachmentType,
    };
  };

  beforeUpload = file => {
    const isLt3M = file.size / 1024 / 1024 <= 3;
    if (!isLt3M) {
      message.error(this.$t('upload.isLt3M'));
    }
    return isLt3M;
  };

  handleChange = info => {
    if (info.file.size / 1024 / 1024 > 3) return;

    this.setState({ defaultListTag: false });
    const fileNum = parseInt(`-${this.props.fileNum}`);
    let fileList = info.fileList;
    let OIDs = this.state.OIDs;
    fileList = fileList.slice(fileNum);
    this.setState({ fileList }, () => {
      const status = info.file.status;
      if (status === 'done') {
        message.success(`${info.file.name} ${this.$t('upload.success') /*上传成功*/}`);
        OIDs.push(info.file.response.attachmentOID);
        OIDs = OIDs.slice(fileNum);
        this.setState({ OIDs }, () => {
          this.props.uploadHandle(
            this.props.needAllResponse ? this.state.fileList : this.state.OIDs
          );
        });
      } else if (status === 'error') {
        message.error(`${info.file.name} ${this.$t('upload.fail') /*上传失败*/}`);
      }
    });
  };

  handleRemove = info => {
    this.setState({ defaultListTag: false });
    let OIDs = this.state.OIDs;
    let fileList = this.state.fileList;
    OIDs.map(OID => {
      OID === (info.response ? info.response.attachmentOID : info.attachmentOID) &&
        OIDs.delete(OID);
    });
    fileList.map(item => {
      (item.response ? item.response.attachmentOID : item.attachmentOID) ===
        (info.response ? info.response.attachmentOID : info.attachmentOID) && fileList.delete(item);
    });
    this.setState({ OIDs }, () => {
      this.props.uploadHandle(this.props.needAllResponse ? this.state.fileList : this.state.OIDs);
    });
  };

  render() {
    const upload_headers = {
      Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
    };
    return (
      <div className="upload">
        <Dragger
          name="file"
          action={this.props.uploadUrl}
          headers={upload_headers}
          data={this.handleData}
          fileList={this.state.fileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
          style={{ padding: '20px 0' }}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">{this.$t('upload.info') /*点击或将文件拖拽到这里上传*/}</p>
          <p className="ant-upload-hint">
            {this.$t('upload.support.extension') /*支持扩展名*/}：{this.props.extensionName}
          </p>
        </Dragger>
      </div>
    );
  }
}

UploadFile.propTypes = {
  uploadUrl: PropTypes.string, //上传URL
  attachmentType: PropTypes.string.isRequired, //附件类型
  extensionName: PropTypes.string, //附件支持的扩展名
  fileNum: PropTypes.number, //最大上传文件的数量
  defaultFileList: PropTypes.array, //默认上传的文件列表，每项必须包含：uid，name
  defaultOIDs: PropTypes.array, //默认上传的文件列表OID
  needAllResponse: PropTypes.bool, //是否返回上传文件的所有内容，为false时只返回OID
  uploadHandle: PropTypes.func, //获取上传文件的OID
};

UploadFile.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  extensionName: '.rar .zip .doc .docx .pdf .jpg...',
  fileNum: 0,
  defaultFileList: [],
  defaultOIDs: [],
  needAllResponse: false,
  uploadHandle: () => { },
};

function mapStateToProps(state) {
  return {
    //authToken: window.sessionStorage.getItem('token')
  };
}

const WrappedUploadFile = Form.create()(UploadFile);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedUploadFile);
