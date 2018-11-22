/**
 * Created by zhouli on 18/2/26
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';

import 'styles/components/template/language-input/language-input.scss';
import languageGrey from 'images/components/language-grey.png';
import language from 'images/components/language.png';
import { Modal, Button, message } from 'antd';
import { deepCopy } from 'utils/extend';
import LIService from './language-input.service';

import PropTypes from 'prop-types';
//这个从后端获取，后端返回空，就给这个默认
const LANGLIST = [
  {
    code: 'zh_cn',
    value: '简体中文',
    comments: '简体中文',
    type: 'language',
  },
];

class LanguageInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false, //模态框的显示
      first: true, //第一次操作输入框
      languageListLocal: [], //用户的当前加载到浏览器语言列表
      sysLanguageDefault: '', //用户主表的语言，这是PF配置的:用户登录时候，存在在session中
      currentUseLanguage: '', //用户当前使用的语言：这是用户手动切换的
      stopConfirm: true, //这个很重要，主表语言为空，一定不能让用户点击确认
      isCreate: false, //是否是新增：默认是编辑
      nameCopy: '', //拷贝一份传入的数据，取消的时候用
      i18nNameCopy: [],
      nameForShow: '', //在外层显示的name
      i18nNameForShow: [],
      name: '', //最后输出的name
      i18nName: [], //最后输出的多语言对象列表
    };
    this.getNameForShow = LIService.getNameForShow;
    this.sortI18nList = LIService.sortI18nList;
    this.checkI18nObj = LIService.checkI18nObj;
    this.initLanguageListForEdit = LIService.initLanguageListForEdit;
    this.initLanguageListForCreate = LIService.initLanguageListForCreate;
    this.mainTableLanguageIsEmpty = LIService.mainTableLanguageIsEmpty;
  }

  componentDidMount() {
    let { languageList, language, user } = this.props;
    if (languageList.length < 1) {
      //给一个默认
      languageList = LANGLIST;
    }

    let languageListLocal = languageList;
    let sysLanguageDefault = language.code ? language.code : 'zh_cn';
    let currentUseLanguage = user.language ? user.language.toLowerCase() : 'zh_cn';

    this.setState(
      {
        languageListLocal,
        sysLanguageDefault,
        currentUseLanguage,
      },
      () => {
        let inputName = this.props.name;
        let inputI18nName = this.props.i18nName;
        let languageListLocal = this.state.languageListLocal;
        // 先把逻辑转为Boolean值
        if (this.props.isEdit) {
          const i18nName = this.initLanguageListForEdit(
            inputName,
            inputI18nName,
            languageListLocal,
            sysLanguageDefault
          );
          let i18nNameForShow = deepCopy(i18nName);
          let nameForShow = this.getNameForShow(currentUseLanguage, i18nName);
          this.setState({
            isCreate: false,
            stopConfirm: false,
            name: inputName,
            i18nName: i18nName,
            i18nNameForShow: i18nNameForShow,
            nameForShow: nameForShow,
            nameCopy: inputName,
            i18nNameCopy: i18nName,
          });
        } else {
          const i18nName = this.initLanguageListForCreate(languageListLocal);
          let i18nNameForShow = deepCopy(i18nName);
          let nameForShow = this.getNameForShow(currentUseLanguage, i18nName);
          this.setState({
            isCreate: true,
            stopConfirm: true,
            name: inputName,
            i18nName: i18nName,
            i18nNameForShow: i18nNameForShow,
            nameForShow: nameForShow,
            nameCopy: inputName,
            i18nNameCopy: i18nName,
          });
        }
      }
    );
  }

  // 我发现实现双向绑定后，这个是多余的
  // 数据已经在本组件里面了，不存在外部再向本组件传值的情况
  componentWillReceiveProps(nextProps) {
    //只有检查了i18n有变化时才会重新设置值
    if (JSON.stringify(nextProps.i18nName) === JSON.stringify(this.state.i18nName)) {
      return;
    }
    let inputName = nextProps.name;

    let inputI18nName = nextProps.i18nName;
    let { languageListLocal, sysLanguageDefault, currentUseLanguage } = this.state;
    let { user } = this.props;
    //因为setState有延迟，所以componentWillReceiveProps函数可能执行在currentUseLanguage设置之前
    if (!currentUseLanguage)
      currentUseLanguage = user.language ? user.language.toLowerCase() : 'zh_cn';
    // 先把逻辑转为Boolean值
    if (nextProps.isEdit) {
      const i18nName = this.initLanguageListForEdit(
        inputName,
        inputI18nName,
        languageListLocal,
        sysLanguageDefault
      );
      let i18nNameForShow = deepCopy(i18nName);
      let nameForShow = this.getNameForShow(currentUseLanguage, i18nName);
      this.setState({
        isCreate: false,
        stopConfirm: false,
        name: inputName,
        i18nName: i18nName,
        i18nNameForShow: i18nNameForShow,
        nameForShow: nextProps.value || nameForShow,
        nameCopy: inputName,
        i18nNameCopy: i18nName,
      });
    } else {
      const i18nName = this.initLanguageListForCreate(languageListLocal);
      let i18nNameForShow = deepCopy(i18nName);
      let nameForShow = this.getNameForShow(currentUseLanguage, i18nName);
      this.setState({
        isCreate: true,
        stopConfirm: true,
        name: inputName,
        i18nName: i18nName,
        i18nNameForShow: i18nNameForShow,
        nameForShow: nameForShow,
        nameCopy: inputName,
        i18nNameCopy: i18nName,
      });
    }
  }

  //显示多语言弹窗
  languageShow = () => {
    this.setState({
      visible: true,
    });
  };

  inputChange = e => {
    let value = e.target.value;
    let inpLength = null;
    if (this.props.inpRule && this.props.inpRule.length > 0) {
      //输入的限制长度
      inpLength = this.getLimitLength(this.props.inpRule, this.state.sysLanguageDefault);
    }

    if (inpLength && value.length > inpLength) {
      message.destroy();
      message.warn(this.$t('lang-inp.lang-tip', { length: inpLength }));
      value = value.substring(0, inpLength);
    }

    this.setState(
      {
        first: false,
        nameForShow: value,
      },
      () => {
        this.inputChangeAfter(value);
      }
    );
  };

  //输入框的值改变之后：
  // 1.拷贝一份，点击取消时用
  // 2.赋值到多语言对象
  inputChangeAfter = value => {
    //若是新增：设置主表、设置多语言
    if (this.state.isCreate) {
      let _nameForShow = value;
      let _i18nName = this.state.i18nName;
      for (let i = 0; i < _i18nName.length; i++) {
        _i18nName[i].value = _nameForShow;
      }
      this.setState(
        {
          name: _nameForShow,
          i18nName: _i18nName,
        },
        () => {
          this.inputChangeAfterCallback();
        }
      );
    }
    //若是编辑：（有条件）设置主表、设置对应的多语言
    if (!this.state.isCreate) {
      if (this.state.sysLanguageDefault === this.state.currentUseLanguage) {
        this.setState({
          nameCopy: value,
        });
      }
      let _i18nName = this.state.i18nName;
      for (let i = 0; i < _i18nName.length; i++) {
        if (_i18nName[i].language.toLowerCase() === this.state.currentUseLanguage) {
          _i18nName[i].value = value;
        }
      }
      this.setState(
        {
          name: value,
          i18nName: _i18nName,
          i18nNameCopy: deepCopy(_i18nName),
        },
        () => {
          this.inputChangeAfterCallback();
        }
      );
    }
  };

  //输入时不断回调
  inputChangeAfterCallback = () => {
    let i18nNameForShow = deepCopy(this.state.i18nName);
    let stopConfirm = this.mainTableLanguageIsEmpty(i18nNameForShow, this.state.sysLanguageDefault);
    this.setState({
      stopConfirm: stopConfirm,
      i18nNameForShow: i18nNameForShow,
    });
    if (this.props.nameChange) {
      this.props.nameChange(this.state.name, this.state.i18nName, this.props.origin);
    }
    this.onChange(this.state.name);
  };

  //这个是为了限制语言长度
  getLimitLength = (rule, lang) => {
    for (let i = 0; i < rule.length; i++) {
      if (rule[i].language === lang) {
        return rule[i].length;
      }
    }
  };
  //多语言输入:手动绑定数据
  languageInputChange = (e, langItem) => {
    langItem.value = e.target.value;

    let inpLength = null;
    if (this.props.inpRule && this.props.inpRule.length > 0) {
      //输入的限制长度
      inpLength = this.getLimitLength(this.props.inpRule, langItem.language);
    }
    if (inpLength && langItem.value.length > inpLength) {
      message.destroy();
      message.warn(this.$t('lang-inp.lang-tip', { length: inpLength }));
      langItem.value = langItem.value.substring(0, inpLength);
    }

    let i18nNameForShow = this.state.i18nNameForShow;
    for (let i = 0; i < i18nNameForShow.length; i++) {
      if (i18nNameForShow[i].language === langItem.language) {
        i18nNameForShow[i] = langItem;
      }
    }
    //主表语言一定要填入
    let stopConfirm = this.mainTableLanguageIsEmpty(i18nNameForShow, this.state.sysLanguageDefault);
    this.setState({
      i18nNameForShow,
      stopConfirm,
    });
  };

  handleCancel = e => {
    let name = deepCopy(this.state.nameCopy);
    let i18nName = deepCopy(this.state.i18nNameCopy);
    let i18nNameForShow = deepCopy(this.state.i18nNameCopy);
    for (let i = 0; i < i18nNameForShow.length; i++) {
      if (i18nName[i].language.toLowerCase() === this.state.sysLanguageDefault) {
        name = i18nNameForShow[i].value;
      }
      if (i18nName[i].language.toLowerCase() === this.state.currentUseLanguage) {
        name = i18nNameForShow[i].value;
      }
    }
    //added by zaranengap
    //取消时同handleOk从i18n里面拿数据
    //TODO: 取消时不应该调用nameChange方法
    this.setState(
      {
        visible: false,
        i18nNameForShow: i18nNameForShow,
        name: name, //最后输出的name
        i18nName: i18nName, //最后输出的多语言对象列表
      },
      () => {
        if (this.props.nameChange) {
          this.props.nameChange(this.state.name, this.state.i18nName, this.props.origin);
        }
        this.onChange(this.state.name);
      }
    );
  };

  handleOk = e => {
    let i18nNameForShow = this.state.i18nNameForShow;
    let name = '';
    let nameForShow = '';

    for (let i = 0; i < i18nNameForShow.length; i++) {
      if (i18nNameForShow[i].language.toLowerCase() === this.state.sysLanguageDefault) {
        name = i18nNameForShow[i].value;
      }
      if (i18nNameForShow[i].language.toLowerCase() === this.state.currentUseLanguage) {
        nameForShow = i18nNameForShow[i].value;
      }
    }
    this.setState(
      {
        visible: false,
        name: name,
        i18nName: deepCopy(i18nNameForShow),
        nameForShow: nameForShow,
        nameCopy: name,
        i18nNameCopy: deepCopy(i18nNameForShow),
      },
      () => {
        if (this.props.nameChange) {
          this.props.nameChange(this.state.name, this.state.i18nName, this.props.origin);
        }
        this.onChange(this.state.name);
      }
    );
  };

  //渲染语言的提示语
  renderLangItemTips = language => {
    let sysLanguageDefault = this.state.sysLanguageDefault;
    if (
      language.language.toLowerCase() == sysLanguageDefault &&
      (language.value == '' || language.value == undefined || language.value == null) &&
      this.props.mainLanguageIsRequired
    ) {
      // 必填
      return this.$t('lang-inp.required');
    } else {
      return '';
    }
  };

  //渲染语言的标题
  renderLangItemTitle = language => {
    let langList = this.state.languageListLocal;
    for (let i = 0; i < langList.length; i++) {
      if (langList[i].code.toLowerCase() === language.toLowerCase()) {
        return langList[i].comments;
      }
    }
  };

  renderLangItemInp = langItem => {
    if (this.props.textArea) {
      let className = this.props.disabled
        ? 'language-arr-input-textarea disabled-class'
        : 'language-arr-input-textarea';

      return (
        <textarea
          className={className}
          placeholder={this.$t('common.please.enter')}
          value={langItem.value}
          wrap={this.props.textAreaFormat}
          disabled={this.props.disabled}
          onChange={e => {
            this.languageInputChange(e, langItem);
          }}
        />
      );
    } else {
      let className = this.props.disabled
        ? 'language-arr-input disabled-class'
        : 'language-arr-input';

      return (
        <input
          className={className}
          placeholder={this.$t('common.please.enter')}
          value={langItem.value}
          disabled={this.props.disabled}
          onChange={e => {
            this.languageInputChange(e, langItem);
          }}
        />
      );
    }
  };
  //渲染单条语言输入框
  renderLangItem = langItem => {
    return (
      <div key={langItem.language}>
        <div className="language-title-wrap">
          <span className="language-title">{this.renderLangItemTitle(langItem.language)}</span>
        </div>
        <div className="language-input-wrap">{this.renderLangItemInp(langItem)}</div>
        <div className="language-arr-tips-wrap">
          <span className="language-arr-tips">{this.renderLangItemTips(langItem)}</span>
        </div>
      </div>
    );
  };

  //渲染多语言
  renderLangList = langList => {
    return langList.map(item => {
      return this.renderLangItem(item);
    });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  renderInp() {
    let classNameInput = this.props.disabled ? 'language-input disabled-class' : 'language-input';
    this.props.value === '' && this.state.nameForShow === '' && (classNameInput = 'language-input-no');
    if (this.props.textArea) {
      return (
        <textarea
          className={classNameInput}
          disabled={this.props.disabled}
          value={this.state.nameForShow || this.props.value || ''}
          onChange={this.inputChange}
          wrap={this.props.textAreaFormat}
          placeholder={this.$t('common.please.enter')}
        />
      );
    } else {
      return (
        <input
          className={classNameInput}
          disabled={this.props.disabled}
          value={this.state.nameForShow || this.props.value || ''}
          onChange={this.inputChange}
          placeholder={this.$t('common.please.enter')}
        />
      );
    }
  }
  //渲染入口
  render() {
    let classNameWrap = this.props.disabled
      ? 'language-input-d-wrap disabled-class'
      : 'language-input-d-wrap';
    if (this.props.textArea) {
      classNameWrap = this.props.disabled
        ? 'language-input-d-wrap-textarea disabled-class'
        : 'language-input-d-wrap-textarea';
    }
    console.log(this.props)
    if((!this.state.first||this.props.validateStatus)&&this.props.value===''){
      classNameWrap = 'language-input-noValue'
    }

    return (
      <div className="language-input-wrap">
        <div className={classNameWrap} style={{ width: this.props.width }}>
          <div className="language-input-image-wrap" onClick={this.languageShow}>
            <img className="language-grey-icon" src={languageGrey} />
            <img className="language-blue-icon" src={language} />
          </div>
          <div className="language-input-wrap">{this.renderInp()}</div>
          <Modal
            width={600}
            className="language-input-modal"
            title={this.$t('lang-inp.lang-setting')}
            closable={false}
            visible={this.state.visible}
            footer={[
              <Button key="back" onClick={this.handleCancel}>
                {/*取消*/}
                {this.$t('common.cancel')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={this.state.stopConfirm}
                onClick={this.handleOk}
              >
                {/*确定*/}
                {this.$t('common.ok')}
              </Button>,
            ]}
          >
            <div className="language-input-alert-wrap">
              <div className="language-input-body">
                {this.renderLangList(this.state.i18nNameForShow)}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

LanguageInput.propTypes = {
  disabled: PropTypes.bool, //是否禁用,true代表禁用
  width: PropTypes.any, //输入框宽度
  name: PropTypes.string, //直接绑定多语言实属性
  i18nName: PropTypes.array, //绑定的i18n对象，如果没有会初始化
  nameChange: PropTypes.func, //监控输入绑定的字段
  isEdit: PropTypes.any, //是否是编辑，有值就是编辑：可以传id；undefined，null 空字符串等都默认为false，将会创建；
  value: PropTypes.string, //默认显示值
  mainLanguageIsRequired: PropTypes.bool, //主语言是否必填,默认必填
  inpRule: PropTypes.array, //中英文输入规则
  textArea: PropTypes.bool, //是否显示文本域
  textAreaFormat: PropTypes.string, //是否存换行符，默认不存soft或者hard
  origin: PropTypes.any, //源数据
  validateStatus: PropTypes.bool, //校验状态,需要和表单的校验方法结合使用
};

LanguageInput.defaultProps = {
  width: '100%',
  disabled: false,
  value: '',
  mainLanguageIsRequired: true,
  textArea: false,
  textAreaFormat: 'soft',
  validateStatus: false
};
//当是文本域的时候，如果样式不够用，可以自己通过父级指定样式
// language-input-d-wrap-textarea
// language-input-wrap

// 必须是这种数据结构,长度限制要一致
// inpRule
// [
//   {
//     length: 12,
//     language: "zh_cn"
//   },
//   {
//     length: 12,
//     language: "en"
//   }
// ]

function mapStateToProps(state) {
  return {
    languageList: state.languages.languageList,
    language: state.languages.languages,
    user: state.user.currentUser,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(LanguageInput);
