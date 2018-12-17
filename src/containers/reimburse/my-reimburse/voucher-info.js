import React from 'react';
import { Row, Col, message } from 'antd';
import Table from 'widget/table'
import { connect } from 'react-redux';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';
import moment from 'moment'
class VoucherInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountColumns: [
        { title: '序号', dataIndex: "index", width: '8%'},
        { title: '行说明', dataIndex: 'lineDescription' },
        { title: '凭证日期', dataIndex: 'accountingDate', render: (value, record) => moment(value).format('YYYY-MM-DD') },
        { title: '公司', dataIndex: 'companyName' },
        { title: '责任中心', dataIndex: 'costCenterName' },
        { title: '科目', dataIndex: 'accountCode' },
        { title: '币种', dataIndex: 'currencyCode' },
        { title: '原币借方', dataIndex: 'enteredAmountDr', render: this.filterMoney },
        { title: '原币贷方', dataIndex: 'enteredAmountCr', render: this.filterMoney },
        { title: '本币借方', dataIndex: 'functionalAmountDr', render: this.filterMoney },
        { title: '本币贷方', dataIndex: 'functionalAmountCr', render: this.filterMoney },

      ],
      writeOffColumns: [
        { title: '单据编号', dataIndex: "businessCode", width: '8%' },
        { title: '行说明', dataIndex: 'lineDescription' },
        { title: '凭证日期', dataIndex: 'accountingDate', render: (value, record) => moment(value).format('YYYY-MM-DD') },
        { title: '公司', dataIndex: 'companyName' },
        { title: '责任中心', dataIndex: 'costCenterName' },
        { title: '科目', dataIndex: 'accountCode' },
        { title: '币种', dataIndex: 'currencyCode' },
        { title: '原币借方', dataIndex: 'enteredAmountDr', render: this.filterMoney },
        { title: '原币贷方', dataIndex: 'enteredAmountCr', render: this.filterMoney },
        { title: '本币借方', dataIndex: 'functionalAmountDr', render: this.filterMoney },
        { title: '本币贷方', dataIndex: 'functionalAmountCr', render: this.filterMoney },

      ],
      paymentColumns: [
        { title: '序号', dataIndex: "index", width: '8%' },
        { title: '行说明', dataIndex: 'lineDescription' },
        { title: '凭证日期', dataIndex: 'accountingDate', render: (value, record) => moment(value).format('YYYY-MM-DD') },
        { title: '公司', dataIndex: 'companyName' },
        { title: '责任中心', dataIndex: 'costCenterName' },
        { title: '科目', dataIndex: 'accountCode' },
        { title: '币种', dataIndex: 'currencyCode' },
        { title: '原币借方', dataIndex: 'enteredAmountDr', render: this.filterMoney },
        { title: '原币贷方', dataIndex: 'enteredAmountCr', render: this.filterMoney },
        { title: '本币借方', dataIndex: 'functionalAmountDr', render: this.filterMoney },
        { title: '本币贷方', dataIndex: 'functionalAmountCr', render: this.filterMoney },
      ],
      expReverseColumns: [
        { title: '序号', dataIndex: "index", width: '8%' },
        { title: '行说明', dataIndex: 'lineDescription' },
        { title: '凭证日期', dataIndex: 'accountingDate', render: (value, record) => moment(value).format('YYYY-MM-DD') },
        { title: '公司', dataIndex: 'companyName' },
        { title: '责任中心', dataIndex: 'costCenterName' },
        { title: '科目', dataIndex: 'accountCode' },
        { title: '币种', dataIndex: 'currencyCode' },
        { title: '原币借方', dataIndex: 'enteredAmountDr', render: this.filterMoney },
        { title: '原币贷方', dataIndex: 'enteredAmountCr', render: this.filterMoney },
        { title: '本币借方', dataIndex: 'functionalAmountDr', render: this.filterMoney },
        { title: '本币贷方', dataIndex: 'functionalAmountCr', render: this.filterMoney },
      ],
      transactionNumber: this.props.voucherParams.businessCode,
      tenantId: this.props.company.tenantId,
      accountData: [],
      cshWriteOfftData: [],
      paymentData: [],
      expReverseData: [],
      scrollX: 0,
    };
  };
  componentDidMount() {
    this.setVoucherBasicField(this.props.company.setOfBooksId);
    this.getAccountInfo();
    this.getCshWriteOffInfo();
    this.getPaymentInfo();
    this.getExpReverseInfo();

  }
  //设置初始化凭证信息列
  setVoucherBasicField = (setOfBooksId) => {
    let x = 1800;
    this.setState({
      scrollX: x
    }, () => {
      //设置科目段信息
      reimburseService.getAccountingSegment(setOfBooksId).then(res => {
        let accountSegmentColumns = this.state.accountColumns;
        let writeOffColumns = this.state.writeOffColumns;
        let expReverseColumns = this.state.expReverseColumns;
        let paymentColumns = this.state.paymentColumns;
        let xSegment = this.state.scrollX;
        let resData = res.data;
        resData.map(c => {
          accountSegmentColumns.push({
            title: c.segmentName,
            dataIndex: c.segmentClassField,
            width: 130,
            tempColumn: true,
          });
          expReverseColumns.push({
            title: c.segmentName,
            dataIndex: c.segmentClassField,
            width: 130,
            tempColumn: true,
          });
          writeOffColumns
        });
        resData.filter(obj => obj.segmentName !== '成本中心段').map(c => {
          writeOffColumns.push({
            title: c.segmentName,
            dataIndex: c.segmentClassField,
            width: 130,
            tempColumn: true,
          });
          paymentColumns.push({
            title: c.segmentName,
            dataIndex: c.segmentClassField,
            width: 130,
            tempColumn: true,
          })
        })
        this.setState({
          accountColumns: accountSegmentColumns,
          expReverseColumns,
          writeOffColumns,
          paymentColumns,
          scrollX: xSegment + (res.data.length) * 130
        })
      })
    })
  }
  //获取费用凭证信息数据
  getAccountInfo = () => {
    const { tenantId, transactionNumber } = this.state;
    reimburseService.getVoucherInfo(tenantId, 'EXP_REPORT', transactionNumber).then(res => {
      if (res.status === 200) {
        this.setState({
          accountData: res.data
        })
      }
    }).catch(e => {
      message.error("获取费用凭证信息失败!")
    })
  }
  //获取取核销凭证信息数据
  getCshWriteOffInfo = () => {
    const { tenantId, transactionNumber } = this.state;
    reimburseService.getVoucherInfo(tenantId, 'CSH_WRITE_OFF', transactionNumber).then(res => {
      if (res.status === 200) {
        this.setState({
          cshWriteOfftData: res.data
        })
      }

    }).catch(e => {
      message.error("获取核销凭证信息失败!")
    })
  }
  //获取支付凭证信息数据
  getPaymentInfo = () => {
    const { tenantId, transactionNumber } = this.state;
    reimburseService.getVoucherInfo(tenantId, 'CSH_PAYMENT', transactionNumber).then(res => {
      if (res.status === 200) {
        this.setState({
          paymentData: res.data
        })
      }
    }).catch(e => {
      message.error("获取支付凭证信息失败!")
    })
  }
  //获取费用反冲信息数据
  getExpReverseInfo = () => {
    const { tenantId, transactionNumber } = this.state;
    reimburseService.getVoucherInfo(tenantId, 'EXP_REVERSE', transactionNumber).then(res => {
      if (res.status === 200) {
        this.setState({
          expReverseData: res.data
        })
      }
    }).catch(e => {
      message.error("获取费用反冲信息失败!")
    })

  }
  render() {
    const { accountColumns, writeOffColumns, paymentColumns, expReverseColumns, accountData, cshWriteOfftData, paymentData, expReverseData, scrollX } = this.state
    let voucherList = (
      <div>
        <h3 className="header-title">费用凭证</h3>
        <Row>
          <Col>
            <Table
              size='middle'
              bordered
              columns={accountColumns}
              dataSource={accountData}
              scroll={{ x: scrollX, y: accountData.length === 0 ? false : 200 }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: accountData.length === 0 ? 20 : -30 }}></div>
        <h3 className="header-title">核销凭证</h3>
        <Row>
          <Col>
            <Table
              size='middle'
              bordered
              columns={writeOffColumns}
              dataSource={cshWriteOfftData}
              scroll={{ x: scrollX, y: cshWriteOfftData.length === 0 ? false : 200 }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: cshWriteOfftData.length === 0 ? 20 : -30 }}></div>
        <h3 className="header-title">支付凭证</h3>
        <Row>
          <Col>
            <Table
              size='middle'
              bordered
              columns={paymentColumns}
              dataSource={paymentData}
              scroll={{ x: scrollX, y: paymentData.length === 0 ? false : 200 }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: paymentData.length === 0 ? 20 : -30 }}></div>
        <h3 className="header-title">费用反冲凭证</h3>
        <Row>
          <Col>
            <Table
              size='middle'
              bordered
              columns={expReverseColumns}
              dataSource={expReverseData}
              scroll={{ x: scrollX, y: expReverseData.length === 0 ? false : 200 }}
            />
          </Col>
        </Row>


      </div>
    )
    return (
      <div>
        {voucherList}
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    company: state.login.company,
  }

}

export default connect(mapStateToProps, null, null, { withRef: true })(VoucherInfo)
