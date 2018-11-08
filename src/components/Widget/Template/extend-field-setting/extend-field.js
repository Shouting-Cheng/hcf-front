/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 * //扩展字段组件需要被复用，成本中心扩展字段也需要用
 //凡是需要用到扩展字段配置的地方
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Button, Icon, Modal } from 'antd';
import 'styles/components/template/extend-field-setting/extend-field.scss';
import { deepCopy } from 'utils/extend';
import { ListSort } from 'widget/index';
import WidgetSetting from 'widget/Template/widget/widget-setting';

let customFormFieldsSorted = [];

class ExtendFieldComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      filedMax: 10,
      customFromOriginList: [], //可以选择表单类型
      customFrom: {}, //配置的表单
    };
  }

  componentWillMount() { }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    this.setState({
      loading: nextProps.loading,
      filedMax: nextProps.filedMax,
      customFrom: nextProps.customFrom,
      customFromOriginList: nextProps.customFromOriginList,
    });
  }

  componentDidMount() {s }

  addFieldItem = field => {
    let item = deepCopy(field);
    let customFrom = this.state.customFrom;
    item.sequence = customFrom.customFormFields.length;
    if (item.sequence >= this.state.filedMax) {
      Modal.warning({
        title: this.$t('extend.field.tips'), //'提示',
        content:
          this.$t('extend.field.maxAdd') + this.state.filedMax + this.$t('extend.field.fields'), //'最多只能添加10个',
      });
      return;
    }
    customFrom.customFormFields.map(data => {
      data._active = false;
    });
    item._active = true;
    item.sequence = customFrom.customFormFields.length > 0 ? customFrom.customFormFields.length : 0;
    customFrom.customFormFields.push(item);
    this.setState({
      customFrom,
      loading: false,
    });
  };

  //激活表单字段
  activeFieldItem = (e, item) => {
    e.stopPropagation();
    let customFrom = this.state.customFrom;
    customFrom.customFormFields.map(data => {
      data._active = false;
    });
    item._active = true;
    this.setState({
      customFrom,
      loading: false,
    });
  };
  //移除表单字段
  removeFieldItem = (e, item) => {
    e.stopPropagation();
    let customFrom = this.state.customFrom;
    //移除表单字段
    customFrom.customFormFields.map((data, index) => {
      if (data.sequence === item.sequence) {
        customFrom.customFormFields.splice(index, 1);
      }
    });
    //重新排序
    customFrom.customFormFields.map((data, index) => {
      data.sequence = index;
    });
    //如果删除是激活的，立即设置一个
    if (item._active && customFrom.customFormFields.length > 0) {
      customFrom.customFormFields[0]._active = true;
    }
    setTimeout(() => {
      this.setState({
        customFrom,
        loading: false,
      });
      // todo
      // > 800ms 才行
      // 不然删除一个后，就无法拖拽了
    }, 800);
  };
  //排序结果
  handleSortFieldItem = result => {
    customFormFieldsSorted = result;
    // let customFrom = this.state.customFrom;
    // let fields = [];
    // //根据排序顺序：重置表单

    // customFrom.customFormFields = fields;
    // this.setState({
    //   customFrom,
    // })
  };

  validete = () => {
    //保存之前，把数据处理好，验证好
    let customFrom = this.state.customFrom;
    let fields = customFrom.customFormFields;
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if (field.fieldName == '' || field.fieldName == null || !field.fieldName) {
        //fieldName不能为空
        Modal.warning({
          title: this.$t('extend.field.tips'), //'提示',
          content: this.$t('extend.field.name.no.empty'), //'字段名称不能为空',
        });
        return false;
      }
      if (field.messageKey === 'cust_list') {
        if (!field.dataSource) {
          Modal.warning({
            title: this.$t('extend.field.tips'), //'提示',
            content: this.$t('extend.field.list.no.empty'), //'选择列表不能为空',
          });
          return false;
        }
        let dataSource = JSON.parse(field.dataSource);
        if (!dataSource.customEnumerationOID) {
          Modal.warning({
            title: this.$t('extend.field.tips'), //'提示',
            content: this.$t('extend.field.list.no.empty'), //'选择列表不能为空',
          });
          return false;
        }
      }
    }
    return true;
  };

  //之前后端留的坑，多语言对象，没有统一处理
  //在最后新增或者更新的时候，要对多语言单独处理
  _forUpdateI18n = customFrom => {
    console.log(customFrom);
    for (let i = 0; i < customFrom.customFormFields.length; i++) {
      let widget = customFrom.customFormFields[i];
      widget.i18n = {};
      widget.customFormFieldI18nDTOS.map(i18nDTO => {
        if (!widget.i18n.fieldName) widget.i18n.fieldName = [];
        widget.i18n.fieldName.push({ language: i18nDTO.language, value: i18nDTO.fieldName });
        if (!widget.i18n.promptInfo) widget.i18n.promptInfo = [];
        widget.i18n.promptInfo.push({ language: i18nDTO.language, value: i18nDTO.promptInfo });
      });
    }
    return customFrom;
  };

  cancel = () => {
    this.props.cancel();
  };
  /**
   * 根据拖拽排序的结果，排序表单字段
   * @param originFields  最初的字段顺序
   * @param sortedFields  被拖拽后的顺序字段
   * @return field 排序好的字段
   */
  _getCustomFormFieldsBySortRes = (originFields, sortedFields) => {
    if (originFields.length > 0) {
      if (sortedFields.length > 0) {
        let arr = [];
        if (originFields.length > sortedFields.length) {
          //先拖拽过，添加字段后，就没有拖拽过
          sortedFields.map((item, index) => {
            let i = parseInt(item['key']);
            originFields[i].sequence = index;
            arr[index] = originFields[i];
          });
          for (let n = sortedFields.length; n < originFields.length; n++) {
            arr[n] = originFields[n];
          }
          return arr;
        } else {
          //拖拽过
          sortedFields.map((item, index) => {
            let i = parseInt(item['key']);
            originFields[i].sequence = index;
            arr[index] = originFields[i];
          });
          return arr;
        }
      } else {
        //没有拖拽过
        return originFields;
      }
    } else {
      //没有字段了
      return [];
    }
  };
  //保存配置好的表单
  saveFrom = () => {
    if (this.validete()) {
      let customFrom = deepCopy(this.state.customFrom);
      let customFormFields = deepCopy(this.state.customFrom.customFormFields);

      let customFormFieldsNew = this._getCustomFormFieldsBySortRes(
        customFormFields,
        customFormFieldsSorted
      );
      customFrom.customFormFields = customFormFieldsNew;
      let willUpdateCustomFrom = {};
      if (customFrom.customFormFields.length > 0) {
        willUpdateCustomFrom = this._forUpdateI18n(customFrom);
      } else {
        willUpdateCustomFrom = customFrom;
      }

      this.props.saveFrom(willUpdateCustomFrom);
    }
    this.setState({ loading: false });
  };
  back = () => {
    this.context.router.goBack();
  };
  handleChangeField = field => {
    let customFrom = this.state.customFrom;
    for (let i = 0; i < customFrom.customFormFields.length; i++) {
      let data = customFrom.customFormFields[i];
      if (field.sequence === data.sequence) {
        customFrom.customFormFields[i] = field;
      }
    }
    this.setState({
      customFrom: customFrom,
      loading: false,
    });
  };
  //渲染 激活的表单字段  详情
  renderFiledItemDetail = () => {
    let customFrom = this.state.customFrom;
    console.log(customFrom)
    let item = {};
    if (customFrom.customFormFields && customFrom.customFormFields.length > 0) {
      customFrom.customFormFields.map(data => {
        if (data._active) {
          item = data;
        }
      });
      return (
        <div>
          <WidgetSetting
            widget={item}
            isExtendField={true}
            showConfig={{
              isReadOnly: false,
              isPDFShow: false,
              required: true,
            }}
            valueKey={'sequence'}
            needType
            widgetList={this.state.customFromOriginList}
            onChange={this.handleChangeField}
          />
        </div>
      );
    } else {
      return <div />;
    }
  };
  //渲染表单
  renderFiledItem = () => {
    let form = this.state.customFrom;
    console.log(form)
    
    let fields = form.customFormFields ? form.customFormFields : [];
    if (fields.length > 0) {
      let dragList = fields.map((item, index) => {
        let className = 'field-item';
        if (item._active) {
          className = 'field-item field-item-active';
        } else {
          className = 'field-item';
        }
        let closeIcon = null;
        if (this.props.leftDragable) {
          closeIcon = (
            <div
              className="f-right close-btn"
              onClick={e => {
                this.removeFieldItem(e, item);
              }}
            >
              <Icon type="close-circle" />
            </div>
          );
        } else {
          closeIcon = <div />;
        }
        return (
          <div
            className={className}
            key={item.sequence}
            origin={item}
            onClick={e => {
              this.activeFieldItem(e, item);
            }}
          >
            <div className="f-left">
              <div className="f-left left-field-item-title">{item.fieldName}</div>
              <div className="f-left left-field-item-inp">{item.promptInfo}</div>
              <div className="clear" />
            </div>
            {closeIcon}
            <div className="clear" />
          </div>
        );
      });

      if (this.props.leftDragable) {
        return (
          <div className="list-drag-wrap">
            <div className="list-drag-inner-wrap">
              <ListSort onChange={this.handleSortFieldItem} dragClassName="list-drag-selected">
                {dragList}
              </ListSort>
            </div>
          </div>
        );
      } else {
        return (
          <div className="list-drag-wrap">
            <div className="list-drag-inner-wrap">
              <div>{dragList}</div>
            </div>
          </div>
        );
      }
    } else {
      return <div />;
    }
  };
  //渲染表单列表：右边的列表
  renderFiledList = () => {
    let list = this.state.customFromOriginList;
    if (list.length > 0) {
      return list.map(item => {
        return (
          <div
            className="field-list-item"
            onClick={() => {
              this.addFieldItem(item);
            }}
            type={item.messageKey}
            key={item.guiWidgetOID}
          >
            {item.name}
          </div>
        );
      });
    } else {
      return <div />;
    }
  };

  renderRightContent = () => {
    if (this.props.rightIsShow) {
      return (
        <div className="extend-field-content-right f-left">
          <div className="field-list">
            <div className="extend-field-title">
              {this.$t('extend.field.click.add.field.type') /*点击添加字段类型*/}
            </div>
            {/*右边的列表*/}
            {this.renderFiledList()}
            <div className="clear" />
          </div>
          <div className="field-active">{this.renderFiledItemDetail()}</div>
        </div>
      );
    } else {
      return <div />;
    }
  };
  renderBottomBtn = () => {
    if (this.props.bottomBtnIsShow) {
      return (
        <div className="extend-field-btn-wrap">
          <Button type="primary" loading={this.state.loading} onClick={this.saveFrom}>
            {this.$t('common.save') /*保存*/}
          </Button>&nbsp;&nbsp;&nbsp;
          <Button onClick={this.cancel}>{this.$t('common.cancel') /*取消*/}</Button>
        </div>
      );
    } else {
      return <div />;
    }
  };

  //获取扩展字段表单
  render() {
    return (
      <div className="extend-field-wrap-component">
        <div>{this.props.header}</div>
        <div className="extend-field-content">
          <div className="extend-field-content-left f-left">
            <div className="extend-field-title">
              {/*最多能添加10个字段*/}
              {this.$t('extend.field.maxAdd') +
                this.state.filedMax +
                this.$t('extend.field.fields')}
            </div>
            {/*左边的可以拖拽区*/}
            {this.renderFiledItem()}
          </div>
          {this.renderRightContent()}
          <div className="clear" />
        </div>
        {this.renderBottomBtn()}
        <div>{this.props.footer}</div>
      </div>
    );
  }
}

// 这个组件可以被导入其他地方可以配置
ExtendFieldComponent.propTypes = {
  header: PropTypes.node, //
  footer: PropTypes.node, //
  filedMax: PropTypes.number, //可以配置的字段数目
  customFrom: PropTypes.object, //
  customFromOriginList: PropTypes.array, //
  saveFrom: PropTypes.func, //
  cancel: PropTypes.func, //
  rightIsShow: PropTypes.bool, //右边部分是否显示
  bottomBtnIsShow: PropTypes.bool, //下边的按钮是否显示
  leftDragable: PropTypes.bool, //左边部分是否可以拖拽
};
ExtendFieldComponent.defaultProps = {
  filedMax: 10,
  loading: false,
  bottomBtnIsShow: true,
  leftDragable: true,
  rightIsShow: true,
};
ExtendFieldComponent.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    user: state.user.currentUser,
    tenantMode: true,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ExtendFieldComponent);
