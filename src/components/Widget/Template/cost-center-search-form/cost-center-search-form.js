import React from 'react';
import PropTypes from 'prop-types';

import { Modal,  Select, Checkbox, Alert } from 'antd';
import Table from 'widget/table'
import CostCenterSearchFormService from 'widget/Template/cost-center-search-form/cost-center-search-form.service';
import debounce from 'lodash.debounce';
import 'styles/components/search-area.scss';
import {messages} from "utils/extend";

class CostCenterSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      costCenters: [],
      data: [],
      columns: [
        {
          title: this.$t('components.search.cost.center.name'),
          key: 'costCenterOid',
          dataIndex: 'costCenterOid',
          render: (value, item) => {
            return this.renderName(item);
          },
        },
        {
          title: this.$t('components.search.cost.center.all.items'),
          key: 'isAll',
          width: '100px',
          dataIndex: 'isAll',
          render: (value, item) => {
            return this.renderIsAll(item);
          },
        },
        {
          title: this.$t('components.search.cost.center.item.from'),
          key: 'costCenterItemCodeFrom',
          dataIndex: 'costCenterItemCodeFrom',
          render: (value, item) => {
            return this.renderSearchInput(item, 'costCenterItemCodeFrom');
          },
        },
        {
          title: this.$t('components.search.cost.center.item.to'),
          key: 'costCenterItemCodeTo',
          dataIndex: 'costCenterItemCodeTo',
          render: (value, item) => {
            return this.renderSearchInput(item, 'costCenterItemCodeTo');
          },
        },
      ],
    };
    this.getCodeOptions = debounce(this.getCodeOptions, 300);
  }

  componentWillMount() {
    this.getCostCenters();
  }

  componentWillReceiveProps(nextProps) {
    this.initData(nextProps.value);
  }
  // 可输入项长度
  getValidData = data => {
    const { length } = this.props;
    return data.slice(0, length);
  };
  // 初始化表单数据
  initData = value => {
    const { costCenters } = this.state;
    let data = [];
    Array.isArray(costCenters) &&
      this.getValidData(costCenters).forEach((item, index) => {
        data.push({
          id: index,
          costCenterOid: undefined,
          isAll: false,
          costCenterItemCodeFrom: '',
          costCenterItemCodeTo: '',
          options: [],
          fromCodeOptions: [],
          toCodeOptions: [],
        });
      });
    value &&
      Array.isArray(value) &&
      this.getValidData(value).forEach((val, index) => {
        data[index].costCenterOid = val.costCenterOid;
        data[index].isAll = !val.costCenterItemCodeFrom && !val.costCenterItemCodeTo;
        data[index].costCenterItemCodeFrom = val.costCenterItemCodeFrom;
        data[index].costCenterItemCodeTo = val.costCenterItemCodeTo;
        data[index].options = costCenters.filter(item => item.costCenterOID === val.costCenterOid);
      });
    this.setState({ data });
  };
  // 获取租户下成本中心查询
  getCostCenters = () => {
    CostCenterSearchFormService.getCostCenters().then(res => {
      let data = [];
      this.getValidData(res.data).forEach((item, index) => {
        data.push({
          id: index,
          costCenterOid: undefined,
          isAll: false,
          costCenterItemCodeFrom: '',
          costCenterItemCodeTo: '',
          options: [],
          fromCodeOptions: [],
          toCodeOptions: [],
        });
      });
      this.setState({ data, costCenters: res.data });
    });
  };
  // 获取搜索条件
  getParams = ({ item, value, key }) => {
    let params = {
      page: 0,
      size: 20,
      keyword: value,
    };
    if (key === 'costCenterItemCodeFrom') {
      item.costCenterItemCodeTo && (params.toCode = item.costCenterItemCodeTo);
      return params;
    }
    if (key === 'costCenterItemCodeTo') {
      item.costCenterItemCodeFrom && (params.fromCode = item.costCenterItemCodeFrom);
      return params;
    }
  };
  // 改变code
  changeCode = ({ value, item, key }) => {
    item[key] = value;
    if (!value) {
      item[this.getCurrentCodeOptionKey(key)] = [];
      this.setState({ data: this.state.data });
      return !1;
    }
    const currentOption = [...item[this.getCurrentCodeOptionKey(key)]].filter(
      option => option.name === value
    )[0];
    currentOption && (item[key] = value = currentOption.code);
    this.setState({ data: this.state.data });
    item.isAll = false;
    this.getCodeOptions({ value, item, key });
  };
  // 获取对应的code项的值列表的key
  getCurrentCodeOptionKey = key => {
    return key === 'costCenterItemCodeTo' ? 'toCodeOptions' : 'fromCodeOptions';
  };
  // 失去焦点处理
  onBlur = (item, key) => {
    if (![...item[this.getCurrentCodeOptionKey(key)]].some(option => option.code === item[key])) {
      this.changeCode({ value: undefined, item, key });
    }
  };
  // 获取成本中心项选择项
  getCodeOptions = ({ item, value, key }) => {
    if (!item.costCenterOid) {
      this.setState({ data: this.state.data });
      return !1;
    }
    CostCenterSearchFormService.getCostCenterItems(
      item.costCenterOid,
      this.getParams({ item, value, key })
    ).then(res => {
      let data = res.data;
      data.forEach(item => {
        item.name = `${item.code}-${item.name}`;
      });
      item[this.getCurrentCodeOptionKey(key)] = data;
      this.setState({ data: this.state.data });
    });
  };
  // 搜索输入框
  renderSearchInput = (item, key) => {
    return (
      <Select
        allowClear
        showSearch
        mode="combobox"
        value={item[key]}
        style={{ width: '100%' }}
        optionFilterProp="children"
        placeholder={this.$t('components.search.cost.center.please.enter.item')}
        onChange={value => this.changeCode({ value, item, key })}
        onBlur={() => {
          this.onBlur(item, key);
        }}
        onFocus={() => this.changeCode({ value: item[key], item, key })}
        getPopupContainer={triggerNode => triggerNode.parentNode}
      >
        {item[[this.getCurrentCodeOptionKey(key)]].map(option => {
          return <Select.Option key={option.name}>{option.name}</Select.Option>;
        })}
      </Select>
    );
  };
  // 改变全选框
  changeIsAll = (e, item) => {
    item.isAll = e.target.checked;
    item.costCenterItemCodeFrom = '';
    item.costCenterItemCodeTo = '';
    item.fromCodeOptions = [];
    item.toCodeOptions = [];
    this.setState({ data: this.state.data });
  };
  // 全选项框
  renderIsAll = item => {
    return <Checkbox onChange={e => this.changeIsAll(e, item)} checked={item.isAll} />;
  };
  // 获取成本中心名称选择项
  getOptions = item => {
    const { costCenters, data } = this.state;
    let options = [];
    costCenters.forEach(costCenter => {
      if (
        !data.some(val => val.costCenterOid === costCenter.costCenterOID) ||
        costCenter.costCenterOID === item.costCenterOid
      ) {
        options.push(costCenter);
      }
    });
    item.options = options;
    this.setState({ data: this.state.data });
  };
  // 改变成本中心名称
  changeName = (value, item) => {
    item.costCenterOid = value;
    item.isAll = !!value;
    item.codeOptions = [];
    item.costCenterItemCodeFrom = '';
    item.costCenterItemCodeTo = '';
    this.setState({ data: this.state.data });
  };
  // name 渲染
  renderName = item => {
    return (
      <Select
        placeholder={this.$t('common.please.select')}
        value={item.costCenterOid}
        onChange={value => this.changeName(value, item)}
        allowClear
        style={{ width: '100%' }}
        onFocus={() => this.getOptions(item)}
        getPopupContainer={triggerNode => triggerNode.parentNode}
      >
        {item.options.map(option => {
          return <Select.Option key={option.costCenterOID}>{option.name}</Select.Option>;
        })}
      </Select>
    );
  };

  onOk = () => {
    const { data } = this.state;
    let result = [];
    data.map(item => {
      item.costCenterOid &&
        result.push({
          costCenterOid: item.costCenterOid,
          costCenterItemCodeFrom: item.costCenterItemCodeFrom,
          costCenterItemCodeTo: item.costCenterItemCodeTo,
        });
    });
    this.props.onChange(result);
    this.setState({ showModal: false });
  };

  onCancel = () => {
    this.props.onChange(this.props.value);
    this.setState({ showModal: false });
  };

  render() {
    const { showModal, columns, data } = this.state;
    const { title, value, placeholder } = this.props;
    return (
      <div>
        <div
          className="ant-input"
          style={{ cursor: 'pointer' }}
          onClick={() => this.setState({ showModal: true })}
        >
          {!value || value.length < 1 ? (
            <span style={{ color: '#bfbfbf' }}>{placeholder}</span>
          ) : (
            this.$t('common.total.selected', { total: value.length })
          )}
        </div>
        <Modal
          visible={showModal}
          title={title}
          okText={this.$t('common.ok')}
          cancelText={this.$t('common.cancel')}
          width={800}
          onOk={this.onOk}
          onCancel={this.onCancel}
          wrapClassName="cost-center-search-modal"
        >
          <Alert
            message={
              <div>
                <p style={{ margin: '0' }}>{this.$t('components.search.cost.center.tip1')}</p>
                <p style={{ margin: '0' }}>{this.$t('components.search.cost.center.tip2')}</p>
              </div>
            }
            key={'info'}
            type={'info'}
            showIcon
          />
          <Table columns={columns} rowKey="id" pagination={false} dataSource={data} />
        </Modal>
      </div>
    );
  }
}

CostCenterSearchForm.propTypes = {
  placeholder: PropTypes.string, //输入框空白时的显示文字
  title: PropTypes.string, //弹窗标题
  length: PropTypes.number, // 可输入项长度
};

CostCenterSearchForm.defaultProps = {
  placeholder: messages('common.please.select'),
  title: '',
  length: 5,
};

export default CostCenterSearchForm;
