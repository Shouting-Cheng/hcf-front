import React from 'react'
import { Form, Upload, Icon, message, Button, Collapse, Badge, Row, Col, Modal } from 'antd'
import httpFetch from 'share/httpFetch'
import config from 'config'
import "styles/components/upload-button.scss"
import PropTypes from 'prop-types';

/**
 * 上传附件组件
 * @params extensionName: 附件支持的扩展名
 * @params fileNum: 最大上传文件的数量
 * @params attachmentType: 附件类型
 * @params uploadHandle: 获取上传文件的Oid
 */
const customPanelStyle = {
  border: 0,
};
class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      Oids: [],
      previewVisible: false,
      previewImage: "",
      defaultListTag: true,
      visible: true
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultFileList.length && this.state.defaultListTag) {
      this.setState({
        fileList: nextProps.defaultFileList,
        Oids: nextProps.defaultOids
      }, () => {
        this.setState({ defaultListTag: false })
      })
    }
  }

  reset = () => {
    this.setState({
      fileList: [],
      Oids: []
    });
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
    if (this.props.disabled) {
      return;
    }
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

  handleRemove = (info, index) => {

    if (this.props.disabled) {
      message.warn(this.$t({ id: "upload.not.allowed.delete" }/*该状态不允许删除附件*/));
      return;
    }
    this.setState({ defaultListTag: false });
    let Oids = this.state.Oids;
    Oids.map(Oid => {
      Oid === (info.response ? info.response.attachmentOid : info.attachmentOid) && Oids.delete(Oid);
    });
    let fileList = this.state.fileList;

    fileList.splice(index, 1);

    this.setState({ fileList, Oids }, () => {
      this.props.uploadHandle(Oids)
    })


    // let oid = info.response ? info.response.attachmentOid : info.attachmentOid;
    // let url = `${config.baseUrl}/api/attachments/${oid}`;
    // httpFetch.delete(url).then(res => {
    //     if (res.status === 200) {
    //         this.setState({ Oids }, () => {
    //             this.props.uploadHandle(this.state.Oids)
    //         });
    //         message.success(this.props.intl.this.$t({ id: "upload.delete.success" }/*附件删除成功*/));
    //     }
    // }).catch(e => {
    //     message.error(this.props.intl.this.$t({ id: "upload.delete.failure" }/*附件删除失败*/));
    // });

  };

  //图片预览
  preview = (record) => {
    this.setState({ previewVisible: true, previewImage: record.response ? record.response.thumbnailUrl : record.thumbnailUrl })
  };


  render() {

    const { previewVisible, previewImage, visible } = this.state;

    const upload_headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    };
    let fileList = this.state.fileList;
    fileList.map(item => {
      let attachmentOid = item.response ? item.response.attachmentOid : item.attachmentOid;
      item["url"] = `${config.baseUrl}/api/attachments/download/${attachmentOid}?access_token=${sessionStorage.getItem('token')}`
    });
    let fileTotal;
    if (this.props.title === undefined) {
      fileTotal = (
        <div >{this.$t({ id: "upload.information" }/*附件信息*/)} <Badge showZero count={fileList.length} offset={[-16, 0]} style={fileList.length === 0 && { backgroundColor: '#52c41a' }} /></div>
      );
    } else {
      fileTotal = this.props.title
    }

    let upload = (
      <Upload name="file"
        action={this.props.uploadUrl}
        headers={upload_headers}
        data={this.handleData}
        fileList={fileList}
        multiple={this.props.multiple}
        disabled={this.props.disabled}
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
        onRemove={this.handleRemove}
        showUploadList={false}
        className="upload-list-inline">
        {this.props.disabled ? '' : <Button><Icon type="upload" /> {this.props.buttonText || this.$t({ id: 'constants.approvelHistory.addAttachment' })}</Button>}
      </Upload>
    );

    return (
      <div className={this.props.className || "upload-button"}>
        <Modal visible={previewVisible} footer={null} onCancel={() => { this.setState({ previewVisible: false }) }}>
          <img alt="picture is missing." style={{ width: '100%' }} src={previewImage} />
        </Modal>
        <Icon onClick={() => { this.setState({ visible: !this.state.visible }) }} type={visible ? "down" : "right"} style={{ marginRight: 10, cursor: "pointer" }} />
        {upload}
        {visible && fileList.map((item, index) => {
          let attachmentOid = item.response ? item.response.attachmentOid : item.attachmentOid;
          let type = item.response ? item.response.fileType : item.fileType
          return (
            <Row key={item.uid} className="file-item">
              <Col style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} span={18}>
                <i className="anticon anticon-paper-clip" style={{ color: item.status == "error" ? "red" : "" }} />
                {
                  type !== 'IMAGE' ?
                    <a href={`${config.baseUrl}/api/attachments/download/${attachmentOid}?access_token=${sessionStorage.getItem('token')}`} style={{ marginLeft: 10, color: item.status == "error" ? "red" : "" }}>{item.fileName || item.name}</a>
                    :
                    <a onClick={() => { this.preview(item) }} style={{ marginLeft: 10, color: item.status == "error" ? "red" : "" }}>{item.fileName || item.name}</a>
                }
              </Col>
              {!this.props.noDelete &&
                <Col span={6} style={{ textAlign: "right" }}>
                  <Icon style={{ color: item.status == "error" ? "red" : "" }} onClick={() => this.handleRemove(item, index)} type="delete" />
                </Col>
              }
            </Row>
          )
        })
        }
      </div>
    )
  }
}

UploadButton.propTypes = {
  uploadUrl: PropTypes.string,  //上传URL
  attachmentType: PropTypes.string.isRequired,  //附件类型
  extensionName: PropTypes.string,  //附件支持的扩展名
  fileNum: PropTypes.number,  //最大上传文件的数量
  defaultFileList: PropTypes.array,  //默认上传的文件列表，每项必须包含：uid，name
  defaultOids: PropTypes.array,  //默认上传的文件列表Oid
  uploadHandle: PropTypes.func, //获取上传文件的Oid
  multiple: PropTypes.bool, // 是否支持多选文件
  disabled: PropTypes.bool, // 是否禁用
  title: PropTypes.string, // Collapse 的标题
  buttonText: PropTypes.string, // 上传按钮的名称
};

UploadButton.defaultProps = {
  uploadUrl: `${config.baseUrl}/api/upload/attachment`,
  extensionName: '.rar .zip .doc .docx .pdf .jpg...',
  fileNum: 0,
  defaultFileList: [],
  defaultOids: [],
  multiple: false,
  disabled: false,
  uploadHandle: () => { }
  // buttonText:this.props.intl.this.$t({id: 'pay.backlash.upload'})
};

const WrappedUploadButton = Form.create()(UploadButton);

export default WrappedUploadButton;
