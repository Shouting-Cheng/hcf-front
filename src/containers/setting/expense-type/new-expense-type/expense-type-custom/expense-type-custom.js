import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { Row, Col, Modal, Button, Checkbox, message, Select, Spin } from 'antd'
const Option = Select.Option;
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
const confirm = Modal.confirm;
import 'styles/setting/expense-type/new-expense-type/expense-type-custom.scss'
import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
import DragWidgetItem from 'containers/setting/expense-type/new-expense-type/expense-type-custom/drag-source/drag-widget-item'
import FakeDropLayout from 'containers/setting/expense-type/new-expense-type/expense-type-custom/drop-source/fake-drop-layout'
import PhoneContent from 'containers/setting/expense-type/new-expense-type/expense-type-custom/drop-source/phone-content'
import { LanguageInput } from 'widget/index'
import formService from 'containers/setting/form/form.service'
import PropTypes from 'prop-types';

class ExpenseTypeCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customWidget: [],
      nowWidgets: [],
      nowSelectedIndex: -1,
      counter: 0,
      customEnumeration: [],
      loading: true,
      saving: false,
      enabledReportKey: false,
      reportValueList: []
    }
  }

  componentWillMount() {
    Promise.all([
      expenseTypeService.getWidgetList(),
      formService.getCustomEnumeration(0, 100, true),
      formService.getExpenseReportScope(4003)
    ]).then(res => {
      this.setState({
        customWidget: res[0].data,
        customEnumeration: res[1].data,
        reportValueList: res[2].data.values || [],
        loading: false
      })
    });
  }

  componentDidMount() {
    let { counter } = this.state;
    let { languageList } = this.props;
    let nowWidgets = JSON.parse(JSON.stringify(this.props.expenseType.fields));
    nowWidgets.map(widget => {
      widget.counterFlag = counter++;
      if (!widget.i18n || JSON.stringify(widget) === '{}') {
        languageList.map(language => {
          widget.i18n.name.push({
            language: language.code.toLowerCase(),
            value: widget.name
          })
        });
      }
    });
    let nowSelectedIndex = this.props.index;
    let enabledReportKey = false;
    if (nowWidgets.length > 0 && nowSelectedIndex === -1) {
      nowSelectedIndex = 0;
      enabledReportKey = Boolean(nowWidgets[0].reportKey);
    } else if (nowSelectedIndex > -1) {
      enabledReportKey = Boolean(nowWidgets[nowSelectedIndex].reportKey);
    }
    this.setState({ nowWidgets, counter, nowSelectedIndex, enabledReportKey })
  }

  /**
   * 从列表中把widget拖拽入phone-content时的事件
   * @param widget 拖入的widget
   * @param index 放下的顺序
   */
  handleDrop = (widget, index) => {
    if (!this.props.tenantMode) {
      return;
    }
    let { nowWidgets, counter } = this.state;
    const { languageList } = this.props;
    let rules = [{
      type: ['DATE', 'MONTH', 'DATETIME'],
      max: 10
    }, {
      type: ['TEXT', 'GPS', 'CUSTOM_ENUMERATION'],
      max: 10
    }, {
      type: ['START_DATE_AND_END_DATE'],
      max: 1
    }, {
      type: ['LONG', 'POSITIVE_INTEGER'],
      max: 5
    }, {
      type: ['DOUBLE'],
      max: 5
    }, {
      type: ['LOCATION'],
      max: 2
    }, {
      type: ['PARTICIPANT'],
      max: 1
    }, {
      type: ['PARTICIPANTS'],
      max: 1
    }];
    let targetRule = {};
    rules.map(rule => {
      if (rule.type.indexOf(widget.fieldType) > -1)
        targetRule = rule;
    });
    let limit = 0;
    nowWidgets.map(nowWidget => {
      if (targetRule.type.indexOf(nowWidget.fieldType) > -1)
        limit++;
    });
    if (limit === targetRule.max) {
      message.error(messages('expense.type.components.max', { number: targetRule.max }));
      return;
    }
    let tempWidget = JSON.parse(JSON.stringify(widget));
    //因为ListSort根据key值排序，key值不能改变和重复，所以此处给每一个拖拽进入的组件一个counter计数为counterFlag
    tempWidget.counterFlag = counter++;
    tempWidget.i18n = {
      name: []
    };
    languageList.map(language => {
      tempWidget.i18n.name.push({
        language: language.code.toLowerCase(),
        value: tempWidget.name
      })
    });
    tempWidget.editable = true;
    tempWidget.showOnList = true;
    nowWidgets.splice(index, 0, tempWidget);
    this.setState({ nowWidgets, counter, nowSelectedIndex: index })
  };

  /**
   * 选择某一组件时的回调
   * @param nowSelectedIndex  列表中的第几个
   * @param widget  对应widget对象
   */
  handleSelectWidget = (nowSelectedIndex, widget) => {
    this.setState({ nowSelectedIndex, enabledReportKey: Boolean(widget.reportKey) })
  };

  /**
   * phone-content内部排序后的事件
   * @param result 返回的ReactDom，key值为拖拽进入时定义的counterFlag
   */
  handleSort = (result) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    //记录当前选择的counterFlag
    let nowSelectWidgetCounter = nowWidgets[nowSelectedIndex].counterFlag;
    let targetIndex = -1;
    let tempWidget = [];
    //根据排序后的key值排序
    result.map(item => {
      nowWidgets.map(widget => {
        (widget.counterFlag + '') === item.key && tempWidget.push(widget);
      });
    });
    //寻找之前选择的index
    tempWidget.map((item, index) => {
      if (item.counterFlag === nowSelectWidgetCounter)
        targetIndex = index
    });
    this.setState({ nowWidgets: tempWidget, nowSelectedIndex: targetIndex })
  };

  /**
   * phone-content内部删除后的事件
   * @param index 待删除的索引
   */
  handleDelete = (index) => {
    if (!this.props.tenantMode) {
      return;
    }
    let { nowWidgets, nowSelectedIndex } = this.state;
    confirm({
      title: messages('expense.type.confirm.delete'),
      content: messages('expense.type.confirm.delete.content'),
      okType: 'danger',
      okText: messages('common.delete'),
      cancelText: messages('common.cancel'),
      onOk: () => {
        nowWidgets.splice(index, 1);
        nowSelectedIndex = -1;
        if (nowWidgets.length > 0) {
          nowSelectedIndex = 0
        }
        this.setState({ nowWidgets, nowSelectedIndex })
      }
    });
  };

  getWidgetType = () => {
    const { nowWidgets, nowSelectedIndex, customWidget } = this.state;
    let widgetType = nowWidgets[nowSelectedIndex].fieldType;
    let result = <Spin />;
    if (nowWidgets[nowSelectedIndex].customEnumerationOid)
      widgetType = 'CUSTOM_ENUMERATION';
    if (nowWidgets[nowSelectedIndex].messageKey === 'dateCombined')
      widgetType = 'START_DATE_AND_END_DATE';
    console.log(widgetType)
    console.log(customWidget)
    customWidget.map(item => {
      console.log(item)
      if (widgetType === item.fieldType)
        result = item.name;
    });
    return result;
  };

  handleChangeWightI18n = (value, i18n) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    nowWidgets[nowSelectedIndex].name = value;
    nowWidgets[nowSelectedIndex].i18n = {
      name: i18n
    };
    this.setState({ nowWidgets })
  };

  handleChangeCheckBox = (e, key) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    nowWidgets[nowSelectedIndex][key] = e.target.checked;
    this.setState({ nowWidgets })
  };

  handleSave = () => {
    const { expenseType } = this.props;
    const { nowWidgets, nowSelectedIndex } = this.state;
    let hasError = false;
    nowWidgets.map((widget, index) => {
      widget.sequence = index;
      if (!widget.name) {
        hasError = true;
        message.error(messages('expense.type.title.required', { index: index + 1 }));
      }
      if (widget.fieldType === 'CUSTOM_ENUMERATION' && !widget.customEnumerationOid) {
        hasError = true;
        message.error(messages('expense.type.list.required', { index: index + 1 }));
      }
      //城市控件增加location messageKey，差标会用到
      if (widget.fieldType === 'LOCATION')
        widget.messageKey = 'location';
      //同行人控件增加participant messageKey，app用到
      if (widget.fieldType === 'PARTICIPANT')
        widget.messageKey = 'participant';
      //参与人控件增加participants messageKey，app用到
      if (widget.fieldType === 'PARTICIPANTS')
        widget.messageKey = 'participants';
      //开始结束日期增加dateCombined messageKey, app用到
      if (widget.fieldType === 'START_DATE_AND_END_DATE')
        widget.messageKey = 'dateCombined';
    });
    if (!hasError) {
      this.setState({ saving: true });
      expenseTypeService.saveExpenseTypeFields(expenseType.id, nowWidgets).then(res => {
        this.setState({ saving: false });
        message.success(messages('common.operate.success'));
        this.props.saveIndex(nowSelectedIndex);
        this.props.onSave();
      }).catch(e => {
        this.setState({ saving: false });
      })
    }
  };

  handleChangeCustomEnumeration = (value) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    nowWidgets[nowSelectedIndex].customEnumerationOid = value;
    this.setState({ nowWidgets })
  };

  handleChangeReportKey = (value) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    nowWidgets[nowSelectedIndex].reportKey = value;
    this.setState({ nowWidgets })
  };

  handleChangeReportKeyEnabled = (e) => {
    let { nowWidgets, nowSelectedIndex } = this.state;
    let enabledReportKey = e.target.checked;
    if (!enabledReportKey) {
      nowWidgets[nowSelectedIndex].reportKey = null;
    }
    this.setState({ enabledReportKey: e.target.checked, nowWidgets })
  };

  render() {
    const { customWidget, nowWidgets, nowSelectedIndex, customEnumeration, loading, saving, enabledReportKey, reportValueList } = this.state;
    const { tenantMode, expenseType } = this.props;
    let nowWidget = nowSelectedIndex > -1 ? nowWidgets[nowSelectedIndex] : null;
    return (
      <div className="expense-type-custom">
        <FakeDropLayout />
        <Row gutter={40}>
          <Col span={8}>
            {loading ? <Spin /> : (
              <div className="widget-area">
                <div className="widget-list">
                  <div className="widget-category">{messages('expense.type.system.widget')}</div>
                  <div className="widget-list">
                    {customWidget.filter(widget => widget.type === 'SYSTEM').map(widget => <DragWidgetItem widget={widget}
                      key={widget.id} />)}
                  </div>
                  <div className="widget-category">{messages('expense.type.custom.widget')}</div>
                  <div className="widget-list">
                    {customWidget.filter(widget => widget.type === 'CUSTOM').map(widget => <DragWidgetItem widget={widget}
                      key={widget.id} />)}
                  </div>
                </div>
              </div>
            )}
          </Col>
          <Col span={8}>
            <div className="fake-phone">
              <div className="phone-buttons">
                <div className="phone-camera" />
                <div className="phone-button phone-button-power" />
                <div className="phone-button phone-button-volume-up" />
                <div className="phone-button phone-button-volume-down" />
                <div className="phone-flash" />
              </div>
              <PhoneContent widgetList={nowWidgets}
                onSort={this.handleSort}
                nowSelectedIndex={nowSelectedIndex}
                onSelect={this.handleSelectWidget}
                onDrop={this.handleDrop}
                onDelete={this.handleDelete}
                disabled={!tenantMode} />
            </div>
          </Col>
          <Col span={8} className="widget-setting">
            {nowWidget ? (
              <div>
                {messages('expense.type.type')}: {this.getWidgetType()}
                <div className="widget-setting-title">{messages('expense.type.title')}</div>
                <LanguageInput isEdit
                  name={nowWidget.name}
                  i18nName={JSON.parse(JSON.stringify(nowWidget.i18n.name))}
                  nameChange={this.handleChangeWightI18n}
                  disabled={!tenantMode}
                  inpRule={[{
                    length: 30,
                    language: "zh_cn"
                  }, {
                    length: 30,
                    language: "en"
                  }]} />
                {(nowWidget.fieldType === 'CUSTOM_ENUMERATION' ||
                  (nowWidget.fieldType === 'TEXT' && nowWidget.customEnumerationOid)) && (
                    <div>
                      <div className="widget-setting-title">{messages('expense.type.custom.value.list')}</div>
                      {loading ? <Spin /> : <Select showSearch
                        style={{ width: '100%' }}
                        value={nowWidget.customEnumerationOid}
                        onChange={this.handleChangeCustomEnumeration}
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        disabled={!tenantMode}>
                        {customEnumeration.map(enumeration =>
                          <Option value={enumeration.customEnumerationOid}
                            key={enumeration.customEnumerationOid}>{enumeration.name}</Option>)}
                      </Select>}
                    </div>
                  )}
                <div className="widget-setting-title">
                  <Checkbox onChange={e => this.handleChangeCheckBox(e, 'required')}
                    checked={nowWidget.required}
                    disabled={!tenantMode}>{messages('expense.type.required')}</Checkbox>
                </div>
                <div className="widget-setting-title">
                  <Checkbox onChange={e => this.handleChangeCheckBox(e, 'showOnList')}
                    checked={nowWidget.showOnList}
                    disabled={!tenantMode}>{messages('expense.type.show')}</Checkbox>
                </div>
                <div className="widget-setting-title">
                  <Checkbox onChange={e => this.handleChangeCheckBox(e, 'printHide')}
                    checked={nowWidget.printHide}
                    disabled={!tenantMode}>{messages('expense.type.hide.when.print')}</Checkbox>
                </div>
                <div className="widget-setting-title">
                  <Checkbox onChange={e => this.handleChangeCheckBox(e, 'editable')}
                    checked={nowWidget.editable}
                    disabled={!tenantMode}>{messages('expense.type.edit')}</Checkbox>
                </div>
                <div className="widget-setting-title">
                  <Checkbox onChange={this.handleChangeReportKeyEnabled}
                    checked={enabledReportKey}
                    disabled={!tenantMode}>
                    {messages('expense.type.report')}<span className="widget-setting-checkbox-info">{messages('expense.type.report.content')}</span>
                  </Checkbox>
                  {!loading && enabledReportKey && (
                    <Select showSearch
                      value={nowWidget.reportKey}
                      onChange={this.handleChangeReportKey}
                      filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                      style={{ marginTop: 5, width: '100%' }}
                      placeholder={messages('common.please.select')}
                      disabled={!tenantMode}>
                      {reportValueList.filter(enumeration => enumeration.enabled).map(enumeration =>
                        <Option value={enumeration.value}
                          key={enumeration.value}>{enumeration.messageKey}</Option>)}
                    </Select>)}
                </div>
              </div>
            ) : messages('expense.type.drag.components')}
            {(expenseType.fields.length > 0 || nowWidgets.length > 0) && tenantMode && (
              <div className="widget-setting-buttons">
                <Button type="primary" onClick={this.handleSave} loading={saving}>{messages('common.save')}</Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

ExpenseTypeCustom.propTypes = {
  expenseType: PropTypes.object,
  onSave: PropTypes.func,
  saveIndex: PropTypes.func,
  index: PropTypes.number
};

function mapStateToProps(state) {
  return {
    languageList: state.languages.languageList,
    tenantMode: true
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(DragDropContext(HTML5Backend)(ExpenseTypeCustom))
