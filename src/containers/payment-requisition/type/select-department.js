/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Table, message, Button, Input, Row, Col, Card, Checkbox, Tree,Spin } from 'antd'

const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;
import PropTypes from 'prop-types';
const TreeNode = Tree.TreeNode;

import httpFetch from 'share/httpFetch'

import config from 'config'
import 'styles/pre-payment/my-pre-payment/select-contract.scss'
class SelectEmployeeGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      selectedKeys: [],
      checkedKeys: [],
      loading: false
    };
  }

  onExpand = (expandedKeys) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} />;
    });
  }

  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/get/dept/by/id?status=102&id=${treeNode.props.eventKey}&name=`).then(res => {
        let temp = [];

        res.data.map(item => {
          temp.push({ title: item.name, key: item.id, isLeaf: !item.hasChildrenDepartments });
        })

        treeNode.props.dataRef.children = temp;

        this.setState({
          treeData: this.state.treeData.concat([]),
        });

        resolve();
      })

    });
  }

  componentDidMount() {
    this.getList();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({checkedKeys:nextProps.checkedKeys});
  }

  getList = () => {
    this.setState({loading:true});
    httpFetch.get(`${config.baseUrl}/api/departments/root?flag=1001`).then(res => {

      if (res.data && res.data.length) {
        let temp = [];

        res.data.map(item => {
          temp.push({ title: item.name, key: item.id });
        })

        this.setState({ treeData: temp,loading:false });
      }

    }).catch(() => {
      this.setState({loading:false});
    })
  }

  onCheck = (values, e) => {
    console.log(values);
    this.setState({ checkedKeys: values.checked });
  }

  handleOk = () => {
    this.props.onOk({
      checkedKeys: this.state.checkedKeys
    });
  }

  onChange = (e) => {

    if(!e.target.value) {
      this.getList();
      return;
    }

    this.refs.search.blur();

    this.setState({loading:true});

    httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/selectDept/enabled?deptCode=&name=${e.target.value}`).then(res=> {
      if (res.data && res.data.length) {
        let temp = [];

        res.data.map(item => {
          temp.push({ title: item.path, key: item.id,isLeaf:true });
        })

        this.setState({ treeData: temp,loading:false });
      }

    })
  }

  render() {

    const { visible, onCancel, afterClose} = this.props;
    const { treeData,checkedKeys } = this.state;
    return (
      <Modal title={"选择人员组"} visible={visible} onCancel={onCancel} afterClose={afterClose} width={800} onOk={this.handleOk} className="list-selector select-department">
        <Spin spinning={this.state.loading}>
          <Search ref="search" style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} />
          <Tree
            checkable
            loadData={this.onLoadData}
            onCheck={this.onCheck}
            checkStrictly={true}
            defaultCheckedKeys={checkedKeys}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        </Spin>
      </Modal >
    );
  }
}

SelectEmployeeGroup.propTypes = {
  visible: PropTypes.bool,  //对话框是否可见
  onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func,  //点击取消后的回调
  afterClose: PropTypes.func,  //关闭后的回调
  type: PropTypes.string,  //选择类型
  selectedData: PropTypes.array,  //默认选择的值id数组
  extraParams: PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  selectorItem: PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  single: PropTypes.bool  //是否单选
};

SelectEmployeeGroup.defaultProps = {
  afterClose: () => { },
  extraParams: {},
  single: false
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SelectEmployeeGroup);

