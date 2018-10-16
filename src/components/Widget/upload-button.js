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
 * @params uploadHandle: 获取上传文件的OID
 */
const customPanelStyle = {
  border: 0,
};
class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      OIDs: [],
      previewVisible: false,
      previewImage: "",
      defaultListTag: true,
      activeKey: "1"
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultFileList.length && this.state.defaultListTag) {
      this.setState({
        fileList: nextProps.defaultFileList,
        OIDs: nextProps.defaultOIDs
      }, () => {
        this.setState({ defaultListTag: false })
      })
    }
  }

  reset = () => {
    this.setState({
      fileList: [],
      OIDs: []
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
    this.setState({ activeKey: "1" })
    if (this.props.disabled) {
      return;
    }
    if (info.file.size / 1024 / 1024 > 3) return;
    this.setState({ defaultListTag: false });
    const fileNum = parseInt(`-${this.props.fileNum}`);
    let fileList = info.fileList;
    let OIDs = this.state.OIDs;
    fileList = fileList.slice(fileNum);
    this.setState({ fileList }, () => {
      const status = info.file.status;
      if (status === 'done') {

        message.success(`${info.file.name} ${this.$t({ id: "upload.success" }/*上传成功*/)}`);
        OIDs.push(info.file.response.attachmentOID);
        OIDs = OIDs.slice(fileNum);
        this.setState({ OIDs }, () => {
          this.props.uploadHandle(this.state.OIDs)
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
    let OIDs = this.state.OIDs;
    OIDs.map(OID => {
      OID === (info.response ? info.response.attachmentOID : info.attachmentOID) && OIDs.delete(OID);
    });
    let fileList = this.state.fileList;

    fileList.splice(index, 1);

    this.setState({ fileList, OIDs }, () => {
      this.props.uploadHandle(OIDs)
    })


    // let oid = info.response ? info.response.attachmentOID : info.attachmentOID;
    // let url = `${config.baseUrl}/api/attachments/${oid}`;
    // httpFetch.delete(url).then(res => {
    //     if (res.status === 200) {
    //         this.setState({ OIDs }, () => {
    //             this.props.uploadHandle(this.state.OIDs)
    //         });
    //         message.success(this.props.intl.this.$t({ id: "upload.delete.success" }/*附件删除成功*/));
    //     }
    // }).catch(e => {
    //     message.error(this.props.intl.this.$t({ id: "upload.delete.failure" }/*附件删除失败*/));
    // });

  };

  onChange = (value) => {
    this.setState({ activeKey: value });
  };

  //图片预览
  preview = (record) => {
    this.setState({ previewVisible: true, previewImage: record.response ? record.response.thumbnailUrl : record.thumbnailUrl })
  };


  render() {

    const { previewVisible, previewImage } = this.state;
    const upload_headers = {
      'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token')).access_token
    };
    let fileList = this.state.fileList;
    fileList.map(item => {
      let attachmentOID = item.response ? item.response.attachmentOID : item.attachmentOID;
      item["url"] = `${config.baseUrl}/api/attachments/download/${attachmentOID}?access_token=${JSON.parse(localStorage.getItem('token')).access_token}`
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
        <Collapse onChange={this.onChange} activeKey={this.state.activeKey} bordered={false} defaultActiveKey={['1']}>
          <Collapse.Panel header={upload} key="1" style={customPanelStyle}>
            {
              fileList.map((item, index) => {
                let attachmentOID = item.response ? item.response.attachmentOID : item.attachmentOID;
                let type = item.response ? item.response.fileType : item.fileType
                return (
                  <Row key={item.uid} className="file-item">
                    <Col style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} span={18}>
                      <i className="anticon anticon-paper-clip" style={{ color: item.status == "error" ? "red" : "" }} />
                      {
                        type !== 'IMAGE' ?
                          <a href={`${config.baseUrl}/api/attachments/download/${attachmentOID}?access_token=${JSON.parse(localStorage.getItem('token')).access_token}`} style={{ marginLeft: 10, color: item.status == "error" ? "red" : "" }}>{item.fileName || item.name}</a>
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

          </Collapse.Panel>
        </Collapse>
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
  defaultOIDs: PropTypes.array,  //默认上传的文件列表OID
  uploadHandle: PropTypes.func, //获取上传文件的OID
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
  defaultOIDs: [],
  multiple: false,
  disabled: false,
  uploadHandle: () => { }
  // buttonText:this.props.intl.this.$t({id: 'pay.backlash.upload'})
};

const WrappedUploadButton = Form.create()(UploadButton);

export default WrappedUploadButton;
