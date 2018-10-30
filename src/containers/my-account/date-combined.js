
import React from 'react';
import { DatePicker, Select, Row, Col } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker;
import moment from 'moment'
import PropTypes from 'prop-types'
class DateCombined extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: null, //{startDate: '', endDate: '', duration: 0}
      maxDuration: 0,
      duration: null,
      dateRange: []
    };
  }

  componentWillMount(){
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.value){
      try {
        let valueWillSet = JSON.parse(nextProps.value);
        let maxDuration = moment(valueWillSet.endDate).utc().diff(moment(valueWillSet.startDate).utc(), 'days');
        this.setState({
          value: valueWillSet,
          dateRange: [
            moment(valueWillSet.startDate).utc(),
            moment(valueWillSet.endDate).utc()
          ],
          duration: valueWillSet.duration,
          maxDuration
        })
      } catch(e) {}
    } else {
      this.setState({
        maxDuration: 0,
        value: null,
        dateRange: [],
        duration: null
      })
    }
  }

  onChange = (changedValue) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  onChangeDate = (dates) => {
    if(dates.length === 2){
      let duration = dates[1].diff(dates[0], 'days');
      let value = {
        startDate: dates[0].format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        endDate: dates[1].format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        duration
      };
      this.setState({ dateRange: dates, duration, value, maxDuration: duration });
      this.onChange(JSON.stringify(value))
    } else {
      this.setState({
        maxDuration: 0,
        value: null,
        dateRange: [],
        duration: null
      });
      this.onChange(null)
    }
  };

  onChangeDuration = (duration) => {
    const { dateRange } = this.state;
    let value = {
      startDate: dateRange ? dateRange[0].format('YYYY-MM-DDTHH:mm:ss') + 'Z' : null,
      endDate: dateRange ? dateRange[1].format('YYYY-MM-DDTHH:mm:ss') + 'Z' : null,
      duration
    };
    this.setState({duration, value});
    this.onChange(JSON.stringify(value))
  };

  render() {
    const { duration, dateRange, maxDuration } = this.state;
    const { disabled } = this.props;
    let options = [];
    for(let count = 0; count <= maxDuration; count++){
      options.push(count);
    }
    return (
      <div>
        <RangePicker onChange={this.onChangeDate}
                     value={dateRange}
                     disabled={disabled}
                     placeholder={[this.$t('expense.date.combined.check.in'), this.$t('expense.date.combined.check.out')]}
                     format="YYYY-MM-DD"
                     style={{ width: '100%' }}/>
        <Row gutter={20} style={{ marginTop: 12 }}>
          <Col span={16}>
            <Select value={duration}
                    placeholder={this.$t('common.please.select')}
                    disabled={dateRange.length ===0 || disabled}
                    onChange={this.onChangeDuration} style={{ width: '100%' }}>
              {options.map(item => {
                return <Option key={item} value={item}>{this.$t('expense.date.combined.duration', { number: item })}</Option>
              })}
            </Select>
          </Col>
        </Row>
      </div>
    );
  }
}

DateCombined.PropTypes = {
  onChange: PropTypes.func,  //进行选择后的回调
  value: PropTypes.string,  //值
  disabled: PropTypes.bool  //是否可编辑
};

DateCombined.defaultProps = {
  disabled: false
};

DateCombined.defaultProps = {};

export default DateCombined;
