import {messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';

import { Tabs } from 'antd'
const TabPane = Tabs.TabPane;

import PayUnpaid from './pay-unpaid'
import PayPaying from './pay-paying'
import PayFail from './pay-fail'
import PaySuccess from './pay-success'

import 'styles/pay/pay-workbench/pay-workbench.scss'

class PayWorkbench extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowStatus: 'Unpaid',
      tabs: [
        {key: 'Unpaid', name: messages('pay.unpay')}, //未支付
        {key: 'Paying', name: messages('pay.paying')},  //支付中
        {key: 'Fail', name: messages('pay.pay.or.return')},  //退票或失败
        {key: 'Success', name: messages('pay.pay.success')}  //支付成功
      ],
      payWorkbench: "/pay/pay-workbench",    //付款工作台
    }
  }


  componentWillMount(){
    if(this.props.match.params.tab)
      this.setState({nowStatus: this.props.match.params.tab})
  }

  onChangeTabs = (key) => {
    this.props.match.params.subTab = undefined;
    this.setState({ nowStatus: key }, () => {
      this.props.dispatch(
        routerRedux.replace({
          pathname: `${this.state.payWorkbench}/${this.state.nowStatus}`,
        })
      );
    })
  };

  renderContent = () => {
    let content = null;
    switch (this.state.nowStatus){
      case 'Unpaid':
        content = <PayUnpaid subTab={this.props.match.params.subTab}/>;
        break;
      case 'Paying':
        content = <PayPaying subTab={this.props.match.params.subTab}/>;
        break;
      case 'Fail':
        content = <PayFail subTab={this.props.match.params.subTab}/>;
        break;
      case 'Success':
        content = <PaySuccess subTab={this.props.match.params.subTab}/>;
        break;
    }
    return content;
  };

  render(){
    const { tabs, nowStatus } = this.state;
    return (
      <div className="pay-workbench">
        <Tabs onChange={this.onChangeTabs} defaultActiveKey={nowStatus}>
          {tabs.map(tab => {
            return <TabPane tab={tab.name} key={tab.key}/>
          })}
        </Tabs>
        {this.renderContent()}
      </div>
    )
  }

}


function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(PayWorkbench);
