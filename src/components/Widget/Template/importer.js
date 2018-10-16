import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { Modal, Button, Tabs, Upload, Icon, message, Table } from 'antd';
const TabPane = Tabs.TabPane;
import httpFetch from 'share/httpFetch';
//import FileSaver from 'file-saver';
import PropTypes from 'prop-types';

//数据导入组件
class Importer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      fileList: [],
      uploading: false,
      tabKey: 'UPDATE',
      result: {},
      transactionID: null,
      errorColumns: [
        { title: this.$t('importer.line.number') /*行号*/, dataIndex: 'index', width: '13%' },
        { title: this.$t('importer.error.message') /*错误信息*/, dataIndex: 'error' },
      ],
      errorData: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible != nextProps.visible) {
      this.setState({ visible: nextProps.visible, tabKey: 'UPDATE' });
    }
    if (nextProps.tabKey) {
      this.setState({ tabKey: nextProps.tabKey });
    }
  }

  handleOk = () => {
    const { tabKey, fileList } = this.state;
    //在导入tab下为上传
    if (tabKey === 'UPDATE') {
      if (!fileList || fileList.length === 0) {
        message.error(this.$t('importer.import.please.selectInfo') /*请选择文件后，再导入*/);
        return;
      }
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append('file', file);
      });
      this.setState({
        uploading: true,
      });
      //导入数据
      httpFetch
        .post(this.props.uploadUrl, formData, { 'Content-type': 'multipart/form-data' })
        .then(res => {
          if (this.props.isImporterResultDom) {
            let result = this.props.callBackResult(res.data);
            this.setState({
              tabKey: 'SUCCESS',
              fileList: [],
              uploading: false,
              resultDom: result.resultDom,
            });
            return;
          }

          if (this.props.listentSwitch) {
            this.setState({
              fileList: [],
              tabKey: 'SUCCESS',
              uploading: false,
              result: { successEntities: 1 },
            });
            this.props.onOk(
              res.data.transactionID ||
                res.data.transactionOID ||
                res.data.transactionUUID ||
                res.data
            );
            message.success(this.$t('importer.import.success', { total: 1 }) /*导入成功*/);
          } else {
            this.setState(
              {
                transactionID:
                  res.data.transactionID ||
                  res.data.transactionOID ||
                  res.data.transactionUUID ||
                  res.data,
              },
              () => {
                this.listenStatus();
              }
            );
          }
        })
        .catch(() => {
          this.setState({ uploading: false });
          message.error(this.$t('importer.import.error.info') /*导入失败，请重试*/);
        });
    } else {
      this.props.onOk(this.state.transactionID);
      this.setState({
        visible: false,
        tabKey: 'UPDATE',
      });
    }
  };

  //监听导入状态：PARSING_FILE(1001), PROCESS_DATA(1002), DONE(1003), ERROR(1004), CANCELLED(1005)
  listenStatus = () => {
    httpFetch
      .get(`${this.props.listenUrl}/${this.state.transactionID}`)
      .then(res => {
        if (res.data.status === 1004) {
          this.setState({ uploading: false });
          message.error(this.$t('importer.import.error.info') /*导入失败，请重试*/);
        } else if (res.data.status !== 1003) {
          setTimeout(() => {
            this.listenStatus();
          }, 1000);
        } else {
          this.setState(
            {
              fileList: [],
              tabKey: 'SUCCESS',
              uploading: false,
              result: res.data,
            },
            () => {
              let errorData = [];
              let errors = this.state.result.errors;
              Object.keys(errors).map(error => {
                errors[error].map(index => {
                  errorData.push({ index, error });
                });
              });
              errorData.sort((a, b) => a.index > b.index);
              errorData = errorData.slice(0, 10);
              this.setState({ errorData });
            }
          );
        }
      })
      .catch(() => {
        this.setState({ uploading: false });
        message.error(this.$t('importer.import.error.info') /*导入失败，请重试*/);
      });
  };

  showImporter = () => {
    this.setState({ visible: true, tabKey: 'UPDATE' });
  };

  onCancel = () => {
    this.setState({ visible: false, uploading: false });
    if (this.state.transactionID) {
      httpFetch.delete(
        `${config.budgetUrl}/api/budget/batch/transaction/logs/${this.state.transactionID}`
      );
    }
  };

  //下载导入模板
  downloadTemplate = () => {
    let hide = message.loading(this.$t('importer.spanned.file') /*正在生成文件..*/);
    httpFetch
      .get(this.props.templateUrl, {}, {}, { responseType: 'arraybuffer' })
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        let name = this.props.fileName;
        FileSaver.saveAs(b, `${name}.xlsx`);
        hide();
      })
      .catch(() => {
        message.error(this.$t('importer.download.error.info') /*下载失败，请重试*/);
        hide();
      });
  };

  //下载错误信息
  downloadErrors = () => {
    let hide = message.loading(this.$t('importer.spanned.file') /*正在生成文件..*/);
    let url = this.props.errorUrl + `/${this.state.transactionID}`;
    httpFetch
      .get(url, {}, {}, { responseType: 'arraybuffer' })
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        let name = this.$t('importer.error.message') /*错误信息*/;
        FileSaver.saveAs(b, `${name}.xlsx`);
        hide();
      })
      .catch(() => {
        hide();
        message.error(
          this.$t(
            'importer.template.download.error.info'
          ) /*错误信息下载失败，请检查导入模板是否正确*/
        );
      });
  };

  //只能上传一个文件
  handleChange = info => {
    let fileList = info.fileList;
    fileList = fileList.reverse().slice(-1);
    this.setState({ fileList });
  };

  render() {
    const { title, uploadUrl } = this.props;

    const { visible, uploading, tabKey, result, errorColumns, errorData } = this.state;
    const props = {
      action: uploadUrl,
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      fileList: this.state.fileList,
      onChange: this.handleChange,
    };

    return (
      <Modal
        className="importer"
        visible={visible}
        onCancel={this.onCancel}
        onOk={this.handleOk}
        afterClose={this.props.afterClose}
        title={title}
        confirmLoading={uploading}
        okText={
          tabKey === 'UPDATE'
            ? this.$t('importer.import') /*导入*/
            : this.$t('importer.finish') /*完 成*/
        }
        cancelText={this.$t('common.cancel') /*取消*/}
      >
        <Tabs
          defaultActiveKey="UPDATE"
          activeKey={tabKey}
          onChange={key => {
            this.setState({ tabKey: key });
          }}
        >
          <TabPane
            tab={this.$t('importer.upload.file') /*上传文件*/}
            key="UPDATE"
            disabled={tabKey === 'SUCCESS'}
          >
            {this.props.createTableShow && (
              <div>
                <h3>{this.$t('importer.create.excel') /*创建电子表格*/}</h3>
                <Button size="small" type="primary" onClick={this.downloadTemplate}>
                  {this.$t('importer.download.excel') /*下载Excel电子表格*/}
                </Button>
                <br />
                1.{this.$t('importer.click.button') /*点击上方按钮*/}
                <br />
                2.{this.$t(
                  'importer.check.template.info'
                ) /*严格按照导入模板整理数据，检查必输事项是否缺少数据*/}
                <br />
                3.{this.$t('importer.save.file') /*保存文件*/}
                <br />
                <br />
              </div>
            )}
            <h3>{this.$t('importer.upload.excel') /*上传电子表格*/}</h3>
            1.{this.$t('importer.click.button.choose.file') /*点击【选择文件】按钮*/}
            <br />
            2.{this.$t(
              'importer.choose.excel.and.click.button'
            ) /*选择你刚更新过的Excel文件，并点击确定*/}
            <br />
            3.{this.$t('importer.click.button.import') /*点击【导入】按钮*/}
            <br />
            <br />
            <Upload {...props}>
              <Button>
                <Icon type="upload" /> {this.$t('importer.choose.file') /*选择文件*/}
              </Button>
            </Upload>
          </TabPane>
          <TabPane
            tab={this.$t('importer.import.result') /*导入结果*/}
            key="SUCCESS"
            disabled={tabKey === 'UPDATE'}
          >
            <div>
              {this.$t('importer.import.success', {
                total: result.successEntities || 0,
              }) /*导入成功：{total}条*/}
            </div>
            <div>
              {this.$t('importer.import.fail', {
                total: result.failureEntities || 0,
              }) /*导入失败：{total}条*/}
              {result.failureEntities ? (
                <span style={{ fontSize: 12, marginLeft: 10 }}>
                  （{this.$t('importer.again.import') /*请修改相应数据后，重新导入*/}）
                </span>
              ) : (
                ''
              )}
            </div>
            {result.failureEntities > 10 ? (
              <div style={{ marginTop: 10 }}>
                <Icon type="exclamation-circle-o" style={{ marginRight: 5, color: 'red' }} />
                {this.$t('importer.fail.over.ten') /*导入失败超过10条，请下载错误信息查看详情*/}
              </div>
            ) : (
              ''
            )}
            {result.failureEntities ? (
              <div>
                <a
                  style={{ display: 'block', textAlign: 'right', marginBottom: 6 }}
                  onClick={this.downloadErrors}
                >
                  {this.$t('importer.download.error') /*下载错误信息*/}
                </a>
                <Table
                  rowKey={record => record.index}
                  columns={errorColumns}
                  dataSource={errorData}
                  pagination={false}
                  scroll={{ x: false, y: 170 }}
                  bordered
                  size="small"
                />
              </div>
            ) : (
              ''
            )}
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

Importer.propTypes = {
  visible: PropTypes.bool, //导入弹框是否可见
  templateUrl: PropTypes.string, //模版下载接口
  uploadUrl: PropTypes.string, //上传接口
  listenUrl: PropTypes.string, //监听上传状态接口，不需要写transactionID变量
  errorUrl: PropTypes.string, //错误信息下载接口，不需要写transactionID变量
  title: PropTypes.string, //标题
  fileName: PropTypes.string, //下载文件名
  onOk: PropTypes.func, //导入成功回调
  tabKey: PropTypes.string, //导入文件||导入结果页
  callBackResult: PropTypes.func, //导入结果通知
  isImporterResultDom: PropTypes.bool, //是否定制化导入结果DOM
  downFileExtension: PropTypes.string, //下载模板文件后缀
  afterClose: PropTypes.func, //关闭后的回调
};

Importer.defaultProps = {
  title: '导入',
  fileName: '导入文件',
  listenUrl: `${config.budgetUrl}/api/budget/batch/transaction/logs`,
  createTableShow: true, //创建表格示例是否显示
  listentSwitch: false, //上传文件后直接回调
  onOk: () => {},
  afterClose: () => {},
};

function mapStateToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(Importer);
