/**
 * Created by 13576 on 2018/1/25.
 */
import React from 'react';
import { connect } from 'react-redux';
import { Collapse, Timeline, Spin, Row, Col } from 'antd';
import { messages } from 'share/common';
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
      children.push(this.getHistoryRender(item, i));
    });
    return children;
  }

  getColor(value) {
    let model = {};
    switch (value.operationType) {
      case 1000:
        if (value.operation === 1001) {
          model.color = 'cyan';
          model.text = messages('common.create');
        } else if (value.operation === 1002) {
          model.color = 'blue';
          model.text = messages('constants.approvelHistory.submit');
        } else if (value.operation === 1003) {
          model.color = 'orange';
          model.text = messages('constants.approvelHistory.withdraw');
        } else if (value.operation === 1004) {
          model.color = 'green';
          model.text = messages('constants.approvelHistory.auditPass');
        } else if (value.operation === 1005) {
          model.color = 'red';
          model.text = messages('constants.approvelHistory.approveReject');
        } else if (value.operation === 6001) {
          model.color = 'yellow';
          model.text = messages('my.zan.gua');
        } else if (value.operation === 6002) {
          model.color = 'red';
          model.text = messages('my.contract.state.cancel');
        } else if (value.operation === 6003) {
          model.color = 'green';
          model.text = messages('my.contract.state.finish');
        } else if (value.operation === 6004) {
          model.color = 'green';
          model.text = messages('my.contract.cancel.hold');
        } else {
          model.color = 'grey';
          model.text = messages('expense.invoice.type.unknown');
        }
        break;

      case 1001:
        if (value.operation === 1001) {
          model.color = 'blue';
          model.text = messages('constants.approvelHistory.submit');
        } else if (value.operation === 1002) {
          model.color = 'orange';
          model.text = messages('constants.approvelHistory.withdraw');
        } else if (value.operation === 5004) {
          model.color = 'blue';
          model.text = messages('my.return.submit');
        } else if (value.operation === 2001) {
          model.color = 'green';
          model.text = messages('constants.approvelHistory.approvePass');
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = messages('my.add.hui.qian');
        }
        break;
      case 1002:
        if (value.operation === 2001) {
          model.color = 'green';
          model.text = messages('constants.approvelHistory.approvePass');
        } else if (value.operation === 2002) {
          model.color = 'red';
          model.text = messages('constants.approvelHistory.approveReject');
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = messages('my.add.hui.qian');
        }
        break;
      case 1003:
        if (value.operation === 3001) {
          model.color = 'green';
          model.text = messages('constants.approvelHistory.approvePass');
        } else if (value.operation === 4001) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.auditPaying');
        } else if (value.operation === 3002) {
          model.color = 'grey';
          model.text = messages('my.add.hui.qian');
        } else if (value.operation === 4001) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.auditPaying');
        } else if (value.operation === 4000) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.auditPaying');
        } else if (value.operation === 7001) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.amountEdit');
        } else if (value.operation === 7002) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.rateEdit');
        } else if (value.operation === 7003) {
          model.color = 'grey';
          model.text = messages('constants.approvelHistory.amountAndRateEdit');
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = messages('my.add.hui.qian');
        }
        break;
      case 1004:
        if (value.operation === 4011) {
          model.color = 'green';
          model.text = messages('constants.documentStatus.invoice.pass');
        } else if (value.operation === 4002) {
          model.color = 'red';
          model.text = messages('constants.approvelHistory.invoiceFail');
        } else if (value.operation === 3002) {
          model.color = 'grey';
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
              <div style={{ color: 'rgba(0,0,0,0.5)' }}>{item.lastModifiedDate}</div>
            </Col>
            <Col span={5}>
              <div style={{}}>
                {' '}
                {item.employeeName}-{item.employeeID}{' '}
              </div>
            </Col>
            <Col>
              <div>{item.operationDetail}</div>
            </Col>
          </Row>
        </Timeline.Item>
      );
    }
    return '';
  }

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <div>
          <Timeline>{this.getHistory()}</Timeline>
        </div>
      </Spin>
    );
  }
}
ApproveHistoryWorkFlow.propTypes = {
  infoData: React.PropTypes.array.isRequired, //传入的基础信息值
  loading: React.PropTypes.bool, //是否显示正在加载中图标
};

ApproveHistoryWorkFlow.defaultProps = {
  infoData: [],
  loading: false,
};

export default ApproveHistoryWorkFlow;
