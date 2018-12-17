import React from 'react';
import { Form, Select, Tag, Input, Progress, Tabs, Button, Menu, Radio, Dropdown, Row, Col, Spin, Timeline, message, Popover, Popconfirm, Icon, Divider, Modal } from 'antd'
import Table from 'widget/table'
import { routerRedux } from "dva/router";
import moment from "moment"

import 'styles/reimburse/reimburse.scss';
import { connect } from 'dva';
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import ApprotionInfo from 'containers/financial-management/expense-reverse/approtion-info'
import CustomTable from 'components/Widget/custom-table';


const FormItem = Form.Item;
const Option = Select.Option;
const CheckableTag = Tag.CheckableTag;
const { TextArea } = Input;

class CostDetail extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
        columns: [
          { title: this.$t('common.sequence'), align: "center", dataIndex: "index", key: "index", width: 60,
            render: (value, record, index) => index + 1
          },
          {         //费用类型
            title: this.$t('common.expense.type'), dataIndex: 'expenseType', width: 80,
            render: desc =>
              <span>
            <Popover content={desc ? desc.name : '-'}>{desc ? desc.name : '-'}</Popover>
          </span>
          },
          {      //发生日期
            title: this.$t("common.happened.date"), dataIndex: 'createdDate', width: 110,
            render: desc =>
              <span>
            <Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : '-'}</Popover>
          </span>
          },
          {
            title: this.$t('expense.reverse.amount'), dataIndex: 'amount', width: 100, align: 'center',
            render: this.filterMoney
          },
          {      //反冲本币金额
            title: this.$t('exp.reserve.baseCurrency.amount'), dataIndex: 'functionAmount', width: 120, align: 'center',
            render: this.filterMoney
          },
          {      //反冲备注
            title: this.$t('exp.reserve.remark'), dataIndex: 'description',
            render: desc =>
              <span>
            <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
          </span>
          },
          {      //发票操作类型
            title: this.$t('exp.invoice.operation.type'), dataIndex: 'invoiceOperationType', width: 140, align: 'center',
            render: (value,record) => {
              return (
                <div>
                  {value === 'DELETE' && <span>{this.$t('exp.blue.invalid')}</span>}
                  {value === 'NO_TICKET' && <span>{this.$t('exp.needless.operation')}</span>}
                  {value === 'OVERDUE' && <span>{this.$t('exp.invoice.outTime')}</span>}
                  {value === 'BACK_LASE' && <a onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showInvoiceDetail(record)
                  }}>{this.$t('exp.red.invoice.reserve')}</a>}
                </div>
              )
            }
          },
          {
            title: this.$t('exp.dir.info'), dataIndex: 'checkInfo', width: 160, align: 'center', render: (value, record) => {
            return (
              <div>
                {record.vatInvoice && <Divider type="vertical"></Divider>}
                <a onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.showApprotion(record)
                }}>{this.$t('exp.detail.info')}</a>
                <Divider type="vertical"></Divider>
                <a onClick={() => this.checkOldExpense(record)}>{this.$t('exp.old.expense.detail')}</a>
              </div>
            )
          }
          },
        ],
          data: [

          ],
          expenseTypeList: [],
          pagination: {
              total: 0
          },
          page: 0,
          pageSize: 5,
          loading: false,
          headerData: {},
          flag: true,
          previewVisible: false,
          previewImage: "",
          record:{},
          showApprotion: false
      };
    }


   componentWillMount(){
   }

  componentDidMount(){
    if (this.props.flag&&!this.props.flag&&this.state.flag) {
      let columns = this.state.columns;
      if(this.props.headerData.reverseHeader.status ===1001 || this.props.headerData.reverseHeader.status === 1003 || this.props.headerData.reverseHeader.status ===1005){
        columns.push({
          title: this.$t('common.operation'), dataIndex: "id", key: "id", width: 120, align: "center", render: (value, record) => {
            return (
              <div>
                <a onClick={() => { this.handleEdit(record) }}>{this.$t('common.edit')}</a>
                <Divider type="vertical"></Divider>
                <Popconfirm placement="top" title={this.$t('configuration.detail.tip.delete')} onConfirm={() => { this.handleDelete(record) }} okText={this.$t('common.ok')} cancelText={this.$t('common.cancel')}>
                  <a>{this.$t('common.delete')}</a>
                </Popconfirm>
              </div>
            )}
        })
      }
      this.setState({
        id: this.props.headerData.reverseHeader.id,
        headerData: this.props.headerData,
        flag: false,
        page: 0
      }, () => {
        this.getList() ;
      });
    };


    if (this.props.disabled && this.state.columns.length === 10) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }

    this.getList()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.flag&&!this.props.flag&&this.state.flag) {
      let columns = this.state.columns;
      if(nextProps.headerData.reverseHeader.status ===1001 || nextProps.headerData.reverseHeader.status === 1003 || nextProps.headerData.reverseHeader.status ===1005){
        columns.push({
          title: this.$t('common.operation'), dataIndex: "id", key: "id", width: 120, align: "center", render: (value, record) => {
            return (
              <div>
                <a onClick={() => { this.handleEdit(record) }}>{this.$t('common.edit')}</a>
                <Divider type="vertical"></Divider>
                <Popconfirm placement="top" title={this.$t('configuration.detail.tip.delete')} onConfirm={() => { this.handleDelete(record) }} okText={this.$t('common.ok')} cancelText={this.$t('common.cancel')}>
                  <a>{this.$t('common.delete')}</a>
                </Popconfirm>
              </div>
            )}
        })
      }
      this.setState({
        id: nextProps.headerData.reverseHeader.id,
        headerData: nextProps.headerData,
        flag: false,
        page: 0
      }, () => {
        this.getList() ;
      });
    };


    if (nextProps.disabled && this.state.columns.length === 10) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }

    this.getList()
  }

  //查看原费用
  checkOldExpense = (record) => {
    this.props.checkReverseInfo && this.props.checkReverseInfo(record);
  };

  //删除费用行
  handleDelete = (record) => {
    reverseService.deleteReverseLine(record.id).then(resp => {
      if (resp.status === 200){
        message.success(this.$t('common.delete.success',{name:''}));
        this.props.query();
        this.getList() ;
        //this.getAmount();
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t('common.delete.failed'))
    })
  };

  //编辑
  handleEdit = (record) => {
    new Promise((reslove, rejected)=>{
      this.props.editReverseInfo && this.props.editReverseInfo(record);
      reslove('123');
    }).then(desc=>{
      this.getList()
    })
  };

  //获取报账单头信息
  getInfo = () => {
        reimburseService.getReimburseDetailById(this.state.headerData.id).then(res => {
            let expenseTypeList = [];
            if (res.data.summaryView && res.data.summaryView.expenseTypeList) {
                expenseTypeList = res.data.summaryView.expenseTypeList;
            }
            this.setState({
                headerData: res.data,
                expenseTypeList
            });
        });
    }

  //获取数据列表
  getList = () => {
    const { id, page, pageSize } = this.state;
    this.setState({ loading: true });
    id&&reverseService.getReverseLine(id,page,pageSize).then(resp => {
      if (resp.status === 200){
        this.setState({
          data: resp.data,
          loading: false,
          pagination: {
            current: this.state.page + 1,
            pageSize: 5,
            total: Number(resp.headers['x-total-count']),
            showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['5','10', '20', '30', '40'],
            onChange: this.onChangePager
          }
        })
      }
    }).catch(e => {
      this.setState({loading: false});
      if(e.response)
        message.error(e.response.data.message)
    })
  };

    showInvoiceDetail = (record) => {
        this.props.showInvoiceDetail && this.props.showInvoiceDetail(record);
    };

    //显示分摊行
    showApprotion = (record) => {
      this.setState({
        record: record,
        showApprotion: true
      })
    };

    //获取费用行列表
    getCostList = (id) => {
        this.setState({ page: 0 }, () => {
            this.getList(id);
        })
    };

    //分页
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ page: page - 1 }, () => {
                this.getList()
            })
        }
    }

    //编辑
    edit = (record) => {
        this.props.costEdit && this.props.costEdit(record);
    }

    //详情
    detail = (record) => {
        if (!this.props.disabled) return;
        this.props.costDetail && this.props.costDetail(record);
    }

    //复制
    copy = (record) => {
        this.props.costCopy && this.props.costCopy(record);
    }

    //删除
    deleteCost = (record) => {
        this.props.deleteCost && this.props.deleteCost(record);
    }

    //图片预览
    preview = (record) => {
        this.setState({ previewVisible: true, previewImage: record.thumbnailUrl })
    }

    //表格展开的内容
    expandedRowRender = (record) => {
        return (
            <Row>
                <Col style={{ textAlign: 'center' }} span={4}><h3>附件信息：</h3></Col>
                <Col span={20}>
                    <Row>
                        {record.attachmentList && record.attachmentList
                          .map(item => {
                            return (
                                <Col span={6} key={item.id}>
                                    <a onClick={() => { this.preview(item) }}>{item.fileName}</a>
                                </Col>
                            )
                        })}
                    </Row>
                </Col>
            </Row>
        )
    }

    render() {
        let { loading, data, record, columns, showApprotion, pagination, headerData, expenseTypeList, previewVisible, previewImage } = this.state;

        return (
          <div>
            <div style={{ clear: "both", padding: "10px 0" }}>
              <Table
                  size="middle"
                  rowKey={record => record.id}
                  loading={loading}
                  columns={columns}
                  dataSource={data}
                  pagination={pagination}
                  bordered
                  expandedRowRender={this.expandedRowRender}
                  onRow={record => ({ onClick: () => this.detail(record) })}
              >
              </Table>
            </div>
            <Modal visible={previewVisible} footer={null} onCancel={() => { this.setState({ previewVisible: false }) }}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
            <ApprotionInfo mode={true} close={() => { this.setState({ showApprotion: false }) }} headerData={this.state.headerData} visible={showApprotion} id={record.sourceReportLineId}/>
         </div>)
    }
}

// CostDetail.contextTypes = {
//     router: React.PropTypes.object
// }
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company,

    }
}

const FormList = Form.create()(CostDetail);

// export default Form.create()(CostDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(FormList);










