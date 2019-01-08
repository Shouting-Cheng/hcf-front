/**
 * created by jsq on 2018/12/26
 */
import React from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import ParameterSOb from 'containers/setting/parameter-definition/paramter-sob'
import ParameterCompany from 'containers/setting/parameter-definition/parameter-company'
import ParameterTenant from 'containers/setting/parameter-definition/parameter-tenant'

class ParameterDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowTab: '0',
      tabs:[
        {
          key: '0', value: this.$t('parameter.definition.teat')
        },
        {
          key: '1', value: this.$t('parameter.definition.sob')
        },
        {
          key: '2', value: this.$t('parameter.definition.comp')
        },
      ],
    }
  }

  renderContent(){
    const { nowTab } = this.state;
    switch (nowTab) {
      case '0': return <ParameterTenant/>;

      case '1': return <ParameterSOb/>;

      case '2': return <ParameterCompany/>;
    }
  }

  handleTab = (key)=>{
    this.setState({nowTab: key})
  };

  render(){
    const {tabs, nowTab, visible, record, sob, } = this.state;
    return (
      <div className="parameter-definition">
        <Tabs onChange={this.handleTab} type='card' defaultActiveKey={'0'}>
          {tabs.map(item=><TabPane tab={item.value} key={item.key}/>)}
        </Tabs>
        {this.renderContent()}
      </div>
    )
  }
}

export default connect()(ParameterDefinition);
