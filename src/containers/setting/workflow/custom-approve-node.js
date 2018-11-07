import React from 'react';
import { connect } from 'dva';
import { deepCopy } from 'utils/extend';
import { Form, Row, Col, message, Spin } from 'antd';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import DragWidgetItem from 'containers/setting/workflow/drag-source/drag-widget-item';
import FakeDropLayout from 'containers/setting/workflow/drop-source/fake-drop-layout';
import NodeContent from 'containers/setting/workflow/drop-source/node-content';

import workflowService from 'containers/setting/workflow/workflow.service';
import 'styles/setting/workflow/workflow-detail.scss';

class CustomApproveNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      customWidget: [
        {
          type: 1001,
          name: this.$t('workflow.detail.approval' /*审批*/),
          remark: this.$t('workflow.detail.approval' /*审批*/),
          code: null,
          level: 1,
          ruleApprovalChainOID: this.props.ruleApprovalChainOID,
          ruleApprovalNodeOID: null,
          nextRuleApprovalNodeOID: null,
        },
        {
          type: 1003,
          name: this.$t('workflow.detail.node.robot' /*机器人*/),
          remark: this.$t('workflow.detail.node.robot' /*机器人*/),
          code: null,
          level: 1,
          ruleApprovalChainOID: this.props.ruleApprovalChainOID,
          ruleApprovalNodeOID: null,
          nextRuleApprovalNodeOID: null,
          approvalActions: '8001', //8001 通过 8002 驳回
        },
        {
          type: 1002,
          name: this.$t('workflow.detail.node.inform' /*知会*/),
          remark: this.$t('workflow.detail.node.inform' /*知会*/),
          code: null,
          level: 1,
          ruleApprovalChainOID: this.props.ruleApprovalChainOID,
          ruleApprovalNodeOID: null,
          nextRuleApprovalNodeOID: null,
          notifyInfo: {
            isApp: true,
            isWeChat: true,
            isWeb: true,
            isName: true,
            isMoney: true,
            isReason: true,
            title: '',
            content: '',
          },
        },
      ],
      nowWidget: deepCopy(this.props.ruleApprovalNodes),
      nowSelectedIndex: 0,
      counter: 0,
      endNodeWidget: null,
      endNodeSelected: false, //结束节点是否被选中
    };
  }

  componentWillMount() {
    //counterFlag为内部组件排序所需key值，在此处初始化
    let nowWidget = deepCopy(this.props.ruleApprovalNodes);
    nowWidget.map((item, index) => {
      nowWidget[index].counterFlag = index;
    });
    this.setState({ nowWidget, counter: nowWidget.length });
  }

  componentWillReceiveProps(nextProps) {
    let nowWidget = deepCopy(nextProps.ruleApprovalNodes);
    nowWidget.map((item, index) => {
      nowWidget[index].counterFlag = index;
    });
    this.setState({ nowWidget, counter: nowWidget.length });

    //只有报销单和借款单显示打印节点
    if (
      nextProps.formInfo &&
      (String(nextProps.formInfo.formType).charAt(0) === '3' ||
        nextProps.formInfo.formType === 2005)
    ) {
      let customWidget = this.state.customWidget;
      let hasPrint = false;
      customWidget.map(item => {
        item.type === 1004 && (hasPrint = true);
      });
      !hasPrint &&
        customWidget.push({
          type: 1004,
          name: this.$t('workflow.detail.node.print' /*打印*/),
          remark: this.$t('workflow.detail.node.print' /*打印*/),
          code: null,
          level: 1,
          ruleApprovalChainOID: this.props.ruleApprovalChainOID,
          ruleApprovalNodeOID: null,
          nextRuleApprovalNodeOID: null,
        });
    }

    //获取结束节点
    let endNodeWidget = this.state.endNodeWidget;
    if (!endNodeWidget) {
      nextProps.ruleApprovalNodes.map(item => {
        item.type === 1005 && (endNodeWidget = item);
      });
      this.setState({ endNodeWidget });
    }
  }

  /**
   * 选择某一组件时的回调
   * @param index  列表中的第几个
   * @param widget  对应widget对象
   */
  handleSelectWidget = (index, widget) => {
    this.props.onSelect(index === -1 ? 1005 : widget.type, widget, index);
    if (!this.props.isRuleInEdit) {
      this.setState({
        nowSelectedIndex: index,
        endNodeSelected: index === -1,
      });
    }
  };

  /**
   * phone-content内部排序后的事件
   * @param result 返回的ReactDom，key值为拖拽进入时定义的counterFlag
   */
  handleSort = result => {
    let { nowWidget, nowSelectedIndex } = this.state;
    //记录当前选择的counterFlag
    let nowSelectWidgetCounter = nowWidget[nowSelectedIndex].counterFlag;
    let nodeOID = nowWidget[nowSelectedIndex].ruleApprovalNodeOID;
    let nextNodeOID = '';
    let targetIndex = -1;
    let tempWidget = [];
    //根据排序后的key值排序
    result.map(item => {
      nowWidget.map(widget => {
        widget.counterFlag + '' === item.key && tempWidget.push(widget);
      });
    });
    //寻找之前选择的index
    tempWidget.map((item, index) => {
      if (item.counterFlag === nowSelectWidgetCounter) targetIndex = index;
      if (item.ruleApprovalNodeOID === nodeOID)
        nextNodeOID = tempWidget[index + 1]
          ? tempWidget[index + 1].ruleApprovalNodeOID
          : this.state.endNodeWidget.ruleApprovalNodeOID;
    });
    workflowService.moveApprovalNode(nodeOID, nextNodeOID).then(() => {
      this.setState({ nowWidget: tempWidget, nowSelectedIndex: targetIndex });
      message.success(this.$t('common.operate.success'));
    });
  };

  /**
   * 从列表中把widget拖拽入phone-content时的事件
   * @param widget 拖入的widget
   * @param index 拖入后的index
   */
  handleDrop = (widget, index) => {
    let { nowWidget, counter, endNodeWidget } = this.state;
    widget.nextRuleApprovalNodeOID = nowWidget[index]
      ? nowWidget[index].ruleApprovalNodeOID
      : endNodeWidget.ruleApprovalNodeOID;
    workflowService.createApprovalNodes(widget).then(res => {
      let tempWidget = JSON.parse(JSON.stringify(res.data));
      //因为ListSort根据key值排序，key值不能改变和重复，所以此处给每一个拖拽进入的组件一个counter计数为counterFlag
      tempWidget.counterFlag = counter++;
      nowWidget.splice(index, 0, tempWidget);
      this.setState({ nowWidget, counter, nowSelectedIndex: index }, () => {
        this.props.onChange(this.state.nowWidget);
      });
      this.props.onSelect(res.data.type, res.data, index);
      message.success(this.$t('common.operate.success'));
    });
  };

  /**
   * 删除节点
   * @param hasDelete true 删除成功
   */
  handleDelete = hasDelete => {
    this.setState({ loading: true });
    hasDelete &&
      workflowService.getApprovalChainDetail(this.props.formOID).then(res => {
        let nowWidget = res.data.ruleApprovalNodes;
        nowWidget.map((item, index) => {
          nowWidget[index].counterFlag = index;
        });
        this.setState(
          {
            nowWidget,
            nowSelectedIndex: 0,
            loading: false,
          },
          () => {
            const { nowWidget } = this.state;
            this.props.onChange(nowWidget);
            nowWidget.length
              ? this.props.onSelect(nowWidget[0].type, nowWidget[0], 0)
              : this.props.onSelect(1005, this.state.endNodeWidget, 0);
          }
        );
      });
  };

  render() {
    const {
      loading,
      customWidget,
      nowWidget,
      nowSelectedIndex,
      endNodeSelected,
      endNodeWidget,
    } = this.state;
    const { saving } = this.props;
    let widgetList = deepCopy(nowWidget);
    widgetList.map((item, index) => {
      item.type === 1005 && widgetList.splice(index, 1);
    });
    return (
      <div className="custom-approve-node">
        <FakeDropLayout />
        <Row className="widget-list-item-container">
          {customWidget.map(widget => {
            return (
              <Col span={6} key={widget.type}>
                <DragWidgetItem widget={widget} />
              </Col>
            );
          })}
        </Row>
        <Spin spinning={loading}>
          <NodeContent
            widgetList={widgetList}
            onSort={this.handleSort}
            nowSelectedIndex={nowSelectedIndex}
            onSelect={this.handleSelectWidget}
            onDrop={this.handleDrop}
            onDelete={this.handleDelete}
            endNodeSelected={endNodeSelected}
            endNodeWidget={endNodeWidget}
            saving={saving}
          />
        </Spin>
      </div>
    );
  }
}

CustomApproveNode.propTypes = {
  ruleApprovalNodes: PropTypes.array,
  ruleApprovalChainOID: PropTypes.string,
  formInfo: PropTypes.object,
  formOID: PropTypes.string,
  isRuleInEdit: PropTypes.bool, //是否有审批条件处于编辑状态
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  saving: PropTypes.bool,
};

CustomApproveNode.defaultProps = {
  ruleApprovalNodes: [],
  isRuleInEdit: false,
};

function mapStateToProps(state) {
  return {
    language: state.languages,
  };
}

const wrappedWorkflow = Form.create()(CustomApproveNode);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(DragDropContext(HTML5Backend)(wrappedWorkflow));
