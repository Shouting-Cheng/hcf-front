import { messages } from 'utils/utils';
/**
 * Created by zhouli on 18/2/2
 * Email li.zhou@huilianyi.com
 */
// 从组织架构模板中引入对应的服务
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';

let TREEDATA = [];
//是否挂载部门下面的人
//如果要挂载人
let isLoadingPerson = false;

export default {
  setIsLoadingPerson: function(val) {
    isLoadingPerson = val;
  },
  //初始化部门树
  setTreeData(data) {
    for (let i = 0; i < data.length; i++) {
      const dep = {};
      dep.type = 'DEP';
      dep.title = data[i].name;
      dep.key = data[i].departmentOid;
      dep.originData = data[i];
      //如果要加载人
      if (isLoadingPerson) {
        if (data[i].hasChildrenDepartments || data[i].hasUsers) {
          dep.isLeaf = false;
          dep.children = [];
        } else {
          dep.isLeaf = true;
        }
      } else {
        if (data[i].hasChildrenDepartments) {
          dep.isLeaf = false;
          dep.children = [];
        } else {
          dep.isLeaf = true;
        }
      }

      TREEDATA.push(dep);
    }
  },
  //把子节点挂在父节点上：部门
  setLeafByParentOid(childNodes, parentNode) {
    let children = parentNode.children;
    for (let i = 0; i < childNodes.length; i++) {
      const dep = {};
      dep.type = 'DEP';
      dep.title = childNodes[i].name;
      dep.key = childNodes[i].departmentOid;
      dep.originData = childNodes[i];
      //如果要加载人
      if (isLoadingPerson) {
        if (childNodes[i].hasChildrenDepartments || childNodes[i].hasUsers) {
          dep.isLeaf = false;
          dep.children = [];
        } else {
          dep.isLeaf = true;
        }
      } else {
        if (childNodes[i].hasChildrenDepartments) {
          dep.isLeaf = false;
          dep.children = [];
        } else {
          dep.isLeaf = true;
        }
      }

      children.push(dep);
    }
    parentNode.children = children;
  },
  //把人的子节点挂在父节点上：人
  setPersonLeafByParentOid(childNodes, parentNode, externalParams) {
    let children = parentNode.children;
    for (let i = 0; i < childNodes.length; i++) {
      const dep = {};
      dep.type = 'PERSON';
      dep.title = childNodes[i].fullName;
      dep.key = childNodes[i].userOid;
      dep.originData = childNodes[i];
      dep.isLeaf = true;

      //用于财务角色分配，如果当前员工已有财务角色而且不属于当前财务角色，则不可被分配
      //add by mengsha.wang@huilianyi.com
      if (
        externalParams &&
        externalParams.financeRoleOid &&
        dep.originData.financeRoleOid &&
        dep.originData.financeRoleOid !== externalParams.financeRoleOid
      ) {
        dep.nodeDisabled = true;
        dep.title = childNodes[i].fullName + '（' + messages('sdp.has.assigned' /*已分配*/) + '）';
      }

      //用于订票管理员分配，过滤已添加的员工
      //add by mengsha.wang@huilianyi.com
      externalParams &&
        externalParams.bookingRoleList &&
        externalParams.bookingRoleList.map(item => {
          if (item.userOid === dep.originData.userOid) {
            dep.nodeDisabled = true;
            dep.title = childNodes[i].fullName + '（' + messages('sdp.has.added' /*已添加*/) + '）';
          }
        });

      children.push(dep);
    }
    parentNode.children = children;
  },
  //检查节点是否已经加载
  checkChildHasLoad(node) {
    return node.children && node.children.length > 0;
  },
  //获取部门树
  getTreeData() {
    return TREEDATA;
  },
  //重置部门树
  resetTreeData() {
    TREEDATA = [];
  },
  // 查询集团下所有部门
  getTenantAllDep() {
    return new Promise((resolve, reject) => {
      OrgService.getTenantAllDepRes()
        .then(res => {
          this.resetTreeData();
          this.setTreeData(res.data);
          resolve(this.getTreeData());
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  // 通过部门oid查询子部门
  getChildDepByDepOid(Dep, parentNode, flag) {
    return new Promise((resolve, reject) => {
      OrgService.getChildDepByDepOidRes(Dep, flag)
        .then(res => {
          this.setLeafByParentOid(res.data, parentNode);
          resolve(this.getTreeData());
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  // 通过部门oid查询部门下面的员工:所有员工，并且要挂载到部门树上
  getDepTreeUserByDepOid(Dep, params, parentNode, externalParams) {
    return new Promise((resolve, reject) => {
      OrgService.getDepUserByDepOid(Dep, params)
        .then(res => {
          this.setPersonLeafByParentOid(res.data, parentNode, externalParams);
          resolve(this.getTreeData());
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  //搜索：这个搜索只能搜索部门
  searchDep(keyword) {
    return new Promise((resolve, reject) => {
      OrgService.searchDep(keyword)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  //搜索：搜索部门与人员
  searchDepV2(keyword, externalParams) {
    return new Promise((resolve, reject) => {
      OrgService.searchDepOrPersonV2(keyword)
        .then(res => {
          //todo
          //通过externalParams，处理搜索到的res中的人员与部门，主要是添加nodeDisabled与name,fullName
          if (externalParams) {
            let data = res.data;
            data.users.map(person => {
              //用于财务角色分配，如果当前员工已有财务角色而且不属于当前财务角色，则不可被分配
              //add by mengsha.wang@huilianyi.com
              if (
                externalParams &&
                externalParams.financeRoleOid &&
                person.financeRoleOid &&
                person.financeRoleOid !== externalParams.financeRoleOid
              ) {
                person.nodeDisabled = true;
                person.fullName =
                  person.fullName + '（' + messages('sdp.has.assigned' /*已分配*/) + '）';
              }

              //用于订票管理员分配，过滤已添加的员工
              //add by mengsha.wang@huilianyi.com
              externalParams.bookingRoleList &&
                externalParams.bookingRoleList.map(item => {
                  if (item.userOid === person.userOid) {
                    person.nodeDisabled = true;
                    person.fullName =
                      person.fullName + '（' + messages('sdp.has.added' /*已添加*/) + '）';
                  }
                });

              return person;
            });
            resolve(res);
          } else {
            resolve(res);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  },
};
