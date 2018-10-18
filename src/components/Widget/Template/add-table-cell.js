import React from 'react';
import PropTypes from 'prop-types';

import { Form, Icon, Input, Popconfirm, Table, Tooltip, message } from 'antd';

import 'styles/components/template/add-table-cell.scss';

class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      originValue: this.props.value,
      data: this.props.data,
      column: this.props.column,
      editable: false,
    };
  }

  componentWillMount() {
    this.setState({ editable: !this.props.value });
  }

  handleChange = e => {
    const value = e.target.value;
    this.setState({ value });
  };

  check = () => {
    const { value, column } = this.state;
    if (column.isRequired && !value) {
      //非空校验
      message.error(this.$t('common.can.not.be.empty', { name: column.title }));
      this.props.onChange(value);
      return;
    }
    if (column.maxLength && value.length > column.maxLength) {
      //字数限制校验
      message.error(this.$t('common.max.characters.length', { max: column.maxLength }));
      return;
    }
    if (column.onlyCheck) {
      //唯一性校验
      let isOnly = true;
      this.state.data.map(item => {
        if (item[column.dataIndex] === value) {
          message.error(this.$t('common.exist.same', { name: column.title }) /*存在相同{name}*/);
          isOnly = false;
        }
      });
      if (!isOnly) return;
    }
    this.setState({ editable: false, originValue: value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  cancel = () => {
    const { column, originValue } = this.state;
    if (column.isRequired && !originValue) {
      message.error(this.$t('common.can.not.be.empty', { name: column.title }));
      return;
    }
    this.setState({ editable: false, value: this.state.originValue });
  };

  edit = () => {
    this.setState({ editable: true });
  };

  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {editable ? (
          <div className="editable-cell-input-wrapper">
            <Input
              value={value}
              onBlur={this.check}
              onChange={this.handleChange}
              onPressEnter={this.check}
            />
            <div className="icons">
              <Tooltip title={this.$t('common.save')}>
                <Icon type="check" onClick={this.check} />
              </Tooltip>
              <Tooltip title={this.$t('common.cancel')}>
                <Icon type="close" onClick={this.cancel} />
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="editable-cell-text-wrapper">
            {value || '-'}
            <Tooltip title={this.$t('common.edit')}>
              <Icon type="edit" className="editable-cell-icon" onClick={this.edit} />
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

class AddTableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      data: [],
      dataKey: 0,
    };
  }

  componentDidMount() {
    let dataKey = 0;
    (this.props.value || []).map(item => {
      item.key > dataKey && (dataKey = item.key);
    });
    this.setState({ dataKey });
    let columns = this.props.columns;
    columns.map(item => {
      if (item.editable) {
        item.render = (value, record, index) => (
          <EditableCell
            value={value}
            column={item}
            data={this.state.data}
            onChange={this.onCellChange(index, item.dataIndex)}
          />
        );
      }
    });
    columns.push({
      title: this.$t('common.operation'),
      dataIndex: 'operation',
      width: '10%',
      render: (value, record) => (
        <Popconfirm
          title={this.$t('common.confirm.delete')}
          onConfirm={() => this.onDelete(record.key)}
        >
          <a>{this.$t('common.delete')}</a>
        </Popconfirm>
      ),
    });
    this.setState({
      columns,
      data: this.props.value || [],
    });
  }

  onCellChange = (index, dataIndex) => {
    return value => {
      let data = this.state.data;
      const target = data[index];
      if (target) {
        target[dataIndex] = value;
        this.setState({ data }, () => {
          this.onChange(this.state.data);
        });
      }
    };
  };

  onDelete = key => {
    let data = [...this.state.data];
    this.setState({ data: data.filter(item => item.key !== key) }, () => {
      this.onChange(this.state.data);
    });
  };

  handleAdd = () => {
    let dataKey = this.state.dataKey;
    dataKey++;
    this.setState({ dataKey }, () => {
      let data = this.state.data;
      let newData = { key: this.state.dataKey };
      this.props.columns.map(item => {
        if (item.defaultValue) {
          newData[item.dataIndex] = item.defaultValue;
        }
      });
      data.push(newData);
      this.setState({ data });
    });
  };

  onChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { columns, data } = this.state;
    return (
      <div className="add-table-cell">
        <a onClick={this.handleAdd}>
          <Icon type="plus-circle-o" className="add-budget-detail-icon" />
          {this.$t('common.add')}
        </a>
        {data && data.length ? (
          <Table
            rowKey="key"
            dataSource={data}
            columns={columns}
            pagination={false}
            scroll={{ x: true }}
            bordered
            size="middle"
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

/**
 *
 * @type columns，每项格式和table的columns一样，新增以下字段
 * {
      editable: false,         //可选，是否可编辑
      isRequired: false,      //可选，是否必填
      defaultValue: '',      //可选，默认值
      onlyCheck: false,     //可选，是否需要唯一性校验
      maxLength: 0,        //可选，最多可输入的字数
 * }
 */
AddTableCell.propTypes = {
  columns: PropTypes.array.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func, //保存后的回调
};

AddTableCell.defaultProps = {
  value: [],
};

const WrappedAddTableCell = Form.create()(AddTableCell);

export default WrappedAddTableCell;
