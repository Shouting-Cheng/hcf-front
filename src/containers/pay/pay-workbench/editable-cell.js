import {messages} from "utils/utils";
import React from 'react'

import config from 'config'
import httpFetch from 'share/httpFetch'
import paymentService  from './pay-workbench.service'
import { Form, InputNumber, Icon, Tooltip, Select, Spin, Popover, Timeline, message } from 'antd'
const Option = Select.Option;
import PropTypes from 'prop-types';
import moment from 'moment'

class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      payType: "",
      modifyValue: null,
      editable: false,
      array: [],
      fetching: false,
      historyContent: null,
      historyLoading: false
    }
  }

  componentWillMount() {
    this.setState({
      value: this.props.value,
      payType: this.props.payType
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value!==this.props.value){
      this.setState({ value: nextProps.value })
      console.log(nextProps)
    }

  }


  //确认修改
  check = (e) => {
    e.stopPropagation();
    this.props.onChange(this.state.value);
    setTimeout(() => {
      !this.props.onChangeError && this.setState({ editable: false, modifyValue: this.state.value })
    })
  };

  //取消修改
  cancel = (e) => {
    e.stopPropagation();
    this.setState({
      editable: false,
      value: this.props.value
    })
  };

  //获取支付类型
  getPayType = (open) =>{
    if(open) {
      this.setState({ fetching: true });
      this.getSystemValueList(2105).then(response => {
        let array = [];
        response.data.values.map(item => {
          array.push({ key: item.value, label: item.messageKey })
        });
        this.setState({ array, fetching: false })
      })
    }
  };

  //获取收款账号
  getAccountOptions = (open) => {
    if(open) {
      let url;
      if (this.props.record.partnerCategory === 'EMPLOYEE') {
        url = `${config.baseUrl}/api/DepartmentGroup/getContactBankByUserId?userId=${this.props.record.partnerId}`;
      } else {
        url = `${config.vendorUrl}/api/ven/artemis/${this.props.record.partnerId}`
      }
      this.setState({ fetching: true });
      httpFetch.get(url).then(res => {
        if (res.status === 200) {
          let array = [];

          if (this.props.record.partnerCategory === 'EMPLOYEE') {
            res.data.map(item => {
              array.push({ key: item.bankAccountNo, label: item.bankAccountNo })
            });
          } else {
            res.data.body.map(item => {
              array.push({ key: item.bankAccount, label: item.bankAccount })
            });
          }
          this.setState({ array, fetching: false })
        }
      }).catch(() => {
        message.error(messages('pay.get.account.failed'));
        this.setState({ fetching: false })
      })
    }
  };

  //显示支付历史
  payHistory = (visible) => {
    if (visible) {
      this.setState({ historyLoading: true });
      paymentService.showPayHistory(this.props.record.id).then(res => {
        if (res.status === 200) {
          let historyContent;
          if (res.data.length) {
            historyContent = (
              <Timeline>
                {res.data.map(item => {
                  return (
                    <Timeline.Item key={item.id} color="green">
                      <span style={{fontSize:13,color:'rgba(0,0,0,0.55)',marginRight:5}}>{moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                      {item.employeeId} {item.employeeName} {item.operationType === 'payment' ? messages('pay.pay') : item.operationType ==='return'? messages('acp.payment.return'):messages('acp.payment.reserved')} {item.currency}
                      {(item.amount || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Timeline.Item>
                  )
                })}
              </Timeline>
            )
          } else {
            historyContent = (
              <div>{messages('pay.history.none')}</div>
            )
          }
          this.setState({ historyContent, historyLoading: false })
        }
      })
    }
  };

  render() {
    const { type, message } = this.props;
    const { value, payType, editable, modifyValue, array, fetching, historyContent, historyLoading } = this.state;
    let history = (
      <Spin spinning={historyLoading}>
        {historyContent}
      </Spin>
    );
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              {
                type === 'number' ?
                  <InputNumber value={value}
                               onChange={(value) => this.setState({ value })} style={{ width: 100 }}/>
                  :
                  <Select defaultValue={value}
                          notFoundContent={fetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                          onChange={(value) => this.setState({value})}
                          style={{ width: (payType=== "payType" ? 80 : 200) }}
                          onDropdownVisibleChange={payType=== "payType" ? this.getPayType : this.getAccountOptions}>
                    {array.map(option => {
                      return <Option key={option.key}>{option.label}</Option>
                    })}
                  </Select>
              }
              <Tooltip placement="top" title={messages('common.save')}>
                <Icon type="check" className="editable-cell-icon-check" onClick={this.check}/>
              </Tooltip>
              <Tooltip placement="top" title={messages('common.cancel')}>
                <Icon type="close" className="editable-cell-icon-cancel" onClick={this.cancel}/>
              </Tooltip>
            </div>
            :
            (
              type === 'number'? (
                <Popover placement="bottom" content={history} onVisibleChange={this.payHistory}>
                  <a className="editable-cell-text-wrapper" style={{textAlign:'right'}}>
                    {modifyValue && modifyValue < this.props.value &&
                    <Tooltip title={messages('pay.amount.validate')}><Icon type="exclamation-circle-o" style={{color:'red',marginRight:5}} /></Tooltip>}
                    {(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    <Tooltip placement="top" title={message}>
                      <Icon type="edit" className="editable-cell-icon" onClick={(e) => {e.stopPropagation();this.setState({ editable: true })}} />
                    </Tooltip>
                  </a>
                </Popover>
              ) : (
                <a className="editable-cell-text-wrapper">
                  {value}
                  <Tooltip placement="top" title={message}>
                    <Icon type="edit" className="editable-cell-icon" onClick={(e) => {e.stopPropagation();this.setState({ editable: true })}} />
                  </Tooltip>
                </a>
              )
            )
        }
      </div>
    );
  }
}

EditableCell.propTypes = {
  type: PropTypes.string,          //修改数据的类型，为 number、string
  value: PropTypes.any.isRequired, //默认值
  message: PropTypes.string,       //点击修改时的提示信息
  record: PropTypes.object,        //行信息
  onChange: PropTypes.func,        //确认修改时的回调
  onChangeError: PropTypes.bool    //确认修改时的回调后是否出错
};

EditableCell.defaultProps={
  type: 'string',
  message: messages('pay.click.change'),
  record: {},
  onChange: () => {},
  onChangeError: false
};

const WrappedEditableCell= Form.create()(EditableCell);

export default WrappedEditableCell;
