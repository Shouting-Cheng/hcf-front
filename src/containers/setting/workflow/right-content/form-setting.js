import React from 'react'
import { connect } from 'dva'
import { Form, Card, Tag, Radio, Row, Col, Checkbox, Spin, Button, message } from 'antd'
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
import PropTypes from 'prop-types';
import chooserData from 'share/chooserData'
import ListSelector from 'widget/list-selector'
import workflowService from 'containers/setting/workflow/workflow.service'
class FormSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      saveLoading: false,
      enableCounterSign: false, //是否允许加签
      counterSignRule: 10, //是否为顺序加签,不允许加签时值为10
      enableCounterSignForSubmitter: false, //不允许自选审批人
      counterSignRuleForSubmitter: 10, //是否为顺序审批,不允许自选审批人时值为10
      filterTypeRuleMode: '', //重复审批规则
      filterRule: 10, //重复审批规则角色对比: 3 1 2 , 和上面的依次对应
      filterTypeRule: 4, //校验"重复"的方式
      enableAmountFilter: false, //当单据金额变大时，校验当前工作流
      enableExpenseTypeFilter: false, //当单据的费用类型发生变化时，校验当前工作流
      proxyStrategy: 10, //代理提交规则 1（B填写好的单据，先经被代理人A审批，通过后开始走流程）、2（B填写好的单据，提交后，知会被代理人A）、3（全选）、10（全不选）
      companySelectorShow: false,
      selectorItem: chooserData['deploy_company_by_carousel'],
      selectedCompany: [],
      companyLoading: false,
      companyOID: [],
      rightSelectedCompany:[]
    }
  }

  componentDidMount() {
    this.getProperty();
    this.getSelectedCompany();
  }

  getProperty = () => {
    this.setState({ loading: true });
    workflowService.getCustomFormProperty(this.props.formOID).then(res => {
      let companyOID = (res.data.approvalAddSignScope || {}).companyOIDs || [];
      this.setState({
        loading: false,
        enableCounterSign: res.data.enableCounterSign,
        counterSignRule: res.data.enableCounterSign ? res.data.counterSignRule : 10,
        enableCounterSignForSubmitter: res.data.enableCounterSignForSubmitter,
        counterSignRuleForSubmitter: res.data.enableCounterSignForSubmitter ? res.data.counterSignRuleForSubmitter : 10,
        filterTypeRuleMode: (res.data.filterRule === 10 && res.data.filterTypeRule === 4) ? '' : '5',
        filterRule: res.data.filterRule,
        filterTypeRule: res.data.filterTypeRule,
        enableAmountFilter: res.data.enableAmountFilter,
        enableExpenseTypeFilter: res.data.enableExpenseTypeFilter,
        proxyStrategy: res.data.proxyStrategy,
        rejectSendEmail: res.data.rejectSendEmail,
        printSendEmail: res.data.printSendEmail,
        endSendEmail: res.data.endSendEmail,
        companyOID: companyOID

      })
    })
  };

  获取选择的公司
  getSelectedCompany = (companyOID) => {
    this.setState({ companyLoading: true });
    workflowService.getBatchCompanyItemList(companyOID).then(res => {
      this.setState({
        selectedCompany: res.data,
        companyLoading: false
      })
    })
  };

  //修改加签人
  handleSignChange = (enableCounterSign, counterSignRule) => {
    this.setState({
      enableCounterSign,
      counterSignRule: enableCounterSign ? counterSignRule : 10
    })
  };

  //修改自选审批人
  handleSubmitterChange = (enableCounterSignForSubmitter, counterSignRuleForSubmitter) => {
    this.setState({
      enableCounterSignForSubmitter,
      counterSignRuleForSubmitter: enableCounterSignForSubmitter ? counterSignRuleForSubmitter : 10
    })
  };

  //修改重复审批规则
  handleFilterChange = (filterTypeRuleMode, filterRule, filterTypeRule) => {
    this.setState({
      filterTypeRuleMode,
      filterRule: filterTypeRuleMode === '5' ? filterRule : 10,
      filterTypeRule: filterTypeRuleMode === '5' ? filterTypeRule : 4,
      enableAmountFilter: filterTypeRuleMode === '5' ? false : true,
      enableExpenseTypeFilter: filterTypeRuleMode === '5' ? false : true,
    })
  };

  //修改代理提交规则
  handleProxyChange = (type, checked) => {
    let proxyStrategy = this.state.proxyStrategy;
    switch (proxyStrategy) {
      case 1:
        proxyStrategy = type === 'strategy1' ? 10 : 3;
        break;
      case 2:
        proxyStrategy = type === 'strategy1' ? 3 : 10;
        break;
      case 3:
        proxyStrategy = type === 'strategy1' ? 2 : 1;
        break;
      case 10:
        proxyStrategy = type === 'strategy1' ? 1 : 2;
        break;
      default:
        proxyStrategy = 10;
    }
    this.setState({ proxyStrategy })
  };

  //保存表单配置
  handleSave = () => {
    const { enableCounterSign, counterSignRule, enableCounterSignForSubmitter, counterSignRuleForSubmitter, filterTypeRuleMode,
      filterRule, filterTypeRule, enableAmountFilter, enableExpenseTypeFilter, proxyStrategy, endSendEmail, printSendEmail, rejectSendEmail } = this.state;
    let chainHistoryFirstRule = ''; //重复审批规则角色对比: all approver singer
    switch (this.state.filterRule) {
      case 3:
        chainHistoryFirstRule = 'all';
        break;
      case 1:
        chainHistoryFirstRule = 'approver';
        break;
      case 2:
        chainHistoryFirstRule = 'signer';
        break;
      default:
        chainHistoryFirstRule = '';
    }
    let companyOIDs = [];
    this.state.rightSelectedCompany.map(item => {
      companyOIDs.push(item.companyOID)
    });
    let params = {
      chainHistoryFirstRule,
      enableCounterSign,
      counterSignRule,
      enableCounterSignForSubmitter,
      counterSignRuleForSubmitter,
      filterTypeRuleMode,
      filterRule,
      filterTypeRule,
      enableAmountFilter,
      enableExpenseTypeFilter,
      proxyStrategy,
      formOid: this.props.formOID,
      rejectSendEmail,
      endSendEmail,
      printSendEmail,
      approvalAddSignScope: {
        companyOIDs
      }
    };
    this.setState({ saveLoading: true });
    workflowService.saveCustomFormProperty(params).then(() => {
      this.setState({ saveLoading: false });
      message.success(this.$t('common.save.success', {name: ''}))
    }).catch(() => {
      this.setState({ saveLoading: false })
    })
  };
  handleSelectCompany = () => {
    let companyOID = this.state.companyOID;
    this.setState({ companyLoading: true });
    if (companyOID.length) {
      workflowService.getBatchCompanyItemList(companyOID).then(res => {
        this.setState({
          selectedCompany: res.data,
          companyLoading: false,
          companySelectorShow: true,
          rightSelectedCompany:res.data,
        })
      })
    } else {
      this.setState({
        companySelectorShow: true,
        companyLoading: false,
      })
    }


  }
  render() {
    const { loading, saveLoading, enableCounterSign, counterSignRule, enableCounterSignForSubmitter, counterSignRuleForSubmitter,
      filterTypeRuleMode, filterRule, filterTypeRule, enableAmountFilter, enableExpenseTypeFilter, proxyStrategy,
      companySelectorShow, selectorItem, selectedCompany,rightSelectedCompany, companyLoading, printSendEmail, rejectSendEmail, endSendEmail } = this.state;
    selectorItem.title = this.$t('setting.key1331'/*选择公司*/);
    return (
      <div className='form-setting'>
        <Spin spinning={loading}>
          <Card type="inner" className="card-container"
                title={
                  <div className="card-title">
                    {this.$t('setting.key1332'/*加签*/)}
                    <span>{this.$t('setting.key1333'/*审批单据时，同意单据，并额外指定一名或几名员工进行审批*/)}</span>
                  </div>
                }>
            <RadioGroup onChange={e => this.handleSignChange(e.target.value, 2)} value={enableCounterSign}>
              <Radio value={false}>{this.$t('setting.key1334'/*不允许加签*/)}</Radio>
              <Radio value={true}>{this.$t('setting.key1335'/*允许加签*/)}</Radio>
            </RadioGroup>
            <RadioGroup onChange={e => this.handleSignChange(true, e.target.value)} value={counterSignRule}>
              <Row><Col offset={1}><Radio value={2} disabled={!enableCounterSign}>
                {this.$t('setting.key1336'/*按顺序全部通过后，进入下一个节点*/)}
              </Radio></Col></Row>
              <Row><Col offset={1}><Radio value={1} disabled={!enableCounterSign}>
                {this.$t('setting.key1337'/*任意一人通过，进入下一个节点*/)}
              </Radio></Col></Row>
            </RadioGroup>
          </Card>
          <Card type="inner" className="card-container"
                title={
                  <div className="card-title">
                    {this.$t('setting.key1338'/*自选审批人*/)}
                    <span>{this.$t('setting.key1339'/*提交人（含代理人）提交单据时，先选择一名或几名指定员工进行审批，再按配置的流程进行审批*/)}</span>
                  </div>
                }>
            <RadioGroup onChange={e => this.handleSubmitterChange(e.target.value, 2)} value={enableCounterSignForSubmitter}>
              <Radio value={false}>{this.$t('setting.key1340'/*不允许自选审批人*/)}</Radio>
              <Radio value={true}>{this.$t('setting.key1341'/*允许自选审批人*/)}</Radio>
            </RadioGroup>
            <RadioGroup onChange={e => this.handleSubmitterChange(true, e.target.value)} value={counterSignRuleForSubmitter}>
              <Row><Col offset={1}><Radio value={2} disabled={!enableCounterSignForSubmitter}>
                {this.$t('setting.key1336'/*按顺序全部通过后，进入下一个节点*/)}
              </Radio></Col></Row>
              <Row><Col offset={1}><Radio value={1} disabled={!enableCounterSignForSubmitter}>
                {this.$t('setting.key1337'/*任意一人通过，进入下一个节点*/)}
              </Radio></Col></Row>
            </RadioGroup>
          </Card>
          <Card type="inner" className="card-container"
                title={
                  <div className="card-title">
                    {this.$t('setting.key1342'/*重复审批规则*/)}
                    <span>{this.$t('setting.key1343'/*当配置的审批流程中，出现一个员工重复审批的情况时*/)}</span>
                  </div>
                }>
            <RadioGroup onChange={e => this.handleFilterChange(e.target.value, 3, 2)} value={filterTypeRuleMode}>
              <Radio value="">{this.$t('setting.key1344'/*每次都进行审批*/)}</Radio>
              <Radio value="5">{this.$t('setting.key1345'/*依据下列设定，不需要每次都进行审批*/)}</Radio>
            </RadioGroup>
            <RadioGroup onChange={e => this.handleFilterChange('5', e.target.value, filterTypeRule)} value={filterRule}>
              <Row><Col offset={1} className={filterTypeRuleMode === '' ? 'remark-disabled' : ''}>
                {this.$t('setting.key1346'/*当前审批人与下列所选角色作比较，若重复则无需再审批*/)}
                <span className="remark">（{this.$t('setting.key1347'/*加签人重复时，仍需审批*/)}）</span>
              </Col></Row>
              <Row><Col offset={1}><Radio value={3} disabled={filterTypeRuleMode === ''}>
                {this.$t('setting.key1348'/*审批人与加签人*/)}
              </Radio></Col></Row>
              <Row><Col offset={1}><Radio value={1} disabled={filterTypeRuleMode === ''}>
                {this.$t('setting.key1349'/*仅审批人*/)}
              </Radio></Col></Row>
              <Row><Col offset={1}><Radio value={2} disabled={filterTypeRuleMode === ''}>
                {this.$t('setting.key1350'/*仅加签人*/)}
              </Radio></Col></Row>
            </RadioGroup>
            <RadioGroup onChange={e => this.handleFilterChange('5', filterRule, e.target.value)} value={filterTypeRule}>
              <Row><Col offset={1} className={filterTypeRuleMode === '' ? 'remark-disabled' : ''}>
                {this.$t('setting.key1351'/*被审批/审核人驳回后再提交，校验*/)}
              </Col></Row>
              <Row><Col offset={1}>
                <Radio value={2} disabled={filterTypeRuleMode === ''}>
                  {this.$t('setting.key1352'/*校验当前工作流（即校验最新一次提交中已审批的环节）*/)}
                </Radio>
              </Col></Row>
              <Row><Col offset={1}>
                <Radio value={1} disabled={filterTypeRuleMode === ''}>
                  {this.$t('setting.key1353'/*校验历史工作流（即校验历史审批（包含最新一次提交中已审批的）环节）*/)}
                </Radio>
              </Col></Row>
            </RadioGroup>
            <div style={{display: filterTypeRule === 1 ? 'block' : 'none'}}>
              <Row><Col offset={2}>{this.$t('setting.key1354'/*特殊情况*/)}</Col></Row>
              <Row><Col offset={2}>
                <Checkbox onChange={e => {this.setState({enableAmountFilter: e.target.checked})}}
                          checked={enableAmountFilter}>
                  {this.$t('setting.key1355'/*当单据金额变大时，校验当前工作流*/)}
                </Checkbox>
              </Col></Row>
              <Row><Col offset={2}>
                <Checkbox onChange={e => {this.setState({enableExpenseTypeFilter: e.target.checked})}}
                          checked={enableExpenseTypeFilter}>
                  {this.$t('setting.key1356'/*当单据的费用类型发生变化时，校验当前工作流*/)}
                </Checkbox>
              </Col></Row>
            </div>
          </Card>
          <Card type="inner" className="card-container"
                title={
                  <div className="card-title">
                    {this.$t('setting.key1357'/*代理提交规则*/)}
                    <span>{this.$t('setting.key1358'/*当员工A授权给员工B，允许代替自己填写单据*/)}</span>
                  </div>
                }>
            <Checkbox onChange={e => {this.handleProxyChange('strategy1', e.target.checked)}}
                      checked={proxyStrategy === 1 || proxyStrategy === 3}>
              {this.$t('setting.key1359'/*B填写好的单据，先经被代理人A审批，通过后开始走流程*/)}
            </Checkbox>
            <Checkbox onChange={e => {this.handleProxyChange('strategy2', e.target.checked)}}
                      checked={proxyStrategy === 2 || proxyStrategy === 3}>
              {this.$t('setting.key1360'/*B填写好的单据，提交后，知会被代理人A*/)}
            </Checkbox>
          </Card>
          <Card type="inner" className="card-container select-company-card"
                title={
                  <div className="card-title">
                    {this.$t('setting.key1361'/*选人范围*/)}
                    <span>{this.$t('setting.key1362'/*对加签、自选审批人等需要选人的功能，规定选人范围*/)}</span>
                  </div>
                }>
            <Row>
              <div className="remark">{this.$t('setting.key1363'/*注: 若未选择公司，则默认允许选择所有公司的人员*/)}</div>
              <Col span={5}>
                <Button type="primary" onClick={this.handleSelectCompany}>
                  {this.$t('setting.key1331'/*选择公司*/)}
                </Button>
              </Col>
              <Col span={15}>
                <div className="selected-company-container">
                  <h4>{this.$t('setting.key1364'/*已选择公司*/)}：</h4>
                  <Spin spinning={companyLoading}>
                    {selectedCompany.map((item, index) => {
                      return <Tag key={item.id} closable onClose={
                        (e)=>{
                          e.preventDefault();
                          let selected = this.state.selectedCompany.filter(o=> o.id !== item.id);
                          this.setState({
                            selectedCompany: selected
                          })
                        }
                      }>{item.name}</Tag>
                      //return `${item.name}${index < selectedCompany.length - 1 ? '、 ' : ''}`
                    })}
                  </Spin>
                </div>
              </Col>
            </Row>
          </Card>
          <Card type="inner" className="card-container select-company-card"
            title={
              <div className="card-title"> {this.$t('setting.key1365'/*邮件通知*/)}
                <span>{this.$t('setting.key1366'/*审批流中，需要通过邮件通知申请人的环节、动作*/)}</span>
              </div>
            }>
            <Row>
              <Col span={4}>{this.$t('setting.key1367'/*发送打印通知：*/)}</Col>
              <Col span={6}> <Checkbox onChange={e => { this.setState({ printSendEmail: e.target.checked }) }}
                checked={printSendEmail}>&nbsp;&nbsp;{this.$t('setting.key1368'/*打印环节*/)}&nbsp;&nbsp;</Checkbox></Col>
              <Col span={6}> <Checkbox onChange={e => { this.setState({ endSendEmail: e.target.checked }) }}
                checked={endSendEmail}>&nbsp;&nbsp;{this.$t('setting.key1369'/*结束环节*/)}</Checkbox></Col>
            </Row>
            <Row >
              <Col span={4}>{this.$t('setting.key1370'/*驳回时是否通知：*/)}</Col>
              <Col span={6}> <Checkbox onChange={e => { this.setState({ rejectSendEmail: e.target.checked }) }}
                checked={rejectSendEmail}></Checkbox></Col>
            </Row>
          </Card>
        </Spin>
        <Button type="primary" loading={saveLoading} onClick={this.handleSave}>{this.$t('common.save')}</Button>
        <ListSelector selectorItem={selectorItem}
          visible={companySelectorShow}
          selectedData={selectedCompany}
          onOk={value => this.setState({ selectedCompany: value.result,rightSelectedCompany:value.result, companySelectorShow: false })}
          onCancel={() => this.setState({ companySelectorShow: false })} />
      </div>
    )
  }
}

FormSetting.propTypes = {
  formOID: PropTypes.string,
};


function mapStateToProps(state) {
  return {

  }
}

const wrappedFormSetting = Form.create()(FormSetting);

export default connect(mapStateToProps)(wrappedFormSetting)
