import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import config from 'config'
import BacklashRechecking from './pay-backlash-rechecking'
import BacklashRechecked from  './pay-backlash-rechecked'
import {messages} from 'utils/utils'

import { Form, Button, Select, Row, Col, Input, Switch, Icon, Badge, Tabs, message, Popover } from 'antd'
const TabPane = Tabs.TabPane;



class PayBacklashRecheck extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            nowStatus: 'backlashRechecking',
            tabs: [
                { key: 'backlashRechecking', name: messages('pay.refund.waitApprove')}, //待复核
                { key: 'backlashRechecked', name: messages('pay.refund.allApproved') }  //已复核
              ],
              payBacklash: "/pay/pay-backlash-recheck/:tab",//反冲复核
              // backlashRechecking: menuRoute.getRouteItem('backlash-rechecking','key'),
              // backlashRechecked: menuRoute.getRouteItem('backlash-rechecked','key')
        }
    }

    componentWillMount(){
      this.setState({nowStatus: "backlashRechecking"})
    }


      onChangeTabs = (key) => {
        this.setState({ nowStatus: key }, () => {
          this.props.dispatch(
            routerRedux.replace({
              pathname: this.state.payBacklash.replace(":tab", key)
            })
          );
        })

      };

      renderContent = () => {
        let content = null;
        switch (this.state.nowStatus){
          case 'backlashRechecking':
            content = <BacklashRechecking />;
            break;
          case 'backlashRechecked':
            content = <BacklashRechecked />;
            break;
        }
        return content;
      };




     render(){
      const { tabs, nowStatus } = this.state;
      return (
        <div className="pay-backlash-recheck">
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


export default connect(mapStateToProps, null, null, { withRef: true })(PayBacklashRecheck);

