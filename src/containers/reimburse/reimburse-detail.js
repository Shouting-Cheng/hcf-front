import React from 'react'
import { connect } from 'react-redux';
import menuRoute from 'routes/menuRoute'
import reimburseService from 'containers/reimburse/reimburse.service'
import { Form, Affix, Button, message, Popconfirm, Modal } from 'antd'
const confirm = Modal.confirm;

import ReimburseDetailCommon from 'containers/reimburse/reimburse-detail-common'
import 'styles/contract/my-contract/contract-detail.scss'
import { formatMessage } from "share/common"

class ReimburseDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      submitAble: false,
      headerData: {},
      submitLoading: false,
      myReimburse: menuRoute.getRouteItem('my-reimburse', 'key'),    //我的报账单
    }
  }

  componentWillMount() {
    this.getInfo();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.params.flag&&!this.props.params.flag){
      this.getInfo(nextProps.params.id)
    }
  }

  //获取报账单信息
  getInfo = (id) => {
    reimburseService.getReimburseDetailById(id||this.props.params.id).then(res => {
      this.setState({
        headerData: res.data
      });
    });
  };

  //获取合同状态
  getStatus = (status) => {
    if (status === 1001 || status === 1005 || status === 1003) {
      this.setState({ submitAble: true })
    }
  };

  //提交
  onSubmit = () => {

    // let data = {
    //   id: this.props.params.id,
    //   ignoreBudgetWarningFlag: false
    // };

    // reimburseService.submit(data).then(res => {
    //   message.success("提交成功！");
    //   this.setState({ submitLoading: false });
    // }).catch(err => {
    //   message.error("提交失败：" + err.response.data.message);
    //   this.setState({ submitLoading: false });
    // });

    this.setState({ submitLoading: true });
    reimburseService.checkBudget(this.props.params.id).then(res => {

      if (res.data.passFlag) {
        this.submit(true);
        return;
      }

      if (res.data.code && res.data.code == "BUD_003") {
        confirm({
          title: '提示',
          content: res.data.message,
          onOk: () => {
            this.submit(true);
          },
          onCancel: () => {
            this.setState({ submitLoading: false });
          }
        });
      }
      else if (res.data.code && res.data.code == "BUD_002") {
        message.error(res.data.message);
        this.setState({ submitLoading: false });
      }
      else if (res.data.code && res.data.code == "BUD_000") {
        this.submit(false);
      }
    }).catch(err => {
      this.setState({ submitLoading: false });
      message.error("提交失败：" + err.response.data.message);
    })
  };

  //提交
  submit = (flag) => {
    let params = {
      id: this.state.headerData.id,
      ignoreBudgetWarningFlag: flag
    };
    reimburseService.submit(params).then(res => {
      message.success("提交成功！");
      this.setState({ submitLoading: false });
      this.onCancel();
    }).catch(err => {
      message.error("提交失败：" + err.response.data.message);
      this.setState({ submitLoading: false });
    })
  }

  //删除
  onDelete = () => {
    this.setState({ dLoading: true });
    reimburseService.deleteExpReportHeader(this.props.params.id).then(res => {
      message.success("删除成功！");
      this.onCancel();
    }).catch(e => {
      this.setState({ dLoading: false });
      message.error(`${formatMessage({ id: "common.operate.filed" }/*操作失败*/)}，${e.response.data.message}`)
    })
  };

  //取消
  onCancel = () => {
    this.context.router.push(this.state.myReimburse.url);
  };

  render() {
    const { loading, dLoading, submitAble, headerData, submitLoading } = this.state;
    const isEdit = headerData.reportStatus == 1001 || headerData.reportStatus == 1003 || headerData.reportStatus == 1005;
    return (
      <div className="contract-detail background-transparent">
        <ReimburseDetailCommon getInfo={this.getInfo} headerData={headerData} id={this.props.params.id}
          getContractStatus={this.getStatus} />
        {isEdit && (
          <Affix offsetBottom={0} className="bottom-bar">
            <Button type="primary" onClick={this.onSubmit} loading={submitLoading} style={{ margin: '0 20px' }}>
              {formatMessage({ id: "my.contract.submit" }/*提 交*/)}
            </Button>
            <Popconfirm placement="top" title={"确认删除？"} onConfirm={this.onDelete} okText="确定" cancelText="取消">
              <Button loading={dLoading}>删除</Button>
            </Popconfirm>
            <Button style={{ marginLeft: '40px' }} onClick={this.onCancel}>{formatMessage({ id: "common.back" }/*返回*/)}</Button>
          </Affix>
        )}
        {this.props.params.refund ? '' : !isEdit && (
          <Affix offsetBottom={0} className="bottom-bar">
            <Button style={{ marginLeft: '30px' }} onClick={this.onCancel}>{formatMessage({ id: "common.back" }/*返回*/)}</Button>
          </Affix>
        )}
      </div>
    )
  }
}

ReimburseDetail.contextTypes = {
  router: React.PropTypes.object
};

const wrappedReimburseDetail = Form.create()((ReimburseDetail));

function mapStateToProps(state) {
  return {
    user: state.login.user,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })((wrappedReimburseDetail));

//export default wrappedContractDetail;
