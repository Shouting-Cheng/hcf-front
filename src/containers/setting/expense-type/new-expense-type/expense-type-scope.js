import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Modal, Button, Checkbox, message, Select, Spin } from 'antd'
const Option = Select.Option;
const confirm = Modal.confirm;
import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
import PermissionsAllocation from 'widget/Template/permissions-allocation'
import PropTypes from 'prop-types';

class ExpenseTypeScope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      userValue: {
        type: 'all',
        values: []
      }
    }
  }

  componentWillMount() {
    const { expenseType } = this.props;
    expenseTypeService.getExpenseTypeScope(expenseType.id).then(res => {
      if (expenseType.accessibleRights === 1) {
        let values = [];
        res.data.rows.map(item => {
          values.push({
            label: item.name,
            key: item.id,
            value: item.id
          })
        });
        this.setState({
          userValue: {
            type: 'group',
            values
          }
        })
      }
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
      allCompanyFlag: true,
      assignUsers: userGroups,
      applyType: userValue.type === 'all' ? 101 : 102,
      assignCompanies: []
    };

    this.setState({ saving: true });
    expenseTypeService.saveExpenseTypeScope(target, expenseType.id).then(res => {
      this.setState({ saving: false });
      this.props.onSave();
    })
  };

  render() {
    const { userValue, saving } = this.state;
    const { tenantMode } = this.props;
    return (
      <div>
        <Row gutter={20}>
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
    tenantMode: true
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseTypeScope)
