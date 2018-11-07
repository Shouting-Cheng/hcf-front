import React from 'react'
import {connect} from 'dva'
import config from "config";
import httpFetch from "share/httpFetch";
import {Button, Table, InputNumber, Form, Icon, message, Checkbox, Badge, Select, Modal, DatePicker, Spin} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
import moment from 'moment';
import 'styles/setting/currency-setting/currency-setting.scss'
import { routerRedux } from "dva/router";


let rateChange = 0;
let applyDateChange = 0;

class CurrencySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      defaultSetOfBook: '',//账套的默认值
      setOfBooksOption: [],//选择账套的option
      setOfBooksId: this.props.match.params.setOfBooksId==="0"?this.props.company.setOfBooksId:this.props.match.params.setOfBooksId,//初始化页面时从接口获取的2个字段，掉接口要用
      tenantId: this.props.company.tenantId,//初始化页面时从接口获取的2个字段，掉接口要用
      functionalCurrencyCode: this.props.match.params.functionalCurrencyCode==="0"?'':this.props.match.params.functionalCurrencyCode,//选择账套后，后面的本位币的code
      functionalCurrencyName: this.props.match.params.functionalCurrencyName==="0"?'':this.props.match.params.functionalCurrencyName,//选择账套后，后面的本位币的name
      warnExchangeRateTol: 10,//偏离汇率
      prohibitExchangeRateTol: 20,//禁止汇率
      isBatchEditing: false,//点击批量更改汇率
      batchCancelEdit: false,//点击批量更改汇率后的取消修改
      batchSave: false,//点击批量更改汇率后的保存
      data: [],
      copyData: [],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      isEditing: false,//点击编辑
      enableAutoUpdate: false,//启用自动汇率
      changeData: [],//列表里更改了汇率生效日期的
    //   onAddNewRate: menuRoute.getRouteItem('currency-setting-add', 'key'),//新增汇率
    //   onEditRate: menuRoute.getRouteItem('currency-setting-edit', 'key'),//编辑汇率
      columns: [
        {
          title: this.$t("currency.setting.currency.name")/*币种名*/,
          key: 'currencyName', dataIndex: 'currencyName'
        },
        {
          title: this.$t("currency.setting.code")/*代码*/,
          key: 'currencyCode',
          dataIndex: 'currencyCode'
        },
        {
          title: this.$t("currency.setting.rate.apply.date")/*汇率生效日期*/,
          key: 'applyDate', dataIndex: 'applyDate',
          render: (text, record, index) => this.tableApplyDate(text, record, index)
        },
        {
          title: this.$t("currency.setting.effective.rate")/*生效汇率*/,
          key: 'rate', dataIndex: 'rate',
          render: (text, record, index) => this.tableRate(text, record, index)
        },
        {
          title: this.$t("currency.setting.auto.rate")/*自动汇率*/,
          key: 'enableAutoUpdate', dataIndex: 'enableAutoUpdate',
          render: enableAutoUpdate => (
            <Badge status={enableAutoUpdate ? 'success' : 'error'}
                   text={enableAutoUpdate ? this.$t("common.status.enable") : this.$t("common.status.disable")}/>)
        },
        {
          title: this.$t("common.column.status")/*状态*/, key: 'enable',
          dataIndex: 'enable',
          render: enable => (
            <Badge status={enable ? 'success' : 'error'}
                   text={enable ? this.$t("common.status.enable") : this.$t("common.status.disable")}/>)
        },
      ]
    }
  }

  componentDidMount() {
    //记住页码
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({
      pagination,
    }, () => {
      this.clearBeforePage();
      this.getSetOfBooks();
    })
    console.log(this.props)

  }

  //初始化选择账套的options
  getSetOfBooks = () => {
    const {setOfBooksId, functionalCurrencyCode} = this.state;
    httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant`)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: true,
            setOfBooksOption: res.data,
            defaultSetOfBook: res.data[0].setOfBooksName,
            setOfBooksId: setOfBooksId || res.data[0].id,
            functionalCurrencyCode: functionalCurrencyCode || res.data[0].functionalCurrencyCode,
          }, () => {
            this.getCurrencyByLanguage();
          })
        }
      })
  };

  getCurrencyByLanguage = () => {
    const {functionalCurrencyName} = this.state;
    httpFetch.get(`${config.baseUrl}/api/Currency/Language/getCurrencyByLanguage?language=chineseName`)
      .then(res => {
          if (res.status === 200) {
            this.setState({
              currencyOptions: res.data,
              loading: false,
            }, () => {
              this.state.currencyOptions.map(param => {
                if (param.currencyCode === this.state.functionalCurrencyCode) {
                  this.setState({
                    loading: false,
                    functionalCurrencyName: functionalCurrencyName || param.currencyName,
                  }, () => {
                    this.getRateDiffer();
                    this.getTableData();
                  })
                }
              });
            })
          }
        }
      )
  }
  //选择账套的某一个option
  onSelectSetOfBook = (value) => {
    const {setOfBooksOption} = this.state;
    this.setState({
      isBatchEditing: false,
    });
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.current = 1;
    setOfBooksOption.map(item => {
      if (item.id === value) {
        this.setState({
          functionalCurrencyCode: item.functionalCurrencyCode,
          setOfBooksId: item.id,
          pagination,
        }, () => {
          this.getTableData();
          this.getRateDiffer();
        })
      }
    })
  };

  //获取汇率容差
  getRateDiffer = () => {
    const {setOfBooksId, tenantId} = this.state;
    this.setState({
      loading: true,
    });
    httpFetch.get(`${config.baseUrl}/api/tenant/config/by/tenantId?setOfBooksId=${setOfBooksId}&tenantId=${tenantId}`)
      .then(
        res => {
          if (res.status === 200) {
            if (res.data) {
              this.setState({
                loading: false,
                warnExchangeRateTol: res.data.warnExchangeRateTol,
                prohibitExchangeRateTol: res.data.prohibitExchangeRateTol,
              })
            } else {
              this.setState({
                loading: false,
                warnExchangeRateTol: 10,
                prohibitExchangeRateTol: 20,
              })
            }
          }
        }
      )
  };

  //获取列表数据
  getTableData = () => {
    let pagination = this.state.pagination;
    const {setOfBooksId, tenantId, functionalCurrencyCode} = this.state;
    this.setState({loading: true});
    let params = {
      baseCurrencyCode: functionalCurrencyCode,
      language: this.props.language.local,
      page: pagination.page,
      size: pagination.pageSize,
      setOfBooksId: setOfBooksId,
      tenantId: tenantId,
    }
    httpFetch.get(`${config.baseUrl}/api/currency/rate/list`,params)
      .then(res => {
          if (res.status === 200) {
            pagination.total = res.data.total;
            this.setState({
              data: res.data.rows,
              copyData: JSON.parse(JSON.stringify(res.data.rows)),
              enableAutoUpdate: res.data.rows.length > 0 && res.data.rows[0].enableAutoUpdate,
              functionalCurrencyName: res.data.rows[0].baseCurrencyName,
              loading: false,
              pagination
            })
          }
        }
      )
  };


  //分页点击
  onChangePager = (p, filters, sorter) => {
    const {isBatchEditing} = this.state;
    if (isBatchEditing) {
      message.error(this.$t("currency.setting.can.not.change") /*批量更改汇率中，不可切换页面*/);
    } else {
      let pagination = this.state.pagination;
      pagination.page = p.current - 1;
      pagination.current = p.current;
      this.setState({
        pagination
      }, () => {
        this.getTableData();
      })
    }
  };

  //点击汇率容差的编辑
  onEdit = () => {
    const {isBatchEditing} = this.state;
    if (isBatchEditing) {
      this.setState({
        isBatchEditing: false,
      })
    }
    this.setState({
      isEditing: true,
    })
  };

  //点击汇率容差的保存
  onSave = () => {
    const {setOfBooksId, tenantId} = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      let params = {
        prohibitExchangeRateTol: values.prohibitExchangeRateTol,
        warnExchangeRateTol: values.warnExchangeRateTol,
        setOfBooksId,
        tenantId,
      };
      httpFetch.post(`${config.baseUrl}/api/tenant/config/input`, params)
        .then(res => {
            if (res.status === 200) {
              message.success(this.$t("wait.for.save.modifySuccess")/*修改成功*/);
              this.getRateDiffer();
            } else {
              message.error(this.$t("wait.for.save.modifyFail")/*修改失败*/);
            }
          }
        )
    });
    this.setState({
      isEditing: false,
    })
  };

  //点击取消
  onCancel = () => {
    this.props.form.resetFields();
    this.setState({
      isEditing: false,
    })
  };

  //点击启用自动汇率的checkbox
  onEnableAutoRate = (e) => {
    const {isBatchEditing} = this.state;
    if (isBatchEditing) {
      this.setState({
        isBatchEditing: false,
      })
    }
    if (e.target.checked) {
      this.setState({
        visible: true,
      })
    } else {
      Modal.confirm({
        title: this.$t("currency.setting.cancel.auto.update")/*确定要取消自动更新汇率？*/,
        onOk: () => {
          this.setState({
            enableAutoUpdate: false,
          }, () => {
            this.onAutoRateChange();
          })
        },
        onCancel: () => {
        },
      });
    }
  };

  //启用或取消启用自动汇率
  onAutoRateChange = () => {
    const {tenantId, setOfBooksId, enableAutoUpdate, isBatchEditing} = this.state;
    if (isBatchEditing) {
      this.setState({
        isBatchEditing: false,
      })
    }
    httpFetch.put(`${config.baseUrl}/api/currency/status/enable/auto/update?tenantId=${tenantId}&setOfBooksId=${setOfBooksId}&enableAutoUpdate=${enableAutoUpdate}`)
      .then(
        res => {
          if (res.status === 200) {
            this.getTableData()
          }
        }
      )
  };

  //点击模态框的确定
  handleModalOK = () => {
    this.setState({
      visible: false,
      enableAutoUpdate: true,
    }, () => {
      this.onAutoRateChange();
    })
  };

  //点击模态框的取消
  handleModalCancel = () => {
    this.setState({
      visible: false,
    })
  };

  //新增汇率
  onAddNewRate = () => {
    const {
      onAddNewRate, setOfBooksId, tenantId, functionalCurrencyCode,
      functionalCurrencyName, enableAutoUpdate
    } = this.state;
    this.setState({
      isBatchEditing: false,
    });
    this.props.dispatch(
      routerRedux.push({
          pathname: `/admin-setting/currency-setting/currency-setting-add/${functionalCurrencyCode}/${functionalCurrencyName}/${setOfBooksId}/${tenantId}/${enableAutoUpdate}`,
          
     })
    );
  };

  //点击table某一行数据
  handleRowClick = (record) => {
    this.setBeforePage(this.state.pagination);
    const {onEditRate, setOfBooksId, functionalCurrencyCode, functionalCurrencyName, enableAutoUpdate} = this.state;
    this.props.dispatch(
      routerRedux.push({
          pathname: `/admin-setting/currency-setting/currency-setting-edit/${enableAutoUpdate}/${record.currencyRateOid}/${functionalCurrencyName}/${functionalCurrencyCode}/${setOfBooksId}`,
          
     })
    );
    // let editUrl = onEditRate.url;
    // this.context.router.push({
    //   pathname: editUrl,
    //   state: {
    //     record,
    //     enableAutoUpdate,
    //     currencyRateOid: record.currencyRateOid,
    //     functionalCurrencyName: functionalCurrencyName,
    //     functionalCurrencyCode: functionalCurrencyCode,
    //     setOfBooksId: setOfBooksId
    //   }
    // })
  };

//批量更改汇率
  batchEditRate = () => {
    this.setState({
      isBatchEditing: true
    })
  };

  //表格里的汇率生效日期
  tableApplyDate = (text, record, index) => {
    const {isBatchEditing} = this.state;
    if (record.currencyCode === record.baseCurrencyCode && record.currencyName === record.baseCurrencyName) {
      return '-'
    }
    if (isBatchEditing && !record.enableAutoUpdate && record.currencyCode !== record.baseCurrencyCode) {
      return (
        <span onClick={(e) => {
          e.stopPropagation()
        }}>
          <DatePicker onChange={(date) => this.tableApplyDateChange(date, record, index)}
                      defaultValue={moment(moment(new Date()).format("YYYY-MM-DD"))}
                      disabledDate={this.disabledDate}
                      allowClear={false}/>
        </span>
      )
    } else {
      return (
        moment(text).format('YYYY-MM-DD')
      )
    }
  };

  //表格里的汇率生效日期改变时
  tableApplyDateChange = (date, record, index) => {
    const {data, changeData} = this.state;
    applyDateChange = 1;
    changeData.addIfNotExist(index);
    data[index]['applyDate'] = moment(date).format();
    this.setState({
      data,
    });
  };

  //汇率生效日期不可选日期
  disabledDate = (current) => {
    let boo = false;
    let end = this.getAfterDate(1, moment(new Date()).format('YYYY.MM.DD'));
    if (current >= moment(end, 'YYYYMMDD hh:mm:ss'))
      boo = true;
    return current && boo;
  };

  getAfterDate = (afterDays, dateStr) => {
    let date = new Date(dateStr);// it's today
    let oneDayTime = afterDays * 24 * 60 * 60 * 1000;// ms
    let newDate = new Date(date.getTime() + oneDayTime);
    return moment(newDate).format('YYYY-MM-DD');
  };

  //表格里的生效汇率
  tableRate = (text, record, index) => {
    const {isBatchEditing} = this.state;
    if (record.currencyCode === record.baseCurrencyCode && record.currencyName === record.baseCurrencyName) {
      return '-'
    }
    if (isBatchEditing && !record.enableAutoUpdate && record.currencyCode !== record.baseCurrencyCode) {
      return (
        <span onClick={(e) => {
          e.stopPropagation()
        }}>
          <InputNumber onChange={(value) => this.tableRateChange(value, record, index)}
                       value={record.rate}
                       min={0.0000001}
                       precision={7}
                       step={0.0000001}/>
        </span>
      )
    } else {
      return text
    }
  };

  //表格里的生效汇率改变时
  tableRateChange = (value, record, index) => {
    const {data} = this.state;
    rateChange = 1;
    data[index]['rate'] = value;
    this.setState({
      data,
    })
  };

//批量更改汇率的取消修改
  onBatchCancelEdit = () => {
    const {copyData} = this.state;
    this.setState({
      data: JSON.parse(JSON.stringify(copyData)),
      batchCancelEdit: true,
      isBatchEditing: false,
      changeData: [],
    });
  };

  //批量更改汇率的保存
  onBatchSave = () => {
    const {data, changeData} = this.state;
    let error = false;
    data.map(item => {
      if (typeof (item.rate) !== 'number' || item.rate <= 0) {
        error = true;
      }
    });
    if (error) {
      message.error(this.$t("currency.setting.number.zero") /*生效汇率必须为大于0的数字*/)
    } else {
      data.map((item, index) => {
        if (!item.enableAutoUpdate) {
          applyDateChange = 1;
          if (changeData.indexOf(index) === -1) {
            item.applyDate = moment(new Date()).utc().format();
          } else {
            item.applyDate = moment(item.applyDate).utc().format()
          }
        }
      });
      this.setState({
        data,
        changeData: [],
      }, () => {
        if (applyDateChange || rateChange) {
          httpFetch.put(`${config.baseUrl}/api/currency/rate/list`, data).then(res => {
            if (res.status === 200) {
              message.success(this.$t("invoice.management.save.success") /*保存成功*/);
              this.setState({
                data: res.data.rows,
                copyData: JSON.parse(JSON.stringify(res.data.rows))
              })
            }
          });
          rateChange = 0;
          applyDateChange = 0;
        }
      });
    }
    this.setState({
      isBatchEditing: false,
    });
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {
      setOfBooksOption, columns, data, isEditing, pagination, loading, visible,
      enableAutoUpdate, functionalCurrencyCode, functionalCurrencyName, warnExchangeRateTol,
      prohibitExchangeRateTol, isBatchEditing, defaultSetOfBook, setOfBooksId
    } = this.state;
    return (
      <div className='currency-setting-wrap'>
        <Spin spinning={loading}>
          <div className='currency-setting'>
            {this.$t("common.please.select")/*选择账套*/}：
            {defaultSetOfBook &&
            <Select style={{width: 200}}
                    placeholder={this.$t("common.please.select")/*请选择账套*/}
                    onSelect={this.onSelectSetOfBook}
                    defaultValue={setOfBooksId}>
              {setOfBooksOption && setOfBooksOption.length && setOfBooksOption.map(item => (
                <Option key={item.id} value={item.id}>{item.setOfBooksName}</Option>
              ))}
            </Select>
            }
            <span className='currency-setting-currency'>
            {this.$t("common.base.currency")/*本位币*/}：
              {
                functionalCurrencyCode && functionalCurrencyName &&
                <Select style={{width: 200}} value={`${functionalCurrencyCode} ${functionalCurrencyName}`} disabled/>
              }
          </span>
          </div>
          <div className='currency-setting'>
            <Form hideRequiredMark={true}>
              {
                isEditing ?
                  <div className='currency-setting-edit'>
                    <span>{this.$t("currency.setting.reality.deviate")/*汇率容差: 实际汇率偏离*/}&nbsp;</span>
                    <span className='currency-setting-item'>
                  <FormItem>
                    {getFieldDecorator('warnExchangeRateTol', {
                      rules: [{
                        required: true,
                        message: this.$t("currency.setting.deviate.not.empty")/*偏离汇率不能为空*/,
                      }],
                      initialValue: warnExchangeRateTol,
                    })(
                      <InputNumber disabled={!isEditing} size='small'/>
                    )}
                  </FormItem>
                </span>
                    <span>&nbsp;{this.$t("currency.setting.deviate.warn")/*%时警告*/}&nbsp;</span>
                    <span className='currency-setting-item'>
                 <FormItem>
                  {getFieldDecorator('prohibitExchangeRateTol', {
                    rules: [{
                      required: true,
                      message: this.$t("currency.setting.forbidden.not.empty")/*禁止汇率不能为空*/,
                    }],
                    initialValue: prohibitExchangeRateTol,
                  })(
                    <InputNumber disabled={!isEditing} size='small'/>
                  )}
                 </FormItem>
                 </span>
                    <span>&nbsp;{this.$t("currency.setting.forbidden.rate")/*%时禁止。*/}</span>
                    <span className='currency-setting-buttons'>
                  <Button type='primary' onClick={this.onSave} size='small'>
                    {this.$t("common.save")/*保存*/}
                   </Button>
                  <span className='currency-setting-cancel'>
                    <Button onClick={this.onCancel} size='small'>
                      {this.$t("common.cancel")/*取消*/}
                    </Button>
                  </span>
                </span>
                  </div>
                  :
                  <span>
            {this.$t("currency.setting.reality.deviate")/*汇率容差: 实际汇率偏离 */}
                    {warnExchangeRateTol}
                    {this.$t("currency.setting.deviate.warn")/*%时警告, */}
                    {prohibitExchangeRateTol}
                    {this.$t("currency.setting.forbidden.rate")/*%时禁止。*/}
                    {this.props.tenantMode && <Icon type='edit' style={{color: '#1890ff'}} onClick={this.onEdit}/>}
          </span>

              }
            </Form>
          </div>
          <div className='currency-setting'>
            {this.$t("currency.setting.enable.auto.rate")/*启用自动汇率：*/}&nbsp;&nbsp;
            <Checkbox checked={enableAutoUpdate} onChange={(e) => {
              this.onEnableAutoRate(e)
            }} disabled={!this.props.tenantMode}/>
            <span className='currency-setting-currency'>
            {this.$t("currency.setting.enable.rate.note")/*启用汇率需知：*/}&nbsp;&nbsp;
              <Checkbox checked={enableAutoUpdate} onChange={(e) => {
                this.onEnableAutoRate(e)
              }} disabled/>
          </span>
            <br/>
            {enableAutoUpdate && <span className='currency-setting-note'>
            {/*该自动汇率信息仅供参考，对使用该汇率数据所导致的结果，汇联易不承担任何责任。*/}
              {this.$t("currency.setting.without.duty")/*免责声明*/}
          </span>}
          </div>
          {this.props.tenantMode &&
          <div className='currency-setting-add-edit'>
            <div>
              <Button type='primary' onClick={this.onAddNewRate}>
                {this.$t("currency.setting.add.new.rate")/*新增汇率*/}
              </Button>
              <span className='currency-setting-button-edit'>
            {isBatchEditing ?
              <span>
                <Button onClick={this.onBatchCancelEdit}>
                  {this.$t("common.cancel")/*取消修改*/}
                </Button>
                <Button onClick={this.onBatchSave} style={{marginLeft: 20}} type='primary'>
                  {this.$t("common.save")/*保存*/}
                </Button>
              </span>
              :
              <Button type='primary' onClick={this.batchEditRate}>
                {this.$t("currency.setting.batch.edit.rate")/*批量更改汇率*/}
              </Button>
            }
          </span>
            </div>
          </div>
          }
          <div className='currency-setting-table'>
            <Table rowKey={(record, index) => index}
                   dataSource={data}
                   columns={columns}
                   pagination={pagination}
                   onChange={this.onChangePager}
                   size='middle'
                   bordered
                   onRow={record => ({
                     onClick: () => this.handleRowClick(record)
                   })}/>
          </div>
          <div className='currency-setting-modal'>
            <Modal onOk={this.handleModalOK}
                   onCancel={this.handleModalCancel}
                   visible={visible}
                   title={this.$t("currency.setting.enable.rate.note")/*启用汇率需知*/}
                   okText={this.$t("currency.setting.agree")/*同意*/}
                   cancelText={this.$t("currency.setting.refuse")/*拒绝*/}
                   getContainer={() => {
                     return document.getElementsByClassName("currency-setting-modal")[0]
                   }}>
              <h3 className='modal-title'>
                {this.$t("currency.setting.enable.agreement")/*汇联易启用自动汇率服务协议*/}
              </h3>
              <div>
                {/*汇联易自动汇率服务协议（以下简称协议）是用户与汇联易所有者之间就自动汇率服务等相关事宜所订立的契约，请用户管理者仔细阅读本启用协议，点击*/}
                {this.$t("currency.setting.agreement.click")/*说明*/}
                <span className='currency-setting-blue' onClick={this.handleModalOK} style={{cursor: 'pointer'}}>
                {this.$t("currency.setting.agree.continue")/*'同意并继续'*/}"
              </span>
                {this.$t("currency.setting.agree.observe")/*按钮后，即视为用户接受并同意遵守本协议的约定。*/}
              </div>
              <h4>{this.$t("currency.setting.agreement.1")/*第1条 对协议条款的确认和接纳*/}</h4>
              <div className='modal-paragraph'>
                <div>
                  {/*1.1 本协议的所有权和运作权归汇联易所有。*/}
                  {this.$t("currency.setting.agreement.1.1")/*1.1*/}
                </div>
                <div>
                  {/*1.2 经用户同意本协议生效后，自动汇率即为用户服务。*/}
                  {this.$t("currency.setting.agreement.1.2")/*1.2*/}
                </div>
                <div>
                  {/*1.3 汇联易保留本产品特殊情况下拒绝服务的权利。*/}
                  {this.$t("currency.setting.agreement.1.3")/*1.3*/}
                </div>
                <div>
                  {/*1.4 用户使用汇联易提供的此服务时，应同时接受适用于本服务的准则。*/}
                  {this.$t("currency.setting.agreement.1.4")/*1.4*/}
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.2")/*第2条 本协议服务*/}</h4>
              <div className='modal-paragraph'>
                <div className='currency-setting-bold'>
                  {this.$t("currency.setting.agreement.2.1")/*2.1 汇联易自动汇率数据的来源为*/}
                  <span className='currency-setting-blue'>
                  {this.$t("currency.setting.third.party")/*第三方统计*/}
                  </span>
                  {this.$t("currency.setting.europe.data")/*的欧洲央行提供的汇率数据。*/}
                </div>
                <div className='currency-setting-bold'>
                  {/*2.2 汇联易自动汇率的数据有效性及准确性以欧洲央行接口提供数据为准。*/}
                  {this.$t("currency.setting.agreement.2.2")/*2.2*/}
                </div>
                <div className='currency-setting-bold'>
                  {/*2.3 汇联易汇率的服务受限于欧洲央行自动汇率的服务。*/}
                  {this.$t("currency.setting.agreement.2.3")/*2.3*/}
                </div>
                <div>
                  {/*2.4 汇率定时于北京时间早8:00整自动更新每日汇率。*/}
                  {this.$t("currency.setting.agreement.2.4")/*2.4*/}
                </div>
                <div className='currency-setting-bold'>
                  {/*2.5 汇联易的自动汇率可以参与用户日常经营活动，但仅限于参考。*/}
                  {this.$t("currency.setting.agreement.2.5")/*2.5*/}
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.3")/*第3条 用户对本协议应承担的义务*/}</h4>
              <div className='modal-paragraph'>
                <div>
                  {this.$t("currency.setting.law.duty")/*本协议依据国家相关法律法规规章制定，用户同意严格遵守以下义务：*/}
                </div>
                <div className='currency-setting-bold'>
                  {/*3.1 自动汇率仅作为本产品的参考汇率，为用户的经营活动提供参考，不得作为其他商用或传播。*/}
                  {this.$t("currency.setting.agreement.3.1")/*3.1*/}
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.4")/*第4条 责任限制及不承诺担保*/}</h4>
              <div className='modal-paragraph'>
                <div className='currency-setting-bold'>
                  {/*4.1 除非另有明确的书面说明,本自动汇率协议提供的数据是在“按现状”和“按现有”的基础上提供的。*/}
                  {this.$t("currency.setting.agreement.4.1")/*4.1*/}
                </div>
                <div className='currency-setting-bold'>
                  {/*4.2 除非另有明确的书面说明,汇联易不对自动汇率数据作任何形式的、明示或默示的声明或担保（根据中华人民共和国法律另有规定的以外）。*/}
                  {this.$t("currency.setting.agreement.4.2")/*4.2*/}
                </div>
                <div>
                  {/*4.3 如因不可抗力或其他汇联易无法控制的原因使自动汇率无法正常使用或更新时，汇联易不承担相应责任，但允许用户关闭自动汇率接口并自行维护汇率。*/}
                  {this.$t("currency.setting.agreement.4.3")/*4.3*/}
                </div>
                <div>
                <span className='currency-setting-blue'>
                  {/*4.4 汇联易自动汇率数据仅供参考，对客户使用该汇率数据所导致的结果，汇联易不承担任何责任。*/}
                  {this.$t("currency.setting.agreement.4.4")/*4.4*/}
                </span>
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.5")/*第5条 协议更新及用户关注义务*/}</h4>
              <div className='modal-paragraph'>
                <div>
                  {/*5.1 根据国家法律法规变化及运营需要，汇联易有权对本协议条款不时地进行修改，修改后的协议一旦被张贴在本站上即生效，并代替原来的协议。*/}
                  {this.$t("currency.setting.agreement.5.1")/*5.1*/}
                </div>
                <div>
                  {/*5.2 用户可随时登陆查阅最新协议；用户有义务不时关注并阅读最新版的协议、其他条款及公告。如用户不同意更新后的协议，可以且应立即停止接受汇联易自动汇率的服务；*/}
                  {this.$t("currency.setting.agreement.5.2")/*5.2*/}
                </div>
                <div>
                  {/*5.3 如用户继续使用自动汇率服务的，即视为同意更新后的协议。汇联易建议用户在使用自动汇率服务之前阅读本协议及公告。如果本协议中任何一条被视为废止、无效或因任何理由不可执行，*/}
                  {/*该条应视为可分的且并不影响任何其余条款的有效性和可执行性。*/}
                  {this.$t("currency.setting.agreement.5.3")/*5.3*/}
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.6")/*第6条 法律管辖和适用*/}</h4>
              <div className='modal-paragraph'>
                <div>
                  {/*本协议的订立、执行和解释及争议的解决均适用在中华人民共和国大陆地区适用之有效法律（但不包括其冲突法规则）。*/}
                  {/*如发生本协议与适用之法律相抵触时， 则这些条款将完全按法律规定重新解释，而其他条款继续有效。*/}
                  {/*如缔约方就本协议内容或其执行发生任何争议,双方应尽力友好协商解决；协商不成时，任何一方均可向协议签订地人民法院提起诉讼。*/}
                  {/*本协议签订地为中华人民共和国上海市普陀区。*/}
                  {this.$t("currency.setting.agreement.law")/*说明*/}
                </div>
              </div>
              <h4>{this.$t("currency.setting.agreement.7")/*第7条 其他*/}</h4>
              <div className='modal-paragraph'>
                <div>
                  {/*7.1 汇联易所有者是指在政府部门依法许可或备案的汇联易网站经营主体。*/}
                  {this.$t("currency.setting.agreement.7.1")/*7.1*/}
                </div>
                <div>
                  {/*7.2 本协议内容中以黑体、加粗、下划线、斜体等方式显著标识的条款，请用户着重阅读。*/}
                  {this.$t("currency.setting.agreement.7.2")/*7.2*/}
                </div>
                <div>
                  {/*7.3 用户点击本协议下方的“同意并继续”按钮即视为用户完全接受本协议，*/}
                  {/*在点击之前请用户再次确认已知悉并完全理解本协议的全部内容。*/}
                  {this.$t("currency.setting.agreement.7.3")/*7.3*/}
                </div>
              </div>
            </Modal>
          </div>
        </Spin>
      </div>
    )
  }
}


// CurrencySetting.contextTypes = {
//   router: React.PropTypes.object
// };
function mapStateToProps(state) {
  return {
    language:state.languages,
    company: state.user.company,
    tenantMode: true,
    proFile:state.user.proFile
  }
}

const wrappedNewContract = Form.create()(CurrencySetting);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewContract);
