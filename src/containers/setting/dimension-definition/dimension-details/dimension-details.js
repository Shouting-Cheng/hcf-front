import React, { Component } from 'react';
import { message, Icon, Tabs } from 'antd';
import BasicInfo from 'widget/basic-info';
import DimensionGroup from './dimension-group';
import DimensionDeValue from './dimension-details-value';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { messages } from 'utils/utils';
import service from './dimension-group-service';

const TabPane = Tabs.TabPane;
class DimensionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoList: [
        {
          type: 'input',
          id: 'dimensionCode',
          isRequired: true,
          label: '维度代码',
        },
        {
          type: 'input',
          id: 'dimensionName',
          isRequired: true,
          label: '维度名称',
        },
        {
          type: 'input',
          id: 'setOfBooksName',
          isRequired: true,
          label: '账套',
        },
        {
          type: 'switch',
          id: 'enabled',
          isRequired: true,
          label: '状态',
        },
      ],
      infoData: {},
      tabKey: props.match.params.dimensionId.includes('?tabKey=2') ? '2' : '1',
      dimensionId: props.match.params.dimensionId.split('?')[0],
      setOfBooksId: null
    }
  }

  componentDidMount() {
    this.getDimension()
  }

  // 获取维度基本信息
  getDimension = () => {
    const id = this.state.dimensionId;
    service.getDimensionDetail(id).then(res => {
      this.setState({
        infoData: res.data,
        setOfBooksId: res.data['setOfBooksId']
       });
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }

   //返回到维度定义
  onBackClick = (e) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition/${this.state.setOfBooksId}`,
      })
    );
  };

  // tab选项卡切换
  tabChange = (key) => {
    this.setState({ tabKey: key }, () => {
      let url = window.location.href.split('?')[0];
      let tabKey = key === '1' ? '?tabKey=1' : '?tabKey=2';
      window.location.href = url + tabKey;
    });
  }

  render() {
    const { infoList, infoData, tabKey, dimensionId, setOfBooksId } = this.state;

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
          <TabPane tab="维值定义" key="1" >
            <DimensionDeValue
              dimensionId={dimensionId}
              setOfBooksId={setOfBooksId}/>
          </TabPane>
          <TabPane tab="维值组定义" key="2" >
            <DimensionGroup dimensionId={dimensionId} />
          </TabPane>
        </Tabs>
        <p style={{ marginBottom: '20px' }}>
          <a onClick={this.onBackClick}>
            <Icon type="rollback" />返回
          </a>
        </p>
      </div>
    )
  }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(DimensionDetails);
