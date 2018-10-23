/**
 * Created by 13576 on 2018/1/25.
 */
import React from 'react';
import { connect } from 'dva'
import { Collapse, Timeline, Spin, Row, Col } from 'antd';
import { messages} from "utils/utils"
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
              model.text = this.$t({id:"common.create"}/*新建*/);
          } else if (value.operation === 1002) {
              model.color = "blue";
              model.text = this.$t({id:"acp.submit"}/*提交*/);
          } else if (value.operation === 1003) {
              model.color = "orange";
              model.text = this.$t({id:"acp.return"}/*撤回*/);
          } else if (value.operation === 1004) {
              model.color = "green";
              model.text = this.$t({id:"acp.approved"}/*审批通过*/);
          } else if (value.operation === 1005) {
              model.color = "red";
              model.text = this.$t({id:"acp.rejected"}/*审批驳回*/);
          } else if (value.operation === 6001) {
          model.color = "yellow";
            model.text = messages('my.zan.gua');   //暂挂中
        } else if (value.operation === 6002) {
          model.color = "red";
            model.text = messages('common.cancel');   //已取消
        } else if (value.operation === 6003) {
          model.color = "green";
            model.text = messages('my.contract.state.finish');     //已完成
          model.color = "green";
            model.text = messages('my.contract.cancel.hold');  //取消暂挂
        } else {
          model.color = "grey";
            model.text = messages('expense.invoice.type.unknown');   //未知
        }; break;
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
              <Collapse.Panel header={this.$t({id:"acp.approve.history"}/*审批历史*/)}  key="1">
                <div style={{ paddingTop: 10, paddingLeft: 15 }}>
                  {this.props.infoData.length ? (<Timeline>
                    {this.getHistory()}
                  </Timeline>) : (<div style={{ textAlign: "center" }}>{this.$t({id:"acp.no.data"}/*暂无数据*/)}</div>)}
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

export default (ApproveHistoryWorkFlow);


