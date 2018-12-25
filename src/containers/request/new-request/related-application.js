/**
 * 关联申请单
 */
import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { Form, Popover } from 'antd';
const FormItem = Form.Item;
import PropTypes from 'prop-types';

import moment from 'moment';
import Chooser from 'widget/chooser';
import requestService from 'containers/request/request.service';

class RelatedApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorItem: {
        title: this.$t('chooser.data.my.relativeApplication') /*'请选择关联的申请单'*/,
        url: `${config.baseUrl}/api/loan/reference/my/application?formOid=${
          this.props.formOid
        }&applicantOid=${this.props.applicantOid}&loanApplicationOid=${this.props.applicationOid}`,
        searchForm: [
          {
            type: 'input',
            id: 'keyword',
            label: `${this.$t('common.applicant')}/${this.$t(
              'chooser.data.my.application.name'
            )}/${this.$t('common.matter')}`,
          } /*申请人/参与人姓名/事由*/,
        ],
        columns: [
          {
            title: this.$t('contract.sign.date') /*提交时间*/,
            dataIndex: 'submittedDate',
            render: value => moment(value).format('YYYY-MM-DD'),
          },
          { title: this.$t('common.matter') /*事由*/, dataIndex: 'title' },
          {
            title: this.$t('bookingManagement.businessCode') /*'申请单号'*/,
            dataIndex: 'businessCode',
          },
          {
            title: this.$t('chooser.data.my.relevantMemeber') /*'相关人员'*/,
            dataIndex: 'applicationParticipants',
            render: (value, record) => {
              let participants = [record.applicantName];
              value.map(item => {
                item.participantOid !== record.applicantOid && participants.push(item.fullName);
              });
              return <Popover content={participants.join(', ')}>{participants.join(', ')}</Popover>;
            },
          },
        ],
        key: 'businessCode',
      },
      listExtraParams: {
        withTravelApplication: true,
        withExpenseApplication: true,
        withBookingApplication: false,
        withLoanApplication: false,
        withUserInfo: true,
        withParticipant: true,
        withCustomFormValue: true,
      },
      defaultRelativeApplication: undefined, //默认关联申请单
      visible: false, //是否显示关联申请单
    };
  }

  componentDidMount() {
    this.handleApplicationShow();
  }

  //是否显示关联申请单
  handleApplicationShow = () => {
    const { formInfo } = this.props;
    let relativeApplicationProperties = {};
    if (
      formInfo.customFormPropertyMap &&
      formInfo.customFormPropertyMap['loan.application.configuration']
    ) {
      relativeApplicationProperties = JSON.parse(
        formInfo.customFormPropertyMap['loan.application.configuration']
      );
      //可关联的申请单范围, 1001费用申请单, 1002差旅申请单, 1003费用申请单或者差旅申请单
      if (
        relativeApplicationProperties.applicationType === '1001' ||
        relativeApplicationProperties.applicationType === '1002' ||
        relativeApplicationProperties.applicationType === '1003'
      ) {
        this.setState({ visible: true }, () => {
          !this.props.info.applicationOid && this.getDefaultRelativeApplication();
        });
      }
    }
  };

  //获取默认关联申请单
  getDefaultRelativeApplication = () => {
    requestService.getLoanDefaultRelativeApplication(this.props.formOid).then(res => {
      this.setState({ defaultRelativeApplication: res.data });
    });
  };

  handleChange = value => {
    this.props.changeHandle(value);
  };

  render() {
    const { formInfo, info } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectorItem, listExtraParams, defaultRelativeApplication, visible } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };

    //初始值
    let initialValue = undefined;
    if (info.applicationOid && info.referenceApplication) {
      let referenceInfo = info.referenceApplication;
      initialValue = [
        { businessCode: referenceInfo.businessCode, applicationOid: referenceInfo.applicationOid },
      ];
    } else if (!info.applicationOid && defaultRelativeApplication) {
      initialValue = [
        {
          businessCode: defaultRelativeApplication.businessCode,
          applicationOid: defaultRelativeApplication.applicationOid,
        },
      ];
    }

    return (
      <div className="related-application">
        {visible && (
          <FormItem
            {...formItemLayout}
            label={this.$t('request.edit.related.application') /*关联申请单*/}
            key="0"
          >
            {getFieldDecorator('related_application', {
              rules: [
                {
                  required:
                    formInfo.customFormPropertyMap &&
                    JSON.parse(
                      formInfo.customFormPropertyMap['loan.application.configuration'] || '{}'
                    ).isReference,
                  message: this.$t('common.please.select'),
                },
              ],
              initialValue: initialValue,
            })(
              <Chooser
                selectorItem={selectorItem}
                listExtraParams={listExtraParams}
                valueKey="applicationOid"
                labelKey="businessCode"
                method="post"
                onChange={this.handleChange}
                single
              />
            )}
          </FormItem>
        )}
      </div>
    );
  }
}

RelatedApplication.propTypes = {
  formOid: PropTypes.string.isRequired,
  formInfo: PropTypes.object.isRequired,
  info: PropTypes.object,
  applicantOid: PropTypes.string,
  applicationOid: PropTypes.string,
  changeHandle: PropTypes.func,
};

RelatedApplication.defaultProps = {
  info: {},
  applicationOid: '',
};

function mapStateToProps(state) {
  return {};
}

const wrappedNewDestination = Form.create()(RelatedApplication);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewDestination);
