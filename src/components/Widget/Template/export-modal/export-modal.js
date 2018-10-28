/**
 * Created by zhouli on 18/6/25
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Modal, Button, Progress, Icon } from 'antd';

import 'styles/components/template/export-modal/export-modal.scss';
import ExportService from 'widget/Template/export-modal/export-modal.service';
import FileSaver from 'file-saver';

class ExportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: null,
      visible: false,
      step: 'pending', //error,success
      progressNum: 0,
      errorDetail: '',
      path: '',
      isCancel: false,
    };
  }

  componentWillMount() { }

  componentDidMount() { }

  exportInfo = () => {
    let timestamp = Date.parse(new Date());
    switch (this.props.exportType) {
      case 'COST_CENTER_GROUP_ASSIGN': {
        //成本中心组
        let param = {
          exportType: this.props.exportType,
          command: this.props.exportCommand,
          timestamp: timestamp,
        };
        ExportService.exportInfo(param, this.props.exportCondition)
          .then(res => {
            this.exportInfoProgress(param);
          })
          .catch(err => { });
        break;
      }
      case 'USER': {
        //用户
        let param = {
          exportType: this.props.exportType,
          command: this.props.exportCommand,
          timestamp: timestamp,
        };
        ExportService.exportInfo(param, this.props.exportCondition)
          .then(res => {
            this.exportInfoProgress(param);
          })
          .catch(err => { });
        break;
      }
      case 'COST_CENTER_ITEM': {
        //用户
        let param = {
          exportType: 'COSTCENTERITEM',
          command: this.props.exportCommand,
          timestamp: timestamp,
        };
        ExportService.exportInfo(param, this.props.exportCondition)
          .then(res => {
            this.exportInfoProgress(param);
          })
          .catch(err => { });
        break;
      }
      case 'REPORT': {
        //报表导出与其他不大一样，注意一点
        //command是报表代码reportCode
        // "exportType": "REPORT",
        //报表
        //用户
        let param = {
          exportType: this.props.exportCondition.exportType,
          command: this.props.exportCondition.command,
          timestamp: timestamp,
        };

        this.props.exportCondition.timestamp = timestamp;
        ExportService.exportInfoForReport(param, this.props.exportCondition)
          .then(res => {
            this.exportInfoProgressForReport(param);
          })
          .catch(err => { });
        break;
      }
      case 'DEPARTMENT_POSITION_USER': {
        //导出部门角色
        let param = {
          exportType: 'DEPARTMENT_POSITION_USER',
          command: this.props.exportCommand,
          timestamp: timestamp,
        };
        ExportService.exportInfo(param, this.props.exportCondition)
          .then(res => {
            this.exportInfoProgress(param);
          })
          .catch(err => { });
        break;
      }
    }
  };

  exportInfoProgress = param => {
    ExportService.exportInfoProgress(param)
      .then(res => {
        this.setState({
          progressNum: parseInt(res.data.progress),
          path: '',
        });
        if (res.data.status === 'S') {
          clearInterval(this.state.timer);
          this.setState(
            {
              step: 'success',
              path: res.data.path,
            },
            () => {
              // this.downloadByPath(res.data.path)
            }
          );
        } else if (res.data.status === 'E') {
          clearInterval(this.state.timer);
          this.setState({
            step: 'error',
            path: '',
            errorDetail: res.data.errorDetail,
          });
        } else {
          clearInterval(this.state.timer);
          let that = this;
          this.state.timer = setInterval(function () {
            that.exportInfoProgress(param);
          }, 2000);
        }
      })
      .catch(err => {
        clearInterval(this.state.timer);
        this.setState({
          step: 'error',
          path: '',
        });
      });
  };

  //自动下载
  downloadByPath = path => {
    window.open(this.state.path, '_blank');
    //get请求path
    //返回res
    // ExportService.getFileByPath(path)
    //   .then((res)=>{
    //     let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    //     let name = this.props.exportTitle;
    //     FileSaver.saveAs(b, `${name}.xlsx`);
    //   })
    //   .catch((err)=>{
    //   })
  };

  setInitState = () => {
    clearInterval(this.state.timer);
    this.setState(
      {
        visible: true,
        progressNum: 0,
        path: '',
        step: 'pending',
      },
      () => {
        this.exportInfo();
      }
    );
  };
  //取消下载
  handleCancel = () => {
    clearInterval(this.state.timer);
    this.setState({
      visible: false,
      isCancel: true,
    });
  };

  //重新下载
  reload = () => {
    clearInterval(this.state.timer);
    this.setState(
      {
        visible: true,
        step: 'pending',
      },
      () => {
        this.exportInfo();
      }
    );
  };
  //关闭
  handleClose = () => {
    clearInterval(this.state.timer);
    this.setState({
      visible: false,
    });
  };

  renderContentByStep = step => {
    switch (step) {
      case 'pending': {
        return (
          <div className="step-pending">
            <div className="title-wrap">
              <div>
                {/*数据加载中...*/}
                {this.$t('export.modal.start.title')}
              </div>
            </div>
            <div className="progress-wrap">
              <Progress percent={this.state.progressNum} status="active" />
            </div>
            <div className="loading-tip">
              <div>
                {/*请勿关闭或者离开当前页面，否则将导致下载失败*/}
                {this.$t('export.modal.tip')}
              </div>
            </div>
            <div className="btn-wrap">
              <Button type="primary" onClick={this.handleCancel}>
                {/*取消下载*/}
                {this.$t('export.modal.cancel.download')}
              </Button>
            </div>
          </div>
        );
        break;
      }
      case 'success': {
        return (
          <div className="step-success">
            <div className="title-wrap">
              <div>
                <Icon className="icon-success" type="check-circle" />
                {/*加载成功，请点击下载*/}
                {this.$t('export.modal.load.success')}
              </div>
            </div>
            <div className="progress-wrap">
              <Progress percent={this.state.progressNum} status="active" />
            </div>
            <div className="btn-wrap">
              {/*<a href={this.state.path} target="_blank" className="download-btn">*/}
              {/*/!*下载*!/*/}
              {/*{this.$t("export.modal.download")}*/}
              {/*</a>*/}
              <Button type="primary" onClick={this.downloadByPath}>
                {/*下载*/}
                {this.$t('export.modal.download')}
              </Button>
              &nbsp; &nbsp;&nbsp;
              <Button onClick={this.handleClose}>
                {/*关闭*/}
                {this.$t('export.modal.close')}
              </Button>
            </div>
          </div>
        );
        break;
      }
      case 'error': {
        return (
          <div className="step-error">
            <div className="title-wrap">
              <div>
                <Icon className="icon-error" type="close-circle" />
                {/*加载失败，请重试*/}
                {this.$t('export.modal.load.error')}
              </div>
            </div>
            <div className="progress-wrap">
              <Progress percent={50} status="active" />
            </div>

            <div className="loading-tip">
              <div>{this.state.errorDetail}</div>
            </div>

            <div className="btn-wrap">
              <Button type="primary" onClick={this.reload}>
                {/*重新下载*/}
                {this.$t('export.modal.reload')}
              </Button>
              &nbsp; &nbsp;&nbsp;
              <Button type="primary" onClick={this.handleClose}>
                {/*关闭*/}
                {this.$t('export.modal.close')}
              </Button>
            </div>
          </div>
        );
        break;
      }
    }
  };

  render() {
    return (
      <div className="export-modal-wrap">
        {this.props.type === 'btn' ? (
          <Button
            type={this.props.btnType}
            disabled={this.props.disabled}
            onClick={this.setInitState}
          >
            {this.props.exportTitle}
          </Button>
        ) : (
            <div onClick={this.setInitState}>{this.props.exportTitle}</div>
          )}

        <Modal
          width={500}
          maskClosable={false}
          closable={false}
          keyboard={false}
          className="export-modal-wrap-modal"
          title={null}
          destroyOnClose={true}
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <div className="export-modal">{this.renderContentByStep(this.state.step)}</div>
        </Modal>
      </div>
    );
  }
}

ExportModal.propTypes = {
  onConfirm: PropTypes.func, // 点击确认之后的回调：返回结果
  onCancel: PropTypes.func, //点击取消的时候
  exportTitle: PropTypes.any, //导出按钮上的文本
  exportType: PropTypes.any, //导出类型
  exportCommand: PropTypes.any, //导出命令，请查看本组件的文档  readme.
  exportCondition: PropTypes.any, //条件
  type: PropTypes.any, //按钮类型，btn,text
  btnType: PropTypes.any, //按钮类型，btn,text
  disabled: PropTypes.bool, //按钮是否禁用
};

ExportModal.defaultProps = {
  type: 'text',
  disabled: false,
};

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    user: state.user.currentUser,
    tenantMode: true,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ExportModal);
