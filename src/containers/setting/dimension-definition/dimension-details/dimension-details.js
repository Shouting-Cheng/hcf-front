
import React, { Component } from 'react';
import { Row, Col, Badge, Tabs, Icon,} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import DimensionDeValue from './dimension-details-value.js'

const TabPane = Tabs.TabPane;

class DimensionDetail extends Component {
   constructor(props) {
      super(props);
      this.state = {
         //当前维度信息
         curTypeList: {},
         //默认的tab页
         tabValue: 'dimensionValue',
         //用于切换tab页的变量
         tabName: 'dimensionValue',
         //当前账套Id
         setOfBooksId: this.props.match.params.setOfBooksId,
         //当前维度Id
         dimensionId: this.props.match.params.dimensionId
      }
   }

  componentWillMount = () => {
    console.log(this.props);
    this.setState({
       curTypeList: {
         dimensionCode: 'one',
         dimensionName: 'name',
         setOfBooksName: 'two',
         enabled: false
       }
    })
  }

  //改变当前的tab
  handleTabsChange = (value) => {
      this.setState({tabName:value});
  }

  //返回上一页
  onBackClick = e =>{
    e.preventDefault();
    this.props.dispatch(
     routerRedux.replace({
       pathname: `/admin-setting/dimension-definition`,
     })
   );
 }

  //据tab分别渲染维值或维值组表格
  renderTabContent = () => {
    const {tabName} = this.state;

    if(tabName === 'dimensionValue') {
        return (
           //渲染维值table
          <DimensionDeValue />
        )
     } else {
        return (
          //渲染维值组table
          <div>
            11
          </div>
        )
     }
  }

  render() {
      const { tabValue, curTypeList } = this.state;

      return (
          <div>
              <h1 style={{paddingBottom: '20px',borderBottom: '1px solid #C9C9C9'}}>基本信息</h1>
              <div>
                <Row
                gutter={24}
                type="flex"
                justify="start"
                style={{ background: '#f7f7f7', padding: '20px 25px 0', borderRadius: '6px 6px 0 0' }}>
                   <Col span={6} style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#989898' }}>维度代码</div>
                    <div style={{ wordWrap: 'break-word' }}>
                        {curTypeList.dimensionCode}
                    </div>
                  </Col>
                  <Col span={6} style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#989898' }}>维度名称</div>
                    <div style={{ wordWrap: 'break-word' }}>
                        {curTypeList.dimensionName}
                    </div>
                  </Col>
                  <Col span={6} style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#989898' }}>账套</div>
                    <div style={{ wordWrap: 'break-word' }}>
                        {curTypeList.setOfBooksName}
                    </div>
                  </Col>
                  <Col span={6} style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#989898' }}>状态</div>
                    <div style={{ wordWrap: 'break-word' }}>
                      <Badge
                        status={curTypeList.enabled ? 'success' : 'error'}
                        text={curTypeList.enabled ? '启用' : '禁用'}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
              <div>
                <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
                  <TabPane tab="维值定义" key="dimensionValue"></TabPane>
                  <TabPane tab="维值组定义" key="dimensionGroup"></TabPane>
                </Tabs>
                {this.renderTabContent()}
              </div>
              <a onClick={this.onBackClick}>
                <Icon type="rollback" />返回
              </a>
          </div>
      )
   }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(DimensionDetail);
