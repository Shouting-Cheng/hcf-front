import React from 'react'
import { connect } from 'dva'
import TagSelect from 'ant-design-pro/lib/TagSelect'
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
      chosenRuleOIDs: [],
    }
  }

  componentDidMount() {
    this.getList()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ chosenRuleOIDs: nextProps.defaultValue || [] })
  }

  getList = () => {
    if (!this.state.formFieldList) {
      this.setState({ loading: true });
      workflowService.getFormFields(this.props.formOID).then(res => {
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
                  oneCostCenter.refCostCenterOID = JSON.parse(field.dataSource).costCenterOID;
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
              if (costCenter.refCostCenterOID === property.refCostCenterOID) {
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
    if (remark === 'out_participant_num') {
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
      remark === 'text_area' || remark === 'select_box') {
      return 'text' //文本类型
    }
    if (remark === 'boolean' || remark === 'writeoff_flag' || remark === 'substitution_invoice' || remark === 'control_beyound_application' ||
      remark === 'control_beyound_position' || remark === 'judge_cost_center' || remark === 'control_beyound_budget' ||
      remark === 'control_beyound_travel_standard' || remark === 'switch' || remark === 'linkage_switch') {
      return 'boolean' //布尔类型
    }
    if (remark === 'select_participant' || remark === 'select_approver' || remark === 'applicant' || remark === 'select_user' ||
      remark === 'cust_list' || remark === 'select_cost_center' || remark === 'select_department' || remark === 'select_special_booking_person' ||
      remark === 'select_corporation_entity' || remark === 'default_corporation_entity' || remark === 'default_expense_type' ||
      remark === 'default_department' || remark === 'currency_code' || remark === 'select_air_ticket_supplier' ||
      remark === 'default_department_level' || remark === 'default_department_path' || remark === 'default_department_role' ||
      remark === 'select_company' || remark === 'default_applicant_company') {
      return 'custList' //值列表类型
    }
  };

  //点击"确定"
  handleOK = () => {
    const { formFieldList, chosenRuleOIDs } = this.state;
    let list = [];
    let chosenRuleItems = [];
    Object.keys(formFieldList).map(key => {
      (formFieldList[key]).map(item => {
        list.push(item)
      })
    });
    chosenRuleOIDs.map((oid, index) => {
      list.map(item => {
        if ((item.messageKey !== 'cust_list' && item.messageKey !== 'judge_cost_center' && item.fieldOID === oid) ||
            (item.messageKey === 'cust_list' && item.refCostCenterOID && `${item.fieldOID}_${item.refCostCenterOID}` === oid) ||
            (item.messageKey === 'cust_list' && !item.refCostCenterOID && item.fieldOID === oid) ||
            (item.messageKey === 'judge_cost_center' && `${item.fieldOID}_${item.messageKey}` === oid)) {
          let param = {
            index,
            entityOID: this.props.ruleApproverOID,
            name: item.fieldName,
            remark: item.messageKey,
            field: item.fieldOID,
            isEdit: true
          };
          item.fieldContent && (param.fieldContent = item.fieldContent);
          let symbol = null;
          switch(this.checkConditionType(item.messageKey)) {
            case 'custList':
              symbol = item.messageKey === 'default_department_path' ? '9007' : '9009';
              break;
            case 'boolean':
              symbol = '9012';
              break;
            case 'text':
              symbol = '9007';
              break;
            default:
              symbol = '9011'; //'long' || 'double' || 'date' (范围)
          }
          item.messageKey === 'select_cost_center' && (param.customEnumerationOID = JSON.parse(item.dataSource || '{}').costCenterOID);
          if (item.messageKey === 'cust_list') {
            param.customEnumerationOID = JSON.parse(item.dataSource || '{}').customEnumerationOID;
            param.refCostCenterOID = item.refCostCenterOID;
            param.costCenterName = item.costCenterName;
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
    const { loading, formFieldList, formFieldCostCenterList, chosenRuleOIDs } = this.state;
    let customFormFieldList = [];
    if (formFieldList) {
      (formFieldList['101'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['102'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['103'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['104'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['105'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['106'] || []).map(item => customFormFieldList.push(item));
      (formFieldList['108'] || []).map(item => customFormFieldList.push(item))
    }
    return (
      <div className='add-approve-rule-modal'>
        <div className="select-rule-modal-container"/>
        <Modal title={this.$t('workflow.detail.select.approve.condition')/*请选择要添加的审批条件*/}
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
                  <h4>{this.$t('workflow.detail.default.condition')/*默认条件*/}</h4>
                  <span>{this.$t('workflow.detail.dept.and.company.notice')/*部门：申请人的部门；法人实体：申请人的法人实体*/}</span>
                  <TagSelect value={chosenRuleOIDs} onChange={value => {this.setState({chosenRuleOIDs: value})}}>
                    {formFieldList && (formFieldList['100'] || []).map(item => {
                      return <TagSelect.Option value={item.fieldOID} key={item.fieldOID}>{item.fieldName}</TagSelect.Option>
                    })}
                  </TagSelect>
                </div>
              </ListItem>
              <ListItem>
                <h4>{this.$t('workflow.detail.custom.condition')/*表单自定义条件*/}</h4>
                <TagSelect value={chosenRuleOIDs} onChange={value => {this.setState({chosenRuleOIDs: value})}}>
                  {customFormFieldList.map(item => {
                    return <TagSelect.Option value={item.fieldOID} key={item.fieldOID}>{item.fieldName}</TagSelect.Option>
                  })}
                </TagSelect>
              </ListItem>
              {formFieldList && formFieldList['200'] && !!formFieldList['200'].length && (
                <ListItem>
                  <h4>{this.$t('workflow.detail.control.condition')/*管控条件*/}</h4>
                  <TagSelect value={chosenRuleOIDs} onChange={value => {this.setState({chosenRuleOIDs: value})}}>
                    {formFieldList['200'].map(item => {
                      return <TagSelect.Option value={item.fieldOID} key={item.fieldOID}>{item.fieldName}</TagSelect.Option>
                    })}
                  </TagSelect>
                </ListItem>
              )}
              {formFieldCostCenterList && !!formFieldCostCenterList.length && (
                <ListItem>
                  <h4>{this.$t('workflow.detail.costCenter.condition')/*成本中心属性条件*/}</h4>
                  {formFieldCostCenterList.map(costCenter => {
                    return (
                      <div key={costCenter.refCostCenterOID}>
                        <div>{costCenter.name}</div>
                        <TagSelect value={chosenRuleOIDs} onChange={value => {this.setState({chosenRuleOIDs: value})}}>
                          {costCenter.propertyList.map(item => (
                            <TagSelect.Option value={`${item.fieldOID}_${item.refCostCenterOID}`}
                                              key={`${item.fieldOID}_${item.refCostCenterOID}`}>{item.fieldName}</TagSelect.Option>
                          ))}
                        </TagSelect>
                      </div>
                    )
                  })}
                </ListItem>
              )}
              {formFieldList && formFieldList['400'] && !!formFieldList['400'].length && (
                <ListItem>
                  <h4>{this.$t('workflow.detail.applicant.and.manager')/*申请人=成本中心经理*/}</h4>
                  <TagSelect value={chosenRuleOIDs} onChange={value => {this.setState({chosenRuleOIDs: value})}}>
                    {/*由于【申请人=成本中心经理】和【表单自定义条件中的成本中心】的fieldOID一样，为了区分，在fieldOID后拼上remark*/}
                    {formFieldList['400'].map(item => (
                      <TagSelect.Option value={`${item.fieldOID}_${item.messageKey}`}
                                        key={`${item.fieldOID}_${item.messageKey}`}>{item.fieldName}</TagSelect.Option>
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
  formOID: PropTypes.string,
  ruleApproverOID: PropTypes.string,
  batchCode: PropTypes.number,
  defaultValue: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};


AddApproveRuleModal.contextTypes = {
  router: PropTypes.object
};

function mapStateToProps(state) {
  return {

  }
}

const wrappedAddApproveRuleModal = Form.create()(AddApproveRuleModal);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedAddApproveRuleModal)
