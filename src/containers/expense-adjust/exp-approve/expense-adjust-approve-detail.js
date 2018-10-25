/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react'
import { Form, Affix, Button, message, Popconfirm, Modal, Row, Col } from 'antd'
const confirm = Modal.confirm;
import { connect } from 'dva'
import ExpenseAdjustApproveCommon from 'containers/expense-adjust/exp-approve/expense-adjust-approve-common'
import { routerRedux } from 'dva/router';

import 'styles/contract/my-contract/contract-detail.scss'
import expenseAdjustService from "containers/expense-adjust/expense-adjust/expense-adjust.service"
import ApproveBar from 'widget/Template/approve-bar'
import 'styles/expense-adjust/expense-adjust-detail.scss'

class ExpenseAdjustApproveDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      headerData: {},
    }
  }

  componentDidMount() {
    this.getInfo();
  }

  //获取费用调整头信息
  getInfo = () => {
    expenseAdjustService.getExpenseAdjustHeadById(this.props.params.id).then(res => {
      this.setState({
        headerData: res.data,
      })
    })
  };

  //返回
  onCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/approval-management/approve-expense-adjust'
      })
    );
  };
  //通过
  handleApprovePass = (remark) => {
    let params = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: this.props.location.state.entityOID,
          entityType: this.props.location.state.entityType,
        }]
    };
    this.setState({passLoading:true,rejectLoading:true});
    expenseAdjustService.pass(params).then(res => {
      if (res.data.successNum) {
        message.success(this.$t({ id: "common.operate.success" }/*操作成功*/));
        this.onCancel()
      }else {
        this.setState({passLoading: false, rejectLoading: false });
        message.error(`${this.$t({ id: "common.operate.filed" }/*操作失败*/)}，${res.data.failReason[this.props.params.entityOID]}`)
      }
    }).catch(err => {
      this.setState({passLoading:false,rejectLoading:false});
      message.error(this.$t('common.operate.filed') + err.response.data.message);
    })
  };

  //驳回
  handleApproveReject = (remark) => {
    let params = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: this.props.location.state.entityOID,
          entityType: this.props.location.state.entityType,
        }]
    };
    this.setState({passLoading:true,rejectLoading:true});
    expenseAdjustService.reject(params).then(res => {
      message.success(this.$t("common.operate.success")/*操作成功*/);
      this.setState({passLoading:true,rejectLoading:true});
      this.onCancel();
    }).catch(err => {
      this.setState({passLoading:true,rejectLoading:true});
      message.error(this.$t('common.operate.filed') + err.response.data.message);
    })
  };

  render() {
    const { passLoading, rejectLoading, headerData } = this.state;
    let isConfirm = this.props.params.flag === 'approved';
    return (
      <div className="expense-adjust-detail" style={{height: '100%'}}>
        <ExpenseAdjustApproveCommon wrappedComponentRef={ref=>this.detail=ref} id={this.props.params.id} expenseAdjustTypeId={this.props.params.expenseAdjustTypeId} />
        {!isConfirm && (
          <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve" style={{marginLeft: 4}}>
            <Row>
              <Col span={17} >
                <ApproveBar
                  style={{paddingLeft: 20}}
                  passLoading={passLoading}
                  backUrl={this.state.expenseAdjust.url}
                  rejectLoading={rejectLoading}
                  handleApprovePass={this.handleApprovePass}
                  handleApproveReject={this.handleApproveReject} />
              </Col>
            </Row>
          </Affix>
        )}
        {isConfirm &&
        <Affix offsetBottom={0} className="bottom-bar-jsq" style={{marginLeft: 4}}>
          <Button onClick={this.onCancel} className="back-btn">{this.$t({ id: "common.back" }/*返回*/)}</Button>
        </Affix>}
      </div >
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  }
}

const wrappedExpenseAdjustApproveDetail = Form.create()((ExpenseAdjustApproveDetail));

export default connect(mapStateToProps, null, null, { withRef: true })((wrappedExpenseAdjustApproveDetail));

