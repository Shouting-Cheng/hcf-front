import React from 'react';
import { connect } from 'dva';
// import { injectIntl } from 'react-intl';
import { Form, Card, Input, Row, Col, Table, Affix, InputNumber, Button, DatePicker, Select, message, Spin, Popconfirm } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import { routerRedux } from "dva/router";
import trainReportService from 'containers/train/TrainReport.service'

import moment from 'moment';
/* import config from 'config'
import httpFetch from "share/httpFetch"; */

// import Item from 'antd/lib/list/Item';
// import ReportList from './report-list';

class ReportMaintain extends React.Component {
  constructor(props) {
    super(props);
    //const { formatMessage } = this.props.intl;
    this.state = {
      loading: false,
      submitLoading: false,
      isNew: true,
      dirty: false,
      isSave: true,
      headerData: {},
      lineData: [],
      dataKey: 3,
      columns: [
        {          /*行ID*/
          title: this.$t("train.line.id" ), key: "key", width: 180, align: 'center', dataIndex: 'id', render: (text, record, index) => this.renderColumns(text, record, index, 'id')
        },
        {          /*发票代码*/
          title: this.$t("train.invoice.code" ), align: 'center', dataIndex: 'invoiceCode', render: (text, record, index) => this.renderColumns(text, record, index, 'invoiceCode')
        },
        {          /*发票号码*/
          title: this.$t("train.invoice.number" ), align: 'center', dataIndex: 'invoiceNumber', render: (text, record, index) => this.renderColumns(text, record, index, 'invoiceNumber')
        },
        {          /*发票金额*/
          title: this.$t("train.invoice.amount" ), className: 'rightClass', dataIndex: 'invoiceAmount', render: (text, record, index) => this.renderColumns(text, record, index, 'invoiceAmount')
        },
        {          /*发票日期*/
          title: this.$t("train.invoice.date"), align: 'center', dataIndex: 'invoiceDate', render: (text, record, index) => this.renderColumns(text, record, index, 'invoiceDate')
        },
        {          /*说明*/
          title: this.$t("train.remark"), width: 200, className: 'leftClass', dataIndex: 'remark', render: (text, record, index) => this.renderColumns(text, record, index, 'remark')
        },                            //操作
        {
          title: this.$t("common.operation"), width: 100, align: 'center', render: (text, record, index) => (
            <span>
              {record.id ? <a href="#" onClick={record.edit ? (e) => this.saveItem(e, record, index) : (e) => this.operateItem(e, record, index, true)}>{this.$t(record.edit ? "common.save" : "common.edit")}</a>
                :
                ''
              }
              {record.edit ?
                <a href="#" style={{ marginLeft: 12 }}
                  onClick={(e) => this.operateItem(e, record, index, false)} >{this.$t("common.cancel" )}</a>
                :
                <Popconfirm onConfirm={(e) => this.deleteItem(e, record, index)} title={this.$t("common.confirm.delete" )}>
                  <a href="#" style={{ marginLeft: 12 }}>{this.$t("common.delete" )}</a>
                </Popconfirm>
              }
            </span>)
        },
      ],
      user: {},
      reportStatus: [],
      companyIdOptions: [], //公司
      unitIdOptions: [], //责任部门选项
      employeeIdOptions: [], //责任人选项
      pagination: {
        total: 0,
        page: 0,
        pageSize: 10,
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true
      },
      // reportList: menuRoute.getRouteItem('tra-report-list', 'key'),  //报销单列表界面
      // reportMaintain: menuRoute.getRouteItem('tra-report-maintain', 'key')
    }
  }

  //删除报销单行
  deleteItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({loading: true});
    trainReportService.deleteReportLine(record.id).then((response) => {
      message.success(`${this.$t("common.delete.success", { name: "" })}`);
      this.setState({
        loading: false
      }, () => {
        //获取行数据
        this.updateLineListAndHeaderAmount();
        
      })
    }).catch((e) => {
      if (e.response) {
        message.error(`${this.$t("common.save.filed")}, ${e.response.data.message}`)
      }
    });

  };

  //更新头金额
  updateTotalAmount() {
    let tempAmount = 0;
    this.state.lineData.map((line, index) => {
      tempAmount = Number(tempAmount) + Number(line.invoiceAmount);
    });
    this.props.form.setFieldsValue({ "totalAmount": tempAmount });
    let headerData = { ...this.state.headerData, totalAmount: tempAmount }
    this.setState({
      headerData
    });
  }

  //删除行时调用
  // 根据报销单头ID获取行列表并更新amount
  updateLineListAndHeaderAmount(){
    const { pagination } = this.state;
    trainReportService.getReportLineListByHeaderId(pagination.page,pagination.pageSize,this.state.headerData.id).then((res) => {
      let lines = [];
      res.data.map((item) => {
        item.key = item.id;//Table的每一行，需要一个key值
        lines.push(item);
      });
      this.setState({ isNew: false,loading:false,lineData: lines });
      //当行删除时，需要更新头金额
      this.updateTotalAmount();
      trainReportService.updateHeader(this.state.headerData);
    });
  }
  //更新单行
  saveItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    //console.log(record);
    trainReportService.updateLine(record).then((response) => {
      message.success(`${this.$t("common.save.success", { name: "" })}`);
      this.setState({
        loading: false,
        isSave: true
      }, () => {
        this.getReportHeaderAndLines();
      })
    }).catch((e) => {
      if (e.response) {
        message.error(`${this.$t("common.save.filed")}, ${e.response.data.message}`)
      }
    })
  };


  operateItem = (e, record, index, flag) => {
    e.preventDefault();
    e.stopPropagation();
    let lineData = this.state.lineData;
    if (!flag) {
      if (typeof record.id === 'undefined') {
        lineData.delete(lineData[index])
        this.setState({ lineData }, () => {
          //当行金额改变时，需要更新头金额
          let tempAmount = 0;
          this.state.lineData.map((line, index) => {
            tempAmount = Number(tempAmount) + Number(line.invoiceAmount);
          });
          let headerData = { ...this.state.headerData, totalAmount: tempAmount }
          this.setState({
            headerData
          });
        });
        return
      }
    }
    lineData[index].edit = flag;
    this.setState({
      lineData,
      isSave: !flag
    });
  };

  //取单据的头行信息
  getReportHeaderAndLines = () => {
    let headerId = this.state.headerData.id;
    if (headerId == 'create' || headerId == undefined) {
      headerId = this.props.match.params.id;
    }
    if (headerId != undefined && headerId != 'create') {
      //查询报账单详情
      trainReportService.getReportHeadAndLine(headerId).then((res) => {
        //console.log(res.data);
        let lines = [];
        res.data.lines.map((item) => {
          item.key = item.id;//Table的每一行，需要一个key值
          lines.push(item);
        });
        this.setState({ isNew: false, headerData: res.data.header, lineData: lines });
      });
    }
  }
  //初始化加载
  componentWillMount() {
    //console.log(this.props);
    //取登录信息
    this.setState({ user: this.props.user, dirty: false });
    //加载单据状态
    this.getSystemValueList(2028).then(res => {
      let reportStatus = res.data.values || [];
      this.setState({ reportStatus })
    });

    this.getReportHeaderAndLines();
    //获取公司列表
    trainReportService.getCompanyListByBooksId(this.props.company.setOfBooksId).then((res) => {
      let companyIdOptions = res.data;
      this.setState({ companyIdOptions })
    });

    //获取责任部门列表
    trainReportService.getUnitList().then(res => {
      res.status === 200 && this.setState({ unitIdOptions: res.data });
    });

    let tempAmount = 0;
    //更新头金额
    this.state.lineData.map((line, index) => {
      tempAmount = Number(tempAmount) + Number(line.invoiceAmount);
    });
    let headerData = { ...this.state.headerData, totalAmount: tempAmount }
    this.setState({
      headerData
    });
  }

  //选择责任部门
  changeUnitId = (unit) => {
    //console.log(unit);
    this.props.form.setFieldsValue({ employeeId: undefined });
    if (unit) {
      const tempUnit = JSON.parse(unit);
      //let url = `${config.baseUrl}/api/departments/users/${tempUnit.departmentOID}`;
      trainReportService.getEmployeeListByUnitOID(tempUnit.departmentOID).then(res => {
        this.setState({ employeeIdOptions: res.data })
      });
    }
  };

  handleAdd = () => {
    let { lineData, dataKey } = this.state;
    let newData = { key: dataKey++, edit: true, invoiceCode: '', "invoiceNumber": "", "remark": "", "invoiceAmount": "", "invoiceDate": '' };
    let array = [];
    array.push(newData);
    let newArray = array.concat(lineData);
    this.setState({ lineData: newArray, dataKey, dirty: true });
  };

  //编辑行时，将值更新到 this.state.data 中去
  handleChangeColumn = (value, index, dataIndex) => {
    const { lineData } = this.state;
    //debugger;
    //console.log(value);
    switch (dataIndex) {
      case 'invoiceCode': {
        lineData[index].invoiceCode = value && value.target ? value.target.value : '';
        break;
      }
      case 'invoiceNumber': {
        lineData[index].invoiceNumber = value && value.target ? value.target.value : '';
        break;
      }
      case 'invoiceDate': {
        lineData[index].invoiceDate = value;
        break;
      }
      case 'invoiceAmount': {
        lineData[index].invoiceAmount = value;
        break;
      }
      case 'remark': {
        lineData[index].remark = value && value.target ? value.target.value : '';
        break;
      }
    }
    this.setState({ lineData, dirty: true }, () => {
      //console.log(dataIndex);
      //当行金额改变时，需要更新头金额
      if (dataIndex == 'invoiceAmount') {
        this.updateTotalAmount();
      }
    })
  }

  renderColumns = (decode, record, index, dataIndex) => {
    if (record.edit) {
      switch (dataIndex) {
        case 'id': {
          return (
            <div style={{ align: "center" }}>{record.id}</div>
          );
        }
        case 'invoiceCode': {
          return <input style={{ width: '98%', "borderRadius": "4px" }} defaultValue={record.invoiceCode} onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} />;
        }
        case 'invoiceNumber': {
          return <input style={{ width: '98%', "borderRadius": "4px" }} defaultValue={record.invoiceNumber} onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} />;
        }
        case 'invoiceDate': {
          if (!record.invoiceDate) {
            return <DatePicker onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} />;
          } else {
            return <DatePicker defaultValue={moment(record.invoiceDate, 'YYYY-MM-DD')} onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} />;
          }
        }
        case 'invoiceAmount': {
          return <InputNumber defaultValue={0} defaultValue={record.invoiceAmount} onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} precision={2} style={{ width: '98%' }} />;
        }
        case 'remark': {
          return <input style={{ width: '98%', "borderRadius": "4px" }} defaultValue={record.remark} onChange={(value) => this.handleChangeColumn(value, index, dataIndex)} />;
        }
      }
    } else {
      switch (dataIndex) {
        case 'id': { return record.id; }
        case 'invoiceCode': { return record.invoiceCode; }
        case 'invoiceNumber': { return record.invoiceNumber; }
        case 'invoiceDate': {
          return moment(record.invoiceDate).format('YYYY-MM-DD');//moment(record.invoiceDate, 'YYYY-MM-DD');  
        }
        case 'invoiceAmount': { return record.invoiceAmount; }
        case 'remark': { return record.remark; }
      }
    }
  };

  //头行一起保存
  saveHeaderAndLines = (e) => {
   
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!this.state.dirty) {
        message.success('没有需要保存的内容.');
        return;
      }
      if (!err) {
        let params = {};
        values.createdBy = this.props.user.id;//this.state.user.id;
        try {
          //转成JSON对象
          const dept = JSON.parse(values.unitId);
          //部门下拉发生变化时，values.unitId会存成一个json对象
          values.unitId = dept.id;
        } catch (error) {
          //编辑时进来，不修改部门下拉，则会走到该异常里来
          values.unitId = this.state.headerData.unitId;
        }
        
        //debugger;
        // console.log(Number(values.applicationId));//NaN
        
        //编辑时进来 values.applicationId的值为  applicationId:name的形式，如果未修改，则取头之前的applicationId
        if(!Number(values.applicationId)){
          values.applicationId = this.state.headerData.applicationId
        }
        values.setOfBooksId = `${this.props.company.setOfBooksId}`;
        values.tenantId = `${this.props.company.tenantId}`;
        params.header = { ...this.state.headerData, ...values };

        params.lines = [];
        this.state.lineData.map((temp, index) => {
          let line = { ...temp, headerId: values.id, lineNumber: (index + 1) * 10 };
          params.lines.push(line);
        });
        trainReportService.saveReportHeadAndLine(params).then((response) => {
          if (response.status === 200) {
            //console.log(response);
            message.success(this.$t("common.operate.success"));
            let lines = [];
            response.data.lines.map((item) => {
              item.key = item.id;//Table的每一行，需要一个key值
              lines.push(item);
            });
            this.props.form.setFieldsValue({ "id": response.data.header.id });
            this.setState({
              loading: false,
              isNew: false,
              dirty: false
            }, () => {
              this.setState({
                headerData: response.data.header,
                lineData: lines
              }, () => {
                this.props.dispatch(
                  routerRedux.push({
                      pathname: `/train-report/tra-report-maintain/${response.data.header.id}`,
                  })
              );
              });
            });
          }
        });
      }
    });
    this.setState({ loading: false });
  }

  //提交
  onSubmit = (e) => {
    //console.log(this.state.headerData);

    if (this.state.headerData.reportStatus == "NEW") {
      e.preventDefault();
      this.setState({ submitLoading: true });
      this.props.form.validateFieldsAndScroll((err, values) => {
        trainReportService.submitReport(this.state.headerData.id).then((response) => {
          if (response.status === 200) {
            message.success(this.$t("common.operate.success"));
            this.setState({ submitLoading: false });
            //提交后返回到列表界面
            this.onBack();
          }
        });
      });
      
    } else {
      message.error(`${this.$t("common.save.filed", { name: "" })}`);
    }
    
  }
  //返回按钮
  onBack = () => {
    this.props.dispatch(
      routerRedux.push({
          pathname: `/train-report`,
      })
  );
  }
  render() {
    const { pagination, unitIdOptions, companyIdOptions, employeeIdOptions, user, reportStatus, headerData, lineData, 
      isNew, loading, submitLoading, columns } = this.state;
    //const { formatMessage } = this.props.intl;
    //console.log(headerData);
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="train">
        <Form onSubmit={this.saveHeaderAndLines}>
          <Card title={this.$t('train.report.header' )} hoverable={false} style={{ marginBottom: '10px' }}>
            <Row>
              <Col span={7} >
                <FormItem label={this.$t('train.create.date' )}>
                  {getFieldDecorator('createdDate', {
                    rules: [{
                      required: true,
                      message: this.$t("common.please.enter" )
                    }],
                    initialValue: isNew ? moment(new Date(), 'YYYY-MM-DD') : moment(headerData.createdDate)
                  })(
                    <DatePicker style={{ width: '100%' }} disabled />
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.create.user' )}>
                  {getFieldDecorator('createdBy', {
                    rules: [{
                      required: true,
                      message: this.$t("common.please.enter" )
                    }],
                    initialValue: user.fullName
                  })(
                    <Input disabled />
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.report.status' )}>
                  {getFieldDecorator('reportStatus', {
                    rules: [{
                      required: true,
                      message: this.$t("common.please.enter" )
                    }],
                    initialValue: isNew ? 'NEW' : headerData.reportStatus
                  })(
                    <Select placeholder={this.$t("common.please.enter" )} style={{ width: '100%' }} disabled>
                      {reportStatus.map(option => {
                        return <Option key={option.value}>{option.messageKey}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={7}>
                <FormItem label={this.$t('train.total.amount' )}>
                  {getFieldDecorator('totalAmount', {
                    rules: [{
                      required: true,
                      message: this.$t("common.please.enter" )
                    }],
                    initialValue: headerData.totalAmount
                  })(
                    <Input disabled />
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.report.id' )}>
                  {getFieldDecorator('id', {
                    rules: [{
                      required: false,
                      message: ''
                    }],
                    initialValue: isNew ? '' : headerData.id
                  })(
                    <Input disabled />
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.business.code' )}>
                  {getFieldDecorator('businessCode', {
                    rules: [{
                      required: true,
                      message: this.$t("common.please.enter" )
                    }],
                    initialValue: isNew ? '' : headerData.businessCode
                  })(
                    <Input disabled={isNew ? false : true} placeholder="请输入编码" />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={7}>
                <FormItem label={this.$t('train.report.company' )}>
                  {getFieldDecorator('companyId', {
                    rules: [{
                      required: true,
                      message: '请选择公司'
                    }],
                    initialValue: isNew ? undefined : headerData.companyId
                  })(
                    <Select placeholder={this.$t("common.please.enter" )} onChange={this.handleCompanyId} style={{ width: '100%' }}>
                      {companyIdOptions.map((option) => {
                        return <Option key={option.id}>{option.name}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.report.unit' )}>
                  {getFieldDecorator('unitId', {
                    rules: [{
                      required: true,
                      message: '请选择部门'
                    }],
                    initialValue: isNew ? undefined : (headerData.unitName || undefined)
                  })(
                    <Select placeholder={this.$t("common.please.enter" )} allowClear onChange={this.changeUnitId} style={{ width: '100%' }}>
                      {unitIdOptions.map((option) => {
                        return <Option key={JSON.stringify(option)}>{option.name}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem label={this.$t('train.application.name' )}>
                  {getFieldDecorator('applicationId', {
                    rules: [{
                      required: true,
                      message: '请选择申请人'
                    }],
                    initialValue: isNew ? undefined : (headerData.applicationId + '-' + headerData.applicationName || undefined)
                  })(
                    <Select placeholder="请选择申请人" allowClear style={{ width: '100%' }}>
                      {employeeIdOptions.map((option) => {
                        return <Option key={option.id}>{option.fullName} - {option.employeeID}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={7}>
                <FormItem label={this.$t('train.report.date' )}>
                  {getFieldDecorator('reportDate', {
                    rules: [{
                      required: true,
                      message: '请选择日期'
                    }],
                    initialValue: isNew ? undefined : moment(headerData.reportDate)
                  })(
                    <DatePicker style={{ width: '100%' }} />
                    )}
                </FormItem>
              </Col>
              <Col span={15} offset={1}>
                <FormItem label={this.$t('train.remark' )}>
                  {getFieldDecorator('remark', {
                    rules: [{
                      required: false,
                      message: ''
                    }],
                    initialValue: isNew ? undefined : headerData.remark
                  })(
                    <TextArea placeholder="可输入说明信息" autosize={{ minRows: 2, maxRows: 6 }} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Affix offsetBottom={0}
            style={{
              position: 'fixed', zIndex: 999, bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px'
            }}>
            <Button type="primary" onClick={this.onSubmit} style={{ margin: '0 20px' }} loading={submitLoading} >{this.$t('common.submit' )}</Button>
            <Button htmlType="submit" loading={loading} >{this.$t('common.save' )}</Button>
            <Button type="danger" ghost onClick={this.onBack} style={{ margin: '0 20px' }}>{this.$t('common.back' )}</Button>
          </Affix>
        </Form>
        <Card title={this.$t('train.report.line' )} hoverable={false} style={{ margin: '0' }}>
          <div className="table-header">
            <div className="table-header-buttons" style={{ marginTop: '-30px' }}>
              <Button type="primary" onClick={this.handleAdd}>{this.$t('train.add.line' )}</Button>
            </div>
          </div>
          <Table
            bordered
            rowKey={record => record.key}
            dataSource={lineData}
            columns={columns}
            loading={loading}
            onChange={this.onChangePager}
            pagination={pagination}
            size="middle" />
        </Card>
      </div>
    )
  }
}

//const WrappedReportMaintain = Form.create()(ReportMaintain);

function mapStateToProps(state) {
  // console.log(state);
  return {
    company: state.user.company,
    user: state.user.currentUser,
  }
}
export default connect(mapStateToProps)(Form.create()(ReportMaintain));
//export default ReportMaintain;