/**
 * Created by zhouli on 18/3/19
 * Email li.zhou@huilianyi.com
 */
//我发现importer组件并不能满足我这边的需求
//1.importer是文件上传与导入错误信息在一起的组件,我要分开导入是导入，显示错误是显示错误的
//2.importer弹窗的布局是固定的那个形式，不满足这边弹窗样式

import React from 'react';
import { connect } from 'dva';
import { messages } from 'utils/utils';
import { Modal, Button, Tabs, Progress, Icon, Popover } from 'antd';
import Table from 'widget/table'
import PropTypes from 'prop-types';


//数据导入组件之后显示错误信息的弹窗
//只用来显示：错误数据需要外部传入

class ImportErrInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      errorData: '',
      errorColumns: [
        {
          title: this.$t('importer.line.number') /*行号*/,
          dataIndex: 'line',
        },
        {
          title: this.$t('importer.error.message') /*错误信息*/,
          dataIndex: 'msg',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
      ],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      errorData: nextProps.errorsList,
    });
  }

  componentWillMount() {
    this.setState({
      visible: this.props.visible,
      errorData: this.props.errorsList,
    });
  }

  exportErrInfo = () => {
    this.props.exportErrInfo();
  };

  hideImportErrInfo = () => {
    this.setState({
      visible: false,
    });
    if (this.props.cancel) {
      this.props.cancel();
    }
  };
  renderProgress = () => {
    if (this.props.progress > 0 && this.props.progress < 100) {
      return <Progress percent={this.props.progress} status="active" />;
    } else {
      return (
        <div>
          <br />
        </div>
      );
    }
  };

  renderExportBtn = () => {
    if (this.props.exportBtn) {
      return this.props.exportBtn;
    } else {
      return (
        <Button onClick={this.exportErrInfo}>
          {/*导出错误信息*/}
          {this.$t('importer.err.export.errinfo')}
        </Button>
      );
    }
  };
  render() {
    //todo
    //针对没有错误信息的时候，还需要对界面进行处理
    return (
      <div className="import-err-info-modal-wrap">
        <Modal
          closable
          width={800}
          className="import-err-info-modal"
          title={this.$t('importer.err.title')} //导入错误信息
          visible={this.state.visible}
          footer={
            <Button onClick={this.hideImportErrInfo}>
              {/*确定*/}
              {this.$t('importer.err.comfirm')}
            </Button>
          }
          onCancel={this.hideImportErrInfo}
          destroyOnClose={true}
        >
          {this.renderExportBtn()}
          {this.renderProgress()}
          <Table
            rowKey={record => record.index}
            columns={this.state.errorColumns}
            dataSource={this.state.errorData}
            pagination={false}
            bordered
          />
        </Modal>
      </div>
    );
  }
}

ImportErrInfo.propTypes = {
  progress: PropTypes.number, //进度条 百分比 传入0--100
  visible: PropTypes.bool.isRequired, //导入弹框是否可见
  title: PropTypes.string, //标题
  exportErrInfo: PropTypes.func, //点击导出错误信息的回调
  cancel: PropTypes.func, //点击关闭的回调函数
  errorsList: PropTypes.array.isRequired, //错误信息
  exportBtn: PropTypes.any, //导出错误信息的按钮
};

ImportErrInfo.defaultProps = {
  exportBtn: false,
  title: messages('importer.err.errinfo'), //错误信息
};

function mapStateToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ImportErrInfo);
