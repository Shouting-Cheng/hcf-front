import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import CanBacklash from './pay-can-backlash'
import MyBacklash from  './pay-my-backlash'
import {messages} from 'utils/utils'

import { Form, Button, Select, Row, Col, Input, Switch, Icon, Badge, Tabs, message, Popover } from 'antd'
const TabPane = Tabs.TabPane;

class PayBacklash extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            nowStatus: 'CAN_BACKLASH',
            tabs: [
                { key: 'CAN_BACKLASH', name: messages('pay.can.reserve') }, //可反冲
                { key: 'MY_BACKLASH', name: messages('pay.my.reserve') }  //我的反冲
              ],
              payBacklash: "/pay/pay-backlash/:tab",//我的反冲
        }
    }

    componentWillMount(){
      this.setState({nowStatus: "CAN_BACKLASH"})
      }


      onChangeTabs = (key) => {
        this.setState({ nowStatus: key }, () => {
          this.props.dispatch(
            routerRedux.replace({
              pathname: this.state.payBacklash.replace(":tab", key),
            })
          );
        })
      };

      renderContent = () => {
        let content = null;
        switch (this.state.nowStatus){
          case 'CAN_BACKLASH':
            content = <CanBacklash/>;
            break;
          case 'MY_BACKLASH':
            content = <MyBacklash />;
            break;
        }
        return content;
      };




     render(){
      const { tabs, nowStatus } = this.state;
      return (
        <div className="main-pay-backlash">
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


export default connect(mapStateToProps, null, null, { withRef: true })(PayBacklash);

