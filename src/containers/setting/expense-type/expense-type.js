import {messages} from "utils/utils";
import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Button } from 'antd'
const TabPane = Tabs.TabPane;
import 'styles/setting/expense-type/expense-type.scss'
import CustomExpenseType from 'containers/setting/expense-type/custom-expense-type'

class ExpenseType extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="expense-type">
        <CustomExpenseType/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseType)
