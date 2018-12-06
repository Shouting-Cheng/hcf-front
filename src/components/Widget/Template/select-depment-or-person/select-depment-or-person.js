/**
 * Created by zhouli on 18/2/2
 * Email li.zhou@huilianyi.com
 * 选择多个部门或者多个人
 * 用于人员组，成本中心项，部门批量调整等
 * 回调函数中返回选择了部门对象、人员对象
 * 由于这个组件比较特殊，要开发新功能,修改bug请找li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Input, Icon, Button } from 'antd';
import DepTreeWithPerson from 'widget/Template/select-depment-or-person/dep-tree-with-person';
import SelectPersonService from './select-depment-or-person.service';
import OrgSearchList from 'widget/Template/select-depment-or-person/org-search-list';

import 'styles/components/template/select-depment-or-person/select-depment-or-person.scss';
import PropTypes from 'prop-types';

const treeData = [];

class SelectDepOrPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDepName: '',
      visible: false,
      treeData: treeData, //部门树数据
      selectedKeys: [], //当前被选中的部门或者人
      selectedKeysDepData: [], //当前被选中的部门或者人的数据
      selectedKeysDepDataFromSearch: [], //当前被选中的部门或者人的数据:是搜索出来的结果
      //上面两个属性要注意，从树里面选择的节点，与从搜索结果选择的节点不一样，需要单独处理
      loading: true,
      expandedKeys: [],
      autoExpandParent: true,
      isSearchOver: false, //是否正在搜索
      //组织架构搜索结果
      searchList: {
        depList: [],
        personList: [],
      },
    };
  }

  componentDidMount() {
    // 组件一旦写上就加载数据了
    // this.getTenantAllDep();
  }

  componentWillReceiveProps(nextProps) {
    //外面控制弹出
    if(!this.state.visible&&nextProps.visible)
     this.showModal()
  }

  showModal = () => {
    SelectPersonService.setIsLoadingPerson(!this.props.onlyDep);
    //显示模态框的时候再加载
    this.getTenantAllDep();
    this.setState({
      selectedKeys: [],
      selectedKeysDepData: [],
      selectedKeysDepDataFromSearch: [],
      visible: true,
    });
  };
  handleOk = e => {
    if (!this.props.depResList && !this.props.personResList) {
      let data = this.getResArrObjData(this.state.selectedKeysDepData);
      if (this.props.onConfirm) {
        this.props.onConfirm(data);
      }
    } else {
      let data = this.getResObjData(
        this.state.selectedKeysDepData,
        this.props.depResList,
        this.props.personResList
      );
      if (this.props.onConfirm) {
        this.props.onConfirm(data);
      }
    }
    this.setState({
      visible: false,
    });
  };

  //获取对象的列表
  getResArrObjData(data) {
    var arr = [];
    if (data.length < 1) {
      arr = arr.concat(this.state.selectedKeysDepDataFromSearch);
      return arr;
    } else {
      for (let i = 0; i < data.length; i++) {
        arr.push(data[i].props.dataRef.originData);
      }
      arr = arr.concat(this.state.selectedKeysDepDataFromSearch);
      return arr;
    }
  }

  //根据传入的配置获取对象的列表
  getResObjData(data, depList, personList) {
    var obj = {
      depList: [],
      personList: [],
    };
    if (data.length < 1 && this.state.selectedKeysDepDataFromSearch.length < 1) {
      return obj;
    } else {
      //树节点
      for (let i = 0; i < data.length; i++) {
        if (data[i].props.dataRef.originData.userOID) {
          //如果是人
          if (personList.length > 0) {
            let item = {};
            for (let j = 0; j < personList.length; j++) {
              item[personList[j]] = data[i].props.dataRef.originData[personList[j]];
            }
            obj.personList.push(item);
          } else {
            obj.personList.push(data[i].props.dataRef.originData);
          }
        } else {
          //如果是部门
          if (depList.length > 0) {
            let item = {};
            for (let j = 0; j < depList.length; j++) {
              item[depList[j]] = data[i].props.dataRef.originData[depList[j]];
            }
            obj.depList.push(item);
          } else {
            obj.depList.push(data[i].props.dataRef.originData);
          }
        }
      }
      // 搜索节点
      if (this.state.selectedKeysDepDataFromSearch.length > 0) {
        var data = this.state.selectedKeysDepDataFromSearch;
        for (let i = 0; i < data.length; i++) {
          if (data[i].userOID) {
            //如果是人
            if (personList.length > 0) {
              let item = {};
              for (let j = 0; j < personList.length; j++) {
                item[personList[j]] = data[i][personList[j]];
              }
              obj.personList.push(item);
            } else {
              obj.personList.push(data[i]);
            }
          } else {
            //如果是部门
            if (depList.length > 0) {
              let item = {};
              for (let j = 0; j < depList.length; j++) {
                item[depList[j]] = data[i][depList[j]];
              }
              obj.depList.push(item);
            } else {
              obj.depList.push(data[i]);
            }
          }
        }
      }
      return obj;
    }
  }

  handleCancel = e => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    this.setState({
      visible: false,
    });
  };
  afterClose = () => {
    this.props.onCancel&&this.props.onCancel();
    this.setState({
      userDepName: '',
      expandedKeys: [],
    });
  };

  // 查询所有集团部门
  getTenantAllDep() {
    SelectPersonService.getTenantAllDep().then(response => {
      this.setState({
        treeData: response,
      });
    });
  }

  // 通过部门oid查询子部门
  getChildDepByDepOID(Dep, parentNode, resolve) {
    SelectPersonService.getChildDepByDepOID(Dep, parentNode, this.props.flagDep).then(response => {
      this.setState({
        treeData: response,
      });
      resolve && resolve();
    });
  }

  // 通过部门oid查询部门下面的员工:挂载到树
  getDepTreeUserByDepOID(Dep, parentNode, resolve) {
    this.setState({ loading: true });
    let params = { page: 0, size: 10000 };
    //查人需要根据是否是公司模式或者严格模式
    if (this.props.strictMode && !this.props.tenantMode) {
      params.roleType = '';
      params.companyOID = this.props.company.companyOID;
      if (this.props.loadCompanyOID) {
        params.companyOID = this.props.loadCompanyOID;
      }
    }

    SelectPersonService.getDepTreeUserByDepOID(
      Dep,
      params,
      parentNode,
      this.props.externalParams
    ).then(response => {
      this.getChildDepByDepOID(Dep, parentNode);
      this.setState({
        treeData: response,
      });
      this.setState({ loading: false });
      resolve && resolve();
    });
  }

  //获取是人的节点：过滤掉部门节点
  getPersonSelected = nodes => {
    var data = {
      nodes: [],
      keys: [],
    };
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].props.dataRef.type != 'DEP') {
        data.nodes.push(nodes[i]);
        data.keys.push(nodes[i].key);
      }
    }
    return data;
  };

  //点击部门树的时候，如果这个节点已经在搜索结果中并且被选择，就需要移除
  removeSelectedKeysDepDataFromSearch(node) {
    let key = node.props.dataRef.key;
    let list = this.state.selectedKeysDepDataFromSearch;
    let newList = [];
    for (let i = 0; i < list.length; i++) {
      let oid = list[i].userOID ? list[i].userOID : list[i].departmentOID;
      if (oid != key) {
        newList.push(list[i]);
      }
    }
    this.setState(
      {
        selectedKeysDepDataFromSearch: newList,
      },
      () => {}
    );
  }

  // 点击被选择
  onSelect = (selectedKeys, info) => {
    //如果只能单选，直接把最后点击的加入，其他就不要
    if (!this.props.multiple) {
      this.setState(
        {
          selectedKeys: [],
          selectedKeysDepData: [],
          selectedKeysDepDataFromSearch: [],
        },
        () => {
          this.onSelectAfter(selectedKeys, info);
        }
      );
    } else {
      this.onSelectAfter(selectedKeys, info);
    }
  };
  onSelectAfter = (selectedKeys, info) => {
    // 如果搜索结果列表中有，需要把搜索结果列表中删除
    this.removeSelectedKeysDepDataFromSearch(info.node);
    if (this.props.onlyPerson) {
      //如果只能选择人
      let personSelected = this.getPersonSelected(info.selectedNodes);
      this.setState(
        {
          selectedKeys: personSelected.keys,
          selectedKeysDepData: personSelected.nodes,
        },
        () => {}
      );
    } else {
      //部门与人都可以选择
      let selectedKeysDepData = info.selectedNodes;
      this.setState({
        selectedKeys: selectedKeys,
        selectedKeysDepData: selectedKeysDepData,
      });
    }
  };
  // 移除已经选择了的
  unSelect = oid => {
    let removedSelectedKeys = [];
    let removedSelectedKeysDepData = [];
    for (let i = 0; i < this.state.selectedKeys.length; i++) {
      if (this.state.selectedKeys[i] != oid) {
        removedSelectedKeys.push(this.state.selectedKeys[i]);
      }
    }
    for (let i = 0; i < this.state.selectedKeysDepData.length; i++) {
      if (this.state.selectedKeysDepData[i].key != oid) {
        removedSelectedKeysDepData.push(this.state.selectedKeysDepData[i]);
      }
    }
    this.setState(
      {
        selectedKeys: removedSelectedKeys,
        selectedKeysDepData: removedSelectedKeysDepData,
      },
      () => {}
    );
  };

  loadData = node => {
    return new Promise(resolve => {
      if (!SelectPersonService.checkChildHasLoad(node.props.dataRef)) {
        if (this.props.onlyDep) {
          this.getChildDepByDepOID(node.props.dataRef.originData, node.props.dataRef, resolve);
        } else {
          this.getDepTreeUserByDepOID(node.props.dataRef.originData, node.props.dataRef, resolve);
        }
      }
    });
  };

  // 点击展开的时候
  onExpand = (expandedKeys, { expanded, node }) => {
    // if (expanded && !SelectPersonService.checkChildHasLoad(node.props.dataRef)) {
    //   // 目前写成同步写法，先请求人，再拿子部门
    //   // this.getChildDepByDepOID(node.props.dataRef.originData, node.props.dataRef);
    //   //如果只展示到部门
    //   if (this.props.onlyDep) {
    //     this.getChildDepByDepOID(node.props.dataRef.originData, node.props.dataRef);
    //   } else {
    //     this.getDepTreeUserByDepOID(node.props.dataRef.originData, node.props.dataRef);
    //   }
    // }
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  //搜索人或者部门置空
  emitEmpty = () => {
    this.userNameDepInput.focus();
    this.setState({ userDepName: '' });
  };
  //搜索人或者部门
  onChangeUserDepName = e => {
    this.setState({
      userDepName: e.target.value,
      isSearchOver: false,
    });
    SelectPersonService.searchDepV2(e.target.value, this.props.externalParams).then(response => {
      let searchList = {
        depList: response.data.departments,
        personList: response.data.users,
      };
      this.setState({
        searchList: searchList,
        isSearchOver: true,
      });
    });
  };
  //搜索结果的列表被点击
  searchListOnClicked = item => {
    let oid = item.userOID ? item.userOID : item.departmentOID;
    //如果只能单选，直接把最后点击的加入，其他就不要
    if (!this.props.multiple) {
      let key = item.userOID ? item.userOID : item.departmentOID;
      this.setState({
        userDepName: this.props.isClickSearchHide ? '' : this.state.userDepName,
        selectedKeys: [key],
        selectedKeysDepData: [],
        selectedKeysDepDataFromSearch: [item],
      });
      return;
    }
    if (this.checkNodeHasSelected(oid)) {
      //这里还涉及到一个去重，就是已经从部门树中选择了的节点，这个函数就不需要再走下去了
      this.setState({
        userDepName: this.props.isClickSearchHide ? '' : this.state.userDepName,
      });
      return;
    } else {
      let list = this.state.selectedKeysDepDataFromSearch;
      list.push(item);
      let selectedKeys = this.state.selectedKeys;
      let key = item.userOID ? item.userOID : item.departmentOID;
      selectedKeys.push(key);
      this.setState({
        userDepName: this.props.isClickSearchHide ? '' : this.state.userDepName,
        selectedKeys,
        selectedKeysDepDataFromSearch: list,
      });
    }
  };

  //检查节点是否已经有了:如果有就返回true
  checkNodeHasSelected(oid) {
    for (let i = 0; i < this.state.selectedKeys.length; i++) {
      if (oid === this.state.selectedKeys[i]) {
        return true;
      }
    }
    for (let i = 0; i < this.state.selectedKeysDepDataFromSearch.length; i++) {
      let item = this.state.selectedKeysDepDataFromSearch[i];
      let key = item.userOID ? item.userOID : item.departmentOID;
      if (oid === key) {
        return true;
      }
    }
    return false;
  }

  //渲染从搜索结果中选择的人或者部门
  renderSelectedFromSearch(list) {
    //item是否在list里面
    function _isInSelected(list, item) {
      for (let i = 0; i < list.length; i++) {
        if (item === list[i].key) {
          return true;
        }
      }
      return false;
    }
    if (list.length < 1) {
      return <div />;
    } else {
      return list.map(item => {
        if (item.userOID) {
          if (_isInSelected(this.state.selectedKeysDepData, item.userOID)) {
          } else {
            return (
              <div className="selected-person-item" key={item.userOID}>
                <div className="type-icon">
                  <Icon type="user" />
                </div>
                <div className="name">{item.fullName}</div>
                <div
                  className="remove-icon"
                  onClick={() => {
                    this.unSelectFromSearch(item.userOID);
                  }}
                >
                  <Icon type="close" />
                </div>
                <div className="clear" />
              </div>
            );
          }
        } else {
          if (_isInSelected(this.state.selectedKeysDepData, item.departmentOID)) {
          } else {
            return (
              <div className="selected-person-item" key={item.departmentOID}>
                <div className="type-icon">
                  <Icon type="folder" />
                </div>
                <div className="name">{item.name}</div>
                <div
                  className="remove-icon"
                  onClick={() => {
                    this.unSelectFromSearch(item.departmentOID);
                  }}
                >
                  <Icon type="close" />
                </div>
                <div className="clear" />
              </div>
            );
          }
        }
      });
    }
  }
  unSelectPersonFromTree = oid => {
    //移除一个人，还需要移除在部门树上的选择状态
    const { selectedKeys } = this.state; //当前被选中的部门或者人
    for (let i = 0; i < selectedKeys.length; i++) {
      if (selectedKeys[i] === oid) {
        selectedKeys.splice(i, 1);
      }
    }
    this.setState({
      //必须得深拷贝重新设置状态
      selectedKeys: [...selectedKeys],
    });
  };

  // 移除已经选择了的:针对搜索结果
  unSelectFromSearch(oid) {
    let removedFromSearch = [];
    let list = this.state.selectedKeysDepDataFromSearch;
    for (let i = 0; i < list.length; i++) {
      if (list[i].userOID) {
        //人
        if (list[i].userOID != oid) {
          removedFromSearch.push(list[i]);
        }
      } else {
        // 部门
        if (list[i].departmentOID != oid) {
          removedFromSearch.push(list[i]);
        }
      }
    }
    this.setState(
      {
        selectedKeysDepDataFromSearch: removedFromSearch,
      },
      () => {
        this.unSelectPersonFromTree(oid);
      }
    );
  }

  //渲染部门树或者搜索结果
  renderOrgTreeOrSearchList = e => {
    if (this.state.userDepName.length > 0) {
      return (
        <div>
          <OrgSearchList
            multiple={this.props.multiple}
            selectedHandle={this.searchListOnClicked}
            searchList={this.state.searchList}
            onlyDep={this.props.onlyDep}
            onlyPerson={this.props.onlyPerson}
            isSearchOver={this.state.isSearchOver}
          />
        </div>
      );
    } else {
      return (
        <div>
          <DepTreeWithPerson
            multiple={this.props.multiple}
            treeData={this.state.treeData}
            selectedKeys={this.state.selectedKeys}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={this.state.autoExpandParent}
            onSelect={this.onSelect}
            onExpand={this.onExpand}
            loadData={this.loadData}
          />
        </div>
      );
    }
  };

  //渲染已经选择的人或者部门
  renderSelected(list) {
    if (list.length < 1 && this.state.selectedKeysDepDataFromSearch.length < 1) {
      return (
        <div className="no-person">
          <Icon type="left" />
          {/*请在左边选择*/
          this.$t('sdp.please-chose-left')}
        </div>
      );
    }
    return list.map(item => {
      if (item.props.dataRef.originData.userOID) {
        return (
          <div className="selected-person-item" key={item.props.dataRef.originData.userOID}>
            <div className="type-icon">
              <Icon type="user" />
            </div>
            <div className="name">{item.props.dataRef.originData.fullName}</div>
            <div
              className="remove-icon"
              onClick={() => {
                this.unSelect(item.props.dataRef.originData.userOID);
              }}
            >
              <Icon type="close" />
            </div>
            <div className="clear" />
          </div>
        );
      } else {
        return (
          <div className="selected-person-item" key={item.props.dataRef.originData.departmentOID}>
            <div className="type-icon">
              <Icon type="folder" />
            </div>
            <div className="name">{item.props.dataRef.originData.name}</div>
            <div
              className="remove-icon"
              onClick={() => {
                this.unSelect(item.props.dataRef.originData.departmentOID);
              }}
            >
              <Icon type="close" />
            </div>
            <div className="clear" />
          </div>
        );
      }
    });
  }

  renderButton() {
    if (this.props.renderButton) {
      return (
        <Button
          onClick={this.showModal}
          disabled={this.props.buttonDisabled}
          type={this.props.buttonType}
        >
          {this.$t(this.props.title)}
        </Button>
      );
    } else {
      return (
        <div onClick={!this.props.buttonDisabled && this.showModal} className="placeholder-class">
          {this.props.title}
        </div>
      );
    }
  }

  renderSelectTitle = () => {
    if (this.props.onlyDep) {
      return (
        <div className="selected-person-title">
          {/*已经选择的部门*/
          this.$t('sdp.chosed-dep')}
        </div>
      );
    }
    if (this.props.onlyPerson) {
      return (
        <div className="selected-person-title">
          {/*已经选择的人*/
          this.$t('sdp.chosed-person')}
        </div>
      );
    }
    return (
      <div className="selected-person-title">
        {/*已经选择的人或部门*/
        this.$t('sdp.chosed-dep-person')}
      </div>
    );
  };

  render() {
    const { userDepName } = this.state;
    const suffix = userDepName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    let searchInputPlaceholder = this.$t('sdp.dep-code-name');
    if (this.props.onlyPerson) {
      searchInputPlaceholder = this.$t('sdp.person-name');
    }
    if (this.props.onlyDep) {
      searchInputPlaceholder = this.$t('sdp.dep-name');
    }
    return (
      <div className="select-dep-or-person">
        <div>
          {this.renderButton()}
          <Modal
            width={900}
            className="select-dep-or-person-modal"
            title={this.props.title}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            afterClose={this.afterClose}
          >
            <div className="select-person-modal-left">
              <Input
                // 部门名称/部门编码/员工名称
                placeholder={searchInputPlaceholder}
                key={'deporgsearch'}
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={suffix}
                value={userDepName}
                onChange={this.onChangeUserDepName}
                ref={node => (this.userNameDepInput = node)}
              />
              {this.renderOrgTreeOrSearchList()}
            </div>
            <div className="select-person-modal-right">
              {this.renderSelectTitle()}
              <div className="selected-person-wrap">
                {this.renderSelectedFromSearch(this.state.selectedKeysDepDataFromSearch)}
                {this.renderSelected(this.state.selectedKeysDepData)}
              </div>
            </div>
            <div className="clear" />
          </Modal>
        </div>
      </div>
    );
  }
}

SelectDepOrPerson.propTypes = {
  onConfirm: PropTypes.func.isRequired, // 点击确认之后的回调：返回结果
  depResList: PropTypes.array, //返回的部门列表配置[id,departmentOID]，默认全部属性
  personResList: PropTypes.array, //返回的人列表配置[id,userOID,email]等，默认全部属性
  onlyDep: PropTypes.bool, //是否只选部门，默认false选择部门与人
  onlyPerson: PropTypes.bool, //是否只选人，默认false选择部门与人
  multiple: PropTypes.bool, //是否多选.默认true
  title: PropTypes.any, //
  buttonType: PropTypes.string,
  buttonDisabled: PropTypes.bool,
  strictMode: PropTypes.bool, //严格模式，公司模式只加载当前公司的人
  loadCompanyOID: PropTypes.any, //严格模式，若是传入这个参数，就之加本公司的人
  renderButton: PropTypes.bool, //是否渲染一个button,默认是,主要如果不能再外层包裹一个button，不然再ie上有兼容问题
  externalParams: PropTypes.object, //用于渲染树节点时需要的额外参数 add by mengsha.wang@huilianyi.com
  isClickSearchHide: PropTypes.bool, //点击搜索结果，是否立即清除关键字
};

SelectDepOrPerson.defaultProps = {
  title: 'sdp.chose-dep-person',
  multiple: true,
  onlyDep: false,
  onlyPerson: false,
  buttonType: '',
  buttonDisabled: false,
  renderButton: true,
  strictMode: false,
  loadCompanyOID: false,
  externalParams: {},
  isClickSearchHide: true,
};
//严格模式，公司模式只加载当前公司的人
//严格模式，集团模式只加载所有公司的人
function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: true,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SelectDepOrPerson);

//默认返回部门与人的对象列表
