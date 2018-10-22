import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import SlideFrame from 'widget/slide-frame'
import config from 'config'
import SearchArea from 'widget/search-area'
import backlashService from './pay-backlash-recheck.service'
import moment from 'moment'
import { Radio, Badge, Table, Tabs,Popover,Pagination, message, Alert, Icon, Dropdown, Menu, Modal, Form, DatePicker } from 'antd'
import ToBacklash from './to-backlash-recheck';
const FormItem = Form.Item;

class Rechecking  extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            setOfBooksId: null,

            searchForm: [
              {type:'input',colSpan: 6, id:'billCode',label:this.$t({id: 'pay.backlash.backlashCode'})},
              {type:'input',colSpan: 6, id:'refBillCode',label:this.$t({id: 'pay.backlash.sourceBacklashCode'})},
                            {
                type: 'items', colSpan: 6, id: 'dateRange', items: [
                  { type: 'date', id: 'backFlashDateFrom', label: this.$t({id: 'pay.backlash.backFlashDateFrom'})},
                  { type: 'date', id: 'backFlashDateTo', label: this.$t({id: 'pay.backlash.backFlashDateTo'}) }
                ]
              },

              {
                type: 'items', colSpan: 6, id: 'amountRange', items: [
                  { type: 'input', id: 'amountFrom', label: this.$t({id: 'pay.backlash.backlashAmountFrom'})},
                  { type: 'input', id: 'amountTo', label: this.$t({id: 'pay.backlash.backlashAmountTo'}) }
                ]
              }
            ],
            canBacklashSearchParams:{},
            columns: [
              { title: this.$t({id: 'pay.backlash.backlashCode'}), dataIndex: 'billcode', width: 250, align: "center",
              render: desc=><span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
               },
              { title:  this.$t({id: 'pay.backlash.sourceBacklashCode'}), dataIndex: 'refBillCode', width: 250, align: "center",
                render: desc=><span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
              },
              { title: this.$t({id: 'pay.backlash.backlashDate'}), dataIndex: 'refundDate',width: 150,align: "center",
                render: desc=><span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
              },
              { title: this.$t({id: 'pay.backlash.submitBy'}), dataIndex: 'createdByName', width: 150,align: "center",
                render: desc=><span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
              },

              {title: this.$t({id: 'pay.backlash.currency'}), dataIndex: 'currency',width: 150,align: "center"},
              { title: this.$t({id: 'pay.backlash.backlashAmount'}), dataIndex: 'amount',width: 150,align: "center",
                render: desc=><span><Popover content={this.filterMoney(desc,2)}>{this.filterMoney(desc,2)}</Popover></span>
              },
              { title: this.$t({id: 'pay.backlash.backlashRemark'}), dataIndex: 'remark',align: "center",
              render: desc=><span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
              }
            ],
            data: [],
            canBacklashPage: 0,
            canBacklashPageSize: 10,
            searchParams: {},
            canBacklashPagination:{total: 0},
            canBacklashData:[],
            goBacklash:null,
            openWindowFlag: false,//发起反冲窗口
          }
    }

    //去反冲页面
    goBacklash = (record) => {
        backlashService.getReadyByDetailId(record.id).then(
            res=>{
                if(res.status === 200){
                    this.setState({openWindowFlag : true ,goBacklash : res.data})
                }
            }
        )
    };

    //反冲窗口关闭
    cancelWindow = (params) => {
      this.setState({openWindowFlag : false},() => {
        params&&this.getCanBacklashList();
      });
    };

      //反冲窗口完全关闭后回掉
    restFormFunc = (params) =>{
        this.setState({openWindowFlag : false},()=>{
            params&&this.getCanBacklashList();
        });
    };



    //可反冲列表搜索
    canBacklashHandle = (values) => {
        values.backFlashDateFrom && (values.backFlashDateFrom = values.backFlashDateFrom.format('YYYY-MM-DD'));
        values.backFlashDateTo && (values.backFlashDateTo = values.backFlashDateTo.format('YYYY-MM-DD'));
        this.setState({ canBacklashSearchParams: values, canBacklashPage: 0 }, () => {
            this.getCanBacklashList()
        })
    };


    componentWillMount() {
        this.getCanBacklashList(this.state.nowStatus);
    }

    //可反冲点击页码
    canBacklashChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ canBacklashPage: page - 1 }, () => {
                this.getCanBacklashList()
            })
        }
    };


    //获取可反冲列表
    getCanBacklashList = (resolve, reject) => {
        const { canBacklashPage, canBacklashPageSize, canBacklashSearchParams } = this.state;

        this.setState({ loading1: true });
        let params = { ...canBacklashSearchParams, page: canBacklashPage, size: canBacklashPageSize,status:"P"};

        backlashService.getBacklashRecheck(params).then((res) => {

            if (res.status === 200) {
                this.setState({
                    canBacklashData: res.data || [],
                    loading1: false,
                    canBacklashPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: canBacklashPage + 1,
                        pageSize:canBacklashPageSize,
                        onChange: this.canBacklashChangePaper,
                        pageSizeOptions : ['10','20','30','40'],
                        showSizeChanger: true,
                        onShowSizeChange : this.onChangePageSize,
                        showQuickJumper:true,
                        showTotal:(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})
                    }
                });
                resolve && resolve()
            }
        }).catch(() => {
            this.setState({ loading1: false });
            reject && reject()
        })
    };
    //每页多少条
    onChangePageSize =(page, pageSize) =>{
      if (page - 1 !== this.state.canBacklashPage || pageSize !== this.state.canBacklashPageSize) {
        this.setState({ canBacklashPage: page - 1,canBacklashPageSize:pageSize }, () => {
          this.getCanBacklashList();
        })
      }
    };
    //点击行去复核页面
    rowClick(record){
        //根据支付明细id查询详情，再将record传过去
        backlashService.getBacklashDTOBybacklashDetailId(record.id).then(
          res => {
            if (res.status === 200) {
              this.setState({ openWindowFlag: true, goBacklash: res.data });
            }
          }
        )
    }

    render(){
        const { goBacklash,openWindowFlag,loading1, searchForm, columns,  canBacklashData,canBacklashPagination } = this.state;
        return(
            <div className="pay-my-backlash">
            <SearchArea searchForm={searchForm}
                    submitHandle={this.canBacklashHandle}
                    clearHandle={()=>{this.setState({canBacklashSearchParams:{}},()=>{
                      this.getCanBacklashList()
                    })}}
                    eventHandle={this.eventHandle}
                    maxLength={4}
                    wrappedComponentRef={(inst) => this.formRef = inst}/>
            <div className="table-header"/>
            <Table rowKey={record => record.id}
                    columns={columns}
                    dataSource={canBacklashData}
                    pagination={canBacklashPagination}
                    loading={loading1}
                    onRow={record => ({
                        onClick: () => this.rowClick(record)
                    })}
                    bordered
                    size="middle" />
            <SlideFrame title={this.$t({id: 'pay.backlash.backlashDetails'})}
                        show={openWindowFlag}
                        onClose={this.cancelWindow}
                        afterClose={this.restFormFunc} >
              <ToBacklash  params={{record:goBacklash,flag:openWindowFlag}}
                           onClose={(e) => {this.cancelWindow(e)}} />
            </SlideFrame>
            </div>
        );
    }
}



function mapStateToProps(state) {
    return {
      user: state.user.currentUser,
      company: state.user.company
    }
}


export default connect(mapStateToProps, null, null, { withRef: true })(Rechecking);


