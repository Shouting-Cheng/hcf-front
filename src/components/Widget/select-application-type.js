import React, { Component } from "react"
import { Select, Modal, Row, Col, Input, Pagination, Spin, Icon } from "antd"
import config from "config"
import httpFetch from "share/httpFetch"
import { connect } from "dva"

class SelectApplcationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      applicationTypes: [],
      selected: {},
      result: {},
      pageSize: 20,
      current: 1,
      total: 0,
      loading: false
    }
  }

  getList = () => {
    let { current, pageSize } = this.state;
    let parmas = { applicationTypeId: this.props.applicationTypeId, page: current - 1, size: pageSize };
    this.setState({ loading: true });
    httpFetch.get(`${config.expenseUrl}/api/expense/application/type/query/expense/type`, parmas).then(res => {
      let applicationTypes = [];
      applicationTypes = [...applicationTypes, ...res.data];
      this.setState({ applicationTypes: applicationTypes, total: Number(res.headers["x-total-count"]), loading: false });
    });
  }

  //下拉框获取焦点
  onDropdownVisibleChange = (value) => {
    if (value) {
      this.setState({ visible: true, selected: this.props.value, current: 1, total: 0 }, this.getList);
    }
  }

  //确定
  handleOk = () => {
    this.props.onChange && this.props.onChange(this.state.selected);
    this.setState({ visible: false });
  }

  //取消
  handleCancel = () => {
    this.setState({ visible: false, selected: {} });
  }

  select = (item) => {
    this.setState({ selected: item });
  }

  //页面改变
  pageChange = (current) => {
    this.setState({ current }, () => {
      this.getList();
    })
  }

  after = () => {
    let {current} = this.state;
    current--;
    this.setState({current}, this.getList);
  }

  next = () => {
    let {current} = this.state;
    current++;
    this.setState({current}, this.getList);
  }

  render() {
    const { visible, applicationTypes, selected, current, pageSize, total, loading } = this.state;
    return (
      <div>
        <Select value={this.props.value.name} onDropdownVisibleChange={this.onDropdownVisibleChange}></Select>
        <Modal
          title="申请类型"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          bodyStyle={{ padding: "24px 0px" }}
          width="50%">
          <div>
            <Row style={{ padding: "0 80px" }} gutter={20}>
              <Col span={12}>
                <Row>
                  <Col style={{ textAlign: "right", paddingRight: 10 }} span={8}>
                    <label style={{ lineHeight: "30px" }}>大类:</label>
                  </Col>
                  <Col span={16}>
                    <Select style={{ width: "100%" }}></Select>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col style={{ textAlign: "right", paddingRight: 10 }} span={8}>
                    <label style={{ lineHeight: "30px" }}>名称:</label>
                  </Col>
                  <Col span={16}>
                    <Input.Search></Input.Search>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Spin spinning={loading}>
              <div style={{ marginTop: 20, height: 400, overflow: "hidden", position: "relative" }}>
                <Row style={{ padding: "0 80px" }} gutter={20}>
                  {applicationTypes.map((item, index) => {
                    return (
                      <Col onClick={() => this.select(item)} key={index} span={6}>
                        <div style={{
                          border: "1px solid #ccc", cursor: "pointer", padding: "10px 12px", margin: "10px 0", display: "flex", overflow: "hidden", height: 60, boxSizing: "border-box",
                          backgroundColor: item.id == selected.id ? "rgba(204, 235, 248, 1)" : "#fff"
                        }}>
                          <img src={item.iconUrl} style={{ width: 40, height: 40, marginRight: 10, flex: "0 0 40px" }} />
                          <span style={{ flex: "1", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.name}</span>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
                {current > 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: 24, display: "flex", alignItems: "center" }}>
                  <Icon onClick={this.after} style={{ fontSize: 32, color: "#ccc", cursor: "pointer"  }} type="left" />
                </div>}
                {(current * pageSize < total) && <div style={{ position: "absolute", top: 0, bottom: 0, right: 24, display: "flex", alignItems: "center" }}>
                  <Icon onClick={this.next} style={{ fontSize: 32, color: "#ccc", cursor: "pointer"  }} type="right" />
                </div>}
              </div>
              {<div style={{ textAlign: "right", margin: "10px 0", padding: "0 80px" }}>
                <Pagination showTotal={total => `共 ${total} 条数据`} onChange={this.pageChange} current={current} size="small" pageSize={pageSize} total={total} />
              </div>}
            </Spin>
          </div>
        </Modal>
      </div>
    )
  }
}

function map(state) {
  return {
    company: state.user.company
  }
}

export default connect(map)(SelectApplcationType)