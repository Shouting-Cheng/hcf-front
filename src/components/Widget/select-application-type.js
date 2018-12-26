import React, { Component } from "react"
import { Select, Modal, Row, Col, Input, Pagination } from "antd"
import config from "config"
import httpFetch from "share/httpFetch"
import { connect } from "dva"

class SelectApplcationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      applicationTypes: [],
      selectedId: 0
    }
  }

  componentDidMount() {

    let parmas = { setOfBooksId: this.props.company.setOfBooksId };
    httpFetch.get(`${config.expenseUrl}/api/expense/types/chooser/query`, parmas).then(res => {

      let applicationTypes = [];

      applicationTypes = [...applicationTypes, ...res.data];

      this.setState({ applicationTypes: applicationTypes.slice(0, 20) });
    });
  }

  //下拉框获取焦点
  onDropdownVisibleChange = (value) => {
    if (value) {
      this.setState({ visible: true });
    }
  }

  //确定
  handleOk = () => {
     
  }

  //取消
  handleCancel = () => {

  }

  select = (item) => {
    this.setState({selectedId: item.id});
  }

  render() {
    const { visible, applicationTypes } = this.state;
    return (
      <div>
        <Select onDropdownVisibleChange={this.onDropdownVisibleChange}></Select>
        <Modal
          title="申请类型"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          bodyStyle={{ padding: "24px 100px"   }}
          width="50%">
          <div>
            <Row gutter={40}>
              <Col span={12}>
                <Select style={{ width: "100%" }}></Select>
              </Col>
              <Col span={12}>
                <Input.Search></Input.Search>
              </Col>
            </Row>
            <div style={{ marginTop: 20, height: 400, cursor: "pointer", overflow: "hidden" }}>
              <Row gutter={20}>
                {applicationTypes.map((item, index) => {
                  return (
                    <Col onClick={() => this.select(item)} key={index} span={6}>
                      <div style={{ border: "1px solid #ccc", padding: "10px 20px", margin: "10px 0", display: "flex", overflow: "hidden", height: 60, boxSizing: "border-box" }}>
                        <img src={item.iconUrl} style={{ width: 40, height: 40, marginRight: 10, flex: "0 0 40px" }} />
                        <span style={{flex: "1", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>{item.name}</span>
                      </div>
                    </Col>
                  )
                })}
              </Row>
            </div>
            <div style={{ textAlign: "right", margin: "10px 0" }}>
              <Pagination size="small" defaultCurrent={1} total={50} />
            </div>
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