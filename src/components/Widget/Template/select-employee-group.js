/**
 * Created By fudebao on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva';
import { Modal,message, Button, Input, Row, Col, Card, Checkbox } from 'antd';
import PropTypes from 'prop-types';

const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;

import httpFetch from 'share/httpFetch';
import SearchArea from 'widget/search-area';

import config from 'config';

import 'styles/pre-payment/my-pre-payment/select-contract.scss';

class SelectEmployeeGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      toData: [],
      useData: [],
      userGroup: [],
      useUserGroup: [],
      userUserGroupEntity: [],
      toSelectList: [], //待选区已经选中的列表
      useSelectList: [], //使用区以选中的列表
      toSearchText: '',
      useSearchText: '',
      selectedData: [],
    };
  }

  renderLabel = item => {
    return (
      <span>
        {item.name}
        {!item.enabled && (
          <span style={{ color: '#FF0000', opacity: 0.5 }}>
            &nbsp;&nbsp;&nbsp;{this.$t('common.disabled' /*禁用*/)}
          </span>
        )}
      </span>
    );
  };

  getList = () => {
    let isOid = this.props.mode == 'oid';

    let url = `${config.baseUrl}/api/user/groups/company?page=0&size=10000`;

    httpFetch.get(url).then(res => {
      if (this.state.selectedData && this.state.selectedData.length) {
        let temp = [];
        let list = [];
        let tempSelect = [];
        res.data.map(item => {
          let valueItem = isOid ? item.userGroupOid : item.id;
          if (this.state.selectedData.findIndex(o => o.value == valueItem) >= 0) {
            let labelShow = this.renderLabel(item);
            list.push({ label: labelShow, value: valueItem });
            tempSelect.push(valueItem);
          } else {
            let labelShow = this.renderLabel(item);
            temp.push({ label: labelShow, value: valueItem });
          }
        });
        this.setState({
          userGroup: temp,
          toData: temp.concat([]),
          useData: list.concat([]),
          useUserGroup: list,
          useSelectList: tempSelect,
          userUserGroupEntity: res.data,
        });
      } else {
        let temp = [];
        res.data.map(item => {
          let valueItem = isOid ? item.userGroupOid : item.id;
          let labelShow = this.renderLabel(item);
          temp.push({ label: labelShow, value: valueItem });
        });
        this.setState({
          userGroup: temp,
          toData: temp.concat([]),
          useData: [],
          useUserGroup: [],
          userUserGroupEntity: res.data,
        });
      }
    });
  };

  componentDidMount() {
    this.setState({ useData: this.props.selectedData || [], selectedData: this.props.selectedData || [] }, () => {
      this.getList();
    });
  }

  checkboxChange = values => {
    this.setState({ toSelectList: values });
  };

  useCheckboxChange = values => {
    this.setState({ useSelectList: values });
  };

  addToUse = () => {
    let array = [];
    let temp = this.state.userGroup.concat([]);
    let toData = this.state.toData.concat([]);
    this.state.toSelectList.map(item => {
      temp.splice(temp.findIndex(o => o.value == item), 1);
      toData.splice(toData.findIndex(o => o.value == item), 1);

      let record = this.state.userGroup.find(o => o.value == item);
      if (record) {
        array.push(record);
      }
    });
    this.setState(
      {
        useUserGroup: this.state.useUserGroup.concat(array),
        useData: this.state.useData.concat(array),
        toData: toData,
        userGroup: temp,
        toSelectList: [],
      },
      () => {
        this.useSearch(this.state.useSearchText);
      }
    );
  };
  removeFromUse = () => {
    let temp = this.state.useUserGroup.concat([]);
    let useData = this.state.useData.concat([]);

    let array = [];

    this.state.useSelectList.map(item => {
      let record = this.state.useUserGroup.find(o => o.value == item);
      if (record) {
        array.push(record);
      }

      temp.splice(temp.findIndex(o => o.value == item), 1);
      useData.splice(useData.findIndex(o => o.value == item), 1);
    });

    this.setState(
      {
        useUserGroup: temp,
        useData: useData,
        useSelectList: [],
        userGroup: this.state.userGroup.concat(array),
        toData: this.state.toData.concat(array),
      },
      () => {
        this.toSearch(this.state.toSearchText);
      }
    );
  };

  onCheckAllChange = e => {
    this.setState({
      toSelectList: e.target.checked ? this.state.userGroup.map(o => o.value) : [],
    });
  };

  onUseCheckAllChange = e => {
    this.setState({
      useSelectList: e.target.checked ? this.state.useUserGroup.map(o => o.value) : [],
    });
  };

  toSearch = value => {
    if (!value) {
      this.setState({ userGroup: this.state.toData, toSearchText: value });
    } else {
      let temp = this.state.toData.filter(o => o.label.props.children[0].indexOf(value) >= 0);

      this.setState({ userGroup: temp, toSearchText: value });
    }
  };

  useSearch = value => {
    if (!value) {
      this.setState({ useUserGroup: this.state.useData, useSearchText: value });
    } else {
      let temp = this.state.useData.filter(o => o.label.props.children[0].indexOf(value) >= 0);

      this.setState({ useUserGroup: temp, useSearchText: value });
    }
  };

  handleOk = () => {
    if (this.props.entity) {
      let temp = [];
      this.state.useData.map(o => {
        this.state.userUserGroupEntity.map(u => {
          if (o.value == (this.props.mode == 'oid' ? u.userGroupOid : u.id)) {
            temp.push(u);
          }
        });
      });
      this.props.onOk({ checkedEntites: temp });
    } else {
      this.props.onOk({ checkedKeys: this.state.useData });
    }
  };

  render() {
    const { visible, onCancel, afterClose } = this.props;
    const {
      data,
      pagination,
      loading,
      userGroup,
      toSelectList,
      useUserGroup,
      useSelectList,
    } = this.state;
    return (
      <Modal
        title={this.$t('select.employee.group.option' /*选择人员组*/)}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        width="70%"
        onOk={this.handleOk}
        className="list-selector select-employee-group"
      >
        <Row gutter={10} style={{ height: '100%' }}>
          <Col span={10} style={{ height: '100%' }}>
            <Card
              title={
                <Checkbox
                  onChange={this.onCheckAllChange}
                  checked={!!toSelectList.length && toSelectList.length == userGroup.length}
                  indeterminate={!!toSelectList.length && toSelectList.length < userGroup.length}
                >
                  {toSelectList.length}/{userGroup.length}
                </Checkbox>
              }
              extra={<span>{this.$t('select.employee.group.wait.option' /*待选区*/)}</span>}
            >
              <Search
                placeholder={this.$t('common.please.enter' /*请输入*/)}
                onChange={e => this.toSearch(e.target.value)}
              />
              {
                <div style={{ margin: '10px 15px' }}>
                  <CheckboxGroup
                    value={toSelectList}
                    onChange={this.checkboxChange}
                    options={userGroup}
                  />
                </div>
              }
            </Card>
          </Col>
          <Col span={4} style={{ height: '100%' }}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <Button
                  disabled={!toSelectList.length}
                  onClick={this.addToUse}
                  size="small"
                  type="primary"
                >
                  {this.$t('select.employee.group.join.use' /*加入使用*/)}&gt;
                </Button>
                <br />
                <Button
                  disabled={!useSelectList.length}
                  onClick={this.removeFromUse}
                  style={{ marginTop: 15 }}
                  size="small"
                  type="primary"
                >
                  &lt;{this.$t('common.back' /*回到代选*/)}
                </Button>
              </div>
            </div>
          </Col>
          <Col span={10} style={{ height: '100%' }}>
            <Card
              title={
                <Checkbox
                  onChange={this.onUseCheckAllChange}
                  checked={!!useSelectList.length && useSelectList.length == useUserGroup.length}
                  indeterminate={
                    !!useSelectList.length && useSelectList.length < useUserGroup.length
                  }
                >
                  {useSelectList.length}/{useUserGroup.length}
                </Checkbox>
              }
              extra={<span>{this.$t('select.employee.group.use.list' /*使用列表*/)}</span>}
            >
              <Search
                placeholder={this.$t('common.please.enter' /*请输入*/)}
                onChange={e => this.useSearch(e.target.value)}
              />
              {
                <div style={{ margin: '10px 15px' }}>
                  <CheckboxGroup
                    value={useSelectList}
                    onChange={this.useCheckboxChange}
                    options={useUserGroup}
                  />
                </div>
              }
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}

SelectEmployeeGroup.propTypes = {
  visible: PropTypes.bool, //对话框是否可见
  onOk: PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组 [{label:"",value:""}]
  selectedData: PropTypes.array, //默认选择的值id数组
  mode: PropTypes.string, //模式 “oid” “id" 默认为id模式
  entity: PropTypes.bool, //entity如果为true返回对象数组 false返回id数组
};

SelectEmployeeGroup.defaultProps = {
  mode: 'id',
  entity: false,
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SelectEmployeeGroup);
