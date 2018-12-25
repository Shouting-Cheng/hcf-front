import React from 'react';
import { Button, Select, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';

import DepTreeSelect from 'components/template/select-depment-with-children/dep-tree-select';
import 'styles/components/template/select-depment-with-children/select-depment-with-children.scss';
class SelectDepWithChildren extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      confirmLoading: false,
      value: [],
      treeData: [],
      defaultValue: [],
    };
  }
  componentWillMount() {}

  componentWillReceiveProps = nextProps => {
    if (nextProps.defaultValue) {
      this.setState({
        defaultValue: nextProps.defaultValue,
      });
    }
  };

  //select组件无点击事件用focus代替，关闭模态框后需取消focus状态
  handleFocus = () => {
    this.selectInput.blur();
    this.showModal();
  };

  showModal = () => {
    let listSelectedData = [];
    if (this.state.value.length > 0) {
      this.state.value.map(value => {
        listSelectedData.push(value.value);
      });
    }
    this.setState({ listSelectedData }, () => {
      this.setState({ visible: true });
    });
  };

  handleOk = () => {
    this.setState({
      confirmLoading: true,
    });
    let showCheckedNodes;
    let checkedNodes = this.refs.Tree.refs.Tree.props.checkedNodes;
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

    if (this.props.onConfirm) {
      this.props.onConfirm(showCheckedNodes);
    }

    this.setState({
      visible: false,
      confirmLoading: false,
      defaultValue: showCheckedNodes,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  clear = () => {
    // this.onChange([]);
    this.setState({ defaultValue: [] });
  };

  render() {
    const { loading, visible, confirmLoading, defaultValue } = this.state;
    let selectedTag = [];
    defaultValue.map(item => {
      selectedTag.push(item.label);
    });
    return (
      <div className="select-depment-with-children">
        <Select
          className="select-depment-with-children-input"
          value={selectedTag}
          mode="multiple"
          placeholder={this.$t('common.please.select')}
          onFocus={this.handleFocus}
          dropdownStyle={{ display: 'none' }}
          disabled={this.props.disabled}
          ref={Select => {
            this.selectInput = Select;
          }}
        />
        {/*如果禁用了，就不要后面的清除icon*/}
        {this.props.disabled ? (
          ''
        ) : (
          <Icon
            className="ant-select-selection__clear icon-position"
            type="close-circle"
            onClick={this.clear}
            style={selectedTag.length === 0 ? { opacity: 0 } : { opacity: 1 }}
          />
        )}
        <Modal
          className="select-depment-with-children-modal"
          width="900px"
          title={this.props.title}
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              {this.$t('common.cancel')}
            </Button>,
            <Button
              key="submit"
              type={this.props.buttonType}
              loading={loading}
              onClick={this.handleOk}
              disabled={this.props.buttonDisabled}
            >
              {this.$t('common.ok')}
            </Button>,
          ]}
        >
          <DepTreeSelect
            defaultValue={defaultValue}
            isIncludeChildren={this.props.isIncludeChildren}
            isClickSearchHide={this.props.isClickSearchHide}
            ref="Tree"
          />
        </Modal>
      </div>
    );
  }
}
SelectDepWithChildren.propTypes = {
  onConfirm: PropTypes.func.isRequired, // 点击确认之后的回调：返回结果
  isIncludeChildren: PropTypes.bool, //子节点和父节点是否关联，选择父节点是否全选子节点
  disabled: PropTypes.bool, //是否禁用，默认false
  title: PropTypes.string, //打开模态框标题
  defaultValue: PropTypes.any, //已选值,要求格式[{key: "", label: ""}]
  buttonType: PropTypes.string,
  buttonDisabled: PropTypes.bool,
  isClickSearchHide: PropTypes.bool, //点击搜索结果，是否立即清除关键字
};

SelectDepWithChildren.defaultProps = {
  isIncludeChildren: false, //子节点和父节点是否关联，选择父节点是否全选子节点,false全选
  disabled: false, //是否禁用，默认false
  title: this.$t('chooser.data.dep.title'), //选择部门
  buttonType: 'primary',
  buttonDisabled: false,
  defaultValue: [],
  isClickSearchHide: true, //点击搜索结果，是否立即清除关键字
};
export default SelectDepWithChildren;
