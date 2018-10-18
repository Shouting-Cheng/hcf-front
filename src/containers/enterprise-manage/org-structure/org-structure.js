import {messages} from "share/common";
/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import {connect} from 'react-redux';

import {
  Button, Table, Icon, Menu, Dropdown, Input, Modal, Popover
} from 'antd';

const confirm = Modal.confirm;
const Search = Input.Search;
// 组织架构
import OrgTree from 'containers/enterprise-manage/org-structure/org-component/org-tree';
//搜索结果列表
import OrgSearchList from 'containers/enterprise-manage/org-structure/org-component/org-search-list';
//搜索结果中人员信息详情
import OrgPersonInfo from 'containers/enterprise-manage/org-structure/org-component/org-person-info';
// 部门角色
import OrgRoles from 'containers/enterprise-manage/org-structure/org-component/org-roles';
import 'styles/enterprise-manage/org-structure/org-structure.scss';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';
import {SelectDepOrPerson} from 'components/index';
import menuRoute from 'routes/menuRoute';
import {getErrorMessage} from 'share/errorMessage';
import SlideFrame from 'components/slide-frame';
import OrgNewDep from 'containers/enterprise-manage/org-structure/org-component/org-new-dep';
import {superThrottle, hasAuthority} from 'share/common';

const treeData = [];

class OrgStructure extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      ROLE_TENANT_ADMIN: false,
      CREATE_DATA_TYPE: false,
      //新增部门，编辑部门
      slideFrame: {
        title: "",
        visible: false,
        params: {}
      },
      visibleBatchAdjustment: false,//批量调整的模态框：是否显示
      batchAdjustmentFrom: [],//批量调整的数据：源
      batchAdjustmentTo: [],//批量调整的数据：目标
      loadingBatchAdjustment: false,//批量调整点击确认
      disabledBatchAdjustment: true,//批量调整 确认按钮 disabled
      userDepName: '',//搜索关键字：员工姓名与部门编码，部门名称
      userName: '',//搜索关键字：员工工号与姓名
      treeData: treeData,//部门树数据
      selectedKeys: [],//当前被选中的部门，默认展示第一个
      selectedKeysDepData: {},//当前被选中的部门的数据
      selectedKeysDepDataByApi: {},//当前被选中的部门通过api查询的详情
      roleIsEdit: false,//部门角色是否正在编辑
      loading: true,
      expandedKeys: [],
      autoExpandParent: true,
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      // 部门人员数据
      depUserData: [],
      // 表格
      columns: [
        {
          /*工号*/
          title: messages('org.employeeID'),
          key: "employeeID",
          dataIndex: 'employeeID',
          width: '10%',
        },
        {
          /*姓名*/
          width: '20%',
          title: messages('org.name'),
          key: "fullName",
          dataIndex: 'fullName',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          /*联系方式*/
          title: messages('org.contact-way'),
          key: "mobile",
          dataIndex: 'mobile',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          /*邮箱*/
          title: messages('org.email'),
          key: "email",
          dataIndex: 'email',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        //这个列下期把人员信息详情做好之后才显示
        {
          //操作
          title: messages('org.operation'), key: "operation", dataIndex: 'operation',
          width: '10%',
          render: (text, record) => (
            <span>
             <a href="#" onClick={(e) => this.useDetail(e, record)}>{messages('common.detail')}</a>
           </span>
          )
        }
      ],
      isSearchOver: false,//是否正在搜索
      //被选择了的人:要移除的人的key,用来翻页
      selectedRowKeys: [],
      //组织架构搜索结果
      searchList: {
        depList: [],
        personList: []
      },
      searchActiveUser: {},//搜索部门树部门与成员，被选中的成员
      depNeedMoveOut: []//当前部门要移除的人
    }
  }

  componentDidMount() {
    let ROLE_TENANT_ADMIN = this.props.tenantMode;
    //人员导入方式：this.props.company.createDataType如果是 1002，属于接口导入
    //新增部门,批量调整,部门编辑,部门停用启用, 子部门加减 都要禁止
    let CREATE_DATA_TYPE = (parseInt(this.props.company.createDataType) != 1002);
    this.setState({
      ROLE_TENANT_ADMIN,
      CREATE_DATA_TYPE
    })

    //不然账号切换之后还存在
    OrgService.resetTreeList();
    this.getTenantAllDep();
  }

  //用户详情页面
  useDetail = (e, record) => {
    let path = menuRoute.getRouteItem('person-detail', 'key').url.replace(":userOID", record.userOID);
    this.context.router.push(path);
  }
  //角色设置页面
  goToRolesList = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('org-structure', 'key').children.orgStructureRolesList.url);
  }

  // 查询所有集团部门
  //是否是删除操作
  getTenantAllDep(isDelete) {
    //let expandedKeys = this.state.expandedKeys;
    //把展开的都收起
    // this.setState({
    //   expandedKeys:[],
    //   autoExpandParent: false,
    // });
    // 要点击开
    // expandedKeys.forEach(function (item) {
    //
    // })
    //老接口，先获取顶级部门，然后点击一个部门获取下面的部门
    // OrgService.getTenantAllDep()
    //新接口获取全部部门，子部门
    OrgService.getTenantAllDepV2(this.state.expandedKeys)
      .then((response) => {
        this.setState({
          treeData: response,
          selectedKeysDepData: this.state.selectedKeys.length > 0 ? this.state.selectedKeysDepData : response[0].originData,
          selectedKeys: this.state.selectedKeys.length > 0 ? this.state.selectedKeys : [response[0].key]
        }, () => {
          //如果删除了激活的节点，重新激活第一个节点
          if (isDelete && this.state.selectedKeysDepData.departmentOID === this.state.selectedKeysDepDataByApi.departmentOID) {
            this.setState({
              treeData: response,
              selectedKeysDepData: response[0].originData,
              selectedKeys: [response[0].key]
            }, () => {
              this.getDepDetailByDepOID(this.state.selectedKeysDepData);
              this.getDepUserByDepOID(this.state.selectedKeysDepData);
            })
          } else {
            if (this.state.selectedKeysDepData.departmentOID === this.state.selectedKeysDepDataByApi.departmentOID) {
              //如果已经查询了，就不用查询了
            } else {
              this.getDepDetailByDepOID(this.state.selectedKeysDepData);
              this.getDepUserByDepOID(this.state.selectedKeysDepData);
            }
          }
        });
      })
  }

  // 通过部门oid查询子部门
  _getChildDepByDepOID(Dep, parentNode) {
    OrgService._getChildDepByDepOID(Dep, parentNode)
      .then((response) => {
        this.setState({
          treeData: response
        });
      })
  }

  // 通过部门oid查询部门详情
  getDepDetailByDepOID(Dep) {
    OrgService.getDepDetailByDepOID(Dep)
      .then((response) => {
        let data = response.data;
        data.departmentPositionDTOList = OrgService.sortDepartmentPositionDTOList(data.departmentPositionDTOList);
        this.setState({
          selectedKeysDepDataByApi: data
        });
      })
  }

  // 通过部门oid查询部门下面的员工
  getDepUserByDepOID(Dep) {
    this.setState({loading: true});
    const {pagination} = this.state;
    let params = {
      departmentOID: Dep.departmentOID,
      size: this.state.pagination.pageSize,
      page: this.state.pagination.page,
      // status: 1001,
      keyword: ""
    }
    OrgService.searchPersonInDep(params)
      .then((response) => {
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          pagination,
          loading: false,
          depUserData: response.data
        }, () => {
          this.refreshRowSelection();
        });
      })
  }


  //只搜部门：这个没有异步
  onlySearchDep = (e) => {
    const value = e.target.value;
    //这个搜索可以不用节流函数
    if (value && value.length > 0) {
      OrgService.onlySearchDep(value)
        .then((res) => {
          this.setState({
            treeData: res
          });
        })
    } else {
      this.getTenantAllDep();
    }
  }
  // 点击被选择
  onSelect = (selectedKeys, info) => {
    let _this = this;
    if (this.state.roleIsEdit) {
      confirm({
        title: messages('org.tips'),//提示
        content: messages('org.tip-role-is-edit'),//部门正在编辑没有保存，是否跳转?
        onOk() {
          _this.onSelectConfrim(selectedKeys, info)
        },
        onCancel() {
        },
      });
    } else {
      this.onSelectConfrim(selectedKeys, info)
    }
  }
  onSelectConfrim = (selectedKeys, info) => {
    const {pagination} = this.state;
    pagination.page = 0;
    pagination.current = 1;
    this.setState(
      {
        pagination,
        depNeedMoveOut: [],
        selectedRowKeys: []
      }
    );
    if (info.selectedNodes.length > 0) {
      let selectedKeysDepData = info.selectedNodes[0].props.dataRef.originData;
      this.setState(
        {
          selectedKeys: selectedKeys,
          selectedKeysDepData: selectedKeysDepData
        }
      );
      //这个东西可以查询一次就缓存起来
      // todo
      this.getDepDetailByDepOID(selectedKeysDepData);
      this.getDepUserByDepOID(selectedKeysDepData);
    }
  }
  // 点击展开的时候
  onExpand = (expandedKeys, {expanded, node}) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    // 检测一下这节点的字节点是不是已经被加载
    // 如果没有被加载才去加载，或者创建了新的子节点才去加载
    // if (expanded && !OrgService.checkChildHasLoad(node.props.dataRef)) {
    //  这是通过接口获取
    //   this.getChildDepByDepOID(node.props.dataRef.originData, node.props.dataRef)
    // }
    //这是从前端获取
    //部门树已经构建好，所以不比每次去请求
    //this._getChildDepByDepOID(node.props.dataRef.originData, node.props.dataRef)
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }


  // 部门树上节点的菜单------start---
  //组织架构树顶部的meun
  renderOrgMoreMeun = () => {
    
    return (
      <Menu>
        <Menu.Item key="0">
          <div onClick={(event) => {
            this.goToRolesList()
          }}>
            {/*设置部门角色*/}
            {messages('org.set-role')}</div>
        </Menu.Item>
        <Menu.Item key="1">
          <div onClick={(event) => {
            this.showBatchAdjustment()
          }}>
            {/*批量调整*/}
            {messages('org.batch-move')}
          </div>
        </Menu.Item>
        <Menu.Item key="2">
          <div onClick={(event) => {
            this.clickMeunNewDep(event, {}, {})
          }}>
            {/*创建部门*/}
            {messages('org.create-dep')}
          </div>
        </Menu.Item>
      </Menu>
    )
  }

  //部门操作菜单
  treeNodeSettingClick = (e) => {
    e.stopPropagation();
  }
  // 停用该部门
  disabledDep = (item) => {
    let oid = item.departmentOID;
    OrgService.disabledDep(oid)
      .then((res) => {
        this.getTenantAllDep();
      })
      .catch((res) => {
        let message = getErrorMessage(res.response);
        
        Modal.warning({
          title: messages('org.tips'),//提示
          content: message,
        });
      })
  }
  // 启用该部门
  enabledDep = (item, node) => {
    let oid = item.departmentOID;
    OrgService.enabledDep(oid)
      .then((res) => {
        this.getTenantAllDep();
      })
  }
  //创建平级部门
  clickMeunNewDep = (e, item, node) => {
    item.c_type = "C_DEP";
    item.treeNode = node;
    
    let slideFrame = {
      title: messages('org.create-dep'),//创建部门"",
      visible: true,
      params: item
    }
    this.setState({
      slideFrame
    })
  }
  //创建子部门
  clickMeunNewChildDep = (e, item, node) => {
    
    item.treeNode = node;
    //传入的部门
    item.c_type = "C_CHILD";
    let slideFrame = {
      title: messages('org.create-child-dep'),//创建子部门"",
      visible: true,
      params: item
    }
    this.setState({
      slideFrame
    })
  }
  //删除部门
  clickMeunDeleteDep = (item) => {
    let oid = item.departmentOID;
    OrgService.deleteDep(oid)
      .then((res) => {
        //删除成功
        this.getTenantAllDep(true);
      })
      .catch((res) => {
        //删除失败
        let message = getErrorMessage(res.response);
        
        Modal.warning({
          title: messages('org.tips'),//提示
          content: message,
        });
      })
  }
  updateDepSuccess = () => {
    this.getTenantAllDep();
  }
  // 部门树上节点的菜单------end---


  // 批量调整---start-----
  //调出批量调整的模态框
  showBatchAdjustment() {
    this.setState({visibleBatchAdjustment: true})
  }

  handleBatchAdjustmentOk = () => {
    let userOIDs = [];
    let oldDepartmentList = [];
    for (let i = 0; i < this.state.batchAdjustmentFrom.length; i++) {
      if (this.state.batchAdjustmentFrom[i].userOID) {
        userOIDs.push(this.state.batchAdjustmentFrom[i].userOID);
      } else {
        oldDepartmentList.push(this.state.batchAdjustmentFrom[i].departmentOID);
      }
    }
    let params = {
      "departmentOID": this.state.batchAdjustmentTo[0].departmentOID,
      "userOIDs": userOIDs,
      "oldDepartmentList": oldDepartmentList
    }
    this.setState({loadingBatchAdjustment: true});
    OrgService.batchMovePerson(params)
      .then((response) => {
        this.setState({
          visibleBatchAdjustment: false,
          loadingBatchAdjustment: false
        });
        this.callbackBatchAdjustmentFrom([]);
        this.callbackBatchAdjustmentTo([]);
        //批量调整之后查询
        this.getDepDetailByDepOID(this.state.selectedKeysDepData);
        this.getDepUserByDepOID(this.state.selectedKeysDepData);
      })
      .catch(() => {
        this.setState({loadingBatchAdjustment: false});
      })
  }
  handleBatchAdjustmentCancel = () => {
    this.setState({visibleBatchAdjustment: false})
  }
  //批量调整部门：目标部门
  callbackBatchAdjustmentTo = (arr) => {
    this.setState({
      batchAdjustmentTo: arr
    }, () => {
      this.setBatchAdjustmentBtnEnabled();
    })
  }
  renderBatchAdjustmentTo = (arr) => {
    
    if (arr.length < 1) {
      return (
        <span>
          {/*还未选择*/}
          {messages('org.no-select')}
        </span>
      )
    } else {
      return (
        <span>
          {/*已选*/}
          {messages('org.selected')}
          {arr[0].name}</span>
      )
    }
  }
  //批量调整部门：源部门与人
  callbackBatchAdjustmentFrom = (arr) => {
    this.setState({
      batchAdjustmentFrom: arr
    }, () => {
      this.setBatchAdjustmentBtnEnabled();
    })
  }
  setBatchAdjustmentBtnEnabled = () => {
    let disabledBatchAdjustment = true;
    if (this.state.batchAdjustmentFrom.length > 0 && this.state.batchAdjustmentTo.length > 0) {
      disabledBatchAdjustment = false;
    }
    this.setState({
      disabledBatchAdjustment
    })
  }
  // 批量调整---end-----


  // 当前部门人员------start------
  // 部门：移入员工
  moveInPerson = (arr) => {
    let userOIDs = [];
    let oldDepartmentList = [];
    //这个地方原则上只有移动员工，但是不排除以后加上部门下的员工
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].userOID) {
        userOIDs.push(arr[i].userOID);
      } else {
        oldDepartmentList.push(arr[i].departmentOID);
      }
    }
    let params = {
      "departmentOID": this.state.selectedKeysDepData.departmentOID,
      "userOIDs": userOIDs,
      "oldDepartmentList": oldDepartmentList
    }
    OrgService.batchMovePerson(params)
      .then((response) => {
        this.setState({visibleBatchAdjustment: false})
        this.getDepDetailByDepOID(this.state.selectedKeysDepData);
        this.getDepUserByDepOID(this.state.selectedKeysDepData);
      })
  }
  // 部门：移除员工
  moveOutPerson = (arr) => {

    let params = {
      "departmentOID": arr[0].departmentOID,
      "userOIDs": this.state.depNeedMoveOut,
      "oldDepartmentList": []
    }
    OrgService.batchMovePerson(params)
      .then((response) => {
        this.clearRowSelection();
        this.getDepUserByDepOID(this.state.selectedKeysDepData);
        this.getDepDetailByDepOID(this.state.selectedKeysDepData);
      })

  }
  // 部门人员翻页
  onUserChangePager = (pagination, filters, sorter) => {
    this.setState({
      pagination: {
        current: pagination.current,
        page: pagination.current - 1,
        pageSize: pagination.pageSize,
        total: pagination.total
      }
    }, () => {
      this.getDepUserByDepOID(this.state.selectedKeysDepData);
    })
  }
  //选中项发生变化的时的回调
  onSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys: selectedRowKeys});
  };
  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let depNeedMoveOut = this.state.depNeedMoveOut;
    if (selected) {
      depNeedMoveOut.push(record.userOID)
    } else {
      depNeedMoveOut.delete(record.userOID)
    }
    this.setState({depNeedMoveOut})
  };
  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let depNeedMoveOut = this.state.depNeedMoveOut;
    if (selected) {
      changeRows.map(item => {
        depNeedMoveOut.push(item.userOID)
      })
    } else {
      changeRows.map(item => {
        depNeedMoveOut.delete(item.userOID)
      })
    }
    this.setState({depNeedMoveOut})
  };

  //换页后根据OIDs刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.depNeedMoveOut.map(userOID => {
      this.state.depUserData.map((item, index) => {
        if (item.userOID === userOID)
          selectedRowKeys.push(index);
      })
    });
    this.setState({selectedRowKeys});
  }

  //清空选择框：选了的人
  clearRowSelection() {
    this.setState({depNeedMoveOut: [], selectedRowKeys: []});
  }

  //搜索部门下的人
  emitEmptyForDep = () => {
    this.userNameInput.focus();
    this.setState({userName: ''}, () => {
      this.onChangeUserName();
    });
  }


  //搜索人名或者工号
  onChangeUserName = (e) => {
    const {pagination} = this.state;
    let useName = "";
    if (e) {
      useName = e.target.value;
    }
    this.setState({
      userName: useName,
      loading: true
    }, () => {
      let params = {
        departmentOID: this.state.selectedKeysDepData.departmentOID,
        size: this.state.pagination.pageSize,
        page: this.state.pagination.page,
        // status: 1001,
        roleType: "TENANT",
        keyword: this.state.userName
      }
      OrgService.searchPersonInDep(params)
        .then((response) => {
          pagination.total = Number(response.headers['x-total-count']);
          this.setState({
            pagination,
            depUserData: response.data
          });
          this.setState({loading: false});
        })
    });

  }
  // 当前部门人员------end------


  // 搜索整个部门树与搜索结果----start
  //搜索整个部门树下面的部门与人
  //搜索人或者部门编码或部门名称
  onChangeUserDepName = (val) => {
    this.setState({
      isSearchOver: false
    });
    //val不用设置了，在oninput设置过了
    OrgService.searchDepOrPersonV2(this.state.userDepName)
      .then((response) => {
        let searchList = {
          depList: response.data.departments,
          personList: response.data.users
        }
        this.setState({
          isSearchOver: true,
          searchList: searchList
        });
      })
  }
  emitEmpty = () => {
    this.setState({userDepName: ''});
  }
  //搜索整个部门树下面的部门与人
  //为了节流函数
  onChangeSetUserDepName = superThrottle(() => {
    this.onChangeUserDepName();
  }, 500, 3000)
  //为了节流函数
  onInputUserDepName = (e) => {
    //这句是为了使用节流函数，不然onChangeSetUserDepName函数中只能使用上一次的输入
    this.state.userDepName = e.target.value;
    this.setState({userDepName: e.target.value});
  }

  //部门树搜索结果点击目标
  selectItemHandle = (item) => {
    if (item.userOID) {
      this.setState({
        searchActiveUser: item
      })
    } else {
      this.setState({
        searchActiveUser: item,
        // userDepName: '',
        selectedKeys: [item.departmentOID],
        selectedKeysDepData: item
      })

      this.getDepDetailByDepOID(item);
      this.getDepUserByDepOID(item);
    }

  }
  //渲染部门树或者搜索结果
  renderOrgTreeOrSearchList = (e) => {
    if (this.state.userDepName.length > 0) {
      return <div>
        <OrgSearchList
          isSearchOver={this.state.isSearchOver}
          searchList={this.state.searchList}
          selectItemHandle={this.selectItemHandle}
        />
      </div>
    } else {
      return <div>
        <OrgTree
          ROLE_TENANT_ADMIN={this.state.ROLE_TENANT_ADMIN}
          CREATE_DATA_TYPE={this.state.CREATE_DATA_TYPE}
          onlySearchDep={this.onlySearchDep}
          enabledDep={this.enabledDep}
          disabledDep={this.disabledDep}
          treeData={this.state.treeData}
          selectedKeys={this.state.selectedKeys}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          treeNodeSettingClick={this.treeNodeSettingClick}
          clickMeunDeleteDep={this.clickMeunDeleteDep}
          clickMeunNewDep={this.clickMeunNewDep}
          clickMeunNewChildDep={this.clickMeunNewChildDep}
        ></OrgTree>
      </div>
    }
  }

  // 搜索整个部门树与搜索结果----end

  //获取角色是否在编辑
  getRoleIsEdit = (isEdit,obj) => {
    this.setState({
      roleIsEdit: isEdit
    })
    if(obj && obj.departmentOID){
      this.getDepDetailByDepOID(obj);
    }
  }

  //渲染部门详情获取人员详情
  renderDepOrPersonInfo = () => {
    let rowSelection = '';
    if (this.state.ROLE_TENANT_ADMIN && this.state.CREATE_DATA_TYPE) {
      rowSelection = {
        selectedRowKeys: this.state.selectedRowKeys,
        onChange: this.onSelectChange,
        onSelect: this.handleSelectRow,
        onSelectAll: this.handleSelectAllRow
      };
    } else {
      rowSelection = {}
    }
    //如果是搜索结果还有选择的人员，如果选择的部门也需要展示部门详情
    if (this.state.userDepName.length > 0 && this.state.searchActiveUser.userOID) {
      return <OrgPersonInfo user={this.state.searchActiveUser}></OrgPersonInfo>
    } else {
      //TODO
      const {userName} = this.state;
      const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmptyForDep}/> : null;
      
      return <div>
        <div className="role-pannel">
          <OrgRoles
            ROLE_TENANT_ADMIN={this.state.ROLE_TENANT_ADMIN}
            CREATE_DATA_TYPE={this.state.CREATE_DATA_TYPE}
            managerIsRequired={!this.props.profile["department.manager.required.disable"]}
            disabledDep={this.disabledDep}
            clickMeunNewChildDep={this.clickMeunNewChildDep}
            updateDepSuccess={this.updateDepSuccess}
            emitIsEdit={this.getRoleIsEdit}
            selectedKeysDepDataByApi={this.state.selectedKeysDepDataByApi}
            selectedKeysDepData={this.state.selectedKeysDepData}
            selectedKeys={this.state.selectedKeys}>
          </OrgRoles>
        </div>
        <div className="dep-users">
          <div className="table-header-wrap">
            <div className="table-header-buttons">
              {/*移入员工*/}
              <div className="f-left">
                <SelectDepOrPerson
                  buttonType={"primary"}
                  buttonDisabled={!this.state.ROLE_TENANT_ADMIN || !this.state.CREATE_DATA_TYPE}
                  title={messages('org.movein-person')}
                  onlyPerson={true}
                  onConfirm={this.moveInPerson}/>
              </div>
              <div className="f-left">
                {/*移出员工*/}
                <SelectDepOrPerson
                  buttonType={"primary"}
                  buttonDisabled={this.state.depNeedMoveOut.length < 1 || !this.state.ROLE_TENANT_ADMIN || !this.state.CREATE_DATA_TYPE}
                  title={messages('org.moveout-person')}
                  multiple={false}
                  onlyDep={true}
                  onConfirm={this.moveOutPerson}/>
              </div>
              <div className="clear"></div>
            </div>
            <div className="table-header-inp">
              {/*员工名称/工号*/}
              <Input
                key={'depsearch'}
                placeholder={messages('org.employeeID-name')}
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                suffix={suffix}
                value={userName}
                onChange={this.onChangeUserName}
                ref={node => this.userNameInput = node}
              />
            </div>
            <div className="clear"></div>
          </div>
          <Table
            dataSource={this.state.depUserData}
            loading={this.state.loading}
            pagination={this.state.pagination}
            onChange={this.onUserChangePager}
            columns={this.state.columns}
            rowSelection={rowSelection}
            size="middle"
            bordered/>
        </div>
      </div>
    }
  }
  //关闭侧边导航：部门编辑\新增子部门\新增平级部门
  handleCloseSlide = () => {
    let slideFrame = this.state.slideFrame;
    slideFrame.visible = false;
    this.getTenantAllDep();
    this.setState({
      slideFrame,
    });
  }

  renderOrgMoreMeunByRole = () => {
    if (this.state.ROLE_TENANT_ADMIN && this.state.CREATE_DATA_TYPE) {
      return (
        <div className='f-right org-structure-tree-title-setting'>
          <Dropdown overlay={
            this.renderOrgMoreMeun()
          } trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              <Icon type="setting"/>
            </a>
          </Dropdown>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }

  }

  //渲染入口
  render() {
    const {userDepName} = this.state;
    const suffix = userDepName ?
      <span className="org-search-icon"><Icon type="close-circle" onClick={this.emitEmpty}/></span> : null;
    
    return (
      <div className="org-structure">
        <div className="f-left org-structure-left">
          <div className="org-structure-tree-title-wrap">
            <div className='f-left org-structure-tree-title'>
              {/*组织架构*/}
              {messages('org.org-structure')}
            </div>
            {this.renderOrgMoreMeunByRole()}
            <div className='clear'></div>
            {/*部门名称/部门编码/员工名称*/}
            <Search
              placeholder={messages('org.dep-name-code-name')}
              enterButton={<span>
                      {/*搜索*/}
                {messages('org.search')}
                    </span>}
              prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
              suffix={suffix}
              value={userDepName}
              key={'search-user-dep-name'}
              onInput={this.onInputUserDepName}
              onChange={this.onChangeSetUserDepName}
              onSearch={this.onChangeUserDepName}
            />
          </div>
          {
            this.renderOrgTreeOrSearchList()
          }
        </div>
        <div className="org-structure-right">
          {
            // 这个根据搜索结果来判断
            this.renderDepOrPersonInfo()
          }
        </div>
        <div className="clear"></div>

        {/*批量调整的模态框，先选择部门与人，再选择目标部门*/}
        <Modal
          className="org-batch-adjustment-model"
          title={messages('org.batch-move')}//批量调整
          width={400}
          onCancel={this.handleBatchAdjustmentCancel}
          visible={this.state.visibleBatchAdjustment}
          footer={[
            <Button key="back" onClick={this.handleBatchAdjustmentCancel}>
              {/*取消*/}
              {messages('org.cancel')}
            </Button>,
            <Button key="submit"
                    disabled={this.state.disabledBatchAdjustment}
                    type="primary"
                    loading={this.state.loadingBatchAdjustment}
                    onClick={this.handleBatchAdjustmentOk}>
              {/*确定*/}
              {messages('org.ok')}
            </Button>,
          ]}
        >
          <h3>
            {/*请选择*/}
            {messages('org.please-select')}
            <b>
              {/*部门或人*/}
              {messages('org.dep-or-person')}
            </b>
            {/*移到*/}
            {messages('org.move')}
            <b>
              {/*另一个部门*/}
              {messages('org.other-dep')}
            </b></h3>

          <div>
            <div className="f-left batch-adjustment-from">
              <div>
                <SelectDepOrPerson
                  // depResList={['departmentOID']}
                  // personResList={['userOID']}
                  title={messages('org.select-dep-or-person')}//选择部门或人
                  onConfirm={this.callbackBatchAdjustmentFrom}/>
              </div>
              <div className="tips-box">
                {/*已选择*/}
                {messages('org.has-select')}
                {
                  this.state.batchAdjustmentFrom.length
                }
                {/*条数据*/}
                {messages('org.item-data')}
              </div>
            </div>
            <div className="f-left middle-text">
              {/*移入到*/}
              {messages('org.move-to')}
            </div>
            <div className="f-left batch-adjustment-to">
              <div>
                <SelectDepOrPerson
                  title={messages('org.select-target')}//选择目标部门
                  multiple={false}
                  onlyDep={true}
                  onConfirm={this.callbackBatchAdjustmentTo}/>
              </div>
              <div className="tips-box">
                {this.renderBatchAdjustmentTo(this.state.batchAdjustmentTo)}
              </div>
            </div>
            <div className="clear"></div>
          </div>
        </Modal>

        {/*新增部门，编辑部门*/}
        <SlideFrame title={this.state.slideFrame.title}
                    show={this.state.slideFrame.visible}
                    content={OrgNewDep}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.setState({slideFrame: {visible: false}})}
                    params={{...this.state.slideFrame.params,flag:this.state.slideFrame.visible}}/>

      </div>
    )
  }
}

OrgStructure.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    company: state.login.company,
    tenantMode: state.main.tenantMode,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(OrgStructure);
