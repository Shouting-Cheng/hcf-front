/**
 * Created by wangjiakun on 2018/05/30 0045.
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { getApprovelHistory } from 'utils/extend';
import { DatePicker, message, InputNumber, Form, Row, Col } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

import config from 'config';
import travelUtil from 'containers/request/travel-request/travelUtil';
import moment from 'moment';

class ExpectStopDate extends React.Component {
  value = {}; //是个moment对象,初始化使用
  initCloseDate = false; //是否初始化自动停用日期
  constructor(props) {
    super(props);
    this.state = {
      isSetCloseDate: false,
      closeDate: '',
      haveDate: true, //是否配置日期  默认配置了
    };
  }

  componentDidMount() {
    this.setIsShowCloseDate();
  }

  componentWillReceiveProps(nextProps) {
    this.setIsShowCloseDate();
  }

  /**
   * 设置预计停用日期
   */
  setStopDate = () => {
    const { callFun } = this.props;
    if (this.state.isSetCloseDate) {
      callFun(true, this.state.closeDate);
    }
  };

  /**
   * 初始化预计停用日期
   */
  setIsShowCloseDate = () => {
    const { applicationData } = this.props.copyValue;
    let isHaveEnd = false; //是否配置了结束 日期
    let isHaveStart = false; //是否配置了结束 日期
    let isSetCloseDate = false; //是否是设置了自动停用
    let closeDays = 0; //自动停用日期天数
    let closeDate = ''; //自动停用日期
    if (applicationData && !this.initCloseDate) {
      this.initCloseDate = true;
      if (applicationData.custFormValues) {
        //有该值编辑
        let end = travelUtil.getFormHeadValue(applicationData.custFormValues, 'end_date');
        let start = travelUtil.getFormHeadValue(applicationData.custFormValues, 'start_date');
        if (end) {
          isHaveEnd = true;
        }
        if (start) {
          isHaveStart = true;
        }
        if (applicationData.closeEnabled) {
          closeDate = moment(applicationData.closeDate);
          isSetCloseDate = true;
        }
      } else {
        //新建
        applicationData.customFormFields.map(item => {
          if (item.messageKey === 'end_date') {
            isHaveEnd = true;
          }
          if (item.messageKey === 'start_date') {
            isHaveStart = true;
          }
        });
        if (applicationData.customFormProperties.enabled === 1) {
          isSetCloseDate = true;
          closeDays = applicationData.customFormProperties.closeDay;
          closeDate = moment(travelUtil.getDefaultDate(closeDays));
        }
      }
      this.setState(
        {
          isSetCloseDate: isSetCloseDate,
          closeDate: closeDate,
          haveDate: isHaveEnd || isHaveStart,
        },
        () => {
          this.setStopDate();
        }
      );
    }
  };

  render() {
    const { haveDate, isSetCloseDate, closeDate } = this.state;
    return (
      !haveDate &&
      isSetCloseDate && (
        <Row>
          <Col span={6} style={{ paddingLeft: '5.7%', marginBottom: 36, color: '#272727' }}>
            {this.$t('itinerary.form.component.stop.date') /*预计停用日期*/}:
          </Col>
          <Col span={12}>
            <DatePicker disabled={true} value={closeDate} format="YYYY-MM-DD" />
          </Col>
        </Row>
      )
    );
  }
}

ExpectStopDate.propTypes = {
  copyValue: PropTypes.array,
  callFun: PropTypes.func,
};

function mapStateToProps(state) {
  return {};
}
const wrappedExpectStopDate = Form.create()(ExpectStopDate);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedExpectStopDate);
