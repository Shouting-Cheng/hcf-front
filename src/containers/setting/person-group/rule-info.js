/**
 * Created by zhouli on 18/1/17
 * Email li.zhou@huilianyi.com
 * 渲染 单个 人员组的限制条件
 */
import React from 'react';

import { Select, Tag, Icon, Button, Checkbox } from 'antd';
import 'styles/setting/person-group/rule-info.scss';

import PropTypes from 'prop-types';
import { messages } from "utils/utils"

class RuleInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      condition: {},//传入的条件
    };
  }

  componentWillMount() {
    this.setState({condition: this.props.condition});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({condition: nextProps.condition});
  }

  //确认保存这个条件
  confirmHandle = () => {
    this.props.confirmHandle(this.props.index);
  };
  //取消编辑
  cancelHandle = () => {
    this.props.cancelHandle(this.props.index);
  };
  //删除条件
  deleteHandle = () => {
    this.props.deleteHandle(this.props.index);
  };
  //改变为编辑态
  editHandle = () => {
    this.props.editHandle(this.props.index);
  };
  /**
   * 选择是否包含
   * @param value    是否包含的标志
   * @param name    标题：部门、级别、类型、职务
   * @param i    条件中项目对应的序号
   */
  logicSelectChange = (value, name, i) => {
    this.props.logicSelectChangeHandle(this.props.index, value, name, i);
  }
  /**
   * 显示弹窗添加条件中项目
   * @param name    标题：部门、级别、类型、职务
   * @param i    条件中项目对应的序号
   */
  showAddByName = (name, i) => {
    this.props.showConditionSelectorHandle(this.props.index, name, i);
  }
  /**
   * 移除一个条件项目
   * @param name     标题：部门、级别、类型、职务
   * @param value    移除的目标对象
   * @param i    条件中项目对应的序号
   */
  removeTagByName = (name, value, n) => {
    this.props.removeTagByNameHandle(this.props.index, name, value, n);
  }
  /**
   * 条件项目是否启用
   * @param val    切换后的值
   * @param i    条件中项目对应的序号
   */
  onCheckboxChange = (val, i) => {
    this.props.onCheckboxChangeHandle(this.props.index, i, val.target.checked);
  }
  /**
   * 渲染条件的项目：非编辑状态
   * @param condition    项目的项目
   * @param name   条件中项目对应的key
   */
  renderConditionDetailByName = (condition, name) => {
    let domRender = (<div></div>);

    const i = this._getIndex(condition.conditionDetails, name);
    const _this = this;
    if ((i === 0 || i) && condition.conditionDetails[i].conditionValues.length > 0) {
      domRender = (
        <div className="rule-info-row">
          <div className="rule-condition-checkbox">
            <Checkbox
              checked={condition.conditionDetails[i].enabled}
              disabled={true}
            >
            </Checkbox>
          </div>
          {
            _renderConditionTitle(name)
          }
          <div className="rule-condition-sub-title">
            {
              condition.conditionDetails[i].conditionLogic === "I" ?
                messages('person.group.rule.contain') : messages('person.group.rule.except')
            }
          </div>
          <div className="rule-condition-content">
            {
              _renderConditionItem(condition.conditionDetails[i].conditionValues)
            }
          </div>
          <div className="clear"></div>
        </div>
      );
    }
    return domRender;

    //渲染条件详情标题
    function _renderConditionTitle(name) {
      if (name === "Department") {
        return (<div className="rule-condition-title">
          {/*部门:*/}
          {messages('person.group.rule.dep')}
        </div>);
      } else if (name === "EmployeeRank") {
        return (<div className="rule-condition-title">
          {/*人员级别:*/}
          {messages('person.group.rule.rank')}
        </div>);
      } else if (name === "EmployeeDuty") {
        return (<div className="rule-condition-title">
          {/*人员职务:*/}
          {messages('person.group.rule.duty')}
        </div>);
      } else if (name === "EmployeeType") {
        return (<div className="rule-condition-title">
          {/*人员类型:*/}
          {messages('person.group.rule.type')}
        </div>);
      }
    }

    //渲染条件详情内容
    function _renderConditionItem(values) {
      let domConditon = [];
      if (values.length > 0) {
        for (let i = 0; i < values.length - 1; i++) {
          domConditon.push(
            <div className="item" key={i}>{values[i].description} ,</div>
          )
        }
        //最后一个不要添加逗号
        domConditon.push(
          <div className="item" key={values.length-1}>{values[values.length - 1].description}</div>
        )
      }
      return domConditon;
    }

  }

  /**
   * 渲染条件的项目：可编辑状态
   * @param condition    项目的项目
   * @param name   条件中项目对应的key
   */
  renderEditConditionDetailByName = (condition, name) => {
    let domRender = (<div></div>);
    var i = this._getIndex(condition.conditionDetails, name);
    //对于编辑状态，需要把没有条件的限制条件显示出来
    if (!(i === 0 || i)) {
      let d = {
        conditionLogic: "I",
        conditionProperty: name,
        conditionValues: []
      }
      i = condition.conditionDetails.length;
      condition.conditionDetails[i] = d;
    }
    if (i === 0 || i) {
      domRender = (
        <div className="rule-info-row">
          <div className="rule-condition-checkbox edit-rule-condition-checkbox">
            <Checkbox
              checked={condition.conditionDetails[i].enabled}
              onChange={(val) => {
                this.onCheckboxChange(val, i)
              }}
            >
            </Checkbox>
          </div>
          {
            this._renderConditionTitle(name)
          }
          <div className="rule-condition-sub-title edit-rule-condition-sub-title">
            {
              this._renderSelectByConditionLogic(condition.conditionDetails[i].conditionLogic, name, i)
            }
          </div>
          <div className="rule-condition-content edit-rule-condition-content">
            {
              this._renderConditionItem(condition.conditionDetails[i].conditionValues, name, i)
            }
          </div>
          <div className="clear"></div>
        </div>
      );
    }
    return domRender;

  }

  //渲染是否包含的选择下拉单
  _renderSelectByConditionLogic(logic, name, i) {

    const Option = Select.Option;
    return (
      <Select defaultValue={logic} onChange={(value) => {
        this.logicSelectChange(value, name, i)
      }}>
        <Option value="I">
          {/*包含*/}
          {messages('person.group.rule.contain')}
        </Option>
        <Option value="E">
          {/*不包含*/}
          {messages('person.group.rule.except')}
        </Option>
      </Select>
    );
  }

  //渲染条件详情标题
  _renderConditionTitle(name) {

    if (name === "Department") {
      return (<div className="rule-condition-title edit-rule-condition-title">
        {/*部门:*/}
        {messages('person.group.rule.dep')}
      </div>);
    } else if (name === "EmployeeRank") {
      return (<div className="rule-condition-title edit-rule-condition-title">
        {/*人员级别:*/}
        {messages('person.group.rule.rank')}
      </div>);
    } else if (name === "EmployeeDuty") {
      return (<div className="rule-condition-title edit-rule-condition-title">
        {/*人员职务:*/}
        {messages('person.group.rule.duty')}
      </div>);
    } else if (name === "EmployeeType") {
      return (<div className="rule-condition-title edit-rule-condition-title">
        {/*人员类型:*/}
        {messages('person.group.rule.type')}
      </div>);
    }
  }

  //渲染条件详情内容
  _renderConditionItem(values, name, n) {

    let domConditon = [];
    for (let i = 0; i < values.length; i++) {
      domConditon.push(<Tag className="item" key={i} closable onClose={() => {
        this.removeTagByName(name, i, n)
      }}>{values[i].description}</Tag>)
    }
    if (name === "Department") {
      domConditon.push(<Tag className="item add-tag" key={name} onClick={() => {
        this.showAddByName(name, n)
      }}><Icon type="plus"/>
        {/*添加部门*/}
        {messages('person.group.rule.adddep')}
      </Tag>);
    } else if (name === "EmployeeRank") {
      domConditon.push(<Tag className="item add-tag" key={name} onClick={() => {
        this.showAddByName(name, n)
      }}><Icon type="plus"/>
        {/*添加人员级别*/}
        {messages('person.group.rule.addrank')}
      </Tag>);
    } else if (name === "EmployeeDuty") {
      domConditon.push(<Tag className="item add-tag" key={name} onClick={() => {
        this.showAddByName(name, n)
      }}><Icon type="plus"/>
        {/*添加人员职务*/}
        {messages('person.group.rule.addduty')}
      </Tag>);
    } else if (name === "EmployeeType") {
      domConditon.push(
        <Tag className="item add-tag" key={name} onClick={() => {
          this.showAddByName(name, n)
        }}><Icon type="plus"/>
          {/*添加人员类型*/}
          {messages('person.group.rule.addtype')}
        </Tag>
      );
    }
    return domConditon;
  }

  //获取指定条件的细项的序号
  _getIndex(conditionDetails, name) {
    for (var i = 0; i < conditionDetails.length; i++) {
      if (conditionDetails[i].conditionProperty === name) {
        return i;
      }
    }
  }

  render() {
    const {condition} = this.state;

    let domRender;
    if (condition.isEditing) {
      //正在编辑的条件
      domRender = (
        <div>
          <div className="rule-info-wrap">
            <div className="rule-info-title">
              <div className="rule-wrap-title">
                {/*条件*/}
                {messages('person.group.rule.conditon')}
                {condition.conditionSeq} </div>
              <div className="rule-btn-wrap">
                <Button type="primary" onClick={this.confirmHandle}>
                  {messages('common.save') /*保存*/}
                </Button>
                <Button type="danger" onClick={this.cancelHandle}>
                  {messages('common.cancel') /*取消*/}
                </Button>
              </div>
              <div className="clear"></div>
            </div>
            <div className="rule-info-content">
              {this.renderEditConditionDetailByName(condition, "Department")}
              {this.renderEditConditionDetailByName(condition, "EmployeeRank")}
              {this.renderEditConditionDetailByName(condition, "EmployeeDuty")}
              {this.renderEditConditionDetailByName(condition, "EmployeeType")}
            </div>
          </div>
        </div>
      )
    } else {
      domRender = (
        <div>
          <div className="rule-info-wrap">
            <div className="rule-info-title">
              <div className="rule-wrap-title">
                {/*条件*/}
                {messages('person.group.rule.conditon')}
                {condition.conditionSeq} </div>
              <div className="rule-btn-wrap">
                <Button type="primary" onClick={this.editHandle}>
                  {messages('common.edit') /*编辑*/}
                </Button>
                <Button type="danger" onClick={this.deleteHandle}>
                  {messages('common.delete') /*删除*/}
                </Button>
              </div>
              <div className="clear"></div>
            </div>
            <div className="rule-info-content">
              {this.renderConditionDetailByName(condition, "Department")}
              {this.renderConditionDetailByName(condition, "EmployeeRank")}
              {this.renderConditionDetailByName(condition, "EmployeeDuty")}
              {this.renderConditionDetailByName(condition, "EmployeeType")}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="rule-info">
        {domRender}
      </div>
    )
  }
}

RuleInfo.propTypes = {
    index: PropTypes.number.isRequired,// 条件的序号
    condition: PropTypes.object.isRequired,// 单个条件对象
    confirmHandle: PropTypes.func.isRequired,// 点击保存
    deleteHandle: PropTypes.func.isRequired,// 点击删除
    editHandle: PropTypes.func.isRequired,// 点击编辑
    cancelHandle: PropTypes.func.isRequired,// 点击取消
    showConditionSelectorHandle: PropTypes.func.isRequired,// 点击添加条件中的项目
    logicSelectChangeHandle: PropTypes.func.isRequired,// 点击选择是否包含
    removeTagByNameHandle: PropTypes.func.isRequired,//移除条件中的单个项目
    onCheckboxChangeHandle: PropTypes.func.isRequired//启用禁用条件中的单个项目
};

//加入多语言
export default RuleInfo;



