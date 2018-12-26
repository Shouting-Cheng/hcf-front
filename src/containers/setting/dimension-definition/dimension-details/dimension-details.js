import React, { Component } from 'react';
import { Card, Row, Col, Badge, Icon, Tabs } from 'antd';
import BasicInfo from 'widget/basic-info';
import DimensionGroup from './dimension-group';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { messages } from 'utils/utils';

const TabPane = Tabs.TabPane;
class DimensionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoList: [
        {
          type: 'input',
          id: 'code',
          isRequired: true,
          label: '维度代码',
        },
        {
          type: 'input',
          id: 'name',
          isRequired: true,
          label: '维度名称',
        },
        {
          type: 'input',
          id: 'account',
          isRequired: true,
          label: '维度账套',
        },
        {
          type: 'switch',
          id: 'enable',
          isRequired: true,
          label: '状态',
        },
      ],
      infoData: {},
      tabKey: "1"
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        infoData: {
          id: 12344,
          code: 123,
          name: '维度',
          account: 'demo',
          enable: false
        }
      })
    }, 1500)
  }

   //返回到维度定义
  onBackClick = (e) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition`,
      })
    );
  };

  // tab选项卡切换
  tabChange = (key) => {
    console.log(typeof(key))
    this.setState({ tabKey: key }, () => {

    });
  }

  render() {
    const { infoList, infoData, tabKey } = this.state;

    return (
      <div>
        <BasicInfo
          infoList={infoList}
          infoData={infoData}
          isHideEditBtn={true}
          // colSpan="6"
        />
        <Tabs
          defaultActiveKey={tabKey}
          onChange={this.tabChange}
          style={{margin: "20px 0"}}
        >
          <TabPane tab="维值定义" key="1" />
          <TabPane tab="维值组定义" key="2" />
        </Tabs>

        { tabKey === "1" && "维值定义" }

        { tabKey === "2" && <DimensionGroup />}

        <p style={{ marginBottom: '20px' }}>
          <a onClick={this.onBackClick}>
            <Icon type="rollback" />返回
          </a>
        </p>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    dimensionValue: 123,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(DimensionDetails);
