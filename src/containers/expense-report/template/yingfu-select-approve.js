
import React from 'react'
import {connect} from 'dva'
import {Form, Modal, message, Table, Popover, Spin} from 'antd'
import expenseReportService from 'containers/expense-report/expense-report.service'
import PropTypes from 'prop-types'

class YingfuSelectApprove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yingfuInvoiceInfo: [],
      pagination: {
        total: 0
      },
      yingfuApproverGroups: [],
      visible: this.props.visible,
      selectVisible: false,
      loading: false
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({visible: this.props.visible})
  }

  //获取选人审批数据
  getList() {
    this.setState({loading: true})
    expenseReportService.getYingfuInvoiceInfo(this.props.expenseReport).then(res => {
      this.setState({loading: false})
      let {yingfuInvoiceInfo, pagination} = this.state;
      yingfuInvoiceInfo = res.data;
      yingfuInvoiceInfo.map(item => {
        if (item.costCenterView && item.costCenterView.approverGroups && item.costCenterView.approverGroups.length > 0) {
          item.costCenterView.selectApproverGroups = [item.costCenterView.approverGroups[0]];
        }
      })
      pagination.total = yingfuInvoiceInfo.length;
      this.setState({yingfuInvoiceInfo, pagination});
    }).catch((e) => {
      this.setState({loading: false})
      if (e && e.data && e.data.message) {
        message.error(e.data.message);
      }
    })
  }

  //编辑审批人信息
  handleEditApprove = (record,index) => {
    let yingfuApproverGroups=record.costCenterView.approverGroups;
    yingfuApproverGroups && yingfuApproverGroups.map(item =>{
      item.index=index;
    });
    this.setState({visible: false, selectVisible: true, yingfuApproverGroups: yingfuApproverGroups});
  };
  //选择审批人
  handleSelectApprove = (record) => {
    let {yingfuInvoiceInfo} = this.state;
    yingfuInvoiceInfo[record.index].costCenterView.selectApproverGroups = [record];
    this.setState({yingfuInvoiceInfo});
    this.handleCancelSelectApprove();

  };
  //处理表单提交
  handleSubmitApprove = () => {
    let {yingfuInvoiceInfo} = this.state;
    let usersOID = [];
    if (!yingfuInvoiceInfo || yingfuInvoiceInfo.length === 0) {
      message.error(messages('common.error1')/*'获取数据失败，请稍后重试或联系管理员'*/);
    }
    for (let i = 0; i < yingfuInvoiceInfo.length; i++) {
      if (!yingfuInvoiceInfo[i].costCenterView.selectApproverGroups || yingfuInvoiceInfo[i].costCenterView.selectApproverGroups.length === 0) {
        message.error(messages('expense-report.submit.yingfu.invoiceDataTip')/*'有费用未选择审批人'*/);
        return;
      }
      //选择审批用户的OID处理
      yingfuInvoiceInfo[i].costCenterView.selectApproverGroups.map(item => {
        if (item.userOIDs instanceof Array && item.userOIDs.length > 1) {
          item.userOIDs.map(t => {
            usersOID.push(t);
          });
        }
        else {
          usersOID.push(item.userOIDs.toString());
        }
      })
    }
    //提交
    this.props.onOk(usersOID.join(':'));
  };
  //处理表单关闭
  handleCancelApprove = () => {
      this.props.afterClose();
  };
  //处理选择审批
  handleCancelSelectApprove = () => {
    this.setState({visible: true, selectVisible: false});
  }

  render() {
    const {visible, selectVisible, yingfuInvoiceInfo, yingfuApproverGroups, loading} = this.state;
    let modalTitle = <div><span>{messages('expense-report.submit.yingfu.selectCostApprove')/*'选择成本中心审批人'*/}</span><br/><span
      style={{color: 'red', fontSize: 14}}>({messages('expense-report.submit.yingfu.submitTip')/*'请选择成本中心对应的审批人并仔细核对，否则报销单将被驳回'*/})</span></div>;
    let approveColunmTitle = <div style={{color: 'red'}}><span>{messages('expense-report.submit.yingfu.approver')/*审批人*/}</span><br/><span>(请点击选择)</span></div>;
    return (
      <div>
        <Modal title={modalTitle} okText={messages('common.submit')/*提交*/} visible={visible} onOk={this.handleSubmitApprove} width={800}
               onCancel={this.handleCancelApprove}>
          <Spin spinning={loading}>
            <Table size="small"
                   dataSource={yingfuInvoiceInfo}
                   onRow={(record,index)=> ({onClick: () => this.handleEditApprove(record,index)})}
                   pagination={false}
                   bordered
                   columns={[
                     {
                       title: messages("expense")/*"费用"*/, dataIndex: "", width: "50%", render: (value, record) => {
                         let content = `${record.costCenterView.costCenterName},${record.costCenterView.currencyCode} ${this.filterMoney(record.costCenterView.amount, 2, true)}`;
                         return (<Popover content={content}>{content}</Popover>)
                       }
                     },
                     {
                       title: approveColunmTitle, dataIndex: "", width: "50%", render: (value, record) => {
                         let contents = [];
                         record.costCenterView.selectApproverGroups.map(item => {
                           contents.push(item.fullNameString);
                         });
                         let content = contents.join(",");
                         return (<Popover content={content}>{content}</Popover>)
                       }
                     }
                   ]}>
            </Table>
          </Spin>
        </Modal>
        <Modal title={modalTitle/*emessages('expense-report.submit.yingfu.selectCostApprove')*//*'选择成本中心审批人'*/} okText={messages('common.ok')/*'确定'*/} visible={selectVisible} onOk={this.handleCancelSelectApprove}
               onCancel={this.handleCancelSelectApprove} width={800}>
          <Table dataSource={yingfuApproverGroups} bordered pagination={false}
                 rowSelection={
                   {
                     type: 'radio',
                     onSelect: this.handleSelectApprove
                   }
                 }
                 columns={[{
                   title: messages('expense-report.submit.yingfu.approver')/*审批人*/, dataIndex: "", width: "100%", render: (value, record) => {
                     return (<Popover content={record.fullNameString}>{record.fullNameString}</Popover>)
                   }
                 }]}/>
        </Modal>
      </div>
    );

  }
}

YingfuSelectApprove.propTypes = {
  visible: PropTypes.bool, //导入弹框是否可见
  expenseReport: PropTypes.object, //报销单对象信息
  onOk: PropTypes.func,       //英孚审批提交
  afterClose: PropTypes.func //关闭后的回调
}

function mapStateToProps(state) {
  return {}
}

const WrappedYingfuSelectApprove = Form.create()(YingfuSelectApprove)

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedYingfuSelectApprove)

