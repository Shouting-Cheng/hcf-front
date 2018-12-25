import React from 'react';
import { connect } from 'dva';
import { Icon, Switch, Select, Radio, Checkbox } from 'antd';
const Option = Select.Option;
const RadioGroup = Radio.Group;
import LanguageInput from 'widget/Template/language-input/language-input';
import PropTypes from 'prop-types';

class LinkageSwitchItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldName: '',
      fieldNameI18n: [],
      promptInfo: '',
      promptInfoI18n: [],
      customEnumerationOid: '',
      fieldType: 'TEXT',
      required: false,
    };
  }

  componentWillMount() {
    const {
      fieldName,
      promptInfo,
      fieldType,
      fieldNameI18n,
      promptInfoI18n,
      customEnumerationOid,
      required,
    } = this.props.item;

    let tempFieldNameI18n = fieldNameI18n;
    let tempPromptInfoI18n = promptInfoI18n;
    if (!fieldNameI18n) {
      tempFieldNameI18n = [];
      tempPromptInfoI18n = [];
      this.props.languageList.map(language => {
        tempFieldNameI18n.push({
          language: language.code,
          value: '',
        });
        tempPromptInfoI18n.push({
          language: language.code,
          value: '',
        });
      });
    }

    this.setState({
      fieldName,
      promptInfo,
      fieldType,
      fieldNameI18n: tempFieldNameI18n,
      promptInfoI18n: tempPromptInfoI18n,
      customEnumerationOid,
      required,
    });
  }

  handleLanguageInput = (value, i18n, attr) => {
    this.setState(
      {
        [attr]: value,
        [attr + 'I18n']: i18n,
      },
      this.onChange
    );
  };

  handleChangeEnumeration = value => {
    this.setState({ customEnumerationOid: value }, this.onChange);
  };

  handleChangeFieldType = e => {
    let value = e.target.value;
    this.setState(
      {
        fieldType: value,
        customEnumerationOid: value === 'TEXT' ? '' : this.state.customEnumerationOid,
      },
      this.onChange
    );
  };

  handleChangeRequired = e => {
    let value = e.target.checked;
    this.setState({ required: value }, this.onChange);
  };

  onChange = () => {
    const { item } = this.props;
    const {
      fieldName,
      promptInfo,
      fieldType,
      fieldNameI18n,
      promptInfoI18n,
      customEnumerationOid,
      required,
    } = this.state;
    item.fieldName = fieldName;
    item.promptInfo = promptInfo;
    item.fieldType = fieldType;
    item.fieldNameI18n = fieldNameI18n;
    item.promptInfoI18n = promptInfoI18n;
    item.customEnumerationOid = customEnumerationOid;
    item.required = required;
    this.props.onChange(item);
  };

  render() {
    const { enumerations, onDelete } = this.props;
    const {
      fieldName,
      fieldNameI18n,
      promptInfo,
      promptInfoI18n,
      customEnumerationOid,
      fieldType,
      required,
    } = this.state;
    return (
      <div className="linkage-switch-item">
        <Icon type="close" className="delete-item" onClick={onDelete} />
        <div className="form-title">{this.$t('widget.field.linkage.type') /*联动类型*/}</div>
        <div className="radio-area">
          <RadioGroup onChange={this.handleChangeFieldType} value={fieldType}>
            <Radio value="TEXT">{this.$t('widget.field.linkage.input') /*输入*/}</Radio>
            <Radio value="CUSTOM_ENUMERATION">
              {this.$t('widget.field.linkage.choice') /*选择*/}
            </Radio>
          </RadioGroup>
        </div>
        <div className="check-box-area">
          <Checkbox onChange={this.handleChangeRequired} checked={required}>
            {this.$t('widget.field.required')}
          </Checkbox>
        </div>

        {fieldType === 'TEXT' ? null : (
          <div>
            <div className="form-title">{this.$t('widget.select.list')}</div>
            <Select onChange={this.handleChangeEnumeration} value={customEnumerationOid}>
              {enumerations.data.map(item => (
                <Option key={item.customEnumerationOid}>{item.name}</Option>
              ))}
            </Select>
          </div>
        )}
        <div className="form-title">{this.$t('widget.field.linkage.title') /*外部标题*/}</div>
        <LanguageInput
          nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'fieldName')}
          width={'100%'}
          name={fieldName}
          isEdit
          i18nName={fieldNameI18n}
        />
        <div className="form-title">{this.$t('widget.field.linkage.prompt') /*提示文字*/}</div>
        <LanguageInput
          nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'promptInfo')}
          width={'100%'}
          name={promptInfo}
          isEdit
          i18nName={promptInfoI18n}
        />
      </div>
    );
  }
}

LinkageSwitchItem.propTypes = {
  enumerations: PropTypes.object,
  item: PropTypes.object,
  onDelete: PropTypes.func,
  onChange: PropTypes.func,
};

LinkageSwitchItem.defaultProps = {};

function mapStateToProps(state) {
  return {
    languageList: state.login.languageList,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(LinkageSwitchItem);
