import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { Tabs, Spin } from 'antd'
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
import ExpenseTypeBase from 'containers/setting/expense-type/new-expense-type/expense-type-base'
import ExpenseTypeCustom from 'containers/setting/expense-type/new-expense-type/expense-type-custom/expense-type-custom'
import ExpenseTypeScope from 'containers/setting/expense-type/new-expense-type/expense-type-scope'

class NewExpenseType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        { key: 'base', name: messages('expense.type.basic.info') },
        { key: 'custom', name: messages('expense.type.detail.setting') }
      ],
      loading: false,
      nowTab: 'base',
      expenseType: null,
      index: -1
    }
  }

  //Tabs点击
  onChangeTabs = (key) => {
    const { profile, expenseTypeSetOfBooks } = this.props;
    // if (key === 'subsidy') {
    //   this.context.router.push(menuRoute.getRouteItem(profile['All.NewAllowance.Enable'] ? 'base-subsidy' : 'travel-policy').url + `?setOfBooksId=${expenseTypeSetOfBooks.id}`);
    // } else {
    //   this.setState({ nowTab: key })
    // }
    this.setState({ nowTab: key })
  };

  getExpenseType = (target, id = this.props.match.params.expenseTypeId) => {
    this.setState({ loading: true });
    let { tabs } = this.state;
    let { languageList } = this.props;
    expenseTypeService.getExpenseTypeDetail(id).then(res => {
      let expenseType = JSON.parse(JSON.stringify(res.data));
      if (expenseType.supplierType === 0 && expenseType.isAbleToCreatedManually && tabs.length === 2) {
        tabs.push({ key: 'scope', name: messages('expense.type.permission.setting') })
      }
      if (expenseType.subsidyType === 1) {
        let hasSubsidy = false;
        tabs.map(tab => {
          hasSubsidy = hasSubsidy || tab.key === 'subsidy'
        });
        !hasSubsidy && tabs.push({ key: 'subsidy', name: messages('expense.type.allowance.rules.setting') })
      }
      expenseType.fields = res.data.fields.sort((a, b) => a.sequence > b.sequence || -1);
      expenseType.fields.map(item => {
        //i18n name值没有初始化时手动初始化
        if (!item.i18n) {
          item.i18n = {};
        }
        if (!item.i18n.name) {
          item.i18n.name = [];
          languageList.map(language => {
            item.i18n.name.push({
              language: language.code.toLowerCase(),
              value: item.name
            })
          });
        }
      });
      this.setState({ expenseType, loading: false, tabs });
      this.props.dispatch({
        type: "setting/setExpenseTypeSetOfBooks",
        payload: {
          id: expenseType.setOfBooksId,
          setOfBooksName: expenseType.setOfBooks.setOfBooksName
        }
      })

      target && this.setState({ nowTab: target })
    })
  };

  componentWillMount() {
    let id = this.props.match.params.expenseTypeId;

    if (id && id != "0") {
      this.getExpenseType()
    }
  }

  renderTabs() {
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key} disabled={tab.key !== 'base' && (!this.props.match.params.expenseTypeId || this.props.match.params.expenseTypeId == "0")} />
      })
    )
  }

  getExpenseTypeComponents = () => {
    const { nowTab, expenseType, index } = this.state;
    console.log(nowTab)
    switch (nowTab) {
      case 'base':
        return <ExpenseTypeBase expenseType={expenseType} onSave={this.getExpenseType} />;
      case 'custom':
        return <ExpenseTypeCustom expenseType={expenseType}
          onSave={this.getExpenseType}
          saveIndex={index => this.setState({ index })}
          index={index} />;
      case 'scope':
        return <ExpenseTypeScope expenseType={expenseType} onSave={this.getExpenseType} />;
    }
  };

  render() {
    const { nowTab, loading } = this.state;
    return (
      <div className="new-expense-type">
        <Tabs onChange={this.onChangeTabs} activeKey={nowTab}>
          {this.renderTabs()}
        </Tabs>
        {loading ? <Spin /> : this.getExpenseTypeComponents()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    languageList: state.languages.languageList,
    profile: state.user.profile,
    expenseTypeSetOfBooks: state.setting.expenseTypeSetOfBooks
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(NewExpenseType)
