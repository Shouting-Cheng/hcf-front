/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 特别说明，针对部门树的生成两种case
 * 1.后端返回第一层部门，点击一个部门查询子部门
 * 2.后端返回所有部门，子部门，前端不通过接口生成部门树
 * 目前页面已经改为第二种
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

// 把已经请求的部门信息的缓存起来，会不会内存泄露？
let TREEDATA = [];
//部门树列表
// todo
//还可优化，就是已经找过的父级部门，从列表中删除
let TREELIST = [];
export default {
  setTreeList(list) {
    TREELIST = list;
  },
  getTreeList() {
    return TREELIST;
  },
  resetTreeList() {
    TREELIST = [];
  },
  getTreeData() {
    return TREEDATA;
  },
  resetTreeData() {
    TREEDATA = [];
  },
  //设置部门树的第一层
  setTreeData(data) {
    for (let i = 0; i < data.length; i++) {
      const dep = {};
      dep.title = data[i].name;
      dep.key = data[i].departmentOID;
      dep.originData = data[i];
      if (data[i].hasChildrenDepartments) {
        dep.isLeaf = false;
        let list = this._getDepChildrenFromTreelist(data[i].id, TREELIST);
        this.setLeafByParentOID(list, dep);
        // dep.children =[]
      } else {
        dep.isLeaf = true;
      }
      TREEDATA.push(dep);
    }
  },
  //把子节点挂在父节点上
  setLeafByParentOID(childNodes, parentNode) {
    let children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const dep = {};
      dep.title = childNodes[i].name;
      dep.key = childNodes[i].departmentOID;
      dep.originData = childNodes[i];
      if (childNodes[i].hasChildrenDepartments) {
        dep.isLeaf = false;
        let list = this._getDepChildrenFromTreelist(childNodes[i].id, TREELIST);
        this.setLeafByParentOID(list, dep);
        // dep.children = [];
      } else {
        dep.isLeaf = true;
      }
      children.push(dep);
    }
    parentNode.children = children;
  },

  //这是后端点击一个部门查询子部门，前端再添加新节点的case-----start---
  //当前端计算遇到性能瓶颈的时候，用这种方式
  // 查询所有集团部门
  getTenantAllDepRes() {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/departments/root/v2?flag=1001')
        .then((res) => {
          resolve(res);
          //不在这里写逻辑，其他地方服务复用
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 查询所有集团部门：设置节点
  getTenantAllDep() {
    return new Promise((resolve, reject) => {
      this.getTenantAllDepRes()
        .then((res) => {
          this.resetTreeData();
          this.setTreeData(res.data);
          resolve(this.getTreeData())
        })
        .catch((err) => {
          reject(err);
        })
    })
  },
  // 通过部门oid查询子部门
  getChildDepByDepOIDRes(Dep,flag) {
    //为了不影响之前的功能
    let _flag = 1001;
    if(flag){
      _flag = flag;
    }
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/department/child/' + Dep.departmentOID + '/?flag='+_flag)
        .then((res) => {
          resolve(res);
          //不在这里写逻辑，其他地方服务复用
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 通过部门oid查询子部门:设置节点
  getChildDepByDepOID(Dep, parentNode) {
    return new Promise((resolve, reject) => {
      this.getChildDepByDepOIDRes(Dep)
        .then((res) => {
          this.setLeafByParentOID(res.data, parentNode);
          resolve(this.getTreeData());
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //禁用一个部门树节点
  deepSearchTREEDATADisabled(nodeKey, treeData) {
    for (let i = 0; i < treeData.length; i++) {
      //看看本级部门有没有
      if (treeData[i].key === nodeKey) {
        treeData[i].originData.status = '102';
        //找到就结束
        return;
      }
      //去他子部门中找
      if (treeData[i].children) {
        this.deepSearchTREEDATADisabled(nodeKey, treeData[i].children);
      }
    }
  },
  //启用一个部门树节点
  deepSearchTREEDATAEnabled(nodeKey, treeData) {
    for (let i = 0; i < treeData.length; i++) {
      //看看本级部门有没有
      if (treeData[i].key === nodeKey) {
        treeData[i].originData.status = '101';
        //找到就结束
        return;
      }
      //去他子部门中找
      if (treeData[i].children) {
        this.deepSearchTREEDATAEnabled(nodeKey, treeData[i].children);
      }
    }
  },
  //删除一个部门树节点
  deepSearchTREEDATADelete(nodeKey, treeData) {
    for (let i = 0; i < treeData.length; i++) {
      //看看本级部门有没有
      if (treeData[i].key === nodeKey) {
        treeData.splice(i, 1)
        //干掉就结束
        return;
      }
      //去他子部门中找
      if (treeData[i].children) {
        this.deepSearchTREEDATADelete(nodeKey, treeData[i].children);
      }
    }
  },
  //设置顶层部门节点，平级部门节点：传入兄弟节点，
  setNodeByBrotherNode(node, brotherNode) {
    if (brotherNode.originData.parentDepartmentOID) {
      //让node成为brotherNode的兄弟节点，在TREEDATA部门树上
      this.deepSearchTREEDATA(node, brotherNode, TREEDATA);
    } else {
      //顶层部门
      const dep = {};
      dep.title = node.name;
      dep.key = node.departmentOID;
      dep.originData = node;
      dep.isLeaf = true;
      TREEDATA.push(dep);
    }
  },

  //设置单个子节点：用于创建子部门之后
  setOneLeafByParentOID(childNode, parentNode) {
    if (parentNode) {
      //有节点：更快
      let children = [];
      if (parentNode.children) {
        children = parentNode.children;
      }
      let dep = {};
      dep.title = childNode.name;
      dep.key = childNode.departmentOID;
      dep.originData = childNode;
      dep.isLeaf = true;
      children.push(dep);
      parentNode.children = children;
    } else {
      this.deepSetOneLeafByNode(childNode, TREEDATA);
    }
  },
  //让node成为brotherNode的兄弟节点，在TREEDATA部门树上
  //其实这个当层级比多，部门也比较多，就要用另一种方案，直接请求当前部门下面的子部门
  //如果部门少于10000,直接前端插入节点
  deepSearchTREEDATA(node, brotherNode, treeData) {
    for (let i = 0; i < treeData.length; i++) {
      //看看本级部门有没有
      if (treeData[i].key === brotherNode.originData.parentDepartmentOID) {
        const dep = {};
        dep.title = node.name;
        dep.key = node.departmentOID;
        dep.originData = node;
        dep.isLeaf = true;
        treeData[i].children.push(dep);
        //找到就结束
        return;
      }
      //去他子部门中找
      if (treeData[i].children) {
        this.deepSearchTREEDATA(node, brotherNode, treeData[i].children);
      }
    }
  },
  //通过一个节点设置叶子节点，这个节点上有一个父节点的key
  deepSetOneLeafByNode(node, treeData) {
    for (let i = 0; i < treeData.length; i++) {
      //看看本级部门有没有
      if (treeData[i].key === node.parentDepartmentOID) {
        let parentNode = treeData[i];
        let children = [];
        if (parentNode.children) {
          children = parentNode.children;
        }
        let dep = {};
        dep.title = node.name;
        dep.key = node.departmentOID;
        dep.originData = node;
        dep.isLeaf = true;
        children.push(dep);
        parentNode.children = children;
        //找到就结束
        return;
      }
      //去他子部门中找
      if (treeData[i].children) {
        this.deepSearchTREEDATA(node, treeData[i].children);
      }
    }
  },
  //如果已经加载就不需要加载节点
  checkChildHasLoad(node) {
    if (node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  },
  //这是后端点击一个部门查询子部门，前端再添加新节点的case-----end---


  //把部门经理放在第一位
  sortDepartmentPositionDTOList(roleList) {
    let temp = roleList[0];
    for (let i = 0; i < roleList.length; i++) {
      if (parseInt(roleList[i].positionCode) === 6101) {
        roleList[0] = roleList[i];
        roleList[i] = temp;
        return roleList;
      }
    }
    return roleList;
  },
  // 通过部门oid查询部门详情
  getDepDetailByDepOID(Dep) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/departments/' + Dep.departmentOID)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 通过部门oid查询部门下面的员工
  //todo  前面的参数Dep要消灭掉才行
  getDepUserByDepOID(Dep, params) {
    let _params = {
      departmentOID:  Dep.departmentOID,
      page: params.page,
      size: params.size,
      roleType: "TENANT",
    }
    //已传入的参数params为主
    let options = Object.assign({},_params,params);
    return new Promise((resolve, reject) => {
      this.searchPersonInDep(options)
        .then((res)=>{
          resolve(res)
        })
        .catch((err) => {
          reject(err);
        })
    })

    //这接口慢，用上面新的
    // params = {page,size}
    // return new Promise((resolve, reject) => {
    //   httpFetch.get(config.baseUrl + '/api/departments/users/' + Dep.departmentOID, params)
    //     .then((res) => {
    //       resolve(res)
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     })
    // })
  },

  //部门搜索:扁平化的展示部门结构，与树形结构
  searchDep(keyWord) {
    let params = {
      flag: 1002,
      hasChildren: false,
      name: keyWord
    }
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/department/like', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err);
        })
    })
  },
  //部门名称，部门编号或者员工姓名搜索:扁平化的展示部门结构，与树形结构
  searchDepOrPersonV2(keyWord) {
    let params = {
      keyword: keyWord,//部门名称，部门编号或者员工姓名
      needEmployeeId: false,//是否支持员工工号搜索
      departmentStatus: null//101启用，102停用，103删除，默认查询101启用，102停用
    }
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/department/user/keyword', params)
        .then((response) => {
          response.data.users = response.data.users.map(function (item) {
            if (item.contact) {
              item.fullName = item.contact.fullName;
              item.email = item.contact.email;
              item.mobile = item.contact.mobile;

              item.gender = item.contact.gender;
              item.employeeID = item.contact.employeeID;
              item.duty = item.contact.duty;

              item.rank = item.contact.rank;
              item.senior = item.contact.senior;
              item.title = item.contact.title;

              item.birthday = item.contact.birthday;
              item.entryDate = item.contact.entryDate;
            }
            return item;
          })
          resolve(response)
        })
        .catch((err) => {
          reject(err);
        })
    })
  },


  // 针对部门的操作curd-------start
  //停用该部门
  disabledDep(depOID) {
    return new Promise((resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/department/disable/' + depOID)
        .then((res) => {
          this._disabledDep(depOID);
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    })
  },
  //启用该部门
  enabledDep(depOID) {
    return new Promise((resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/department/enable/' + depOID)
        .then((res) => {
          this._enabledDep(depOID);
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //删除部门
  deleteDep(depOID) {
    return new Promise((resolve, reject) => {
      httpFetch.delete(config.baseUrl + '/api/department/delete/' + depOID)
        .then((res) => {
          this._deleteDep(depOID);
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    })
  },
  //创建子部门
  //第二个参数是当前部门树节点，创建成功后，需要在节点上添加子部门
  createChildDep(data, treeNode) {
    // let data = {"parentDepartmentOID":"f789179f-1102-4791-b84d-186e53f6c0fa","name":"111","path":"cciae|111","companyOID":null}
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/departments/', data)
        .then((res) => {
          this._createDep(res.data);
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //创建顶层部门，平级部门
  //第二个参数是当前部门树节点，创建成功后，需要在节点上添加子部门
  createTopDep(data, treeNode) {
    // let data={"companyOID":"1af2a30d-9719-419b-a7ef-68078462baed","name":"as12","path":"as12","i18n":{"name":[{"language":"zh_cn","value":"as12"},{"language":"en","value":"as12"}]}}
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/departments/', data)
        .then((res) => {
          this._createDep(res.data);
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //修改部门详情，带部门角色
  updateDep(dep) {
    return new Promise((resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/departments', dep)
        .then((res) => {
          res.data.parentId = res.data.parentDepartmentId;
          this._updateDep(res.data);
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 针对部门的操作curd-------end


  //批量移动：批量部门oid与人员oid移动到目标部门
  batchMovePerson(params) {
    // let params = {
    //   "departmentOID":"37f0c85b-1f1a-4694-b9da-eecb125e2fbf",
    //   "userOIDs":["8b01870e-438e-4cb3-b46a-6dbc70533e56"],
    //   "oldDepartmentList":["c07cc878-8165-4fe4-a1c0-269e154f4841"]
    // }
    return new Promise((resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/departments/change/list', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //目前新的v3接口还没完善，不支持多部门参数，多法人实体参数
  //v3完善之后，这个就换

  // 重构完成之后，这接口就
  //关键字查人（工号，姓名，邮箱，手机号）
  //员工状态查人（最好支持多状态：比如离职与待离职）
  //部门查人（多部门）
  //公司查人（多公司）
  //法人实体查人（多法人实体）

  //这个接口非常重要：
  //组织架构，人员管理，公司维护等页面等等，凡是有用到查人的接口，都有引入这个接口
  //如果改动，必须谨慎
  searchPersonInDep(params) {
    // let params = {
    //   companyOID:"37f0c85b-1f1a-4694-b9da-eecb125e2fbf",// 可以传数组
    //   departmentOID: "37f0c85b-1f1a-4694-b9da-eecb125e2fbf",// 可以传数组
    //   corporationOID: "37f0c85b-1f1a-4694-b9da-eecb125e2fbf",// 可以传数组
    //   page: 0,
    //   size: 10,
    //   status: 1001,//不传代表只查询在职，1001也是在职，1002待离职员工，1003离职员工，all代表查询全部
    //   roleType: "TENANT",
    //   keyword: ""，
    //   isInactiveSearch :"true"//只查询没激活的员工，不传就查询所有的员工
    // }

    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/users/v3/search', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })

  },


  //这是全部部门查询的case,把所有部门存在前端---start----

  // 查询所有集团部门(含子部门)
  getTenantAllDepResV2() {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/department/tenant/all')
        .then((res) => {
          resolve(res);
          //不在这里写逻辑，其他地方服务复用
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 查询所有集团部门(含子部门),设置节点
  getTenantAllDepV2(expandedKeys) {
    if (TREELIST.length > 0) {
      return new Promise((resolve, reject) => {
        this.resetTreeData();
        this.setTreeList(TREELIST);
        this.setTreeData(this._getTopDepFromList(TREELIST));
        resolve(this.getTreeData());
      })
    } else {
      return new Promise((resolve, reject) => {
        this.getTenantAllDepResV2()
          .then((res) => {
            this.resetTreeData();
            this.setTreeList(res.data);
            this.setTreeData(this._getTopDepFromList(TREELIST));
            resolve(this.getTreeData())
          })
          .catch((err) => {
            reject(err);
          })
      })
    }
  },

  onlySearchDep(keyword) {
    //前端分词搜索，就可以做到单个字搜索
    return new Promise((resolve, reject) => {
      let res = [];
      TREELIST.map(function (item) {
        //正则匹配
        if (item.name.match(keyword)) {
          const dep = {};
          dep.title = item.name;
          dep.key = item.departmentOID;
          dep.originData = item;
          //搜索的结果还可以搞成一个部门树的形式
          res.push(dep);
        }
      })
      resolve(res);
    })
  },

  //删除部门
  _deleteDep(depOID) {
    for (let i = 0; i < TREELIST.length; i++) {
      if (TREELIST[i].departmentOID === depOID) {
        TREELIST.splice(i, 1);
        break;
      }
    }
  },
  //禁用部门
  _disabledDep(depOID) {
    //把列表中的数据改掉
    for (let i = 0; i < TREELIST.length; i++) {
      if (TREELIST[i].departmentOID === depOID) {
        TREELIST[i].status = '102';
        break;
      }
    }
  },
  //启用部门
  _enabledDep(depOID) {
    //把列表中的数据改掉
    for (let i = 0; i < TREELIST.length; i++) {
      if (TREELIST[i].departmentOID === depOID) {
        TREELIST[i].status = '101';
        break;
      }
    }
  },
  //新增子部门或部门
  _createDep(node) {
    if (node.parentDepartmentId) {
      node.parentId = node.parentDepartmentId;
    }
    TREELIST.push(node);
  },
  //修改部门
  _updateDep(node) {
    //把列表中的数据改掉
    for (let i = 0; i < TREELIST.length; i++) {
      if (TREELIST[i].departmentOID === node.departmentOID) {
        TREELIST[i] = node;
        break;
      }
    }
  },
  _getChildDepByDepOID(Dep, parentNode) {
    return new Promise((resolve, reject) => {
      let list = this._getDepChildrenFromTreelist(Dep.id, TREELIST);
      this.setLeafByParentOID(list, parentNode);
      resolve(this.getTreeData());
    })
  },
  // 获取对应子部门从前端缓存的列表中
  _getDepChildrenFromTreelist(depid, list) {
    let arr = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].parentId + "" === depid + "") {
        if (this._checkDepHasChildren(list[i], list)) {
          list[i].hasChildrenDepartments = true
        } else {
          list[i].hasChildrenDepartments = false
        }
        arr.push(list[i])
      }
    }
    return arr;
  },
  //从后端的列表中获取第一级部门
  _getTopDepFromList(list) {
    let arr = [];
    for (let i = 0; i < list.length; i++) {
      //没有parentId或者parentDepartmentOID
      if (!list[i].parentId && !list[i].parentDepartmentOID) {
        if (this._checkDepHasChildren(list[i], list)) {
          list[i].hasChildrenDepartments = true
        } else {
          list[i].hasChildrenDepartments = false
        }
        arr.push(list[i])
      }
    }
    return arr;
  },
  //判断这个部门是否有子部门，后端返回的节点没有字段标志说这个部门是否是父级部门
  _checkDepHasChildren(item, list) {
    for (let i = 0; i < list.length; i++) {
      if (item.id + "" === list[i].parentId) {
        return true;
      }
    }
    return false;
  },
  //这是全部部门查询的case,把所有部门存在前端---end----


  // 部门角色页面的接口----start
  //获取角色列表：翻页的
  getRoleList(params) {
    // params = {page,size}
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/departmentposition/page', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err);
        })
    })
  },
  //创建或者修改部门角色
  createUpdateRole(role) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/departmentposition', role)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  // 部门角色页面的接口----end
}

