/**
 * Created by 13576 on 2018/1/25.
 */
import React from 'react';
import { Collapse, Timeline, Spin, Row, Col } from 'antd';
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
          model.text = this.$t( 'common.new'  /*新建*/);
        } else if (value.operation === 1002) {
          model.color = 'blue';
          model.text = this.$t('acp.payment.payment'  /*提交*/);
        } else if (value.operation === 1003) {
          model.color = 'orange';
          model.text = this.$t( 'acp.return'  /*撤回*/);
        } else if (value.operation === 1004) {
          model.color = 'green';
          model.text = this.$t( 'acp.approved' /*审批通过*/);
        } else if (value.operation === 1005) {
          model.color = 'red';
          model.text = this.$t('acp.rejected'  /*审批驳回*/);
        } else if (value.operation === 6001) {
          model.color = 'yellow';
          model.text = '暂挂中';
        } else if (value.operation === 6002) {
          model.color = 'red';
          model.text = '已取消';
        } else if (value.operation === 6003) {
          model.color = 'green';
          model.text = '已完成';
        } else if (value.operation === 6004) {
          model.color = 'green';
          model.text = '取消暂挂';
        } else if (value.operation === 9001) {
          model.color = 'DarkViolet';
          model.text = this.$t( 'acp.payment.payment' /*支付*/);
        } else if (value.operation === 9002) {
          model.color = 'SkyBlue';
          model.text = this.$t('acp.payment.return'  /*退款*/);
        } else if (value.operation === 9003) {
          model.color = 'DeepPink';
          model.text = this.$t( 'acp.payment.refund'  /*退票*/);
        } else if (value.operation === 9004) {
          model.color = 'OrangeRed';
          model.text = this.$t( 'acp.payment.reserved'  /*反冲*/);
        } else {
          model.color = 'grey';
          model.text = '未知';
        }
        break;

      case 1001:
        if (value.operation === 1001) {
          model.color = 'blue';
          model.text = this.$t('acp.submit'  /*提交*/);
        } else if (value.operation === 1002) {
          model.color = 'orange';
          model.text = this.$t('acp.return'  /*撤回*/);
        } else if (value.operation === 5004) {
          model.color = 'blue';
          model.text = '还款提交';
        } else if (value.operation === 2001) {
          model.color = 'green';
          model.text = '审批通过';
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = '添加会签';
        }
        break;
      case 1002:
        if (value.operation === 2001) {
          model.color = 'green';
          model.text = this.$t('acp.approved'  /*审批通过*/);
        } else if (value.operation === 2002) {
          model.color = 'red';
          model.text = this.$t( 'acp.rejected'  /*审批驳回*/);
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = '添加会签';
        }
        break;
      case 1003:
        if (value.operation === 3001) {
          model.color = 'green';
          model.text = '审批通过';
        } else if (value.operation === 4001) {
          model.color = 'grey';
          model.text = '财务付款';
        } else if (value.operation === 3002) {
          model.color = 'grey';
          model.text = '添加会签';
        } else if (value.operation === 4001) {
          model.color = 'grey';
          model.text = '财务付款';
        } else if (value.operation === 4000) {
          model.color = 'grey';
          model.text = '财务付款中';
        } else if (value.operation === 7001) {
          model.color = 'grey';
          model.text = '核定金额修改';
        } else if (value.operation === 7002) {
          model.color = 'grey';
          model.text = '核定汇率修改';
        } else if (value.operation === 7003) {
          model.color = 'grey';
          model.text = '核定金额和汇率修改';
        } else if (value.operation === 5009) {
          model.color = 'grey';
          model.text = '添加会签';
        }
        break;
      case 1004:
        if (value.operation === 4011) {
          model.color = 'green';
          model.text = '开票通过';
        } else if (value.operation === 4002) {
          model.color = 'red';
          model.text = '开票驳回';
        } else if (value.operation === 3002) {
          model.color = 'grey';
          model.text = '添加会签';
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
        <div className="approve-history">
          <div className="collapse">
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Collapse.Panel header={this.$t('acp.approve.history' /*审批历史*/)} key="1">
                <div style={{ paddingTop: 10, paddingLeft: 15 }}>
                  {this.props.infoData.length ? (
                    <Timeline>{this.getHistory()}</Timeline>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      {this.$t({ id: 'acp.no.data' } /*暂无数据*/)}
                    </div>
                  )}
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>
      </Spin>
    );
  }
}
ApproveHistoryWorkFlow.propTypes = {
  infoData: PropTypes.array.isRequired, //传入的基础信息值
  loading: PropTypes.bool, //是否显示正在加载中图标
};

ApproveHistoryWorkFlow.defaultProps = {
  infoData: [],
  loading: false,
};

export default ApproveHistoryWorkFlow;
