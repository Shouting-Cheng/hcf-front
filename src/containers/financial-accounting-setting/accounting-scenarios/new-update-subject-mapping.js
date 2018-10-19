/**
 * created by jsq on 2018/01/02
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Form, Icon, Select, Row, Col, message} from 'antd'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import config from 'config'
import 'styles/financial-accounting-setting/accounting-scenarios/new-update-subject-mapping.scss'
import Chooser from "components/chooser";
const Option = Select.Option;
const FormItem = Form.Item;
import {formatMessage} from 'share/common'

class NewUpdateMatchingGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      elements:[],
      matchGroup:{},
      defaultValue:{},
      selectorMap: {},
      noLines: false,
      sectionMatch: {
        accountName: "-"
      },
      firstRender: true,
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
    };
  }

  componentWillReceiveProps(nextProps){
    let params = nextProps.params;
    if(JSON.stringify(params)==='{}'){
      this.props.form.resetFields();
      this.setState({
        firstRender:  true,
        loading: false,
        sectionMatch: {
          accountName: "-"
        },
      })
    }else {
      if(this.state.firstRender){
        //新增
        if(typeof params.lines !== 'undefined'){
          if(params.lines.length>0){//有核算要素
            let selectorMap = {};
            params.lines.map(item=>{
              let selectorItem = null;
              if(item.isSystem){
                selectorItem={
                  listExtraParams: {
                    groupCode: item.groupCode,
                    tenantId: this.props.company.tenantId,
                    setOfBooksId: params.setOfBooksId
                  },
                }
              }else {
                selectorItem = {
                  id: item.elementId,
                  title: item.elementNature,
                  url:`${config.accountingUrl}/api/general/match/group/filed/values`,
                  searchForm:[
                    {type: 'input', id: 'valueCode', label: formatMessage({id:"account.code"},{name: item.elementNature})},
                    {type: 'input', id: 'valueDesc', label: formatMessage({id:"account.name"},{name: item.elementNature})}
                  ],
                  columns: [
                    {title: formatMessage({id:"account.code"},{name: item.elementNature}), dataIndex: 'code'},
                    {title: formatMessage({id:"account.name"},{name: item.elementNature}), dataIndex: 'name'},
                  ],
                  key: 'id'
                };
              }
              selectorMap[item.elementId] = {
                selectorItem: selectorItem,
                listExtraParams: {
                  groupCode: item.groupCode,
                  tenantId: this.props.company.tenantId,
                  setOfBooksId: params.setOfBooksId
                },
                valueKey: 'code',
                labelKey: 'name',
                value: [],
                array: item.isSystem ? [] : undefined
              };
            });
            this.setState({
              firstRender: false,
              matchGroup: params,
              elements: params.lines,
              noLines: false,
              selectorMap
            })
          }else {//没有核算要素
            this.setState({
              firstRender: false,
              noLines: true,
              matchGroup: params,
            })
          }
        }else {
        //更新
          let sectionMatch = Object.assign({},params.sectionMatch);
          let matchGroup = Object.assign({},params.matchGroup);
          let defaultValue = {
            sectionCode: [{id: sectionMatch.accountId, accountCode: sectionMatch.accountCode, accountName: sectionMatch.accountName }],
          };
          let selectorMap = {};
          if(sectionMatch.lineInfo !== null){
            sectionMatch.lineInfo.map(item=>{
              let selectorItem = {
                id: item.elementId,
                title: item.elementNature,
                url:`${config.accountingUrl}/api/general/match/group/filed/values`,
                searchForm: item.isSystem ? [] :[
                  {type: 'input', id: 'valueCode', label: formatMessage({id:"account.code"},{name: item.elementNature})},
                  {type: 'input', id: 'valueDesc', label: formatMessage({id:"account.name"},{name: item.elementNature})}
                ],
                columns: [
                  {title: formatMessage({id:"account.code"},{name: item.elementNature}), dataIndex: 'code'},
                  {title: formatMessage({id:"account.name"},{name: item.elementNature}), dataIndex: 'name'},
                ],
                key: 'id'
              };
              selectorMap[item.elementId] = {
                selectorItem: selectorItem,
                listExtraParams: {
                  groupCode: item.groupCode,
                  tenantId: this.props.company.tenantId,
                  setOfBooksId: params.matchGroup.setOfBooksId
                },
                valueKey: 'code',
                labelKey: 'name',
                value: [{ code: item.elementValue,name: item.elementName}]
              };

              defaultValue[item.elementId] = [{id: item}];
              let value = {};
              value[item.elementId] = [{code: item.elementValue, name: item.elementName}];
              this.props.form.setFieldsValue(value)
            });
            this.setState({
              firstRender: false,
              defaultValue,
              sectionMatch,
              noLines: false,
              matchGroup,
              elements: sectionMatch.lineInfo,
              selectorMap
            })
          }else {
            this.setState({
              noLines: true,
              firstRender: false,
              defaultValue,
              sectionMatch,
              matchGroup,
            })
          }
        }
      }
    }
  }

  handleValueList = (param)=>{
    let selectorMap = this.state.selectorMap;
    accountingService.getElementsValueType(selectorMap[param].selectorItem.listExtraParams).then(response=>{
      selectorMap[param].array = response.data;
      this.setState({selectorMap})
    })
  };

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current-1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };

  handleSave = (e)=>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        let elements  = this.state.elements;
        let matchGroup = this.state.matchGroup;
        let params = {
          mappingGrpHdId: matchGroup.headId,
          accountId: values.sectionCode[0].id,
          layoutPriority: matchGroup.layoutPriority,
        };
        let lineInfo = [];
        elements.map(item=>{
          let option = {
            elementCode: item.elementCode,
            elementValue: !values[item.elementId][0].id
              ? values[item.elementId][0].code : values[item.elementId][0].id
          };
          if(item.groupCode === 'CURRENCY' || item.groupCode === 'CSH_BANK_ACCOUNT' ){
            option.elementValue = values[item.elementId][0].code
          }
          if(item.isSystem){
            option.elementValue = values[item.elementId]
          }
          if(!option.elementValue){
            option.elementValue = item.elementValue;
          }
          if(typeof this.state.sectionMatch.id !== 'undefined'){
            option.id = item.id
          }
          lineInfo.push(option)
        });
        if(typeof this.state.sectionMatch.id !== 'undefined'){
          params.id = this.state.sectionMatch.id;
          params.versionNumber = this.state.sectionMatch.versionNumber;
        }
        params.lineInfo = lineInfo;
        console.log(params)
        accountingService.batchInsertOrUpdateSection([params]).then(response=>{
          if(typeof this.state.sectionMatch.id === 'undefined' )
            message.success(`${formatMessage({id: "common.save.success"},{name:""})}`);
          else
            message.success(`${formatMessage({id:"common.operate.success"})}`);
          this.setState({
            loading: false,
            sectionMatch:{
              accountName: "-"
            }
          });
          this.setState({loading: false});
          this.props.form.resetFields();
          this.props.close(true);
        }).catch(e=>{
          if(e.response){
            if(typeof this.state.sectionMatch.id === 'undefined' )
              message.error(`${formatMessage({id: "common.save.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            else
              message.error(`${formatMessage({id: "common.operate.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            this.setState({loading: false})
          }
        })
      }
    });
  };

  handleCancel = ()=>{
    this.props.form.resetFields();
    this.setState({
      firstRender: true,
      loading: false,
      elements:[],
      matchGroup:{},
      defaultValue:{},
      selectorMap: {},
      sectionMatch: {
        accountName: "-"
      },
    },
      this.props.close(false)
    )
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  handleSection = (value)=>{
    let sectionMatch = this.state.sectionMatch;
    sectionMatch.accountName = value[0].accountName;
    this.setState({sectionMatch})
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, elements, sectionMatch, selectorMap, matchGroup, defaultValue, noLines } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 0 },
    };
    return(
      <div className="new-update-subject-matching">
        <Form onSubmit={this.handleSave}>
          <div className="subject-matching-title">{formatMessage({id:"account.select.subject"})}</div>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem {...formItemLayout} label={formatMessage({id:'accounting.subject'})  /*科目*/}>
              {getFieldDecorator('sectionCode', {
                initialValue: defaultValue.sectionCode,
                rules: [{
                  required: true,
                  message: formatMessage({id: "common.please.select"})
                }]
              })(
              <Chooser placeholder={formatMessage({id:"common.please.select"})}
                      type='segment_map'
                      single={true}
                      listExtraParams={{setOfBooksId: matchGroup.setOfBooksId,headId: matchGroup.headId}}
                      valueKey="accountCode"
                      labelKey="accountName"
                      onChange={this.handleSection}/>
            )}
          </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem {...formItemLayout} label={formatMessage({id:'accounting.subject.name'})  /*科目名称*/}>
            <label>{sectionMatch.accountName}</label>
          </FormItem>
            </Col>
          </Row>
          { noLines ? null :
            <div>
              <div className="subject-matching-title">{formatMessage({id:"account.select.element"})}</div>
            </div>
          }
          { noLines ? null :
            elements.map(item=>
              <Row gutter={22}  key={item.elementId}>
                <Col span={22}>
                  <FormItem {...formItemLayout} label={item.elementNature}>
                {getFieldDecorator(item.elementId, {
                  initialValue: selectorMap[item.elementId].value,
                  rules: [{
                    required: true,
                    message: formatMessage({id: "common.please.select"})
                  }]
                })(
                  item.isSystem ?
                    <Select onFocus={()=>this.handleValueList(item.elementId)}>
                      {selectorMap[item.elementId].array.map(children=><Option key={children.id}>{children.name}</Option>)}
                    </Select>
                    :
                  <Chooser placeholder={formatMessage({id:"common.please.select"})}
                     selectorItem={selectorMap[item.elementId].selectorItem}
                     listExtraParams={selectorMap[item.elementId].listExtraParams}
                     labelKey={selectorMap[item.elementId].labelKey}
                     valueKey={selectorMap[item.elementId].valueKey}
                     single={true}
                  />
                )}
              </FormItem>
                </Col>
              </Row>)
          }
          <div className="slide-footer">
            <Button type="primary" htmlType='submit' loading={loading}>{formatMessage({id:"common.save"})}</Button>
            <Button onClick={this.handleCancel}>{formatMessage({id:"common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}


NewUpdateMatchingGroup.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}
const WrappedNewUpdateMatchingGroup = Form.create()(NewUpdateMatchingGroup);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateMatchingGroup);
