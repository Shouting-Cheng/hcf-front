import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button, message, Radio } from 'antd'

const RadioGroup = Radio.Group;

import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
import PermissionsAllocation from 'widget/Template/permissions-allocation'
import PropTypes from 'prop-types';

import Chooser from 'widget/chooser'

class ExpenseTypeScope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      value: 1,
      companys: [],
      userValue: {
        type: 'all',
        values: []
      }
    }
  }

  componentWillMount() {
    const { expenseType } = this.props;
    expenseTypeService.getExpenseTypeScope(expenseType.id).then(res => {

      this.setState({
        value: res.data.allCompanyFlag ? 1 : 2,
        companys: res.data.assignCompanies.map(o => ({ id: o.companyId }))
      });




      // if (expenseType.accessibleRights === 1) {
      //   let values = [];
      //   res.data.map(item => {
      //     values.push({
      //       label: item.name,
      //       key: item.id,
      //       value: item.id
      //     })
      //   });
      //   this.setState({
      //     userValue: {
      //       type: 'group',
      //       values
      //     }
      //   })
      // }
    })
  }

  componentDidMount() {
  }

  handleChangePermissions = (userValue) => {
    this.setState({ userValue });
  };

  handleSave = () => {
    const { userValue } = this.state;
    const { expenseType } = this.props;
    if (userValue.type === 'group' && userValue.values.length === 0) {
      message.error(messages('expense.type.please.add.user.group'));
      return;
    }
    let userGroups = [];
    userValue.values.map(item => {
      userGroups.push({
        userTypeId: item.key
      })
    });

    let target = {
      allCompanyFlag: this.state.value == 1,
      assignUsers: userGroups,
      applyType: userValue.type === 'all' ? 101 : 102,
      assignCompanies: this.state.companys.map(o => ({ companyId: o.id }))
    };

    this.setState({ saving: true });
    expenseTypeService.saveExpenseTypeScope(target, expenseType.id).then(res => {
      this.setState({ saving: false });
      this.props.onSave();
    })
  };

  onChange = (e) => {
    this.setState({ value: e.target.value });
  }

  selectCompany = (values) => {
    console.log(values);
    this.setState({
      companys: values
    })
  }

  render() {
    const { userValue, saving } = this.state;
    const { tenantMode } = this.props;
    return (
      <div>
        <Row gutter={20}>
          <Col span={4}>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              适用公司:
            </div>
          </Col>
          <Col span={8}>
            <RadioGroup onChange={this.onChange} value={this.state.value}>
              <Radio value={1}>全部公司</Radio>
              <Radio value={2}>部分公司</Radio>
            </RadioGroup>
            {(this.state.value == 2) && <Chooser
              placeholder={this.$t({ id: "common.please.select" })}
              value={this.state.companys}
              type={"company"}
              single={false}
              labelKey="name"
              valueKey="id"
              showNumber
              listExtraParams={{ setOfBooksId: this.props.company.setOfBooksId }}
              onChange={this.selectCompany} />}
          </Col>
        </Row>
        <Row style={{ marginTop: 20 }} gutter={20}>
          <Col span={4}>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {messages('expense.type.permission.scope')}:
            </div>
          </Col>
          <Col span={8}>
            <PermissionsAllocation onChange={this.handleChangePermissions}
              needEntity
              hiddenComponents={["department"]}
              value={userValue}
              disabled={!tenantMode} />
          </Col>
        </Row>
        {tenantMode && (
          <Row gutter={20} style={{ marginTop: 20 }}>
            <Col span={4} />
            <Col span={8}>
              <Button type="primary" onClick={this.handleSave} loading={saving}>{messages('common.save')}</Button>
            </Col>
          </Row>
        )}
      </div>
    )
  }
}

ExpenseTypeScope.propTypes = {
  expenseType: PropTypes.object,
  onSave: PropTypes.func
};

function mapStateToProps(state) {
  return {
    tenantMode: true,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseTypeScope)
