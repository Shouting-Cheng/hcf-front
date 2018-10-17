import {messages} from "share/common";
/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 组织架构树
 */
import React from 'react';

import {Tree, Icon, Menu, Dropdown, Input} from 'antd';

const Search = Input.Search;
const TreeNode = Tree.TreeNode;
import 'styles/enterprise-manage/org-structure/org-component/org-tree.scss';

// 测试多部门账号uat
// 吴彪:13500000012  密码：a11111,uat
class OrgStructureTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
  }

  //搜索人或者部门
  emitEmpty = () => {
    this.userNameDepInput.focus();
    this.setState({userDepName: ''});
  }
  //搜索人或者部门
  onChangeUserDepName = (e) => {
    this.setState({userDepName: e.target.value});
  }

  //渲染部门节点右边菜单
  //parentNode用户创建平级部门
  renderTreeNodeTitleMeun = (item) => {
    

    if (item.originData.status + "" === "101") {
      return (
        <Menu>
          <Menu.Item key="0">
          <div onClick={(event) => {
            this.props.clickMeunNewChildDep(event, item.originData, item)
          }}>
            {/*创建子部门*/}
            {messages('org.tree.create-child-dep')}
          </div>
          </Menu.Item>
          <Menu.Item key="4">
            <div onClick={(event) => {
              this.props.clickMeunNewDep(event, item.originData, item)
            }}>
              {/*创建平级部门*/}
              {messages('org.tree.create-dep')}
            </div>
          </Menu.Item>
          <Menu.Divider/>
          {/*<Menu.Item key="1">*/}
          {/*<div onClick={(event) => {*/}
            {/*this.props.clickMeunDeleteDep(item.originData)*/}
          {/*}}>*/}
            {/*/!*删除部门*!/*/}
            {/*{messages('org.tree.delete-dep')}*/}
          {/*</div>*/}
          {/*</Menu.Item>*/}
          <Menu.Item key="5">
            <div onClick={(event) => {
              this.props.disabledDep(item.originData);
            }}>
              {/*停用部门*/}
              {messages('org.tree.disabled')}
            </div>
          </Menu.Item>
        </Menu>
      )
    } else {
      return (
        <Menu>
          <Menu.Item key="5">
            <span onClick={(event) => {
              this.props.enabledDep(item.originData, item);
            }}>
              {/*启用部门*/}
              {messages('org.tree.enabled')}
            </span>
          </Menu.Item>
        </Menu>
      )
    }
  }
  renderDropdown = (item) => {
    if (this.props.ROLE_TENANT_ADMIN && this.props.CREATE_DATA_TYPE) {
      return  <Dropdown overlay={
        this.renderTreeNodeTitleMeun(item)
      } trigger={['click']}>
        <a className="ant-dropdown-link" href="#">
          <Icon type="bars"/>
        </a>
      </Dropdown>;
    } else {
      return <span></span>;
    }
  }

  //渲染部门节点title内容
  //parentNode用户创建平级部门
  renderTreeNodeTitle = (item) => {
    
    let titleDom = "";
    if (item.originData.status + "" === "101") {
      titleDom = <span className='org-dep-node-title'>
          {item.title}
        </span>
    } else {
      titleDom = <span className='org-dep-node-title'>
          {item.title} &nbsp;
        {/*已停用*/}
        {messages('org.tree.has-disabled')}
        </span>
    }
    return (
      <div className='org-dep-node-title-wrap'>
        {
          titleDom
        }
        <span className='org-dep-node-set' onClick={(event) => {
          this.props.treeNodeSettingClick(event)
        }}>
            {
              this.renderDropdown(item)
            }
          </span>
      </div>
    )
  }

  //渲染部门节点
  //parentNode用户创建平级部门
  renderTreeNodes = (data) => {
    return data.map((item) => {
      //有子节点
      if (item.children) {
        if (item.originData.status + "" === "101") {
          return (
            <TreeNode
              title={
                this.renderTreeNodeTitle(item)
              }
              key={item.key}
              dataRef={item}
              className='org-dep-node'>
              {this.renderTreeNodes(item.children, item)}
            </TreeNode>
          );
        } else {
          return (
            // 禁用的部门
            <TreeNode
              title={
                this.renderTreeNodeTitle(item)
              }
              disabled
              key={item.key}
              dataRef={item}
              className='org-dep-node'>
              {this.renderTreeNodes(item.children, item)}
            </TreeNode>
          );
        }
      }
      //无子节点
      if (item.originData.status + "" === "101") {
        return <TreeNode className='org-dep-node'
                         title={
                           this.renderTreeNodeTitle(item)
                         }
                         key={item.key} dataRef={item}/>
      } else {
        // 禁用的部门
        return <TreeNode className='org-dep-node'
                         disabled
                         title={
                           this.renderTreeNodeTitle(item)
                         }
                         key={item.key} dataRef={item}/>
      }

    });
  }

  render() {
    
    return (
      <div className="org-structure-tree">
        <div className="only-dep-search-inp">
          {/*//只搜部门*/}
          <Search style={{marginBottom: 8}}
                  placeholder={messages('org.tree.search-dep')}
                  onChange={this.props.onlySearchDep}/>
        </div>
        <Tree
          showLine
          selectedKeys={this.props.selectedKeys}
          expandedKeys={this.props.expandedKeys}
          autoExpandParent={this.props.autoExpandParent}
          onSelect={this.props.onSelect}
          onExpand={this.props.onExpand}
        >
          {this.renderTreeNodes(this.props.treeData)}
        </Tree>
      </div>
    )
  }
}

OrgStructureTree.propTypes = {
  ROLE_TENANT_ADMIN: React.PropTypes.bool,
  CREATE_DATA_TYPE: React.PropTypes.bool,
  onlySearchDep: React.PropTypes.func,//只是前端部门树搜索
  disabledDep: React.PropTypes.func,//点击禁用的回调
  enabledDep: React.PropTypes.func,//点击启用的回调
  treeData: React.PropTypes.array.isRequired,//组织架构数据
  selectedKeys: React.PropTypes.array.isRequired,//被选择了的部门
  expandedKeys: React.PropTypes.array.isRequired,//被展开了的部门
  autoExpandParent: React.PropTypes.bool.isRequired,
  onSelect: React.PropTypes.func.isRequired,// 点击选择某一个部门
  onExpand: React.PropTypes.func.isRequired,// 点击展开某一个部门
  treeNodeSettingClick: React.PropTypes.func.isRequired,// 点击设置
  clickMeunDeleteDep: React.PropTypes.func.isRequired,// 删除部门
  clickMeunNewDep: React.PropTypes.func.isRequired,// 新增平级部门
  clickMeunNewChildDep: React.PropTypes.func.isRequired,// 新增子部门
};


export default OrgStructureTree;

