import React from 'react'
import { connect } from 'dva'

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
import { routerRedux } from 'dva/router';

class BudgetOrganizationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowStatus: 'SCENARIOS',
      tabs: [
        {key: 'SCENARIOS', name: this.$t('budget.setting.scenarios') },
        {key: 'VERSIONS', name: this.$t('budget.setting.version')},
        {key: 'STRUCTURE', name: this.$t('budget.setting.structure')},
        {key: 'TYPE', name: this.$t('budget.setting.item.type')},
        {key: 'ITEM', name: this.$t('budget.setting.item')},
        {key: 'GROUP', name: this.$t('budget.setting.item.group')},
        {key: 'STRATEGY', name: this.$t('budget.setting.control.strategy')},
        {key: 'RULE', name: this.$t('budget.setting.control.rule')},
        {key: 'ITEM_MAP', name: this.$t('budget.setting.item.map')},
        {key: 'JOURNAL_TYPE', name: this.$t('budget.setting.journal.type')}
      ],
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
    if(this.props.match.params.tab!==':tab' )
      this.setState({nowStatus: this.props.match.params.tab})
  }

  onChangeTabs = (key) =>{
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', this.props.organization.id)
          .replace(':setOfBooksId',this.props.match.params.setOfBooksId)
          .replace(':tab', key)
      })
    );
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
    return this.props.match.params.id ? React.createElement(content, Object.assign({}, this.props.match.params, {organization: this.props.organization})) : null;
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
    organization: state.user.organization
  }
}


export default connect(mapStateToProps, null, null, { withRef: true })(BudgetOrganizationDetail);
