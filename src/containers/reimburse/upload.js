import React from 'react'
import { Form, Upload, Icon, message } from 'antd'
const Dragger = Upload.Dragger;

import config from 'config'
import {formatMessage} from "share/common"

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
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultFileList != this.state.defaultFileList) {
      this.setState({
        fileList: nextProps.defaultFileList,
        OIDs: nextProps.defaultOIDs
      }, () => {
        this.setState({ defaultListTag: false })
      })
    }
  }

  handleData = () => {
    return {
      attachmentType: this.props.attachmentType
    };
  };

  beforeUpload = (file) => {
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error(formatMessage({ id: "upload.isLt3M" }));
    }
    return isLt3M;
  };

  handleChange = (info) => {
    if (info.file.size / 1024 / 1024 > 3) return;
    this.setState({ defaultListTag: false });
    const fileNum = parseInt(`-${this.props.fileNum}`);
    let fileList = info.fileList;
    let OIDs = this.state.OIDs;
    fileList = fileList.slice(fileNum);
    this.setState({ fileList }, () => {
      const status = info.file.status;
      if (status === 'done') {
        message.success(`${info.file.name} ${formatMessage({ id: "upload.success" }/*上传成功*/)}`);
        OIDs.push(info.file.response.attachmentOID);
        OIDs = OIDs.slice(fileNum);
        this.setState({ OIDs }, () => {
          this.props.uploadHandle(this.state.OIDs)
        })
      } else if (status === 'error') {
        message.error(`${info.file.name} ${formatMessage({ id: "upload.fail" }/*上传失败*/)}`);
      }
    });
  };

  handleRemove = (info) => {

    this.setState({ defaultListTag: false });
    let OIDs = this.state.OIDs;

    OIDs.map(OID => {
      OID === (info.response ? info.response.attachmentOID : info.attachmentOID) && OIDs.delete(OID);
    });
    this.setState({ OIDs }, () => {
      this.props.uploadHandle(this.state.OIDs)
    })
  };

  render() {

    const upload_headers = {
      'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('hly.token')).access_token
    };
    return (
      <div className="upload">
        <Dragger name="file"
          action={this.props.uploadUrl}
          headers={upload_headers}
          data={this.handleData}
          fileList={this.state.fileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
          style={{ padding: '20px 0' }}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">{formatMessage({ id: "upload.info" }/*点击或将文件拖拽到这里上传*/)}</p>
          <p className="ant-upload-hint">{formatMessage({ id: "upload.support.extension" }/*支持扩展名*/)}：{this.props.extensionName}</p>
        </Dragger>
      </div>
    )
  }
}

UploadFile.propTypes = {
  uploadUrl: React.PropTypes.string,  //上传URL
  attachmentType: React.PropTypes.string.isRequired,  //附件类型
  extensionName: React.PropTypes.string,  //附件支持的扩展名
  fileNum: React.PropTypes.number,  //最大上传文件的数量
  defaultFileList: React.PropTypes.array,  //默认上传的文件列表，每项必须包含：uid，name
  defaultOIDs: React.PropTypes.array,  //默认上传的文件列表OID
  uploadHandle: React.PropTypes.func, //获取上传文件的OID
};

UploadFile.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  extensionName: '.rar .zip .doc .docx .pdf .jpg...',
  fileNum: 0,
  defaultFileList: [],
  defaultOIDs: [],
  uploadHandle: () => { }
};

const WrappedUploadFile = Form.create()((UploadFile));

export default WrappedUploadFile;
