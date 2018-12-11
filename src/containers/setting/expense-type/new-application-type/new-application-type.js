import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import {Tabs, Spin, Affix, Button} from 'antd'
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
import ApplicationTypeBase from 'containers/setting/expense-type/new-application-type/application-type-base'
import ExpenseTypeCustom from 'containers/setting/expense-type/new-expense-type/expense-type-custom/expense-type-custom'
import ExpenseTypeScope from 'containers/setting/expense-type/new-expense-type/expense-type-scope'
import { routerRedux } from 'dva/router';

class NewExpenseType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        { key: 'base', name: messages('expense.type.basic.info') },
        { key: 'custom', name: messages('expense.type.detail.setting') },
        { key: 'scope', name: messages('expense.type.permission.setting') }
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

    let { languageList } = this.props;
    expenseTypeService.getExpenseTypeDetail(id).then(res => {

      let expenseType = JSON.parse(JSON.stringify(res.data));

      expenseTypeService.getFieldsById(id).then(data => {

        expenseType.fields = data.data.sort((a, b) => a.sequence > b.sequence || -1);
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

        this.setState({ expenseType, loading: false, entryMode: expenseType.entryMode, priceUnit: expenseType.priceUnit });

        this.props.dispatch({
          type: "setting/setExpenseTypeSetOfBooks",
          payload: {
            id: expenseType.setOfBooksId,
            setOfBooksName: expenseType.setOfBooksName || ""
          }
        })
        target && this.setState({ nowTab: target });
      })
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
    switch (nowTab) {
      case 'base':
        return <ApplicationTypeBase expenseType={expenseType} onSave={this.getExpenseType} />;
      case 'custom':
        return <ExpenseTypeCustom expenseType={expenseType}
          onSave={this.getExpenseType}
          saveIndex={index => this.setState({ index })}
          index={index} />;
      case 'scope':
        return <ExpenseTypeScope expenseType={expenseType} onSave={this.getExpenseType} />;
    }
  };
  goBack = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/expense-type"
    }))
  };

  render() {
    const { nowTab, loading } = this.state;
    return (
      <div className="new-expense-type" style={{paddingBottom: 30}}>
        <Tabs onChange={this.onChangeTabs} activeKey={nowTab}>
          {this.renderTabs()}
        </Tabs>
        {loading ? <Spin /> : (
          <div style={{ padding: 20 }}>
            {this.getExpenseTypeComponents()}
          </div>)}
        <div style={{paddingLeft:'20px'}}>
          <Affix offsetBottom={0} style={{
            position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
            boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px', zIndex: 1
          }}>
            <Button
              type="primary"
              onClick={this.goBack}
              style={{ margin: '0 20px' }}
            >
              {this.$t('common.back')}
            </Button>
          </Affix>

        </div>
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
