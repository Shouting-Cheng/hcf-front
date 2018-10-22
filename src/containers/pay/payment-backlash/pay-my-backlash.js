
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import config from 'config'
import { Radio, Badge, Table, Tabs, Popover, Pagination, message, Alert, Icon, Dropdown, Menu, Modal, Form, DatePicker } from 'antd'
import SearchArea from 'widget/search-area'
import backlashService from './pay-backlash.service'
import moment from 'moment'
import ToBacklash from './to-backlash';
import SlideFrame from 'widget/slide-frame'

class CanBacklash extends React.Component {
    constructor(props) {
        super(props);
        const statusList = [
          { value: "N", label: this.$t({id: 'pay.backlash.N'}) } ,
          { value: "P", label: this.$t({id: 'pay.backlash.P'})  },
          { value: "S", label: this.$t({id: 'pay.backlash.S'}) },
          { value: "F", label: this.$t({id: 'pay.backlash.F'})  }
        ];

        this.state = {
            loading: false,
            visible: false,
            setOfBooksId: null,

            searchForm: [
                { type: 'input', colSpan: 6, id: 'backlashCode', label: this.$t({id: 'pay.backlash.backlashCode'}) },
                { type: 'input', colSpan: 6, id: 'billCode', label: this.$t({id: 'pay.backlash.sourceBacklashCode'}) },
                {
                    type: 'items', colSpan: 6, id: 'dateRange', items: [
                        { type: 'date', id: 'backFlashDateFrom', label: this.$t({id: 'pay.backlash.backFlashDateFrom'}) },
                        { type: 'date', id: 'backFlashDateTo', label: this.$t({id: 'pay.backlash.backFlashDateTo'}) }
                    ]
                },
                {
                    type: 'items', colSpan: 6, id: 'amountRange', items: [
                        { type: 'input', id: 'backlashAmountFrom', label: this.$t({id: 'pay.backlash.backlashAmountFrom'}) },
                        { type: 'input', id: 'backlashAmountTo', label: this.$t({id: 'pay.backlash.backlashAmountTo'})  }
                    ]
                },
                { type: 'select', colSpan: 6, id: 'backlashStatus', label: this.$t({id: 'pay.backlash.backlashStatus'}), options: statusList }
            ],
            myBacklashSearchParams: {
            },
            columns: [
                {
                    title: this.$t({id: 'pay.backlash.backlashCode'}), dataIndex: 'billcode', width: 250, align: "center",
                    render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
                },
                {
                    title: this.$t({id: 'pay.backlash.sourceBacklashCode'}), dataIndex: 'refBillCode', width: 250, align: "center",
                    render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
                },
                {
                    title: this.$t({id: 'pay.backlash.backlashDate'}), dataIndex: 'refundDate', width: 150,
                    render: desc => <span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
                },
                {
                    title: this.$t({id: 'pay.backlash.backlashAmount'}), dataIndex: 'amount', width: 150,
                    render: desc => <span><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>
                },
                {
                    title: this.$t({id: 'pay.backlash.backlashRemark'}), dataIndex: 'remark',
                    render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
                },
                {
                    title: this.$t({id: 'pay.backlash.backlashStauts'}), dataIndex: 'paymentStatus', render: (value, record) => {
                        return (
                            <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
                        )
                    }
                }
            ],
            status: {
                "N": {label: this.$t({id: 'pay.backlash.N'}), state: 'default'},
                "P": {label: this.$t({id: 'pay.backlash.P'}), state: 'processing'},
                "S": {label: this.$t({id: 'pay.backlash.S'}), state: 'success'},
                "F": {label: this.$t({id: 'pay.backlash.F'}), state: 'error'}
            },
            data: [],
            myBacklashPage: 0,
            myBacklashPageSize: 10,
            pagination: {
                total: 0
            },
            searchParams: {},
            myBacklashPagination: {
              total: 0
            },
            myBacklashData: [],
            goBacklash: null,
            openWindowFlag: false,//发起反冲窗口
        }
    }

    //去反冲页面
    goBacklash = (record) => {
        //根据支付明细id查询详情，再将record传过去
        backlashService.getBacklashDTOBybacklashDetailId(record.id).then(
            res => {
                if (res.status === 200) {
                    this.setState({ openWindowFlag: true, goBacklash: res.data });
                }

            }
        )
    };


       //可反冲点击页码
       myBacklashChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ myBacklashPage: page - 1 }, () => {
                this.getMyBacklashList()
            })
        }
    };

    //反冲窗口关闭
    cancelWindow = (params) => {
      this.setState({ openWindowFlag: false },() => {
        params&&this.getMyBacklashList();
      });

    };

    //反冲窗口完全关闭后回掉
    restFormFunc = (params) => {
        this.setState({ openWindowFlag: false }, () => {
          params&&this.getMyBacklashList();
        });
    };

    //获取我发起的反冲列表
    getMyBacklashList = (resolve, reject) => {
        const { myBacklashPage, myBacklashPageSize, myBacklashSearchParams } = this.state;
        this.setState({ loading1: true });
        let params = { ...myBacklashSearchParams, page: myBacklashPage, size: myBacklashPageSize };
        for(let name in params){
          !params[name]&& delete  params[name]
        }
        backlashService.queryMyBacklashList(params).then((res) => {
            if (res.status === 200) {
                this.setState({
                    myBacklashData: res.data || [],
                    loading1: false,
                    myBacklashPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: myBacklashPage + 1,
                        pageSize:myBacklashPageSize,
                        onChange: this.myBacklashChangePaper,
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
      if (page - 1 !== this.state.myBacklashPage || pageSize !== this.state.myBacklashPageSize) {
        this.setState({ myBacklashPage: page - 1,myBacklashPageSize:pageSize }, () => {
          this.getMyBacklashList();
        })
      }
    };
    componentWillMount() {
        this.getMyBacklashList(this.state.nowStatus);
    }


    //我发起的反冲列表
    myBacklashHandle = (values) => {
        values.backFlashDateFrom && (values.backFlashDateFrom = values.backFlashDateFrom.format('YYYY-MM-DD'));
        values.backFlashDateTo && (values.backFlashDateTo = values.backFlashDateTo.format('YYYY-MM-DD'));
        this.setState({ myBacklashSearchParams: values,myBacklashPage:0 }, () => {
            this.getMyBacklashList()
        })
    };
    render() {
        const { goBacklash, openWindowFlag, loading1, searchForm, columns,  myBacklashData, myBacklashPagination } = this.state;
        return (
            <div className="pay-my-backlash">
                <SearchArea searchForm={searchForm}
                    submitHandle={this.myBacklashHandle}
                    clearHandle={()=>{}}
                    maxLength={4}
                    eventHandle={this.eventHandle}
                    wrappedComponentRef={(inst) => this.formRef = inst} />
                <div className="table-header"/>
                <Table rowKey={record => record.id}
                    columns={columns}
                    dataSource={myBacklashData}
                    pagination={myBacklashPagination}
                    loading={loading1}
                    onRow={record => ({
                        onClick: () =>
                        {
                          record.flag=true;
                          this.goBacklash(record)
                        }
                    })}
                    bordered
                    size="middle" />
                <SlideFrame title={this.$t({id: 'pay.backlash.backlashDetails'})}
                    show={openWindowFlag}
                    onClose={this.cancelWindow}
                    afterClose={this.restFormFunc} >
                  <ToBacklash  params={{ record: goBacklash, flag: openWindowFlag}}
                               onClose={(e)=>{this.cancelWindow(e)}}/>
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


export default connect(mapStateToProps, null, null, { withRef: true })(CanBacklash);
