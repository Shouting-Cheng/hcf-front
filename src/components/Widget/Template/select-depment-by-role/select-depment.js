/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';

import { Modal, Input, Icon, Button } from 'antd';

import 'styles/components/template/select-depment-by-role/select-depment.scss';
import DepTree from 'widget/Template/select-depment-by-role/dep-tree';
import SelectRoleDepService from './select-depment.service';
import PropTypes from 'prop-types';

const treeData = [];

class SelectDepByRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: treeData, //部门树数据
      visible: false,
      selectedKeys: [], //当前被选中的部门key
      expandedKeys: [], //展开的部门key
      selectedDepList: [], //选择的部门对象列表
      autoExpandParent: true,
      keyword: '',
    };
  }

  componentWillMount() {
    this.getFinanceRoleTree();
  }

  componentDidMount() {
    this.setState(
      {
        visible: this.props.isShow,
      },
      () => {
        if (this.state.visible) {
          this.getFinanceRoleTree();
        }
      }
    );
  }

  getFinanceRoleTree = () => {
    let params = {
      keyword: this.state.keyword,
    };
    SelectRoleDepService[this.props.apiServiceKey](params).then(res => {
      this.setState({
        treeData: res.data,
      });
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.isShow,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onCancel();
  };
  handleOk = () => {
    this.setState({
      visible: false,
    });
    let data = this.state.selectedDepList;
    let t = data.map(item => {
      return item.props.dataRef;
    });
    this.props.onConfirm(t);
  };
  // 点击被选择
  onSelect = (selectedKeys, info) => {
    this.setState({
      selectedKeys: selectedKeys,
      selectedDepList: info.selectedNodes,
    });
  };
  // 点击展开的时候
  onExpand = (expandedKeys, { expanded, node }) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  //搜索部门
  onChangeDepName = e => {
    this.setState(
      {
        selectedKeys: [],
        expandedKeys: [],
        selectedDepList: [],
        keyword: e.target.value,
      },
      () => {
        this.getFinanceRoleTree();
      }
    );
  };
  //搜索人或者部门置空
  emitEmpty = () => {
    this.userNameDepInput.focus();
    this.setState(
      {
        keyword: '',
        selectedKeys: [],
        expandedKeys: [],
        selectedDepList: [],
      },
      () => {
        this.getFinanceRoleTree();
      }
    );
  };

  render() {
    const suffix = this.state.keyword ? (
      <Icon type="close-circle" onClick={this.emitEmpty} />
    ) : null;

    return (
      <div className="select-dep-by-role">
        <div className="select-dep-by-role-container" />
        <Modal
          width={900}
          getContainer={() => {
            return document.getElementsByClassName('select-dep-by-role-container')[0];
          }}
          className="select-dep-by-role-modal"
          title={this.props.title}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className="search-input-wrap">
            <Input
              placeholder={this.$t('common.search')}
              key={'deporgsearch'}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              suffix={suffix}
              value={this.state.keyword}
              onChange={this.onChangeDepName}
              ref={node => (this.userNameDepInput = node)}
            />
          </div>
          <DepTree
            multiple={this.props.multiple}
            treeData={this.state.treeData}
            selectedKeys={this.state.selectedKeys}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={this.state.autoExpandParent}
            onSelect={this.onSelect}
            onExpand={this.onExpand}
            showEnable={true}
          />
        </Modal>
      </div>
    );
  }
}

SelectDepByRole.propTypes = {
  onConfirm: PropTypes.func.isRequired, // 点击确认之后的回调：返回结果
  onCancel: PropTypes.func.isRequired, //点击取消的时候
  isShow: PropTypes.bool, // 模态框显示
  multiple: PropTypes.bool, // 是否多选
  title: PropTypes.any.isRequired, //模态框标题
  apiServiceKey: PropTypes.string.isRequired, //写在服务中promise对象，对应的key
};

SelectDepByRole.defaultProps = {
  isShow: false,
  multiple: true,
};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SelectDepByRole);
