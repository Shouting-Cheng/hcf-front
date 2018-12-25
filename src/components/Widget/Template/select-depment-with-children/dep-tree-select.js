import React from 'react';
import { Input, Tree, Icon, Spin } from 'antd';
import SelectDepWithChildrenService from 'components/template/select-depment-with-children/select-depment-with-children.service';
import 'styles/components/template/select-depment-with-children/select-depment-with-children.scss';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
import PropTypes from 'prop-types';

class DepTreeSelect extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      treeData: [],
      keywords: '',
      searchResult: [],
      checkedKeys: [],
      checkedNodesInfo: {},
      checkedNodes: [],
    };
  }
  componentWillMount() {
    this.getList(this.props.defaultValue);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loading: true });
    if (nextProps.defaultValue === this.props.defaultValue) {
      this.setState({ loading: false });
      return false;
    } else {
      if (nextProps.defaultValue) {
        this.getList(nextProps.defaultValue);
      }
    }
  }

  getList = value => {
    this.setState({ loading: true });
    let checkedKeys = [];
    value.map(item => {
      checkedKeys.push(item.key);
    });
    SelectDepWithChildrenService.getFirstlevelDep(this.props.flagDep).then(response => {
      response.data.map(item => {
        item.title = item.name;
        item.value = item.departmentOid;
        item.key = item.departmentOid;
        item.isLeaf = !item.hasChildrenDepartments;
      });
      this.setState({
        treeData: response.data,
        checkedNodes: this.props.defaultValue,
        checkedKeys: checkedKeys,
        loading: false,
      });
    });
  };

  onLoadData = treeNode => {
    return new Promise(resolve => {
      this.setState({
        loading: true,
      });
      if (treeNode.props.dataRef.hasChildrenDepartments) {
        SelectDepWithChildrenService.getChildlevelDep(
          this.props.flagDep,
          treeNode.props.dataRef.departmentOid
        ).then(response => {
          response.data.map(item => {
            item.title = item.name;
            item.value = item.departmentOid;
            item.key = item.departmentOid;
            item.isLeaf = !item.hasChildrenDepartments;
            //antd无法做到disableCheckbox=true后异步加载数据显示选择并禁用  所以抛弃选择根节点后禁用选择子节点的方案，改为当选择跟节点时，右侧不显示子节点
            // if(!this.props.isIncludeChildren && (this.state.checkedKeys.indexOf(treeNode.props.dataRef.departmentOid) > -1)){
            //   item.disabled = true;
            // }else{
            //   item.disabled = false;
            // }
          });
          treeNode.props.dataRef.children = response.data;
          this.setState({
            treeData: [...this.state.treeData],
            loading: false,
          });
          resolve();
        });
      }
    });
  };

  onChange = e => {
    const value = e.target.value;
    this.setState({
      keywords: value,
    });
    SelectDepWithChildrenService.getSearchResult(value).then(response => {
      this.setState({
        searchResult: response.data,
      });
    });
  };

  onCheck = (checkedKeys, info) => {
    let checkedNodes = [];
    info.checkedNodes.map(item => {
      checkedNodes.push({
        key: item.props.dataRef.value,
        label: item.props.dataRef.title,
        isLeaf: item.props.dataRef.isLeaf,
        parentDepartmentOid: item.props.dataRef.parentDepartmentOid,
      });
    });
    if (this.props.isIncludeChildren) {
      this.setState({
        checkedKeys: [...checkedKeys],
        checkedNodes: checkedNodes,
      });
    } else {
      this.setState({
        checkedKeys: [...checkedKeys.checked],
        checkedNodes: checkedNodes,
      });
    }
  };

  onCheckSearchList = item => {
    let checkedNodes = this.state.checkedNodes;
    let checkedKeys = this.state.checkedKeys;
    if (checkedKeys.indexOf(item.departmentOid) === -1) {
      checkedKeys.push(item.departmentOid);
      checkedNodes.push({
        key: item.departmentOid,
        label: item.name,
        isLeaf: true,
        parentDepartmentOid: item.parent.departmentOid,
      });
      this.setState({
        checkedKeys: checkedKeys,
        checkedNodes: checkedNodes,
      });
      if (this.props.isClickSearchHide) {
        this.searchInput.blur();
        this.setState({
          keywords: '',
          searchResult: [],
        });
      }
    }
  };

  removeItem = value => {
    let checkedKeys = this.state.checkedKeys;
    let checkedNodes;

    //该代码在方案调整为 左边check时直接过滤已选节点，若根节点全选，则右侧不显示子节点后 失去意义，所以注释掉了
    // if(this.props.isIncludeChildren && value.isLeaf){
    //   //如果是叶子节点并且是非受控模式，查找他的根节点并同时移除，否则无法联动左侧树导致数据混乱
    //   checkedKeys.splice(checkedKeys.indexOf(value.key),1);
    //   checkedKeys.splice(checkedKeys.indexOf(value.parentDepartmentOid),1);
    //
    //   checkedNodes = this.state.checkedNodes.filter(( item ) =>{
    //     return item.key !== ( value.key || value.parentDepartmentOid);
    //   });
    // }else{
    //   checkedKeys.splice(checkedKeys.indexOf(value.key),1);
    //   checkedNodes = this.state.checkedNodes.filter(( item ) =>{
    //     return item.key !== value.key;
    //   });
    // }

    checkedKeys.splice(checkedKeys.indexOf(value.key), 1);
    checkedNodes = this.state.checkedNodes.filter(item => {
      return item.key !== value.key;
    });

    this.setState({
      checkedKeys: checkedKeys,
      checkedNodes: checkedNodes,
    });
  };

  renderList() {
    const { searchResult, keywords, checkedKeys } = this.state;
    if (searchResult.departments && searchResult.departments.length) {
      return searchResult.departments.map(item => {
        const index = item.name.indexOf(keywords);
        const beforeStr = item.name.substr(0, index);
        const afterStr = item.name.substr(index + keywords.length);
        const className =
          checkedKeys.indexOf(item.departmentOid) > -1
            ? 'selected-dep-item checked'
            : 'selected-dep-item';
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{keywords}</span>
              {afterStr}
            </span>
          ) : (
            <span>{item.name}</span>
          );
        return (
          <div
            className={className}
            key={item.departmentOid}
            onClick={() => this.onCheckSearchList(item)}
          >
            <Icon type="team" />
            <span className="selected-dep-item-name">{title}</span>
          </div>
        );
      });
    } else {
      return <p className="dep-tree-no-dep">{this.$t('sdp.no.search.result')}</p>;
    }
  }
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

  renderCheckedNodes = checkedNodes => {
    //如果根节点为选中状态，即全选改部门的下级部门，无需将下级部门列出来，但若根节点未选中，则要列出选中的子节点
    let showCheckedNodes;
    if (this.props.isIncludeChildren) {
      let parentNodes = [];
      checkedNodes.map(item => {
        if (!item.isLeaf) {
          parentNodes.push(item.key);
        }
      });
      showCheckedNodes = [
        ...checkedNodes.filter(node => {
          return parentNodes.indexOf(node.parentDepartmentOid) === -1;
        }),
      ]; //第二次过滤掉二级副部门
    } else {
      showCheckedNodes = checkedNodes;
    }
    return showCheckedNodes.map(item => {
      return (
        <div className="selected-dep-item" key={item.key}>
          <Icon type="team" />
          <span className="selected-dep-item-name">{item.label}</span>
          <Icon type="close-circle" key={item.key} onClick={() => this.removeItem(item)} />
        </div>
      );
    });
  };

  render() {
    const { treeData, checkedKeys, keywords, checkedNodes } = this.state;
    return (
      <Spin spinning={this.state.loading}>
        <div className="dep-tree-select-box-l">
          <Search
            placeholder={this.$t('common.search')}
            onChange={this.onChange}
            value={keywords}
            ref={Search => {
              this.searchInput = Search;
            }}
          />
          <div className="dep-tree-select-wrap">
            <div className="dep-tree-search-box">
              {keywords !== '' ? (
                this.renderList()
              ) : (
                <Tree
                  checkable
                  onCheck={this.onCheck}
                  loadData={this.onLoadData}
                  checkedKeys={checkedKeys}
                  checkedNodes={checkedNodes}
                  checkStrictly={!this.props.isIncludeChildren}
                  ref="Tree"
                >
                  {this.renderTreeNodes(treeData)}
                </Tree>
              )}
            </div>
          </div>
        </div>
        <div className="dep-tree-select-box-r">
          <h5>{this.$t('sdp.chosed-dep')}</h5>
          <div className="dep-tree-select-wrap">
            <div className="dep-tree-selected-box">
              {checkedKeys.length ? (
                this.renderCheckedNodes(checkedNodes)
              ) : (
                <p className="dep-tree-no-dep">{this.$t('sdp.please-chose-left')}</p>
              )}
            </div>
          </div>
        </div>
        <div className="clear" />
      </Spin>
    );
  }
}

DepTreeSelect.propTypes = {
  isIncludeChildren: PropTypes.bool, //子节点和父节点是否关联，选择父节点是否全选子节点
  defaultValue: PropTypes.any, //已选值，要求格式[{key: "", label: ""}]
  flagDep: PropTypes.string, //部门状态，flag = 1001全部, 1002启用, 1003未启用
  isClickSearchHide: PropTypes.bool, //点击搜索结果，是否立即清除关键字
};

DepTreeSelect.defaultProps = {
  isIncludeChildren: false, //子节点和父节点是否关联，选择父节点是否全选子节点
  defaultValue: [],
  flagDep: '1002',
  isClickSearchHide: true, //点击搜索结果，是否立即清除关键字
};

export default DepTreeSelect;
