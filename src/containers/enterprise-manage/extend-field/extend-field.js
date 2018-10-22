import { messages } from 'utils/utils';
/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 * //扩展字段组件需要被复用，成本中心扩展字段也需要用
 //凡是需要用到扩展字段配置的地方
 */
import React from 'react';
import { connect } from 'react-redux';

import EFService from 'containers/enterprise-manage/extend-field/extend-field.service';
import 'styles/enterprise-manage/extend-field/extend-field.scss';
import ExtendFieldComponent from 'components/template/extend-field-setting/extend-field';

import BaseService from 'share/base.service';
import { message } from 'antd';
//默认的扩展字段表单，Profile中没有获取到，就使用这个
const extendFieldDefault = {
  formName: '用户附加信息', //用户附加信息
  iconName: 'user_attach_info',
  messageKey: 'user_attach_form',
  formType: 5001,
  formCode: 'user_attach_form',
  asSystem: false,
  valid: true,
  parentOID: null,
  associateExpenseReport: false,
  customFormFields: [],
  remark: '人员附加信息', //
  referenceOID: null,
  visibleExpenseTypeScope: 1001,
  visibleUserScope: 1001,
};

class ExtendField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      customFromOriginList: [], //可以选择表单类型
      customFrom: {}, //配置的表单
    };
  }

  componentWillMount() {}

  componentDidMount() {
    this.getWidgetList();
    this.getCustomForm();
  }
  //获取表单字段类型
  getWidgetList = () => {
    EFService.getWidgetList({ type: 1003 }).then(res => {
      this.setState({
        customFromOriginList: res.data,
      });
    });
  };
  //获取表单
  getCustomForm = () => {
    //如果没有需要前端初始化创建
    if (this.props.profile['company.contact.custom.form']) {
      this.setState({
        loading: true,
      });
      EFService.getCustomForm(this.props.profile['company.contact.custom.form']).then(res => {
        let customFrom = res.data;
        if (customFrom.customFormFields.length > 0) {
          customFrom.customFormFields[0]._active = true;
        }
        this.setState({
          loading: false,
          customFrom,
        });
      });
    } else {
      this.setState({
        customFrom: extendFieldDefault,
      });
    }
  };
  createOrUpdate = form => {
    if (this.props.profile['company.contact.custom.form']) {
      this.updateCustomForm(form);
    } else {
      this.createCustomForm(form);
    }
  };
  //创建表单
  createCustomForm = form => {
    this.setState({
      loading: true,
    });
    EFService.createCustomForm(form).then(res => {
      message.success(messages('extend-field-updated'));
      this.setState({
        loading: false,
      });
      //这个地方需要更新一下functionProfile，因为创建表单之后，接口数据变化了
      BaseService.getProfile();
    });
  };
  //更新表单
  updateCustomForm = form => {
    if (!form.formOID) {
      //只有当新增之后，立即再次更新执行这个逻辑
      form.formOID = this.props.profile['company.contact.custom.form'];
    }
    this.setState({
      loading: true,
    });
    // todo
    // 后端返回的字段没有排序:需要自己写一个函数排序，或者自己再次查询一次
    EFService.updateCustomForm(form).then(res => {
      //更新成功
      message.success(messages('extend-field-updated'));
      // let customFrom = res.data;
      // if (customFrom.customFormFields.length > 0) {
      //   customFrom.customFormFields[0]._active = true;
      //   //在这里写排序逻辑
      // }
      this.setState({
        loading: false,
        // customFrom,
      });
    });
  };
  //取消
  cancel = () => {
    this.context.router.goBack();
  };

  //获取扩展字段表单
  render() {
    return (
      <div className="extend-field-wrap">
        <ExtendFieldComponent
          loading={this.state.loading}
          filedMax={10}
          cancel={this.cancel}
          rightIsShow={this.props.tenantMode}
          bottomBtnIsShow={this.props.tenantMode}
          leftDragable={this.props.tenantMode}
          saveFrom={this.createOrUpdate}
          customFrom={this.state.customFrom}
          customFromOriginList={this.state.customFromOriginList}
        />
      </div>
    );
  }
}

ExtendField.contextTypes = {
  router: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ExtendField);
