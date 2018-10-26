import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import { Form, Affix, Button,Card,message, Popconfirm, Modal, Row, Col } from 'antd'
const confirm = Modal.confirm;
import ReimburseReviewDetailCommon from 'containers/reimburse/reimburse-review/reimburse-detail-common'
import 'styles/contract/my-contract/contract-detail.scss'
import ApproveBar from 'components/Widget/Template/approve-bar'

class ReimburseReviewDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      headerData: {},
      passLoading: false,
      rejectLoading: false,
      //reimburseView: menuRoute.getRouteItem('reimburse-review', 'key'),    //我的合同审核
    }
  }

  componentWillMount() {
    this.getInfo();
  }

  //获取报账单信息
  getInfo = () => {
    reimburseService.getReimburseBasicDetailById(this.props.match.params.id).then(res => {
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


  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/reimburse-review`,
      })
    );
  };

  //通过
  handleApprovePass = (remark) => {
    this.setState({ passLoading: true });
    reimburseService.auditAccounting(this.state.headerData.id, 'APPROVE', remark).then(res => {
      if (res.status === 200) {
        if ("SUCCESS" === res.data) {
          message.success("审核成功！");
          this.setState({ passLoading: false });
          this.onCancel()
        } else {
          this.setState({ passLoading: false });
          message.error("审核失败，" + res.data);
        }
      } else {
        this.setState({ passLoading: false });
      }
    }).catch(e => {
      this.setState({ passLoading: false });
      message.error(`审核失败，${e.response.data.message}`)
    })
  };

  //不通过
  handleApproveReject = (remark) => {
    this.setState({ rejectLoading: true });
    reimburseService.auditAccounting(this.state.headerData.id, 'REJECT', remark).then(res => {
      if (res.status === 200) {
        if ("SUCCESS" === res.data) {
          message.success("拒绝成功！");
          this.setState({ rejectLoading: false });
          this.onCancel()
        } else {
          this.setState({ rejectLoading: false });
          message.error("审核失败，" + res.data);
        }
      } else {
        this.setState({ rejectLoading: false });
      }
    }).catch(e => {
      this.setState({ rejectLoading: false });
      message.error(`拒绝失败，${e.response.data.message}`)
    })
  };

  render() {
    const { headerData, passLoading, rejectLoading } = this.state;
    return (
      <div className="contract-detail" style={{ margin: '10px -6px',borderTop:'1px solid #ececec' }}>
        <ReimburseReviewDetailCommon getInfo={this.getInfo} headerData={headerData} id={this.props.match.params.id}
          getContractStatus={this.getStatus} />
        {
          (!headerData.auditFlag && headerData) ? <Affix offsetBottom={2} className="bottom-bar bottom-bar-approve">

            <ApproveBar backUrl={"/financial-management/reimburse-review"} passLoading={passLoading}
              rejectLoading={rejectLoading}
              style={{paddingLeft: 80,paddingRight:220}}
              handleApprovePass={this.handleApprovePass}
              handleApproveReject={this.handleApproveReject} />
          </Affix> : (<Affix offsetBottom={2} className="bottom-bar">
            <Button onClick={this.onCancel} className="back-btn">{this.$t({ id: "common.back" }/*返回*/)}</Button>
          </Affix>)
        }
      </div>
    )
  }
}
const wrappedReimburseReviewDetail = Form.create()(ReimburseReviewDetail);
function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedReimburseReviewDetail);
