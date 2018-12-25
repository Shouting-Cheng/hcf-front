import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { Modal, Button, Tabs, Upload, Icon, message, Steps, Timeline } from 'antd';
import { Selector } from 'widget/index';

const Step = Steps.Step;
import httpFetch from 'share/httpFetch';
// import expenseService from 'containers/my-account/expense.service';
import PropTypes from 'prop-types';

import FileSaver from 'file-saver';
import configureStore from '../../../../index';

//数据导入组件
class ExternalExpenseImport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      fileList: [],
      uploading: false,
      tabKey: 'UPDATE',
      result: {},
      transactionID: null,
      formOid: null,
      expenseTypeId: undefined,
      expenseTypeName: '',
      errorColumns: [
        { title: this.$t('importer.line.number') /*行号*/, dataIndex: 'index', width: '13%' },
        { title: this.$t('importer.error.message') /*错误信息*/, dataIndex: 'error' },
      ],
      currentStep: 0,
      errorData: [],
      option: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ visible: nextProps.visible, tabKey: 'UPDATE' });
  }

  handleOk = () => {
    const { tabKey } = this.state;
    //在导入tab下为上传
    if (tabKey === 'UPDATE') {
      const { fileList } = this.state;
      const formData = new FormData();

      if (!this.state.expenseTypeId) {
        message.warn(this.$t('expense.please.select.expense.type'));
        // 请选择费用类型
        return;
      }
      if (fileList && fileList.length < 1) {
        message.warn(this.$t('expense-report.ex.expense.import.upload.template.tip'));
        // 请上传模版
        return;
      }

      fileList.forEach(file => {
        formData.append('file', file);
      });
      formData.append('claimOid', this.props.expenseReportOid);
      formData.append('expenseTypeId', this.state.expenseTypeId);
      formData.append('ownerOid', this.props.userOid);
      this.setState({
        uploading: true,
      });

      // expenseService
      //   .invoiceTemplateUpload(formData)
      //   .then(res => {
      //     this.setState({
      //       fileList: [],
      //       tabKey: 'SUCCESS',
      //       uploading: false,
      //       result: { successEntities: 1 },
      //     });
      //     this.props.onOk();
      //   })
      //   .catch(() => {
      //     this.setState({ uploading: false });
      //     message.error(this.$t('importer.import.error.info') /*导入失败，请重试*/);
      //   });
    } else {
      this.props.onOk('close');
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
    if (this.state.uploading && this.state.transactionID) {
      httpFetch.delete(
        `${config.budgetUrl}/api/budget/batch/transaction/logs/${this.state.transactionID}`
      );
    }
  };

  //下载导入模板
  downloadTemplate = () => {
    let hide = message.loading(this.$t('importer.spanned.file') /*正在生成文件..*/);
    // expenseService
    //   .invoiceTemplateDown(this.state.expenseTypeId)
    //   .then(res => {
    //     let b = new Blob([res.data], {
    //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     });
    //     let name = this.state.option.children + new Date().format('yyyyMMddhhmmss');
    //     FileSaver.saveAs(b, `${name}.xlsx`);
    //     this.setState({ currentStep: 2 });
    //     hide();
    //   })
    //   .catch(() => {
    //     message.error(this.$t('importer.download.error.info') /*下载失败，请重试*/);
    //     hide();
    //   });
  };
  //选择费用类型回调
  selectExpenseTypeCallBack = (changedValue, option) => {
    this.setState({ expenseTypeId: changedValue });
    if (changedValue) {
      this.setState({ currentStep: 1, option: option });
    } else {
      this.setState({ currentStep: 0, option: {} });
    }
  };

  //只能上传一个文件
  handleChange = info => {
    let fileList = info.fileList;
    fileList = fileList.reverse().slice(-1);
    this.setState({ fileList });
  };

  render() {
    const { title, uploadUrlKey, expenseReportOid, formOid, userOid, applicationOid } = this.props;

    const {
      visible,
      uploading,
      tabKey,
      result,
      errorColumns,
      errorData,
      currentStep,
      expenseTypeId,
    } = this.state;
    const props = {
      action: uploadUrlKey,
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
        if (this.setState.currentStep === 2 || this.setState.currentStep === 1) {
          this.setState({ currentStep: 3 });
        }
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
        <Steps direction="vertical" size="small" current={currentStep}>
          <Step
            title={this.$t('expense-report.ex.expense.import.select.type') /*选择费用类型*/}
            description={
              <div style={{ width: '50%' }}>
                <Selector
                  onChange={this.selectExpenseTypeCallBack}
                  type="externalExpense"
                  placeholder={this.$t('expense-report.ex.expense.import.select') /*'请输入选择'*/}
                  params={{ formOid: formOid, userOid: userOid, applicationOid: applicationOid }}
                />
              </div>
            }
          />
          <Step
            title={
              this.$t(
                'expense-report.ex.expense.import.download.template.format'
              ) /*"下载模板并严格按照格式填写"*/
            }
            description={
              <Button
                size="small"
                type="primary"
                onClick={this.downloadTemplate}
                disabled={!expenseTypeId}
              >
                {this.$t('expense-report.ex.expense.import.download.template') /*下载模板*/}
              </Button>
            }
          />
          <Step
            title={
              this.$t(
                'expense-report.ex.expense.import.upload.template.format'
              ) /* "上传模板请确认与【1】中所选的费用类型一致"*/
            }
            description={
              <Upload
                {...props}
                accept={
                  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
              >
                <Button>
                  <Icon type="upload" />{' '}
                  {this.$t('expense-report.ex.expense.import.upload.template') /* 上传模板 */}
                </Button>
              </Upload>
            }
          />
        </Steps>
      </Modal>
    );
  }
}

ExternalExpenseImport.propTypes = {
  visible: PropTypes.bool, //导入弹框是否可见
  templateUrl: PropTypes.string, //模版下载接口
  uploadUrlKey: PropTypes.string, //上传接口
  listenUrl: PropTypes.string, //监听上传状态接口，不需要写transactionID变量
  errorUrl: PropTypes.string, //错误信息下载接口，不需要写transactionID变量
  title: PropTypes.string, //标题
  fileName: PropTypes.string, //下载文件名
  onOk: PropTypes.func, //导入成功回调
  afterClose: PropTypes.func, //关闭后的回调
  expenseReportOid: PropTypes.string, //报销单oid
  formOid: PropTypes.string, //表单oid
  userOid: PropTypes.string, //用户Oid
};

ExternalExpenseImport.defaultProps = {
  title: '导入',
  fileName: '导入文件',
  listenUrl: '',
  createTableShow: true, //创建表格示例是否显示
  listentSwitch: true, //上传文件后直接回调
  expenseReportOid: null,
  formOid: null,
  userOid: null,
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
)(ExternalExpenseImport);
