import React from 'react'
import { connect } from 'dva';
// import menuRoute from 'routes/menuRoute'
import reimburseService from 'containers/reimburse/reimburse-approve/reimburse.service'
import { Form, Affix, Button, message, Popconfirm, Modal, Row, Col } from 'antd'
const confirm = Modal.confirm;

import ReimburseDetailCommon from 'containers/reimburse/reimburse-approve/reimburse-detail-common'
import 'styles/contract/my-contract/contract-detail.scss'

import ApproveBar from 'widget/Template/approve-bar'
import { routerRedux } from 'dva/router';


class ReimburseDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      submitAble: false,
      headerData: {},
      submitLoading: false,
    //   myReimburse: menuRoute.getRouteItem('approve-my-reimburse', 'key'),
    }
  }

  componentWillMount() {
    this.getInfo();
    console.log(this.props)
  }

  //获取报账单信息
  getInfo = () => {
    reimburseService.getReimburseDetailById(this.props.match.params.id).then(res => {
      this.setState({
        headerData: res.data
      });
    });
  }

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
      }

      if (res.data.code && res.data.code == "BUD_003") {
        confirm({
          title: '提示',
          content: res.data.message,
          onOk() {
            this.submit(true);
          },
          onCancel() {
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
      message.error("网络错误，请稍后重试！");
    })
  };

  //提交
  submit = (flag) => {
    let params = {
      id: this.state.headerData.id,
      ignoreBudgetWarningFlag: flag ? flag : null
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
      message.error(`${this.$t({ id: "common.operate.filed" }/*操作失败*/)}，${e.response.data.message}`)
    })
  };

  //通过
  handleApprovePass = (remark) => {
    let params = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: this.state.headerData.expenseReportOID,
          entityType: 801001
        }]
    };
    reimburseService.approvePass(params).then(res => {
      message.success('操作成功！');
      this.onCancel();
    }).catch(err => {
      message.error("操作失败：" + err.response.data.message);
    })
  }

  //驳回
  handleApproveReject = (remark) => {
    let params = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: this.state.headerData.expenseReportOID,
          entityType: 801001
        }]
    };
    reimburseService.approveReject(params).then(res => {
      message.success('操作成功！');
      this.onCancel();
    }).catch(err => {
      message.error("操作失败：" + err.response.data.message);
    })
  }

  onCancel = () => {
    // this.context.router.push(this.state.myReimburse.url);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/approval-management/approval-my-reimburse`,
      })
    );
  };

  render() {
    const { loading, dLoading, submitAble, headerData, submitLoading } = this.state;
    return (
      <div >
        <ReimburseDetailCommon getInfo={this.getInfo} headerData={headerData} id={this.props.match.params.id}
          getContractStatus={this.getStatus} />
        {
          this.props.match.params.flag === 'unapproved' ? <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
            <Row>
              <Col span={18}>
                <ApproveBar passLoading={loading}
                  style={{paddingLeft: 20}}
                  backUrl={`/approval-management/approval-my-reimburse`}
                  rejectLoading={dLoading}
                  handleApprovePass={this.handleApprovePass}
                  handleApproveReject={this.handleApproveReject} />
              </Col>
            </Row>
          </Affix> :
          <Affix offsetBottom={0} style={{
            position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
            boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px', zIndex: 1
          }}>
            <Button style={{marginLeft: 33}} loading={loading} onClick={this.onCancel} className="back-btn">{this.$t({ id: "common.back" }/*返回*/)}</Button>
          </Affix>
        }
      </div>
    )
  }
}



const wrappedReimburseDetail = Form.create()((ReimburseDetail));

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })((wrappedReimburseDetail));

//export default wrappedContractDetail;
