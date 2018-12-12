import {messages} from "share/common";
/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react'
import {connect} from 'react-redux'

import {Button,  Badge} from 'antd'
import Table from 'widget/table'
import SlideFrame from 'components/slide-frame'
import SearchArea from 'components/search-area'
import WrappedPaymentMethod from 'containers/pay-setting/payment-method/new-payment-method'
import paymentMethodService from 'containers/pay-setting/payment-method/payment-method.service'
import 'styles/pay-setting/payment-method/payment-method.scss'


class PaymentMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: [
        {/*付款方式类型*/
          title: messages('paymentMethod.paymentMethodCategory'),
          dataIndex: 'paymentMethodCategory',
          key: 'paymentMethodCategory',
          render(recode){
            if(recode === "ONLINE_PAYMENT"){
              return "线上"
            }else if(recode === "OFFLINE_PAYMENT"){
              return "线下"
            }else if(recode === "EBANK_PAYMENT"){
              return "落地文件"
            }
          }
        },
        {/*付款方式代码*/
          title: messages('paymentMethod.paymentMethodCode'),
          dataIndex: 'paymentMethodCode',
          key: 'paymentMethodCode',
        },
        {/*付款方式名称*/
          title: messages('paymentMethod.description'),
          dataIndex: 'description',
          key: 'description',
        },

        {/*状态*/
          title: messages('paymentMethod.isEnabled'),
          dataIndex: 'isEnabled',
          key: 'isEnabled',
          render: (recode, text) => {
            return (<div ><Badge status={ recode ? "success" : "error"}/>
              {recode ? messages('common.status.enable') : messages('common.status.disable')}
            </div>);
          }
        },
      ],
      searchForm: [
        {type: 'input', id: 'paymentMethodCode', label: messages('paymentMethod.paymentMethodCode')},
        {type: 'input', id: 'description', label: messages('paymentMethod.description')},
      ],
      pageSize: 10,
      page: 0,
      pagination: {
        total: 0
      },
      searchParams: {
        paymentMethodCode: '',
        description:'',
      },
      updateParams: {},
      showSlideFrameNew: false,
      loading: true

    };
  }


  componentWillMount() {
    this.getList();
  }


//获得数据
  getList() {
    let params = {};
    params.description=this.state.searchParams.description;
    params.paymentMethodCode=this.state.searchParams.paymentMethodCode;
    params.size=this.state.pageSize;
    params.current=this.state.page+1;
    paymentMethodService.getPaymentType(params).then((response) => {
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
      updateParams: {
        description: '',
        paymentMethodCode: '',
      },
    })
  }

  //搜索
  search = (result) => {
    let searchParams = {
      description: result.description,
      paymentMethodCode: result.paymentMethodCode
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

  handleCloseNewSlide = (params) => {
    console.log(params);
    console.log(12323);
    if(params) {
      this.setState({loading: true,showSlideFrameNew: false},() => {
        this.getList();
      });
    }
  };


  showSlideNew = (flag) => {
    this.setState({
      showSlideFrameNew: flag
    })
  };

  newItemTypeShowSlide = () => {
    this.setState({
      updateParams: {},
    }, () => {
      this.showSlideNew(true)
    })
  }

  putItemTypeShowSlide = (recode) => {
    this.setState({
      updateParams: recode,
    }, () => {
      this.showSlideNew(true)
    })

  }


  render() {
    const {columns, data, pagination, searchForm, showSlideFrameNew, loading, updateParams, isPut} = this.state
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
            <Button type="primary"
                    onClick={this.newItemTypeShowSlide}>{messages('common.create') }</Button>
          </div>
        </div>

        <div className="Table_div" style={{backgroundColor: 111}}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={pagination}
            loading={loading}
            bordered
            onRow={record => ({
              onClick: () => this.putItemTypeShowSlide(record)
            })}
            size="middle"
          />
        </div>

        <SlideFrame title={JSON.stringify(this.state.updateParams) === "{}"?messages('paymentMethod.newPaymentMethod'):messages('paymentMethod.editPaymentMethod')}
                    show={showSlideFrameNew}
                    content={WrappedPaymentMethod}
                    afterClose={this.handleCloseNewSlide}
                    onClose={() => this.showSlideNew(false)}
                    params={updateParams}/>
      </div>
    );
  }

}

function mapStateToProps() {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(PaymentMethod);
