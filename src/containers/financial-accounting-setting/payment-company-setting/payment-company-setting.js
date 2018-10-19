import {messages} from "share/common";
/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react'
import {connect} from 'react-redux'

import {Button, Table,Popover, Popconfirm,message} from 'antd'
import SlideFrame from 'components/slide-frame'
import SearchArea from 'components/search-area'

import NewPaymentCompanySetting from 'containers/pay-setting/payment-company-setting/new-payment-company-setting'
import paymentCompanySettingService from 'containers/pay-setting/payment-company-setting/payment-company-setting.service'
import 'styles/pay-setting/payment-company-setting/payment-company-setting.scss'


class PaymentCompanySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      setOfBooksId:this.props.company.setOfBooksId,
      ducumentCategoryData:{
        "EXP_REPORT":"报销单",
        "PAYMENT_REQUISITION":"借款单",
        "ACP_REQUISITION":"付款申请单",
        "PUBLIC_REPORT":"对公报账单",
        "PREPAYMENT_REQUISITION":"预付款单"
      },
      columns: [
        {/*优先级*/
          title: messages('paymentCompanySetting.priorty'),
          dataIndex: 'priorty',
          key: 'priorty',

        },
        {/*单据公司代码*/
          title: messages('paymentCompanySetting.companyCode'),
          dataIndex: 'companyCode',
          key: 'companyCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {/*单据公司名称*/
          title: messages('paymentCompanySetting.companyName'),
          dataIndex: 'companyName',
          key: 'companyName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {/*单据类别*/
          title: messages('paymentCompanySetting.ducumentCategory'),
          dataIndex: 'ducumentCategory',
          key: 'ducumentCategory',
          render: recode => (
            <Popover content={this.state.ducumentCategoryData[recode]}>
              {this.state.ducumentCategoryData[recode]}
            </Popover>)
        },
        {/*单据类型*/
          title: messages('paymentCompanySetting.ducumentType'),
          dataIndex: 'ducumentType',
          key: 'ducumentType',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {/*付款公司代码*/
          title: messages('paymentCompanySetting.paymentCompanyCode'),
          dataIndex: 'paymentCompanyCode',
          key: 'paymentCompanyCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {/*付款公司名称*/
          title: messages('paymentCompanySetting.paymentCompanyName'),
          dataIndex: 'paymentCompanyName',
          key: 'paymentCompanyName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },

      ],
      searchForm: [
        {type: 'select', id: 'setOfBooksId', label:messages('paymentCompanySetting.setOfBooks'), options: [], defaultValue: '', isRequired: true,
          labelKey: 'setOfBooksCode', valueKey: 'setOfBooksId',disabled:!this.props.tenantMode,event:'setOfBooksId'},
        {type: 'input', id: 'companyCode', label: messages('paymentCompanySetting.companyCode')},
        {type: 'input', id: 'companyName', label: messages('paymentCompanySetting.companyName')},
        {type: 'value_list', id: 'ducumentCategory', label: messages('paymentCompanySetting.ducumentCategory'), options: [], valueListCode: 2106}
      ],
      pageSize: 10,
      page: 0,
      pagination: {
        total: 0
      },
      searchParams: {
        setOfBooksId:this.props.company.setOfBooksId,
        companyCode: '',
        companyName: '',
        ducumentCategory:'',
      },
      updateParams: {
        paymentMethodCategory: '',
        paymentMethodCode: '',
      },
      showSlideFrameNew: false,
      showSlideFramePut: false,
      loading:false,
      selectorItem:{},
      selectedRowKeys:[],
      rowSelection: {
        type:'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
      },
    };
  }



  componentWillMount() {
    paymentCompanySettingService.getSetOfBooksByTenant().then((res) => {
        let searchForm = this.state.searchForm;
        let searchParams = this.state.searchParams;
        searchForm[0].defaultValue = this.props.company.setOfBooksId;
        const options =[];
        res.data.map((item)=>{
          options.push({
            label:item.setOfBooksCode+" - "+item.setOfBooksName,
            value:String(item.id),
          })
        })
        searchForm[0].options = options;
        searchParams.setOfBooksId = this.props.company.setOfBooksId;
        this.setState({ searchForm, searchParams }, () => {
          this.getList();
        })

    })


    this.getSystemValueList(2106).then(res => {
     console.log(res.data);
    });
  }

//获得数据
  getList() {
    this.setState({loading:true})
    let params = {};
    params.setOfBooksId = this.state.setOfBooksId;
    params.companyCode=this.state.searchParams.companyCode?this.state.searchParams.companyCode:"";
    params.companyName=this.state.searchParams.companyName?this.state.searchParams.companyName:"";
    params.ducumentCategory=this.state.searchParams.ducumentCategory?this.state.searchParams.ducumentCategory:"";
    params.size=this.state.pageSize;
    params.page=this.state.page;
    paymentCompanySettingService.getPaymentCompanySetting(params).then((response) => {
      response.data.map((item) => {
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    }).catch((e)=>{
      message.error(e.response.data.message);
      this.setState({loading: false});

    });
  }

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };


  //清空搜索区域
  clear = () => {
    this.setState({
      searchParams: {
        companyCode: '',
        companyName: '',
        ducumentCategory:'',
      },
      setOfBooksId:this.props.company.setOfBooksId
    },()=>{
      this.getList();
    })
  }

  //搜索
  search = (result) => {
    let searchParams = {
        setOfBooksId:result.setOfBooksId?result.setOfBooksId:'',
        companyCode: result.companyCode?result.companyCode:'',
        companyName: result.companyName?result.companyName:'',
        ducumentCategory:result.ducumentCategory?result.ducumentCategory:'',
    };
    this.setState({
      searchParams: searchParams,
      loading: true,
      page: 0,
      current: 1
    }, () => {
      this.getList();
    })
  };

  //获取选择的账套
  searchEventHandle = (e,value)=>{
    console.log(e);
    console.log(value);
    if(e==="setOfBooksId"){
      this.setState({setOfBooksId:value},()=>{
        this.getList();
      });
    }
  }

  handleCloseNewSlide = (params) => {

    this.setState({
      showSlideFrameNew: false
    },()=>{
      if(params) {
        this.setState({loading: true});
        this.getList();
      }
    })
  };


  showSlideNew = (flag) => {
    this.setState({
      showSlideFrameNew: flag
    })
  };

  newItemTypeShowSlide = () => {
    if(this.state.setOfBooksId) {
      this.setState({
        updateParams: {
          isNew: true,
          setOfBooksId: this.state.setOfBooksId,
        },
      }, () => {
        this.showSlideNew(true)
      })
    }else {
      message.warning("请先选择账套");
    }
  }


  //删除
  deleteShowSlide=()=>{
    let data = this.state.selectedRowKeys;
    paymentCompanySettingService.deletePaymentCompanySetting(data).then((req)=>{
      message.success(`${messages('common.operate.success')}`);
      this.setState({
        selectedRowKeys:[]
      },()=>{
        this.getList();
      })
    }).catch(e=>{
      message.error(`${messages('common.operate.filed')}`);
    })
  }


  putItemTypeShowSlide = (recode) => {
  const  value={
        ...recode,
      paymentCompanyId:[{
        key:recode.paymentCompanyId,
        id:recode.paymentCompanyId,
        name:recode.paymentCompanyName
      }],
      companyId:[{
        key:recode.companyId,
        id:recode.companyId,
        name:recode.companyName
      }],
      isNew:false,
      setOfBooksId:this.state.setOfBooksId
    }
    this.setState({
      updateParams: value,
    }, () => {
      this.showSlideNew(true)
    })

  }

  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys,selectedRows) =>{
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({
      rowSelection,
      selectedRowKeys,
      selectedData:selectedRowKeys
    });
  };

  render() {
    const {columns, data, pagination, searchForm,rowSelection, showSlideFramePut, showSlideFrameNew, loading, updateParams, isPut} = this.state
    return (
      <div className="payment-method">
        <div className="searchFrom">
          <SearchArea
            searchForm={searchForm}
            submitHandle={this.search}
            clearHandle={this.clear}
            eventHandle={this.searchEventHandle}/>
        </div>

        <div className="table-header">
          <div
            className="table-header-title">{messages('common.total', {total: `${pagination.total}`})}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.newItemTypeShowSlide}>{messages('common.create') }</Button>
            <Popconfirm placement="topLeft" title={messages('common.delete')} onConfirm={this.deleteShowSlide} okText={messages('common.ok')} cancelText={messages('common.cancel')}>
              <Button className="delete" style={{marginRight:"16px"}}   disabled={this.state.selectedRowKeys.length === 0} >{messages('common.delete') }</Button>
            </Popconfirm>

          </div>
        </div>

        <div className="Table_div" style={{backgroundColor: 111}}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={pagination}
            loading={loading}
            rowKey={recode=>{return recode.id}}
            rowSelection={rowSelection}
            bordered
            onRow={record => ({
              onClick: () => this.putItemTypeShowSlide(record)
            })}
            size="middle"
          />
        </div>

        <SlideFrame  title={JSON.stringify(this.state.updateParams) === "{}"?messages('paymentCompanySetting.newPaymentCompanySetting'):messages('paymentCompanySetting.editPaymentCompanySetting')}
                    show={showSlideFrameNew}
                    content={NewPaymentCompanySetting}
                    afterClose={this.handleCloseNewSlide}
                    onClose={() => this.showSlideNew(false)}
                    params={updateParams}/>

      </div>
    );
  }

}


function mapStateToProps(state) {
  return {
    company: state.login.company,
    tenantMode: state.main.tenantMode,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(PaymentCompanySetting);
