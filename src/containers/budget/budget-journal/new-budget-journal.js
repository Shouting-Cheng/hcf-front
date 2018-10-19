/**
 * Created by 13576 on 2017/10/6.
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Col, Row, Select, Form, Input, message, Card, Affix } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import Chooser from 'components/chooser';
import UploadFile from 'components/upload.js'
import httpFetch from 'share/httpFetch';
import config from 'config'
import menuRoute from 'routes/menuRoute.js'
import budgetJournalService from 'containers/budget/budget-journal/budget-journal.service'
import "styles/budget/budget-journal/new-budget-journal.scss"

import { formatMessage } from "share/common"

class NewBudgetJournalFrom extends React.Component {
  // GENERATE(1001)//编辑中
  // , APPROVAL(1002)//审批中
  // , WITHDRAW(1003) // 撤回
  // , APPROVAL_PASS(1004) // 审批通过
  // , APPROVAL_REJECT(1005) // 审批驳回
  // , DELETE(1006) //已删除
  // //对公报销单 2001
  // //预付款申请单 3001
  // //付款申请单 4001
  // //预算日记账 5001
  // ,POSTED(5001)//复核(过账)
  // ,BACKLASH_SUBMIT(5002)//:反冲提交
  // ,BACKLASH_CHECKED(5003)//:反冲审核
  // //合同  6001
  // ,HOLD(6001)//暂挂中
  // ,CANCEL(6002)//已取消
  // ,FINISH(6003)//已完成

  // // 记录操作历史加的
  // ,NOT_HOLD(6004) //取消暂挂
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      budgetJournalDetailPage: menuRoute.getRouteItem('budget-journal-detail', 'key'),    //预算日记账详情
      budgetJournalPage: menuRoute.getRouteItem('budget-journal', 'key'),    //预算日记账
      idSelectJournal: false,
      isStructureIn: false,
      defaultValueList: {},
      defaultDataList: [
        {
          type: 'chooser', event: 'versionName', defaultValueKey: 'versionName',
          url: `${config.budgetUrl}/api/budget/versions/query?enabled=true&status=CURRENT&organizationId=${this.props.organization.id}`
        },
        {
          type: 'chooser', event: 'scenarioName', defaultValueKey: 'scenarioName',
          url: `${config.budgetUrl}/api/budget/scenarios/query?defaultFlag=true&organizationId=${this.props.organization.id}`
        }
      ],
      structureGroup: [],
      periodStrategy: [],
      periodPeriodQuarter: [],
      periodPeriod: [],
      structureFlag: true,
      periodFlag: true,
      periodYearFlag: true,
      periodQuarterFlag: true,
      periodStrategyFlag: true,
      journalTypeIdFlag: true,
      file: {},
      attachmentOID: [],
      formOid: null,
      documentOid: null
    };
  }



  componentWillMount() {
    this.getPeriodStrategy();
    this.getDefaultValue();
  }

  //获取表单默认值
  getDefaultValue() {
    let defaultValueList = this.state.defaultValueList;
    let defaultDataList = this.state.defaultDataList;
    defaultDataList.map((item) => {
      httpFetch.get(item.url).then((response) => {
        if (item.type === "chooser") {
          defaultValueList[item.defaultValueKey] = response.data;
          this.props.form.setFieldsValue(
            defaultValueList
          )
        }
      }).catch((e) => {
        if (e.response)
          message.error(e.response.data.message)
      })
    })
  }



  //获取编制期段
  getPeriodStrategy = () => {
    this.getSystemValueList(2002).then((response) => {
      let periodStrategy = [];
      response.data.values.map((item) => {
        let option = {
          key: item.code,
          label: item.messageKey
        };
        periodStrategy.push(option);
      });
      this.setState({
        periodStrategy: periodStrategy,
      })
    });
  };


  //保存日记账头
  saveHeard = (value) => {
    this.setState({
      loading: true,
    })
    budgetJournalService.addBudgetJournalHeaderLine(value).then((response) => {
      let path = this.state.budgetJournalDetailPage.url.replace(":journalCode", response.data.dto.id);
      this.context.router.push(path);
      this.setState({
        loading: false,
      })
    }).catch(e => {
      message.error(e.response.data.message)
      this.setState({
        loading: false,
      })
    })

  };


  //处理表单数据
  handleFrom = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        let userData = {
          "dto": {
            "companyId": this.props.company.id,
            "companyName": this.props.company.name,
            "organizationId": this.props.organization.id,
            "organizationName": this.props.organization.organizationName,
            "structureId": value.structureId,
            "structureName": "structureName",
            "description": "",
            "reversedFlag": "N",
            "sourceBudgetHeaderId": undefined,
            "sourceType": undefined,
            "employeeId": this.props.user.id,
            "employeeName": this.props.user.fullName,
            "unitName": "periodNumber",
            'versionId': value.versionName[0].id,
            'versionName': value.versionName[0].versionName,
            'scenarioId': value.scenarioName[0].id,
            'scenarioName': value.scenarioName[0].scenarioName,
            "status": 1001,
            "journalTypeId": value.journalTypeName[0].id,
            "journalTypeName": value.journalTypeName[0].journalTypeName,
            "periodStrategy": value.periodStrategy,
            "versionNumber": "1",
            "attachmentOID": this.state.attachmentOID,
            "formOid": this.state.formOid,
            "documentType": this.state.documentOid
          }
          ,
          "list": []
        };
        this.saveHeard(userData);
      }
    })
  };


  //根据预算日记账类型，获得预算表
  getStructure(value) {
    let params = {};
    params.companyId = this.props.company.id;
    params.journalTypeId = value;

    budgetJournalService.getStructureByBudgetJournalType(params).then(res => {

      let structureId = null;
      let queryDefaultStructureParams = {};
      queryDefaultStructureParams.journalTypeId = value;
      budgetJournalService.getDefaultStructure(queryDefaultStructureParams).then(response => {

        if (response.data) {

          res.data.map((item) => {
            item.key = item.id;
            if(item.key == response.data.id) {
              structureId = response.data.id;
            }
          })

          this.props.form.setFieldsValue({
            "structureId": structureId,
            "periodStrategy": response.data.periodStrategy
          })

        } else {
          res.data.map((item) => {
            item.key = item.id;
          })
        }
        this.setState({ "structureGroup": res.data });
      }).catch(e => { message.error(e.response.data.message) })

    }).catch(e => { message.error(e.response.data.message) })



    this.getFormOid(value);

  }

  getFormOid(value) {
    let formOid = null;
    let documentOid = null;
    let params = {};
    params.organizationId = this.props.organization.id;
    params.journalTypeId = value;
    params.page = 0;
    params.size = 50;
    console.log(this.props.organization);
    budgetJournalService.getJournalType(params).then((res) => {
      res.data.map((item) => {
        if (item.id == value) {
          formOid = item.form0id;
          documentOid = item.formType;
          this.setState({
            formOid,
            documentOid
          }, () => { })
        }
      })
    })
  }


  //选择预算表时，获得期间段
  handleSelectChange = (values) => {
    this.state.structureGroup.map((item) => {
      if (item.id == values) {
        const periodStrategy = item.periodStrategy;
        this.props.form.setFieldsValue({
          periodStrategy: periodStrategy,
        });
      }
    });

  };

  //取消
  HandleClear = () => {
    let path = this.state.budgetJournalPage.url;
    this.context.router.push(path);
  };


  //选择预算日记账类型，设置对应的预算表选
  handleJournalType = (value) => {
    if (value.length > 0) {
      let valueData = value[0];
      this.setState({
        idSelectJournal: true,
        structureFlag: false
      });
      this.props.form.setFieldsValue({
        structureId: ''
      });

      this.getStructure(valueData.id);
    }

  };

  //上传附件，获取OID
  uploadHandle = (value) => {
    this.setState({
      attachmentOID: value
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const organization = this.props.organization;
    const { structureGroup, periodStrategy, structureFlag, periodStrategyFlag, uploading } = this.state;
    const formItemLayout = {};
    const strategyOptions = structureGroup.map((item) => <Option value={String(item.id)}>{item.structureName}</Option>);
    const periodStrategyOptions = periodStrategy.map((item) => <Option key={item.key} value={item.key}>{item.label}</Option>);

    return (
      <div className="new-budget-journal">
        <div className="budget-journal-title">
          <div><h1>{formatMessage({ id: "budgetJournal.journal" })}</h1></div>
          <div className="budgetJournal-journal-title-detail">{formatMessage({ id: "budgetJournal.journalDetail" })}</div>
        </div>
        <div className="divider"> </div>
        <Form onSubmit={this.handleFrom} style={{}}>
          <Card title={formatMessage({ id: "budgetJournal.basicInformation" })} style={{ with: "100%" }}>
            <Row gutter={40} type="flex" align="top">
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.journalCode" })}>
                  {getFieldDecorator('journalCode', {
                    rules: [{}],
                    initialValue: '-'
                  })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.employeeId" })}>
                  {getFieldDecorator('employeeId', {
                    rules: [{
                      required: true,
                      message: '',
                    }],
                    initialValue: this.props.user.fullName
                  })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budget.organization" })}>
                  {getFieldDecorator('organizationName', {
                    rules: [{
                      required: true,
                      message: '',
                    }],
                    initialValue: organization.organizationName
                  })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.companyId" })}>
                  {getFieldDecorator('companyId', {
                    rules: [{
                      required: true,
                      message: 'formatMessage({id: "common.can.not.be.empty"}, {name:"journalTypeName"}',
                    }],
                    initialValue: this.props.company.name
                  })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.unitId" })}>
                  {getFieldDecorator('departmentName', {
                    rules: [{
                      required: true,
                      message: '',
                    }],
                    initialValue: this.props.user.departmentName
                  })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Card>
          <div className="divider"> </div>

          <Card title={formatMessage({ id: "budgetJournal.budgetInformation" })} style={{ with: "100%" }}>
            <Row gutter={40} type="flex" align="top">
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.journalTypeId" })}>
                  {getFieldDecorator('journalTypeName', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.can.not.be.empty" }, { name: formatMessage({ id: "budgetJournal.journalTypeId" }) })
                    }]
                  })(
                    <Chooser
                      type='budget_journal_type'
                      labelKey='journalTypeName'
                      valueKey='id'
                      single={true}
                      listExtraParams={{ "organizationId": this.props.organization.id }}
                      onChange={this.handleJournalType}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.structureId" })}
                >
                  {getFieldDecorator('structureId', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.can.not.be.empty" }, { name: formatMessage({ id: "budgetJournal.structureId" }) })
                    }],

                  })(
                    <Select onSelect={this.handleSelectChange} disabled={structureFlag}>
                      {strategyOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.periodStrategy" })}>
                  {getFieldDecorator('periodStrategy', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.can.not.be.empty" }, { name: formatMessage({ id: "budgetJournal.periodStrategy" }) })
                    }],

                  })(
                    <Select disabled={periodStrategyFlag}>
                      {periodStrategyOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.versionId" })}>
                  {getFieldDecorator('versionName', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.can.not.be.empty" }, { name: formatMessage({ id: "budgetJournal.version" }) })
                    }],
                    valuePropName: "value",
                    initialValue: this.state.defaultValueList["versionName"],
                  })(
                    <Chooser
                      type='budget_versions'
                      labelKey='versionName'
                      valueKey='id'
                      single={true}
                      listExtraParams={{ "organizationId": this.props.organization.id, "enabled": true }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={formatMessage({ id: "budgetJournal.scenarios" })}>
                  {getFieldDecorator('scenarioName', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.can.not.be.empty" }, { name: formatMessage({ id: "budgetJournal.scenarios" }) })
                    }],
                    valuePropsName: "value",
                    initialValue: this.state.defaultValueList["scenarioName"],
                  })(
                    <Chooser
                      type='budget_scenarios'
                      labelKey='scenarioName'
                      valueKey='id'
                      single={true}
                      listExtraParams={{ "organizationId": this.props.organization.id, "enabled": true }}
                    />
                  )}
                </FormItem>
              </Col>

            </Row>
          </Card>

          <div className="divider" style={{ height: 16 }}> </div>
          <Card title={formatMessage({ id: "budgetJournal.attachmentInformation" })} style={{ with: "100%" }}>
            <Row gutter={40} type="flex" align="top">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={formatMessage({ id: "budgetJournal.attachment" })}  //附件
                >
                  <div className="dropbox">
                    {getFieldDecorator('file', {})(
                      <UploadFile
                        attachmentType="BUDGET_JOURNAL"
                        fileNum={5}
                        uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                        uploadHandle={this.uploadHandle}
                      />
                    )}
                  </div>

                </FormItem>
              </Col>
            </Row>
          </Card>
          <div className="divider" style={{ height: 40 }}> </div>
          <Affix offsetBottom={0}
                 style={{
                   position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
                   boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px'
                 }}>
            <Button type="primary" htmlType="submit" loading={this.state.loading} style={{ margin: '0 20px' }}>{formatMessage({ id: "budgetJournal.lastStep" })}</Button>
            <Button onClick={this.HandleClear}>{formatMessage({ id: "budgetJournal.return" })}</Button>
          </Affix>
        </Form>
      </div>
    )
  }
}


NewBudgetJournalFrom.contextTypes = {
  router: React.PropTypes.object
};


const NewBudgetJournal = Form.create()(NewBudgetJournalFrom);

function mapStateToProps(state) {
  return {
    user: state.login.user,
    company: state.login.company,
    organization: state.login.organization

  }

}

export default connect(mapStateToProps, null, null, { withRef: true })((NewBudgetJournal));
