/**
 * Created by Allen on 2018/5/9.
 */
import React from 'react';
import { connect } from 'dva';
import {  Button, message, Alert, Popover, InputNumber, Tag } from 'antd';
import Table from 'widget/table'
import config from 'config';
import moment from 'moment'
import httpFetch from 'share/httpFetch';
import { routerRedux } from "dva/router";
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'


class NewExpenseInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],   //表格数据
      selectedRowKeys: [],  //选中的项
      lineDtos: [],
      loading: false,
      addLoading: false,
      amount: '',
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      columns: [ //'费用类型'
        {title: this.$t('common.expense.type'), dataIndex: 'expenseTypeName', width: 100},
        {title: this.$t('common.happened.date')/*'发生日期'*/, dataIndex: 'createdDate', width: 110, render: desc =>
          <span>{moment(desc).format('YYYY-MM-DD')}</span>
        },
        {title: this.$t('common.comment')/*"备注"*/, dataIndex: 'comment'},
        {title: this.$t('common.currency')/*"币种"*/, dataIndex: 'invoiceCurrencyCode', width: 90},
        {title: this.$t('common.amount')/*"金额"*/, dataIndex: 'actualAmount', width: 90},
        {title: this.$t('request.base.amount'/*本币金额*/), dataIndex: 'baseAmount'}
      ]
    }
  }

  componentDidMount(){
    if (this.props.params.lineFlag && this.props.params.listType === 'reverseLine'){
      this.setState({
        id: this.props.params.id,
        reverseId: this.props.params.reverseId,
        selectedRowKeys: []
      },() => {
        this.getReverseLineList();
      });
    }
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.params.lineFlag && nextProps.params.listType === 'reverseLine'){
      this.setState({
        id: nextProps.params.id,
        reverseId: nextProps.params.reverseId,
        selectedRowKeys: []
      },() => {
        this.getReverseLineList();
      });
    }
  }

  getReverseLineList(){
    const { page, pageSize, reverseId } = this.state;
    this.setState({loading: true});
    let params = {
      headerId: reverseId,
      expenseTypeId: '',
      selectIds: []
    };
    reverseService.getExpenseLine(page,pageSize,params).then(resp => {
      if (resp.status === 200){
        this.setState({
          loading: false,
          data: resp.data,
          pagination: {
            current: this.state.page + 1,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangePager
          }
        });
      }
    }).catch((e) => {
      this.setState({loading: false});
      if(e.response)
        message.error(e.response.data.message);
    })
  }


  onSelectChange = (selectedRowKeys) => {
    const { data } = this.state;
    let amount = 0;
    let lineDtos = [];
    selectedRowKeys.map(selectItem => {
      data.map(item => {
        if (item.id === selectItem){
          amount += item.actualAmount ;
          if (item.digitalInvoice && item.digitalInvoice.invoiceTypeNo === '01'){
            lineDtos.push({id: selectItem, invoiceOperationType: 'DELETE'})
          } else{
            lineDtos.push({id: selectItem, invoiceOperationType: 'NO_TICKET'})
          }
        }
      })
    });
    this.setState({ lineDtos, amount, selectedRowKeys });
  };

  //新建保存
  handleSave = () => {
    const { reverseId, lineDtos } = this.state;

    if (lineDtos.length === 0){
      message.error(this.$t('exp.add.tips')); //请添加选择项
      return false;
    }
    let params  = {
      lineDtos: lineDtos,
      reverseInvoice: {}
    };
    this.setState({addLoading: true});
    reverseService.saveExpenseLine(reverseId,params).then(resp => {
      if (resp.status === 200){
        this.setState({addLoading: false});
        message.success(this.$t('common.save.success',{name:''}));
        this.props.onClose(true)
      }
    }).catch(e => {
      this.setState({addLoading: false});
      if(e.response)
        message.error(e.response.data.message);
    })
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getReverseLineList()
      })
    }
  };

  onCancel = () => {
    this.props.onClose();
  };

  render() {
    const { columns, data, loading, selectedRowKeys, amount, addLoading, pagination } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div className="container reimburse">
        <div className="table-header" style={{display: 'inline-flex',margin: '0 0 16px'}}>
          <p style={{}}>{this.$t('common.total1',{total: pagination.total})}，</p>
          { hasSelected &&
            <Alert type="info" showIcon
                 message={<div>
                   {this.$t('org.has-select')} &nbsp;&nbsp; <span style={{color: '#1890ff'}}>{selectedRowKeys.length}</span>&nbsp;{this.$t('exp.number.expense')},{this.$t('request.detail.total.amount')}&nbsp;&nbsp;<span style={{color: '#1890ff'}}>{amount}</span>
                    </div>}
            />
          }
        </div>
        <Table dataSource={data}
               loading={loading}
               columns={columns}
               pagination={pagination}
               rowKey={record => record.id }
               rowSelection={rowSelection}
        />
        <div className="slide-footer">
          <Button type="primary" htmlType="submit" onClick={this.handleSave} loading={addLoading}>
            {this.$t('common.add')}</Button>
          <Button onClick={this.onCancel}>{this.$t('common.cancel')}</Button>
        </div>
      </div>
    )
  }
}
// NewExpenseInfo.contextTypes = {
//   router: React.PropTypes.object
// };


function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(NewExpenseInfo);
