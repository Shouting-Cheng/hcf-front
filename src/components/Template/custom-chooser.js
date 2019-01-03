import React, { Component } from "react"
import { Radio } from "antd"

import Chooser from "widget/chooser"

const RadioGroup = Radio.Group;

class CustomChooser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAll: true
    }
  }

  radioChange = (e) => {
    let { value = {} } = this.props;
    value.radioValue = e.target.value;
    value.chooserValue = [];
    this.props.onChange && this.props.onChange(value);
  }

  chooserChange = (values) => {
    let { value = {} } = this.props;
    value.chooserValue = values;
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    return (
      <div>
        <RadioGroup onChange={this.radioChange} value={this.props.value ? this.props.value.radioValue : true}>
          <Radio value={true}>全部类型</Radio>
          <Radio value={false}>部分类型</Radio>
        </RadioGroup>
        <Chooser
          type={this.props.type}
          single={!!this.props.single}
          placeholder={this.$t('common.please.select')}
          labelKey={this.props.labelKey}
          valueKey={this.props.valueKey}
          disabled={this.props.value ? this.props.value.radioValue : true}
          onChange={this.chooserChange}
          value={this.props.value ? this.props.value.chooserValue : []}
          listExtraParams={this.props.params}
          showNumber
        />
      </div>
    )
  }
}

export default CustomChooser