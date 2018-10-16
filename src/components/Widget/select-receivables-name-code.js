import React from 'react';
import { Select, Icon, Popove, Input, Spin } from 'antd';
import base from 'share/base.service';
import ListSelector from 'components/Widget/list-selector';
import 'styles/reimburse/reimburse.scss';

const InputGroup = Input.Group;

class SelectReceivablesNameCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      receivables: [],
      fetching: false,
      showPayee: false,
    };
  }

  receivablesSerarch = value => {
    const { type } = this.props;

    if (!value) {
      this.setState({ receivables: [] });
      return;
    }

    let payeeCategory = 1001;

    if (type == 'EMPLOYEE') {
      payeeCategory = 1001;
    } else if (type == 'VENDER') {
      payeeCategory = 1002;
    }

    this.setState({ fetching: true });

    base.getReceivables(value, payeeCategory).then(res => {
      this.setState({ receivables: res.data, fetching: false });
    });
  };

  onSelect = value => {
    this.props.onChange(value);
  };

  showPayee = () => {
    this.setState({ showPayee: true });
  };

  payeeHandleListOk = value => {
    let record = value.result[0];
    if (record) {
      this.props.onChange({ key: record.id, label: record.name });
    } else {
      this.props.onChange({});
    }
    this.setState({ showPayee: false });
  };

  //获取收款方code
  getPayeeCategoryCode = payeeCategory => {
    let type = 1001;
    if (payeeCategory == 'EMPLOYEE') {
      type = 1001;
    } else if (payeeCategory == 'VENDER') {
      type = 1002;
    }
    return type;
  };

  render() {
    const { value, type, disabled, onChange } = this.props;
    const { showPayee } = this.state;

    return (
      <div className="select-receivables">
        <InputGroup compact>
          <Select
            style={{ width: '84%' }}
            showSearch
            onSearch={this.receivablesSerarch}
            onChange={this.onSelect}
            filterOption={false}
            value={value}
            labelInValue
            defaultActiveFirstOption={false}
            disabled={disabled}
            notFoundContent={this.state.fetching ? <Spin size="small" /> : null}
          >
            {this.state.receivables.map(o => {
              return <Select.Option key={o.id}>{o.name}</Select.Option>;
            })}
          </Select>
          <span onClick={disabled ? () => {} : this.showPayee} className="action">
            <Icon type="ellipsis" />
          </span>
        </InputGroup>
        <ListSelector
          single={true}
          visible={showPayee}
          type="select_payee_name_code"
          labelKey="name"
          valueKey="id"
          onCancel={() => {
            this.setState({ showPayee: false });
          }}
          onOk={this.payeeHandleListOk}
          extraParams={{ empFlag: this.getPayeeCategoryCode(type), pageFlag: true }}
          selectedData={value.key ? [{ id: value.key, name: value.label }] : [{ id: '', name: '' }]}
        />
      </div>
    );
  }
}

export default SelectReceivablesNameCode;
