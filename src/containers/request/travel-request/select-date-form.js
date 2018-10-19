/**
 * Created by wangjiakun on 2018/05/18 0028.
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { getApprovelHistory } from 'utils/extend';
import { DatePicker, message, InputNumber, Form, TimePicker } from 'antd';
const FormItem = Form.Item;
import travelUtil from 'containers/request/travel-request/travelUtil';
import moment from 'moment';

class SelectDateForm extends React.Component {
  value = {}; //是个moment对象,初始化使用
  dateValue = ''; //承载要返回的时间字符串 '2018-09-02T12:22:45Z' 格式
  timeMoment = {}; //最新时间 更新时间使用
  initCloseDate = false; //是否初始化自动停用日期
  constructor(props) {
    super(props);
    this.state = {
      custFormValue: [], //来自表单的表单配置项的值
      date: null, //日期
      isShowTime: false, //是否显示时间选择框
      isEdit: false,
      isSetCloseDate: false,
      closeDate: '',
      isHaveEnd: false,
      closeDays: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value instanceof moment) {
      this.value = nextProps.value;
      if (this.state.isHaveEnd && this.props.field.messageKey === 'end_date') {
        this.setStopDate(nextProps.value);
      } else if (!this.state.isHaveEnd && this.props.field.messageKey === 'start_date') {
        this.setStopDate(nextProps.value);
      }
      this.resetDateTime();
    }
    this.setIsShowCloseDate();
  }

  componentDidMount() {
    let value = this.props.value ? this.props.value : '';
    let fieldConstraint = JSON.parse(
      this.props.field.fieldConstraint ? this.props.field.fieldConstraint : '{}'
    );
    this.value = value ? value : '';
    if (fieldConstraint.enableTime) {
      if (fieldConstraint.defaultTime && !value) {
        this.value = moment(fieldConstraint.defaultTime);
        this.onChange();
      }
      this.setState({ isShowTime: true });
    }
    this.resetDateTime();
  }

  /**
   * 重设显示的时间
   */
  resetDateTime = () => {
    // if(this.value instanceof moment){
    if (typeof this.value == 'object') {
      this.value.local();
      this.setState({ date: this.value });
    }
  };

  /**
   * 自定义表单组件必须方法，用来回传给表单value值
   * 回传的值为 this.dateValue
   */
  onChange = () => {
    const onChange = this.props.onChange;
    if (this.state.isShowTime) {
      this.dateValue = this.value.utc().format();
    } else {
      this.dateValue = this.value.local().format('YYYY-MM-DD');
    }
    if (onChange) {
      onChange(this.dateValue);
    }
    this.value.local();
  };

  /**
   * 监听日期选择器变化
   * @param dateMoment 日期moment对象
   */
  onDateChange = dateMoment => {
    this.value = dateMoment;
    this.resetDateTime();
    if (this.state.isHaveEnd && this.props.field.messageKey === 'end_date') {
      this.setStopDate(dateMoment);
    } else if (!this.state.isHaveEnd && this.props.field.messageKey === 'start_date') {
      this.setStopDate(dateMoment);
    }
    this.onChange();
  };

  /**
   * 监听时间选择器变化
   * @param timeMoment 时间moment对象
   */
  onTimeChange = timeMoment => {
    if (!timeMoment) {
      return;
    }
    this.value = timeMoment;
    this.timeMoment = timeMoment;
    this.resetDateTime();
  };

  /**
   * 选择时间弹框是否打开
   * @param value  false关闭，true 打开
   */
  onOpenChange = isOpen => {
    if (!isOpen) {
      this.onChange();
    }
  };

  /**
   * 设置预计停用日期
   * @param dateMoment 当前结束日期moment对象
   */
  setStopDate = dateMoment => {
    const { callFun } = this.props;
    let closeDate = moment(
      travelUtil.getAfterDate(this.state.closeDays, dateMoment.utc().format('YYYY-MM-DD'))
    );
    closeDate.local();
    this.setState({
      closeDate: closeDate,
    });
    if (this.state.isSetCloseDate) {
      callFun(true, closeDate.utc().format());
    }
    closeDate.local();
  };

  /**
   * 初始化预计停用日期
   */
  setIsShowCloseDate = () => {
    let applicationData = null;
    if (this.props.copyValue) {
      applicationData = this.props.copyValue.applicationData;
    }
    let isHaveEnd = false; //是否配置了结束 日期
    let isEdit = false; //是否是编辑状态
    let isSetCloseDate = false; //是否是设置了自动停用
    let closeDays = 0; //自动停用日期天数
    let closeDate = ''; //自动停用日期
    if (applicationData && !this.initCloseDate) {
      this.initCloseDate = true;
      if (applicationData.custFormValues) {
        //有该值编辑
        isEdit = true;
        let end = travelUtil.getFormHeadValue(applicationData.custFormValues, 'end_date');
        if (end) {
          isHaveEnd = true;
        }
        if (applicationData.closeEnabled) {
          closeDate = moment(applicationData.closeDate);
          closeDays = applicationData.customFormProperties.closeDay;
          isSetCloseDate = true;
        }
      } else {
        //新建
        applicationData.customFormFields.map(item => {
          if (item.messageKey === 'end_date') {
            isHaveEnd = true;
          }
        });
        if (applicationData.customFormProperties.enabled === 1) {
          isSetCloseDate = true;
          closeDays = applicationData.customFormProperties.closeDay;
          if (!isHaveEnd) {
            //没有配置结束日期
            closeDate = moment(travelUtil.getDefaultDate(closeDays));
          }
        }
      }
      this.setState({
        isEdit: isEdit,
        isSetCloseDate: isSetCloseDate,
        closeDate: closeDate,
        isHaveEnd: isHaveEnd,
        closeDays: closeDays,
      });
    }
  };

  render() {
    const { date, isShowTime, isSetCloseDate, closeDate, isHaveEnd } = this.state;
    const { field } = this.props;
    const disableDate = field.messageKey === 'start_date' ? field.endDate : field.startDate;
    const funName = field.messageKey === 'start_date' ? 'disabledDateStart' : 'disabledDateEnd';
    return (
      <div style={{ width: '150%' }}>
        <DatePicker
          value={date}
          onChange={d => this.onDateChange(d)}
          disabledDate={c => travelUtil[funName](c, disableDate)}
        />&nbsp;&nbsp;
        {isShowTime && (
          <TimePicker
            format="HH:mm"
            value={date}
            clearText={'时间不可为空'}
            onChange={this.onTimeChange}
            onOpenChange={this.onOpenChange}
          />
        )}
        {isHaveEnd &&
          field.messageKey === 'end_date' &&
          isSetCloseDate && (
            <span>
              &nbsp;&nbsp;{this.$t('itinerary.form.component.stop.date') /*预计停用日期*/}:{' '}
              <DatePicker
                style={{ width: '20%' }}
                disabled={true}
                value={closeDate}
                format="YYYY-MM-DD"
              />
            </span>
          )}
        {!isHaveEnd &&
          field.messageKey === 'start_date' &&
          isSetCloseDate && (
            <span>
              &nbsp;&nbsp;{this.$t('itinerary.form.component.stop.date') /*预计停用日期*/}:{' '}
              <DatePicker
                style={{ width: '20%' }}
                disabled={true}
                value={closeDate}
                format="YYYY-MM-DD"
              />
            </span>
          )}
      </div>
    );
  }
}

SelectDateForm.propTypes = {
  copyValue: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.moment, PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  callFun: PropTypes.func,
};

function mapStateToProps(state) {
  return {};
}
const wrappedSelectDateForm = Form.create()(SelectDateForm);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedSelectDateForm);
