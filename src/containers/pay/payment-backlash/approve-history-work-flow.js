/**
 * Created by 13576 on 2018/1/25.
 */
import React from 'react';
import { connect } from 'dva'
import { Collapse, Timeline, Spin, Row, Col } from 'antd';
import {messages} from 'utils/utils'
import PropTypes from 'prop-types';
/**
 * 审批历史
 */
class ApproveHistoryWorkFlow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      historyData: [],
    };
  }

  getHistory() {
    const historyData = this.props.infoData;
    let children = [];
    historyData.map((item, i) => {
      children.push(
        this.getHistoryRender(item, i)
      )
    })
    return children;
  }

  getColor(value) {

    let model = {};

    switch (value.operationType) {
      case 1000:
        if (value.operation === 1001) {
          model.color = "cyan";
          model.text = messages('common.create');  //新建
        } else if (value.operation === 1002) {
          model.color = "blue";
          model.text = messages('common.submit');
          model.dot = "up-circle-o";
        } else if (value.operation === 1003) {
          model.color = "red";
          model.text = messages('common.withdraw'); //撤回
          model.dot = "down-circle-o";
        } else if (value.operation === 1004) {
          model.color = "green";
          model.text = messages('common.approve.pass');  // 审批通过
          model.dot = "check-circle-o";
        } else if (value.operation === 1005) {
          model.color = "red";
          model.text = messages('common.approve.rejected');   //审批驳回
          model.dot = "close-circle-o";
        } else if (value.operation === 6001) {
          model.color = "yellow";
          model.text = messages('my.zan.gua');   //暂挂中
        } else if (value.operation === 6002) {
          model.color = "red";
          model.text = messages('common.cancel');   //已取消
        } else if (value.operation === 6003) {
          model.color = "green";
          model.text = messages('my.contract.state.finish');     //已完成
        } else if (value.operation === 6004) {
          model.color = "green";
          model.text = messages('my.contract.cancel.hold');  //取消暂挂
        } else if (value.operation === 9001) {
          model.color = "blue";
          model.text = messages('menu.pay');   //支付
          model.dot = "pay-circle-o";
        } else if (value.operation === 9002) {
          model.color = "blue";
          model.text = messages('acp.payment.return');  //退款
          model.dot = "down-circle-o";
        } else if (value.operation === 9003) {
          model.color = "blue";
          model.text = messages('acp.payment.refund');  //退票
          model.dot = "down-circle-o";
        } else if (value.operation === 9004) {
          model.color = "blue";
          model.text = messages('acp.payment.reserved');  //反冲
          model.dot = "clock-circle-o";
        } else {
          model.color = "grey";
          model.text = messages('expense.invoice.type.unknown');   //未知
        }; break;

      case 1001:
        if (value.operation === 1001) {
          model.color = "blue";
          model.text = messages('common.submit');   //提交
          model.dot = "up-circle-o";
        } else if (value.operation === 1002) {
          model.color = "red";
          model.text = messages('common.withdraw');    //撤回
          model.dot = "down-circle-o";
        } else if (value.operation === 5004) {
          model.color = "blue";
          model.text = messages('my.return.submit');   //还款提交
          model.dot = "up-circle-o";
        } else if (value.operation === 2001) {
          model.color = "green";
          model.text = messages('common.approve.pass');   //审批通过
          model.dot = "check-circle-o";
        } else if (value.operation === 5009) {
          model.color = "grey";
          model.text = messages('my.add.hui.qian');   //添加会签
          model.dot = "check-circle-o";
        }; break;
      case 1002:
        if (value.operation === 2001) {
          model.color = "green";
          model.text = messages('common.approve.pass'); //审批通过
          model.dot = "check-circle-o";
        } else if (value.operation === 2002) {
          model.color = "red";
          model.text = messages('common.approve.rejected');  //审批驳回
          model.dot = "close-circle-o";
        } else if (value.operation === 5009) {
          model.color = "grey";
          model.text = messages('my.add.hui.qian');  //添加会签
          model.dot = "check-circle-o";
        }; break;
      case 1003:
        if (value.operation === 3001) {
          model.color = "green";
          model.text = messages('batch.print.approved');   //审核通过
          model.dot = "check-circle-o";
        } else if (value.operation === 4001) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.auditPay');   //财务付款
        } else if (value.operation === 3002) {
          model.color = "red";
          model.text = messages('constants.documentStatus.audit.rejected');   //审核驳回
          model.dot = "close-circle-o";
        } else if (value.operation === 4001) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.auditPay');  //财务付款
        } else if (value.operation === 4000) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.auditPaying');  //财务付款中
        } else if (value.operation === 7001) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.amountEdit');  //核定金额修改
        } else if (value.operation === 7002) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.rateEdit');   //核定汇率修改
        } else if (value.operation === 7003) {
          model.color = "grey";
          model.text = messages('constants.approvelHistory.amountAndRateEdit');  //核定金额和汇率修改
        } else if (value.operation === 5009) {
          model.color = "grey";
          model.text = messages('my.add.hui.qian');  //添加会签
          model.dot = "close-circle-o";
        }; break;
      case 1004:
        if (value.operation === 4011) {
          model.color = "green";
          model.text = messages('constants.documentStatus.invoice.pass');  //开票通过
          model.dot = "check-circle-o";
        } else if (value.operation === 4002) {
          model.color = "red";
          model.text = messages('constants.approvelHistory.invoiceFail');  //开票驳回
        } else if (value.operation === 3002) {
          model.color = "grey";
          model.text = messages('my.add.hui.qian');
        }
    }
    return model;
  }

  getHistoryRender(item, i) {
    if (item) {
      let model = this.getColor(item);
      return (
        <Timeline.Item color={model.color} key={i}>
          <Row>
            <Col span={3}>
              <div style={{ fontWeight: 'bold' }}>{model.text}</div>
            </Col>
            <Col span={4}>
              <div style={{ color: "rgba(0,0,0,0.5)" }}>{item.lastModifiedDate}</div>
            </Col>
            <Col span={5}>
              <div style={{}}> {item.employeeName}-{item.employeeID} </div>
            </Col>
            <Col>
              <div>{item.operationDetail}</div>
            </Col>
          </Row>
        </Timeline.Item>)
    }
    return ''
  }

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <div className="approve-history">
          <div className="collapse">
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Collapse.Panel header={messages('expense.approval.history')} key="1">
                <div style={{ paddingTop: 10, paddingLeft: 15 }}>
                  {this.props.infoData.length ? (<Timeline>
                    {this.getHistory()}
                  </Timeline>) : (<div style={{ textAlign: "center" }}>{messages('acp.no.data')}</div>)}
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>
      </Spin>
    )
  }
}
ApproveHistoryWorkFlow.propTypes = {
  infoData: PropTypes.array.isRequired,  //传入的基础信息值
  loading: PropTypes.bool                //是否显示正在加载中图标
};

ApproveHistoryWorkFlow.defaultProps = {
  infoData: [],
  loading: false
};

export default ApproveHistoryWorkFlow


