import React from 'react'
import { connect } from 'dva'
import TagSelect from 'components/TagSelect'
import { Form, Modal, Spin, List, message } from 'antd'
const ListItem = List.Item;
import PropTypes from 'prop-types';

import workflowService from 'containers/setting/workflow/workflow.service'

class AddApproveRuleModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formFieldList: null, //表单条件字段 字段类型(100默认, 101文本, 102整数, 103日期, 104浮点数, 105日期, 106值列表, 107GPS, 108布尔)
      formFieldCostCenterList: null, //审批条件为成本中心属性字段
      chosenRuleOids: [],
    }
  }

  componentDidMount() {
    this.getList()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ chosenRuleOids: nextProps.defaultValue || [] })
  }

  getList = () => {
    if (!this.state.formFieldList) {
      this.setState({ loading: true });
      workflowService.getFormFields(this.props.formOid).then(res => {
        this.setState({ loading: false, formFieldList: res.data }, () => {
          //初始化审批条件的成本中心属性字段
          let formFieldList = this.state.formFieldList;
          let costCenterList = [];
          let costCenterPropertyList = [];
          Object.keys(formFieldList).map(key => {
            //拿出成本中心的名字
            if (key === '101' && formFieldList[key] && formFieldList[key].length) {
              formFieldList[key].map(field => {
                if (field.messageKey === 'select_cost_center' && field.dataSource) {
                  let oneCostCenter = {};
                  oneCostCenter.name = field.fieldName;
                  oneCostCenter.refCostCenterOid = JSON.parse(field.dataSource).costCenterOid;
                  costCenterList.push(oneCostCenter)
                }
              })
            }
            if (key === '300' && formFieldList[key] && formFieldList[key].length) {
              costCenterPropertyList = formFieldList[key];
            }
          });
          //把成本中心属性拼到对应的成本中心下
          costCenterList.map(costCenter => {
            costCenter.propertyList = [];
            costCenterPropertyList.map(property => {
              if (costCenter.refCostCenterOid === property.refCostCenterOid) {
                property.costCenterName = costCenter.name;
                costCenter.propertyList.push(property);
              }
            })
          });
          this.setState({ formFieldCostCenterList: costCenterList })
        })
      }).catch(() => {
        this.setState({ loading: false });
        message.error(this.$t('common.error1'))
      })
    }
  };

  //判断条件类型
  checkConditionType = (remark) => {
    if (remark === 'out_participant_num' || remark === 'custom_form_travel_day') {
      return 'long' //整数类型
    }
    if (remark === 'total_budget' || remark === 'average_budget' || remark === 'default_total_amount' ||
      remark === 'amount' || remark === 'default_amount' || remark === 'number') {
      return 'double' //浮点类型
    }
    if (remark === 'start_date' || remark === 'end_date' || remark === 'date' || remark === 'common.date') {
      return 'date' //日期类型
    }
    if (remark === 'title' || remark === 'input' || remark === 'remark' || remark === 'out_participant_name' ||
      remark === 'text_area' || remark === 'select_box' || remark === 'default_user_work_number' || remark === 'default_user_position') {
      return 'text' //文本类型
    }
    if (remark === 'boolean' || remark === 'writeoff_flag' || remark === 'substitution_invoice' || remark === 'control_beyound_application' ||
      remark === 'control_beyound_position' || remark === 'judge_cost_center' || remark === 'control_beyound_budget' ||
      remark === 'control_beyound_travel_standard' || remark === 'switch' || remark === 'linkage_switch' || remark === 'default_travel_application_version') {
      return 'boolean' //布尔类型
    }
    if (remark === 'select_participant' || remark === 'select_approver' || remark === 'applicant' || remark === 'select_user' ||
      remark === 'cust_list' || remark === 'select_cost_center' || remark === 'select_department' || remark === 'select_special_booking_person' ||
      remark === 'select_corporation_entity' || remark === 'default_corporation_entity' || remark === 'default_expense_type' ||
      remark === 'default_department' || remark === 'currency_code' || remark === 'select_air_ticket_supplier' ||
      remark === 'default_department_level' || remark === 'default_department_path' || remark === 'default_department_role' ||
      remark === 'select_company' || remark === 'default_applicant_company' || remark === 'default_user_applicant'
      || remark === 'default_user_department' || remark === 'default_user_direct_leadership'|| remark === 'select_document_department') {
      return 'custList' //值列表类型
    }
    if (remark === 'default_user_sex' || remark === 'default_user_level'
      || remark === 'default_user_post' || remark === 'default_user_category'
      || remark === 'default_user_department_extend' || remark === 'custom_form_department_extend') {
      return 'selector'; //选择列表类型
    }
  };

  //点击"确定"
  handleOK = () => {
    const { formFieldList, chosenRuleOids } = this.state;
    let list = [];
    let chosenRuleItems = [];
    Object.keys(formFieldList).map(key => {
      (formFieldList[key]).map(item => {
        list.push(item)
      })
    });
    chosenRuleOids.map((oid, index) => {
      list.map(item => {
        if ((item.messageKey !== 'cust_list' && item.messageKey !== 'judge_cost_center' && item.fieldOid === oid) ||
          (item.messageKey === 'cust_list' && item.refCostCenterOid && `${item.fieldOid}_${item.refCostCenterOid}` === oid) ||
          (item.messageKey === 'cust_list' && !item.refCostCenterOid && item.fieldOid === oid) ||
          ((item.messageKey === 'default_user_department_extend' || item.messageKey === 'custom_form_department_extend')
            && (`${item.fieldOid},${item.messageKey}` === oid)) ||
          (item.messageKey === 'judge_cost_center' && `${item.fieldOid}_${item.messageKey}` === oid)) {
          let param = {
            index,
            entityOid: this.props.ruleApproverOid,
            name: item.fieldName,
            remark: item.messageKey,
            field: (item.messageKey === 'default_user_department_extend' || item.messageKey === 'custom_form_department_extend') ?
              `${item.fieldOid},${item.messageKey}` : item.fieldOid,
            isEdit: true
          };
          item.fieldContent && (param.fieldContent = item.fieldContent);
          let symbol = null;
          switch (this.checkConditionType(item.messageKey)) {
            case 'custList':
              symbol = (item.messageKey === 'default_department_path') ? '9007' : '9009';
              break;
            case 'boolean':
              symbol = '9012';
              break;
            case 'text':
              symbol = '9007';
              break;
            case 'selector':
              symbol = '9009';
              break;
            default:
              symbol = '9011'; //'long' || 'double' || 'date' (范围)
          }
          item.messageKey === 'select_cost_center' && (param.customEnumerationOid = JSON.parse(item.dataSource || '{}').costCenterOid);
          if (item.messageKey === 'cust_list') {
            param.customEnumerationOid = JSON.parse(item.dataSource || '{}').customEnumerationOid;
            param.refCostCenterOid = item.refCostCenterOid;
            param.costCenterName = item.costCenterName;
          }
          if (item.messageKey === 'default_user_department_extend' || item.messageKey === 'custom_form_department_extend') {
            param.customEnumerationOid = JSON.parse(item.dataSource || '{}').customEnumerationOid;
            // param.customEnumerationOid = "b0a71585-1429-41ee-a7a8-2a40bda07879";
          }
          symbol && (param.symbol = symbol);
          chosenRuleItems.push(param)
        }
      })
    });
    this.props.onOk(chosenRuleItems, this.props.batchCode)
  };

  render() {
    const { visible } = this.props;
    const { loading, formFieldList, formFieldCostCenterList, chosenRuleOids } = this.state;
    let customFormFieldList = [];
    if (formFieldList) {
      (formFieldList['101'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['102'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['103'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['104'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['105'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['106'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['108'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['109'] || []).map(item => customFormFieldList.push(item));
    }
    return (
      <div className='add-approve-rule-modal'>
        <div className="select-rule-modal-container" />
        <Modal title={this.$t('setting.key1284'/*请选择要添加的审批条件*/)}
          visible={visible}
          getContainer={() => {
            return document.getElementsByClassName("select-rule-modal-container")[0];
          }}
          onOk={this.handleOK}
          onCancel={this.props.onCancel}>
          <Spin spinning={loading}>
            <List itemLayout="horizontal">
              <ListItem className="default-addition">
                <div>
                  <h4>{this.$t('setting.key1286'/*申请人条线*/)}</h4>
                  <TagSelect hideCheckAll={true} value={chosenRuleOids} onChange={value => { this.setState({ chosenRuleOids: value }) }}>
                    {formFieldList && (formFieldList['100'] || []).map(item => {
                      let value = (item.messageKey === 'default_user_department_extend' || item.messageKey === 'custom_form_department_extend')
                        ? `${item.fieldOid},${item.messageKey}` : item.fieldOid;
                      return <TagSelect.Option value={value} key={item.fieldOid}>{item.fieldName}</TagSelect.Option>
                    })}
                  </TagSelect>
                </div>
              </ListItem>
              <ListItem>
                <h4>{this.$t('setting.key1287'/*表单自定义条件*/)}</h4>
                <TagSelect hideCheckAll={true} value={chosenRuleOids} onChange={value => { this.setState({ chosenRuleOids: value }) }}>
                  {customFormFieldList.map(item => {

                    let value = (item.messageKey === 'default_user_department_extend' || item.messageKey === 'custom_form_department_extend')
                      ? `${item.fieldOid},${item.messageKey}` : item.fieldOid;
                    return <TagSelect.Option value={value} key={item.fieldOid}>{item.fieldName}</TagSelect.Option>
                  })}
                </TagSelect>
              </ListItem>
              {formFieldList && formFieldList['200'] && !!formFieldList['200'].length && (
                <ListItem>
                  <h4>{this.$t('setting.key1288'/*管控条件*/)}</h4>
                  <TagSelect hideCheckAll={true} value={chosenRuleOids} onChange={value => { this.setState({ chosenRuleOids: value }) }}>
                    {formFieldList['200'].map(item => {
                      return <TagSelect.Option value={item.fieldOid} key={item.fieldOid}>{item.fieldName}</TagSelect.Option>
                    })}
                  </TagSelect>
                </ListItem>
              )}
              {formFieldCostCenterList && !!formFieldCostCenterList.length && (
                <ListItem>
                  <h4>{this.$t('setting.key1289'/*成本中心属性条件*/)}</h4>
                  {formFieldCostCenterList.map(costCenter => {
                    return (
                      <div key={costCenter.refCostCenterOid}>
                        <div>{costCenter.name}</div>
                        <TagSelect hideCheckAll={true} value={chosenRuleOids} onChange={value => { this.setState({ chosenRuleOids: value }) }}>
                          {costCenter.propertyList.map(item => (
                            <TagSelect.Option value={`${item.fieldOid}_${item.refCostCenterOid}`}
                              key={`${item.fieldOid}_${item.refCostCenterOid}`}>{item.fieldName}</TagSelect.Option>
                          ))}
                        </TagSelect>
                      </div>
                    )
                  })}
                </ListItem>
              )}
              {formFieldList && formFieldList['400'] && !!formFieldList['400'].length && (
                <ListItem>
                  <h4>{this.$t('setting.key1290'/*申请人=成本中心经理*/)}</h4>
                  <TagSelect hideCheckAll={true} value={chosenRuleOids} onChange={value => { this.setState({ chosenRuleOids: value }) }}>
                    {/*由于【申请人=成本中心经理】和【表单自定义条件中的成本中心】的fieldOid一样，为了区分，在fieldOid后拼上remark*/}
                    {formFieldList['400'].map(item => (
                      <TagSelect.Option value={`${item.fieldOid}_${item.messageKey}`}
                        key={`${item.fieldOid}_${item.messageKey}`}>{item.fieldName}</TagSelect.Option>
                    ))}
                  </TagSelect>
                </ListItem>
              )}
            </List>
          </Spin>
        </Modal>
      </div>
    )
  }
}

AddApproveRuleModal.propTypes = {
  visible: PropTypes.bool,
  formOid: PropTypes.string,
  ruleApproverOid: PropTypes.string,
  batchCode: PropTypes.number,
  defaultValue: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};
  


function mapStateToProps(state) {
  return {

  }
}

const wrappedAddApproveRuleModal = Form.create()(AddApproveRuleModal);

export default connect(mapStateToProps)(wrappedAddApproveRuleModal)
