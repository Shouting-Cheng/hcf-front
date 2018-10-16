import {messages} from "share/common";
/**
 * 关联申请单
 */
import React from 'react'
import { connect } from 'react-redux'
import config from 'config'
import { Form, Popover } from 'antd'
const FormItem = Form.Item;

import moment from 'moment'
import Chooser from 'components/chooser'
import requestService from 'containers/request/request.service'

class RelatedApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorItem: {
        title: messages('chooser.data.my.relativeApplication')/*'请选择关联的申请单'*/,
        url: `${config.baseUrl}/api/loan/reference/my/application?formOID=${this.props.formOID}&applicantOID=${this.props.applicantOID}&loanApplicationOID=${this.props.applicationOID}`,
        searchForm: [{type: 'input', id: 'keyword', label: `${messages('common.applicant')}/${messages('chooser.data.my.application.name')}/${messages('common.matter')}`}/*申请人/参与人姓名/事由*/],
        columns: [
          {title: messages('contract.sign.date')/*提交时间*/, dataIndex: 'submittedDate', render: value => moment(value).format('YYYY-MM-DD')},
          {title: messages('common.matter')/*事由*/, dataIndex: 'title'},
          {title: messages('bookingManagement.businessCode')/*'申请单号'*/, dataIndex: 'businessCode'},
          {title: messages('chooser.data.my.relevantMemeber')/*'相关人员'*/, dataIndex: 'applicationParticipants', render: (value, record) => {
            let participants = [record.applicantName];
            value.map(item => {
              item.participantOID !== record.applicantOID && participants.push(item.fullName)
            });
            return <Popover content={participants.join(', ')}>{participants.join(', ')}</Popover>
          }}
        ],
        key: 'businessCode'
      },
      listExtraParams: {
        "withTravelApplication": true,
        "withExpenseApplication": true,
        "withBookingApplication": false,
        "withLoanApplication": false,
        "withUserInfo": true,
        "withParticipant": true,
        "withCustomFormValue": true
      },
      defaultRelativeApplication: undefined, //默认关联申请单
      visible: false, //是否显示关联申请单
    }
  }

  componentDidMount() {
    this.handleApplicationShow()
  }

  //是否显示关联申请单
  handleApplicationShow = () => {
    const { formInfo } = this.props;
    let relativeApplicationProperties = {};
    if (formInfo.customFormPropertyMap && formInfo.customFormPropertyMap['loan.application.configuration']) {
      relativeApplicationProperties = JSON.parse(formInfo.customFormPropertyMap['loan.application.configuration']);
      //可关联的申请单范围, 1001费用申请单, 1002差旅申请单, 1003费用申请单或者差旅申请单
      if (relativeApplicationProperties.applicationType === '1001' ||
        relativeApplicationProperties.applicationType === '1002' ||
        relativeApplicationProperties.applicationType === '1003') {
        this.setState({ visible: true },() => {
          !this.props.info.applicationOID && this.getDefaultRelativeApplication()
        })
      }
    }
  };

  //获取默认关联申请单
  getDefaultRelativeApplication = () => {
    requestService.getLoanDefaultRelativeApplication(this.props.formOID).then(res => {
      this.setState({ defaultRelativeApplication: res.data })
    })
  };

  handleChange = (value) => {
    this.props.changeHandle(value)
  };

  render() {
    const { formInfo, info } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectorItem, listExtraParams, defaultRelativeApplication, visible } = this.state;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14, offset: 1},
    };

    //初始值
    let initialValue = undefined;
    if (info.applicationOID && info.referenceApplication) {
      let referenceInfo = info.referenceApplication;
      initialValue = [{businessCode: referenceInfo.businessCode, applicationOID: referenceInfo.applicationOID}]
    } else if (!info.applicationOID && defaultRelativeApplication) {
      initialValue = [{businessCode: defaultRelativeApplication.businessCode, applicationOID: defaultRelativeApplication.applicationOID}]
    }

    return (
      <div className="related-application">
        {visible && (
          <FormItem {...formItemLayout} label={messages('request.edit.related.application')/*关联申请单*/} key='0'>
            {getFieldDecorator('related_application', {
              rules: [{
                required: formInfo.customFormPropertyMap && JSON.parse(formInfo.customFormPropertyMap['loan.application.configuration'] || '{}').isReference,
                message: messages('common.please.select')
              }],
              initialValue: initialValue
            })(
              <Chooser selectorItem={selectorItem}
                       listExtraParams={listExtraParams}
                       valueKey="applicationOID"
                       labelKey="businessCode"
                       method="post"
                       onChange={this.handleChange}
                       single/>
            )}
          </FormItem>
        )}
      </div>
    )
  }
}

RelatedApplication.propTypes = {
  formOID: React.PropTypes.string.isRequired,
  formInfo: React.PropTypes.object.isRequired,
  info: React.PropTypes.object,
  applicantOID: React.PropTypes.string,
  applicationOID: React.PropTypes.string,
  changeHandle: React.PropTypes.func,
};

RelatedApplication.defaultProps = {
  info: {},
  applicationOID: ''
};

function mapStateToProps(state) {
  return { }
}

const wrappedNewDestination = Form.create()(RelatedApplication);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewDestination)
