import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types'
import { Spin, Input, Card, Row, Col, Icon, message, Checkbox, Button } from 'antd';
const Search = Input.Search;
import 'styles/components/template/business-card-consumption-selector.scss';

import baseService from 'share/base.service';
import PropTypes from 'prop-types'

class BusinessCardConsumptionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      consumptionRecords: [],
      page: 0,
      pageSize: 10,
      selectedSum: 0,
      hasMore: true,
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {}

  //得到上个月的账单日.上个月不肯能是1号和28号以后，所以不用计算月末，日期直接-1即可
  getLastMonthBillDate = billDate => {
    let date = new Date(billDate);
    let thisYear = date.getFullYear();
    let thisMonth = date.getMonth() + 1;
    let lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    let lastDate = date.getDate() + 1;
    let lastYear = lastMonth === 12 ? thisYear - 1 : thisYear;
    return new Date(`${lastYear}-${lastMonth}-${lastDate}`).format('yyyy-MM-dd');
  };

  getList = () => {
    let { page, pageSize } = this.state;
    this.setState({ loading: true });
    baseService
      .getBusinessCardConsumptionList('CMBC', false, this.props.user.userOID, page, pageSize)
      .then(res => {
        if (res.data.success) {
          let records = res.data.rows.sort((a, b) => a.bilMon < b.bilMon || -1);
          let consumptionRecords = this.state.consumptionRecords;
          records.map(record => {
            let groupLength = consumptionRecords.length;
            if (
              groupLength === 0 ||
              consumptionRecords[groupLength - 1].endDate !== record.bilDate
            ) {
              let startDate = this.getLastMonthBillDate(record.bilDate);
              let consumptionRecord = {
                endDate: record.bilDate,
                month: new Date(record.bilDate).getMonth() + 1,
                startDate,
                records: [],
                checked: false,
              };
              consumptionRecord.records.push(record);
              consumptionRecords.push(consumptionRecord);
            } else {
              consumptionRecords[groupLength - 1].records.push(record);
            }
          });
          this.setState({
            consumptionRecords,
            page: page + 1,
            hasMore: records.length !== 0 && records.length % pageSize === 0,
          });
        }
        this.setState({ loading: false });
      });
  };

  handleCheckGroup = groupIndex => {
    let { consumptionRecords, selectedSum } = this.state;
    let target = !consumptionRecords[groupIndex].checked;
    consumptionRecords[groupIndex].checked = target;
    consumptionRecords[groupIndex].records.map(record => {
      record.checked = target;
      return record;
    });
    let length = consumptionRecords[groupIndex].records.length;
    selectedSum += target ? length : -length;
    this.setState({ consumptionRecords, selectedSum });
  };

  handleCheckItem = (groupIndex, index) => {
    let { consumptionRecords, selectedSum } = this.state;
    consumptionRecords[groupIndex].records[index].checked = !consumptionRecords[groupIndex].records[
      index
    ].checked;
    selectedSum += consumptionRecords[groupIndex].records[index].checked ? 1 : -1;
    let groupStatus = true;
    consumptionRecords[groupIndex].records.map(record => {
      groupStatus = groupStatus && record.checked;
    });
    consumptionRecords[groupIndex].checked = groupStatus;
    this.setState({ consumptionRecords, selectedSum });
  };

  handleOk = () => {
    let { consumptionRecords } = this.state;
    let result = [];
    consumptionRecords.map(group => {
      group.records.map(record => {
        record.checked && result.push(record);
      });
    });
    if (result.length < 0) {
      message.error('没有选择商务卡');
    } else {
      this.props.onSelect(result);
    }
  };

  formatTime = trxTim => {
    return `${trxTim.substr(0, 2)}:${trxTim.substr(2, 2)}:${trxTim.substr(4, 2)}`;
  };

  render() {
    const { loading, consumptionRecords, selectedSum, hasMore } = this.state;
    return (
      <div className="business-card-consumption-selector">
        <div className="business-card-container">
          {consumptionRecords.length > 0 ? (
            consumptionRecords.map((group, groupIndex) => (
              <div key={groupIndex}>
                <Row
                  className="business-card-group-item"
                  onClick={() => this.handleCheckGroup(groupIndex)}
                >
                  <Col span={2}>
                    <Checkbox checked={group.checked} />
                  </Col>
                  <Col span={22}>
                    {group.month}月账单<span className="ant-divider" />
                    {group.startDate} ~ {group.endDate}
                  </Col>
                </Row>
                {group.records.map((record, index) => (
                  <Row
                    className="business-card-item"
                    key={record.id}
                    onClick={() => this.handleCheckItem(groupIndex, index)}
                  >
                    <Col span={2}>
                      <Checkbox checked={record.checked} />
                    </Col>
                    <Col span={14}>
                      <div className="business-card-info business-card-item-time">
                        {record.trsDate} {this.formatTime(record.trxTim)}
                        {record.overTime && <span className="overtime">已逾期</span>}
                      </div>
                      <div className="business-card-info business-card-item-acp">
                        {record.acpName}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="business-card-info business-card-item-bank">
                        {record.bankName} {record.crdNum.substr(record.crdNum.length - 4, 4)}
                      </div>
                      <div className="business-card-info business-card-item-amount">
                        {record.posCurCod} {record.posCurAmt.toFixed(2)}
                      </div>
                    </Col>
                  </Row>
                ))}
              </div>
            ))
          ) : !loading ? (
            <div className="no-business-card-consumption">没有商务卡消费记录</div>
          ) : null}
          <div className="loading-footer">
            {loading ? (
              <Spin spinning={loading} />
            ) : hasMore ? (
              <div onClick={this.getList}>
                <Icon type="plus-square-o" />&nbsp;&nbsp;加载更多
              </div>
            ) : (
              '没有更多数据了'
            )}
          </div>
        </div>
        <div className="slide-footer">
          <Button onClick={this.handleOk} type="primary" disabled={selectedSum === 0}>
            确定
          </Button>
          <Button onClick={this.props.onCancel}>取消</Button>
        </div>
      </div>
    );
  }
}

BusinessCardConsumptionSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BusinessCardConsumptionSelector);
