import React from 'react'
import { connect } from 'react-redux'
import {messages} from 'share/common'

import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import BudgetScenarios from 'containers/budget-setting/budget-organization/budget-scenarios/budget-scenarios'
import BudgetStructure from 'containers/budget-setting/budget-organization/budget-structure/budget-structure'
import BudgetVersions from 'containers/budget-setting/budget-organization/budget-versions/budget-versions'
import BudgetItemType from 'containers/budget-setting/budget-organization/budget-item-type/budget-item-type'
import BudgetItem from 'containers/budget-setting/budget-organization/budget-item/budget-item'
import BudgetGroup from 'containers/budget-setting/budget-organization/budget-group/budget-group'
import BudgetStrategy from 'containers/budget-setting/budget-organization/budget-strategy/budget-strategy'
import BudgetControlRules from 'containers/budget-setting/budget-organization/budget-control-rules/budget-control-rules'
import BudgetJournalType from 'containers/budget-setting/budget-organization/budget-journal-type/budget-journal-type'
import BudgetItemMap from 'containers/budget-setting/budget-organization/budget-item-map/budget-item-map'

import menuRoute from 'routes/menuRoute'

class BudgetOrganizationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowStatus: 'SCENARIOS',
      tabs: [
        {key: 'SCENARIOS', name: messages('budget.setting.scenarios') },
        {key: 'VERSIONS', name: messages('budget.setting.version')},
        {key: 'STRUCTURE', name: messages('budget.setting.structure')},
        {key: 'TYPE', name: messages('budget.setting.item.type')},
        {key: 'ITEM', name: messages('budget.setting.item')},
        {key: 'GROUP', name: messages('budget.setting.item.group')},
        {key: 'STRATEGY', name: messages('budget.setting.control.strategy')},
        {key: 'RULE', name: messages('budget.setting.control.rule')},
        {key: 'ITEM_MAP', name: messages('budget.setting.item.map')},
        {key: 'JOURNAL_TYPE', name: messages('budget.setting.journal.type')}
      ],
      budgetOrganizationDetailPage: menuRoute.getRouteItem('budget-organization-detail','key'),    //组织定义详情的页面项
    };
  }

  //渲染Tabs
  renderTabs(){
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key}/>
      })
    )
  }

  componentWillMount(){
    if(this.props.location.query.tab)
      this.setState({nowStatus: this.props.location.query.tab})
  }

  onChangeTabs = (key) =>{
    this.setState({
      nowStatus: key
    })
  };

  renderContent = () => {
    let content = null;
    switch (this.state.nowStatus){
      case 'SCENARIOS':
        content = BudgetScenarios;
        break;
      case 'STRUCTURE':
        content = BudgetStructure;
        break;
      case 'VERSIONS':
        content = BudgetVersions;
        break;
      case 'TYPE':
        content = BudgetItemType;
        break;
      case 'ITEM':
        content = BudgetItem;
        break;
      case 'GROUP':
        content = BudgetGroup;
        break;
      case 'STRATEGY':
        content = BudgetStrategy;
        break;
      case 'RULE':
        content = BudgetControlRules;
        break;
      case 'JOURNAL_TYPE':
        content = BudgetJournalType;
        break;
      case 'ITEM_MAP':
        content = BudgetItemMap;
        break;
    }
    return this.props.organization.id ? React.createElement(content, Object.assign({}, this.props.params, {organization: this.props.organization})) : null;
  };

  render(){
    return (
      <div>
        <h3 className="header-title">{this.props.organization.organizationName}</h3>
        <Tabs onChange={this.onChangeTabs} defaultActiveKey={this.state.nowStatus}>
          {this.renderTabs()}
        </Tabs>
        {this.renderContent()}
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

BudgetOrganizationDetail.contextTypes = {
  router: React.PropTypes.object
};

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetOrganizationDetail);
