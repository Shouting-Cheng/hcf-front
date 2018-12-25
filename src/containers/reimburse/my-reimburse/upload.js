import React from 'react'
import { Form, Upload, Icon, message } from 'antd'
const Dragger = Upload.Dragger;

import config from 'config'


/**
 * 上传附件组件
 * @params extensionName: 附件支持的扩展名
 * @params fileNum: 最大上传文件的数量
 * @params attachmentType: 附件类型
 * @params uploadHandle: 获取上传文件的Oid
 */

class UploadFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      Oids: [],
      defaultListTag: true,
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultFileList != this.state.defaultFileList) {
      this.setState({
        fileList: nextProps.defaultFileList,
        Oids: nextProps.defaultOids
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
      message.error(this.$t({ id: "upload.isLt3M" }));
    }
    return isLt3M;
  };

  handleChange = (info) => {
    if (info.file.size / 1024 / 1024 > 3) return;
    this.setState({ defaultListTag: false });
    const fileNum = parseInt(`-${this.props.fileNum}`);
    let fileList = info.fileList;
    let Oids = this.state.Oids;
    fileList = fileList.slice(fileNum);
    this.setState({ fileList }, () => {
      const status = info.file.status;
      if (status === 'done') {
        message.success(`${info.file.name} ${this.$t({ id: "upload.success" }/*上传成功*/)}`);
        Oids.push(info.file.response.attachmentOid);
        Oids = Oids.slice(fileNum);
        this.setState({ Oids }, () => {
          this.props.uploadHandle(this.state.Oids)
        })
      } else if (status === 'error') {
        message.error(`${info.file.name} ${this.$t({ id: "upload.fail" }/*上传失败*/)}`);
      }
    });
  };

  handleRemove = (info) => {

    this.setState({ defaultListTag: false });
    let Oids = this.state.Oids;

    Oids.map(Oid => {
      Oid === (info.response ? info.response.attachmentOid : info.attachmentOid) && Oids.delete(Oid);
    });
    this.setState({ Oids }, () => {
      this.props.uploadHandle(this.state.Oids)
    })
  };

  render() {

    const upload_headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
          <p className="ant-upload-text">{this.$t({ id: "upload.info" }/*点击或将文件拖拽到这里上传*/)}</p>
          <p className="ant-upload-hint">{this.$t({ id: "upload.support.extension" }/*支持扩展名*/)}：{this.props.extensionName}</p>
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
  defaultOids: React.PropTypes.array,  //默认上传的文件列表Oid
  uploadHandle: React.PropTypes.func, //获取上传文件的Oid
};

UploadFile.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  extensionName: '.rar .zip .doc .docx .pdf .jpg...',
  fileNum: 0,
  defaultFileList: [],
  defaultOids: [],
  uploadHandle: () => { }
};

const WrappedUploadFile = Form.create()((UploadFile));

export default WrappedUploadFile;
