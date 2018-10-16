import PropTypes from 'prop-types';
/**
 * Created By fudebao on 2017/09/21
 */
import React from 'react';
import { connect } from 'react-redux';
import { Modal, Table, message, Button, Input, Row, Col, Card, Checkbox, Tree, Spin } from 'antd';
const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;
const TreeNode = Tree.TreeNode;
import httpFetch from 'share/httpFetch';
import debounce from 'lodash.debounce';
import config from 'config';
import 'styles/pre-payment/my-pre-payment/select-contract.scss';
class SelectDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toData: [], //待选区的数据
      useData: [], //使用区的数据
      useDepartment: [], //使用区显示的数据
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      loading: false,
      toSearchText: '',
      useSearchText: '',
      toSelectList: [], //待选区选中的列表
      useSelectList: [], //使用区选中的列表
    };
    this.onSearch = debounce(this.onSearch, 250);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({ useData: nextProps.selectedData ? nextProps.selectedData : [] }, () => {
        this.getList();
      });
    }
  }

  useSearch = value => {
    if (!value) {
      this.setState({ useDepartment: this.state.useData, useSearchText: value });
    } else {
      let temp = this.state.useData.filter(o => o.label.indexOf(value) >= 0);

      this.setState({ useDepartment: temp, useSearchText: value });
    }
  };

  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} />;
    });
  };

  onLoadData = treeNode => {
    return new Promise(resolve => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      let model = JSON.parse(treeNode.props.eventKey);
      let url = `${config.baseUrl}/api/DepartmentGroup/get/dept/by/id?id=${model.id}&name=`;

      if (this.props.mode == 'oid') {
        url = `${config.baseUrl}/api/department/child/${model.id}?flag=1001`;
      }
      if (this.props.entity) {
        url = `${config.baseUrl}/api/department/child/${model.departmentOID}?flag=1001`;
      }

      httpFetch.get(url).then(res => {
        let temp = [];
        let selected = this.state.toSelectList;

        res.data = res.data || [];

        res.data.map(item => {
          let obj = {
            id: item.id,
            name: item.name,
            path: item.name,
          };

          if (this.props.mode == 'oid') {
            obj = {
              name: item.name,
              path: item.path,
              id: item.departmentOID,
            };
          }
          if (this.props.entity) {
            obj = item;
          }
          let jsonStr = JSON.stringify(obj);

          if (this.props.mode == 'oid') {
            if (this.state.useData.findIndex(o => o.value == item.departmentOID) >= 0) {
              selected.push(jsonStr);
            }
          } else {
            if (this.state.useData.findIndex(o => o.value == item.id) >= 0) {
              selected.push(jsonStr);
            }
          }

          temp.push({ title: item.name, key: jsonStr, isLeaf: !item.hasChildrenDepartments });
        });

        treeNode.props.dataRef.children = temp;

        this.setState({
          toData: this.state.toData.concat([]),
          toSelectList: selected,
        });

        resolve();
      });
    });
  };

  getList = () => {
    this.setState({ loading: true });

    let url = `${config.baseUrl}/api/departments/root?flag=1001`;
    if (this.props.mode == 'oid') {
      url = `${config.baseUrl}/api/departments/root/v2?flag=1001`;
    }

    httpFetch
      .get(url)
      .then(res => {
        if (res.data && res.data.length) {
          this.setState({ useDepartment: this.state.useData });

          let temp = [];
          let selected = [];

          res.data.map(item => {
            let obj = {
              id: item.id,
              name: item.name,
              path: item.name,
            };

            if (this.props.mode == 'oid') {
              obj = {
                name: item.name,
                path: item.path,
                id: item.departmentOID,
              };
            }
            if (this.props.entity) {
              obj = item;
            }
            let jsonStr = JSON.stringify(obj);

            if (this.state.useData.findIndex(o => o.value == item.id) >= 0) {
              selected.push(jsonStr);
            }

            temp.push({ title: item.name, key: jsonStr, isLeaf: !item.hasChildrenDepartments });
          });

          this.setState({ toData: temp, loading: false, toSelectList: selected });
        } else {
          this.setState({ toData: [], loading: false, toSelectList: [] });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onCheck = (values, e) => {
    let temp = [];
    values.checked.map(item => {
      let model = JSON.parse(item);
      temp.push({ label: model.path, value: model.id });
    });

    this.setState({ toSelectList: values.checked });
  };

  handleOk = () => {
    this.props.onOk({
      checkedKeys: this.state.useData.concat([]),
    });
  };

  addToUse = () => {
    let temp = [];

    let useData = this.state.useData;

    this.state.toSelectList.map(item => {
      let model = JSON.parse(item);

      if (useData.findIndex(o => o.value == model.id) >= 0) {
        return;
      }
      if (this.props.entity) {
        let o = {
          departmentId: model.id,
          departmentOid: model.departmentOID,
          name: model.name,
          path: model.path,
          status: model.status,
          key: model.id,
          value: model.id,
          label: model.path,
        };
        temp.push(o);
      } else {
        temp.push({ label: model.path, value: model.id, key: model.id });
      }
    });

    this.setState({
      useData: useData.concat(temp),
      useDepartment: useData.concat(temp),
      useSearchText: '',
    });
  };

  removeFromUse = () => {
    let useData = this.state.useData;
    let toSelectList = this.state.toSelectList;

    this.state.useSelectList.map(item => {
      useData.splice(useData.findIndex(o => o.value == item), 1);
      toSelectList.splice(
        toSelectList.findIndex(o => {
          let model = JSON.parse(o);
          return model.id == item;
        }),
        1
      );
    });

    this.setState({
      useData: useData.concat([]),
      useSelectList: [],
      toSelectList: toSelectList.concat([]),
      useDepartment: useData,
    });
  };

  useCheckboxChange = values => {
    this.setState({ useSelectList: values });
  };

  onSearch = value => {
    if (!value) {
      this.getList();
      return;
    }

    this.setState({ loading: true });

    let url = `${
      config.baseUrl
    }/api/DepartmentGroup/selectDepartment/enabled?deptCode=&name=${encodeURIComponent(value)}`;
    if (this.props.mode == 'oid') {
      url = `${
        config.baseUrl
      }/api/department/like?flag=1002&hasChildren=false&name=${encodeURIComponent(value)}`;
    }

    httpFetch.get(url).then(res => {
      if (res.data && res.data.length) {
        let temp = [];
        let selected = [];
        res.data = res.data || [];
        res.data.map(item => {
          let obj = {
            id: item.id,
            name: item.name,
            path: item.path,
          };

          if (this.props.mode == 'oid') {
            obj = {
              name: item.name,
              path: item.path,
              id: item.departmentOID,
            };
          }
          let jsonStr;
          if (this.props.entity) {
            jsonStr = JSON.stringify(item);
          } else {
            jsonStr = JSON.stringify(obj);
          }

          if (this.props.mode == 'oid') {
            if (this.state.useData.findIndex(o => o.value == item.departmentOID) >= 0) {
              selected.push(jsonStr);
            }
          } else {
            if (this.state.useData.findIndex(o => o.value == item.id) >= 0) {
              selected.push(jsonStr);
            }
          }

          temp.push({ title: item.path, key: jsonStr, isLeaf: true });
        });

        this.setState({ toData: temp, loading: false, toSelectList: selected });
      } else {
        this.setState({ toData: [], loading: false, toSelectList: [] });
      }
    });
  };

  onChange = value => {
    this.setState({ toSearchText: value });
    this.onSearch(value);
  };

  render() {
    const { visible, onCancel, afterClose } = this.props;
    const {
      toData,
      useSelectList,
      toSelectList,
      useDepartment,
      toSearchText,
      useSearchText,
    } = this.state;
    return (
      <Modal
        title={'选择部门'}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        width={'70%'}
        onOk={this.handleOk}
        className="list-selector select-department select-employee-group "
      >
        <Row gutter={10} style={{ height: '100%' }}>
          <Col span={10} style={{ height: '100%' }}>
            <Card title="待选区">
              <Search
                style={{ marginBottom: 8 }}
                value={toSearchText}
                placeholder="请输入"
                onChange={e => this.onChange(e.target.value)}
              />
              <Tree
                checkable
                loadData={this.onLoadData}
                onCheck={this.onCheck}
                checkStrictly={this.props.checkStrictly}
                defaultCheckedKeys={toSelectList}
              >
                {this.renderTreeNodes(toData)}
              </Tree>
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
                  &lt;{this.$t('select.employee.group.back.to.wait') /*回到待选*/}
                </Button>
              </div>
            </div>
          </Col>
          <Col style={{ height: '100%' }} span={10}>
            <Card title={this.$t('select.employee.group.use.list') /*使用列表*/}>
              <Search
                value={useSearchText}
                placeholder={this.$t('common.please.enter') /*请输入*/}
                onChange={e => this.useSearch(e.target.value)}
              />
              {
                <div style={{ margin: '10px 15px' }}>
                  <CheckboxGroup
                    value={useSelectList}
                    onChange={this.useCheckboxChange}
                    options={useDepartment}
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

SelectDepartment.propTypes = {
  onCancel: PropTypes.func,
  afterClose: PropTypes.func,
  visible: PropTypes.bool, //对话框是否可见
  onOk: PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组 [{label:"",value:""}]
  selectedData: PropTypes.array, //默认选择的值id数组
  mode: PropTypes.string, //模式 “oid” “id" 默认为id模式
  entity: PropTypes.bool,
  checkStrictly: PropTypes.bool, //是否关联子部门，默认不关联
};

SelectDepartment.defaultProps = {
  mode: 'id',
  entity: false,
  checkStrictly: true,
};

export default SelectDepartment;
