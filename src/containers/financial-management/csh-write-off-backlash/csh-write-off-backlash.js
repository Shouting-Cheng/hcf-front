import React, { Component } from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import {
  Divider,
  message,
  Tabs,
  Row,
  Col,
  Icon,
  InputNumber,
  Input,
  Popover,
  Timeline,
  Popconfirm,
} from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
import cshWriteOffBacklashService from 'containers/financial-management/csh-write-off-backlash/csh-write-off-backlash.service';
import EditViewUpload from 'widget/Template/edit-view-upload';
import ViewDetailsModal from 'widget/Template/view-details-modal';
import PrePaymentCommonReadonly from 'containers/pre-payment/my-pre-payment/pre-payment-common-readonly';
class CshWriteOffBacklash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //核销反冲历史
      writeOffReservedHistory: [],
      /**
       * 待核销反冲
       */
      columns1: [
        {
          title: this.$t({ id: 'write.off.backlash.documentNumber' } /**报销单编号*/),
          dataIndex: 'documentNumber',
          width: '130',
          align: 'center',
          render: documentNumber => {
            return (
              <Popover content={documentNumber}>
                <span>{documentNumber}</span>
              </Popover>
            );
          },
        },
        {
          title: '核销反冲日期',
          dataIndex: 'writeOffDate',
          width: '98',
          align: 'center',
          render: writeOffDate => {
            return writeOffDate ? moment(writeOffDate).format('YYYY-MM-DD') : '';
          },
        },
        {
          title: '申请人',
          dataIndex: 'documentApplicantName',
          width: '70',
          align: 'center',
        },
        {
          title: '被核销单据编号',
          dataIndex: 'sourceDocumentNumber',
          width: '154',
          align: 'center',
          render: (sourceDocumentNumber, record, index) => {
            return (
              <Popover content={sourceDocumentNumber}>
                <a onClick={e => this.onSourceDocumentNumberClick(e, record, index)}>
                  {sourceDocumentNumber}
                </a>
              </Popover>
            );
          },
        },
        {
          title: '付款流水号',
          dataIndex: 'billCode',
          width: '154',
          align: 'center',
          render: billCode => {
            return (
              <Popover content={billCode}>
                <span>{billCode}</span>
              </Popover>
            );
          },
        },
        {
          title: '核销金额',
          dataIndex: 'writeOffAmount',
          width: '130',
          align: 'center',
          render: (writeOffAmount, record, index) => {
            return (
              <div>
                <span>{record.currency}&nbsp;</span>
                <span>{this.filterMoney(writeOffAmount, 2, true)}</span>
              </div>
            );
          },
        },
        {
          title: '本次核销反冲金额',
          dataIndex: 'reversedAmount',
          width: '160',
          align: 'center',
          render: (reversedAmount, record, index) => {
            return (
              <div>
                {record.cashWriteOffReverseHistory.length ? (
                  <Popover
                    content={
                      <Timeline>
                        {record.cashWriteOffReverseHistory.map(item => {
                          return (
                            <Timeline.Item key={item.id}>
                              {moment(item.writeOffDate).format('YYYY-MM-DD HH:mm:ss')}
                              &nbsp;&nbsp;{item.createdName}
                              &nbsp;&nbsp;核销反冲 &nbsp;{item.currency}
                              {this.filterMoney(item.reversedAmount, 2, true)}
                            </Timeline.Item>
                          );
                        })}
                      </Timeline>
                    }
                    trigger="hover"
                    title="核销反冲历史"
                  >
                    {record.editReverseAmountVisible === true ? (
                      <Row>
                        <Col span={20}>
                          <span>{record.currency}&nbsp;</span>
                          <InputNumber
                            precision={2}
                            onMouseOut={e => this.onAmountMouseMove(e, record, index)}
                            placeholder="请输入"
                            min="0"
                            defaultValue={reversedAmount}
                            value={reversedAmount}
                            onChange={value => this.onReverseAmountChange(value, record, index)}
                          />
                        </Col>
                        <Col span={4}>
                          &nbsp;<Icon
                            onClick={e => this.onEditReverseAmountClick(e, record, index)}
                            type="edit"
                          />
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        <Col span={20}>
                          <span>
                            {record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}
                          </span>
                        </Col>
                        <Col span={4}>
                          &nbsp;<Icon
                            onClick={e => this.onEditReverseAmountClick(e, record, index)}
                            type="edit"
                          />
                        </Col>
                      </Row>
                    )}
                  </Popover>
                ) : (
                  <div>
                    {record.editReverseAmountVisible === true ? (
                      <Row>
                        <Col span={20}>
                          <span>{record.currency}&nbsp;</span>
                          <InputNumber
                            precision={2}
                            onMouseOut={e => this.onAmountMouseMove(e, record, index)}
                            placeholder="请输入"
                            min="0"
                            defaultValue={reversedAmount}
                            value={reversedAmount}
                            onChange={value => this.onReverseAmountChange(value, record, index)}
                          />
                        </Col>
                        <Col span={4}>
                          &nbsp;<Icon
                            onClick={e => this.onEditReverseAmountClick(e, record, index)}
                            type="edit"
                          />
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        <Col span={20}>
                          <span>
                            {record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}
                          </span>
                        </Col>
                        <Col span={4}>
                          &nbsp;<Icon
                            onClick={e => this.onEditReverseAmountClick(e, record, index)}
                            type="edit"
                          />
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
              </div>
            );
          },
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '150',
          align: 'center',
          render: (remark, record, index) => {
            return (
              <Popover content={remark}>
                {record.editRemarkVisible === true ? (
                  <Row>
                    <Col span={20}>
                      <Input
                        placeholder="请输入"
                        defaultValue={remark}
                        value={remark}
                        onChange={value => this.onRemarkChange(value, record, index)}
                      />
                    </Col>
                    <Col span={4}>
                      &nbsp;<Icon
                        onClick={e => this.onEditRemarkClick(e, record, index)}
                        type="edit"
                      />
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    <Col span={20}>
                      <span>{remark}</span>
                    </Col>
                    <Col span={4}>
                      &nbsp;<Icon
                        onClick={e => this.onEditRemarkClick(e, record, index)}
                        type="edit"
                      />
                    </Col>
                  </Row>
                )}
              </Popover>
            );
          },
        },
        {
          title: '附件',
          dataIndex: 'attachments',
          align: 'center',
          render: (attachments, record, index) => {
            return (
              <a onClick={e => this.onAttachmentClick(e, record, index)}>
                <span>{attachments.length}</span>
              </a>
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '112',
          fixed: 'right',
          align: 'center',
          render: (operation, record, index) => {
            return (
              <Popconfirm
                title="是否确认发起此次核销反冲？"
                okText="确定"
                cancelText="取消"
                onConfirm={e => {
                  this.onOperationClick(e, record, index);
                }}
              >
                <a>发起核销反冲</a>
              </Popconfirm>
            );
          },
        },
      ],
      searchForm1: [
        { type: 'input', id: 'documentNumber', label: '报账单编号', colSpan: '6' },
        {
          type: 'list',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          colSpan: '6',
          id: 'applicantId',
          label: '申请人',
          listType: 'user_budget',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
        },
        { type: 'input', colSpan: '6', id: 'sourceDocumentNumber', label: '被核销单据编号' },
        { type: 'input', colSpan: '6', id: 'billCode', label: '付款流水号' },
        {
          type: 'items',
          colSpan: '6',
          id: 'date',
          items: [
            { type: 'date', id: 'writeOffDateFrom', label: '核销反冲日期从' },
            { type: 'date', id: 'writeOffDateTo', label: '核销反冲日期至' },
          ],
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'amount',
          items: [
            { type: 'input', id: 'writeOffAmountFrom', label: '核销金额从' },
            { type: 'input', id: 'writeOffAmountTo', label: '核销金额至' },
          ],
        },
      ],
      searchParam1: {},
      loading1: true,
      pagination1: {
        showSizeChanger: true,
        showQuickJumper: true,
        current: 1,
        total: 0,
      },
      page1: 0,
      pageSize1: 10,
      data1: [],
      /**
       * 我发起的核销反冲
       */
      columns2: [
        {
          title: '报账单编号',
          dataIndex: 'documentNumber',
          width: '144',
          align: 'center',
          render: documentNumber => {
            return (
              <Popover content={documentNumber}>
                <span>{documentNumber}</span>
              </Popover>
            );
          },
        },
        {
          title: '核销反冲日期',
          dataIndex: 'writeOffDate',
          width: '120',
          align: 'center',
          render: writeOffDate => {
            return moment(writeOffDate).format('YYYY-MM-DD');
          },
        },
        {
          title: '申请人',
          dataIndex: 'documentApplicantName',
          align: 'center',
          width: '70',
        },
        {
          title: '被核销单据编号',
          dataIndex: 'sourceDocumentNumber',
          width: '144',
          align: 'center',
          render: sourceDocumentNumber => {
            return (
              <Popover content={sourceDocumentNumber}>
                <span>{sourceDocumentNumber}</span>
              </Popover>
            );
          },
        },
        {
          title: '付款流水号',
          dataIndex: 'billCode',
          width: '144',
          align: 'center',
          render: billCode => {
            return (
              <Popover content={billCode}>
                <span>{billCode}</span>
              </Popover>
            );
          },
        },
        {
          title: '核销金额',
          dataIndex: 'writeOffAmount',
          width: '150',
          align: 'center',
          render: (writeOffAmount, record, index) => {
            return (
              <div>
                <span>
                  {record.currency}&nbsp;{this.filterMoney(writeOffAmount, 2, true)}
                </span>
              </div>
            );
          },
        },
        {
          title: '本次核销反冲金额',
          dataIndex: 'reversedAmount',
          width: '160',
          align: 'center',
          render: (reversedAmount, record, index) => {
            return record.status === 'N' ? (
              record.editReverseAmountVisibleWait === true ? (
                <Row>
                  <Col span={20}>
                    <span>{record.currency}&nbsp;</span>
                    <InputNumber
                      precision={2}
                      onMouseOut={e => this.onReversedAmountMouseMove(e, record, index)}
                      placeholder="请输入"
                      min="0"
                      value={reversedAmount}
                      onChange={e => this.onUserReversedAmountChange(e, record, index)}
                    />
                  </Col>
                  <Col span={4}>
                    &nbsp;<Icon
                      onClick={e => this.onEditReverseAmountWaitClick(e, record, index)}
                      type="edit"
                    />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col span={20}>
                    <span>
                      {record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}
                    </span>
                  </Col>
                  <Col span={4}>
                    &nbsp;<Icon
                      onClick={e => this.onEditReverseAmountWaitClick(e, record, index)}
                      type="edit"
                    />
                  </Col>
                </Row>
              )
            ) : (
              <div>
                <span>
                  {record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}
                </span>
              </div>
            );
          },
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '150',
          align: 'center',
          render: (remark, record, index) => {
            return record.status === 'N' ? (
              <Popover content={remark}>
                {record.editRemarkVisibleWait === true ? (
                  <Row>
                    <Col span={20}>
                      <Input
                        placeholder="请输入"
                        value={remark}
                        onChange={e => {
                          this.onUserRemarkChange(e, record, index);
                        }}
                      />
                    </Col>
                    <Col span={4}>
                      &nbsp;<Icon
                        onClick={e => this.onEditRemarkWaitClick(e, record, index)}
                        type="edit"
                      />
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    <Col span={20}>
                      <span>{remark}</span>
                    </Col>
                    <Col span={4}>
                      &nbsp;<Icon
                        onClick={e => this.onEditRemarkWaitClick(e, record, index)}
                        type="edit"
                      />
                    </Col>
                  </Row>
                )}
              </Popover>
            ) : (
              <Popover content={remark}>
                <span>{remark}</span>
              </Popover>
            );
          },
        },
        {
          title: '附件',
          dataIndex: 'attachments',
          width: '60',
          align: 'center',
          render: (attachments, record, index) => {
            return (
              <a onClick={e => this.onAttachmentClick(e, record, index)}>
                <span>{attachments.length}</span>
              </a>
            );
          },
        },
        {
          title: '复核状态',
          dataIndex: 'statusDescription',
          align: 'center',
          width: '100',
        },
        {
          title: '复核意见',
          dataIndex: 'approvalOpinions',
          width: '150',
          align: 'center',
          render: approvalOpinions => {
            return (
              <Popover content={approvalOpinions}>
                <span>{approvalOpinions}</span>
              </Popover>
            );
          },
        },
        {
          title: '复核人',
          dataIndex: 'approvalName',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '144',
          fixed: 'right',
          align: 'center',
          render: (operation, record, index) => {
            return (
              <div>
                <Popconfirm
                  title="是否确认作废此次核销反冲？作废后仍可重新发起"
                  okText="确认"
                  cancelText="取消"
                  onConfirm={e => this.onUserCancelClick(e, record)}
                >
                  <a disabled={record.status !== 'N'}>作废</a>
                </Popconfirm>
                <Divider type="vertical" />
                <Popconfirm
                  title="是否确认重新发起此次核销反冲？"
                  okText="确认"
                  cancelText="取消"
                  onConfirm={e => this.onUserReservedAgainClick(e, record, index)}
                >
                  <a disabled={record.status !== 'N'}>重新发起</a>
                </Popconfirm>
              </div>
            );
          },
        },
      ],
      searchForm2: [
        { type: 'input', id: 'documentNumber', label: '报账单编号', colSpan: '6' },
        {
          type: 'select',
          colSpan: '6',
          id: 'status',
          label: '复核状态',
          options: [
            { value: 'N', label: '驳回' },
            { value: 'P', label: '复核中' },
            { value: 'Y', label: '已复核' },
          ],
        },
        { type: 'input', colSpan: '6', id: 'sourceDocumentNumber', label: '被核销单据编号' },
        { type: 'input', colSpan: '6', id: 'billCode', label: '付款流水号' },
        {
          type: 'items',
          colSpan: '6',
          id: 'date',
          items: [
            { type: 'date', id: 'writeOffDateFrom', label: '核销反冲日期从' },
            { type: 'date', id: 'writeOffDateTo', label: '核销反冲日期至' },
          ],
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'amount',
          items: [
            { type: 'input', id: 'writeOffAmountFrom', label: '核销金额从' },
            { type: 'input', id: 'writeOffAmountTo', label: '核销金额至' },
          ],
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'thisAmount',
          items: [
            { type: 'input', id: 'writeOffReverseAmountFrom', label: '本次核销反冲额' },
            { type: 'input', id: 'writeOffReverseAmountTo', label: ':' },
          ],
        },
        {
          type: 'list',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          colSpan: '6',
          id: 'applicantId',
          label: '申请人',
          listType: 'bgtUserOID',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
        },
        {
          type: 'list',
          colSpan: '6',
          id: 'approvalId',
          label: '复核人',
          listType: 'bgtUserOID',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
        },
      ],
      loading2: true,
      pagination2: {
        showSizeChanger: true,
        showQuickJumper: true,
        current: 1,
        total: 0,
      },
      page2: 0,
      pageSize2: 10,
      data2: [],
      searchParam2: {},
      /**
       * 附件
       */
      attachmentVisible: false,
      //当前行数据,目前仅提供给了附件弹窗使用
      nowRecord: {},
      //当前所在行index
      nowIndex: -1,
      //当前data
      nowData: 'data1',
      /**
       * 查看单据详情弹窗
       */
      modalVisible: false,
      modalContent: {},
      modalTitle: '',
      /**
       * tabs面板控制
       */
      tabs: [
        { key: 'backlashRechecking', name: '待核销反冲' }, //待复核
        { key: 'backlashRechecked', name: '我发起的核销反冲' }, //已经复核
      ],
      nowStatus: 'backlashRechecking',
    };
  }
  /**
   * 鼠标移出事件-待核销反冲金额
   */
  onAmountMouseMove = (e, record, index) => {
    let { data1 } = this.state;
    data1[index].reversedAmount = this.filterMoney(record.reversedAmount, 2, true).replace(
      /,/g,
      ''
    );
    this.setState({
      data1,
    });
  };
  /**
   * 鼠标移出事件-我发起的核销反冲金额
   */
  onReversedAmountMouseMove = (e, record, index) => {
    let { data2 } = this.state;
    data2[index].reversedAmount = this.filterMoney(record.reversedAmount, 2, true).replace(
      /,/g,
      ''
    );
    this.setState({
      data2,
    });
  };
  /**
   * 控制行上可编辑列
   */
  //本次核销反冲金额-带核销反冲
  onEditReverseAmountClick = (e, record, index) => {
    let { data1 } = this.state;
    if (!record.editReverseAmountVisible) {
      data1[index].editReverseAmountVisible = true;
    } else {
      data1[index].editReverseAmountVisible = !record.editReverseAmountVisible;
    }
    this.setState({
      data1,
    });
  };
  //备注-待核销反冲
  onEditRemarkClick = (e, record, index) => {
    let { data1 } = this.state;
    if (!record.editRemarkVisible) {
      data1[index].editRemarkVisible = true;
    } else {
      data1[index].editRemarkVisible = !record.editRemarkVisible;
    }
    this.setState({
      data1,
    });
  };
  //本次核销反冲金额-我发起的核销反冲
  onEditReverseAmountWaitClick = (e, record, index) => {
    let { data2 } = this.state;
    if (!record.editReverseAmountVisibleWait) {
      data2[index].editReverseAmountVisibleWait = true;
    } else {
      data2[index].editReverseAmountVisibleWait = !record.editReverseAmountVisibleWait;
    }
    this.setState({
      data2,
    });
  };
  //备注-我发起的核销反冲
  onEditRemarkWaitClick = (e, record, index) => {
    let { data2 } = this.state;
    if (!record.editRemarkVisibleWait) {
      data2[index].editRemarkVisibleWait = true;
    } else {
      data2[index].editRemarkVisibleWait = !record.editRemarkVisibleWait;
    }
    this.setState({
      data2,
    });
  };
  /**
   * 查看单据详情弹窗关闭事件
   */
  onModalCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };
  /**
   * 被核销单据编号-查看单据详情
   */
  onSourceDocumentNumberClick = (e, record, index) => {
    e.preventDefault();
    this.setState({
      modalTitle: '预付款单详情',
      modalVisible: true,
      modalContent: (
        <PrePaymentCommonReadonly
          params={{
            id: record.cashWriteOffReservePrepaymentRequisition.paymentRequisitionHeaderId,
            flag: 'prePayment',
          }}
          id={record.cashWriteOffReservePrepaymentRequisition.paymentRequisitionHeaderId}
          flag="prePayment"
        />
      ),
    });
  };
  /**
   * 附件
   */
  onAttachmentClick = (e, record, index) => {
    e.preventDefault();
    this.setState({
      attachmentVisible: true,
      nowRecord: record,
      nowIndex: index,
    });
  };
  /**
   * 生命周期函数，constructor之后，render之前
   */
  componentWillMount = () => {
    this.getWaitReserveDetail();
    this.getWriteOffUserReservedDetail();
  };
  /**
   * 本次核销反冲金额变化事件
   */
  onReverseAmountChange = (value, record, index) => {
    let { data1 } = this.state;
    data1[index].reversedAmount = value;
    this.setState({
      data1,
    });
  };
  /**
   * 备注变化事件
   */
  onRemarkChange = (value, record, index) => {
    let { data1 } = this.state;
    data1[index].remark = value.target.value;
    this.setState({
      data1,
    });
  };

  /**
   * 发起核销反冲
   */
  onOperationClick = (e, record, index) => {
    e.preventDefault();
    if (!record.reversedAmount) {
      message.error(`发起核销反冲失败：请输入本次核销反冲金额`);
    } else {
      this.setState({
        loading1: true,
      });
      let id = record.id;
      let reversedAmount = record.reversedAmount;
      let remark = record.remark ? record.remark : '';
      let attachmentOid = record.attachmentOid;
      cshWriteOffBacklashService
        .cshWriteOffDoReserved(id, reversedAmount, remark, attachmentOid)
        .then(res => {
          if (res.status === 200) {
            message.success(`发起核销反冲成功`);
            this.getWaitReserveDetail();
            this.getWriteOffUserReservedDetail();
          }
        })
        .catch(e => {
          if (e.response) {
            message.error(`发起核销反冲失败：${e.response.data.message}`);
            this.setState({ loading1: false });
          }
        });
    }
  };
  /**
   * 获取待反冲核销记录
   */
  getWaitReserveDetail = () => {
    let { searchParam1 } = this.state;
    let params = {
      page: this.state.page1,
      size: this.state.pageSize1,
    };
    if (searchParam1.documentNumber) {
      params.documentNumber = searchParam1.documentNumber;
    }
    if (searchParam1.applicantId) {
      params.applicantId = searchParam1.applicantId;
    }
    if (searchParam1.sourceDocumentNumber) {
      params.sourceDocumentNumber = searchParam1.sourceDocumentNumber;
    }
    if (searchParam1.billCode) {
      params.billCode = searchParam1.billCode;
    }
    if (searchParam1.createdDateFrom) {
      params.createdDateFrom = moment(searchParam1.createdDateFrom).format('YYYY-MM-DD');
    }
    if (searchParam1.createdDateTo) {
      params.createdDateTo = moment(searchParam1.createdDateTo).format('YYYY-MM-DD');
    }
    if (searchParam1.writeOffAmountFrom) {
      params.writeOffAmountFrom = searchParam1.writeOffAmountFrom;
    }
    if (searchParam1.writeOffAmountTo) {
      params.writeOffAmountTo = searchParam1.writeOffAmountTo;
    }
    cshWriteOffBacklashService
      .getWriteOffWaitReserveDetail(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            data1: res.data,
            loading1: false,
            pagination1: {
              total: Number(
                res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
              ),
              onChange: this.onChangePaper1,
              onShowSizeChange: this.onShowSizeChange1,
              current: this.state.page1 + 1,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`获取待核销反冲记录失败:${e.response.data.message}`);
        }
      });
  };
  /**
   * 待核销反冲的切换分页
   */
  onChangePaper1 = page => {
    if (page - 1 !== this.state.page1) {
      this.setState(
        {
          page1: page - 1,
          loading1: true,
        },
        () => {
          this.getWaitReserveDetail();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange1 = (current, pageSize) => {
    this.setState(
      {
        loading1: true,
        page1: current - 1,
        pageSize1: pageSize,
      },
      () => {
        this.getWaitReserveDetail();
      }
    );
  };
  /**
   * 待核销反冲搜索按钮
   */
  search1 = param => {
    this.setState(
      {
        loading1: true,
        page1: 0,
        searchParam1: param,
      },
      () => {
        this.getWaitReserveDetail();
      }
    );
  };
  /**
   * 待核销反冲清空按钮
   */
  clear1 = () => {
    this.setState(
      {
        loading1: true,
        page1: 0,
        searchParam1: {},
      },
      () => {
        this.getWaitReserveDetail();
      }
    );
  };
  /*********************************************************************** */
  /**
   * 我发起的核销反冲
   */
  getWriteOffUserReservedDetail = () => {
    let { searchParam2 } = this.state;
    let params = {
      page: this.state.page2,
      size: this.state.pageSize2,
    };
    if (searchParam2.documentNumber) {
      params.documentNumber = searchParam2.documentNumber;
    }
    if (searchParam2.applicantId) {
      params.applicantId = searchParam2.applicantId;
    }
    if (searchParam2.sourceDocumentNumber) {
      params.sourceDocumentNumber = searchParam2.sourceDocumentNumber;
    }
    if (searchParam2.billCode) {
      params.billCode = searchParam2.billCode;
    }
    if (searchParam2.createdDateFrom) {
      params.createdDateFrom = moment(searchParam2.createdDateFrom).format('YYYY-MM-DD');
    }
    if (searchParam2.createdDateTo) {
      params.createdDateTo = moment(searchParam2.createdDateTo).format('YYYY-MM-DD');
    }
    if (searchParam2.writeOffAmountFrom) {
      params.writeOffAmountFrom = searchParam2.writeOffAmountFrom;
    }
    if (searchParam2.writeOffAmountTo) {
      params.writeOffAmountTo = searchParam2.writeOffAmountTo;
    }
    if (searchParam2.status) {
      params.status = searchParam2.status;
    }
    if (searchParam2.approvalId) {
      params.approvalId = searchParam2.approvalId;
    }
    if (searchParam2.writeOffReverseAmountFrom) {
      params.writeOffReverseAmountFrom = searchParam2.writeOffReverseAmountFrom;
    }
    if (searchParam2.writeOffReverseAmountTo) {
      params.writeOffReverseAmountTo = searchParam2.writeOffReverseAmountTo;
    }
    cshWriteOffBacklashService
      .getWriteOffUserReservedDetail(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            data2: res.data,
            loading2: false,
            pagination2: {
              total: Number(
                res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
              ),
              onChange: this.onChangePaper2,
              onShowSizeChange: this.onShowSizeChange2,
              current: this.state.page2 + 1,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`获取我发起的核销反冲记录失败：${e.response.data.message}`);
        }
      });
  };
  /**
   * 切换页签事件
   */
  onChangePaper2 = page => {
    if (page - 1 !== this.state.page2) {
      this.setState(
        {
          page2: page - 1,
          loading2: true,
        },
        () => {
          this.getWriteOffUserReservedDetail();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange2 = (current, pageSize) => {
    this.setState(
      {
        loading2: true,
        page2: current - 1,
        pageSize2: pageSize,
      },
      () => {
        this.getWriteOffUserReservedDetail();
      }
    );
  };
  /**
   * 我发起的核销反冲 本次核销反冲金额变化事件
   */
  onUserReversedAmountChange = (e, record, index) => {
    let { data2 } = this.state;
    data2[index].reversedAmount = e;
    this.setState({
      data2,
    });
  };
  /**
   * 我发起的核销反冲 备注变化事件
   */
  onUserRemarkChange = (e, record, index) => {
    let { data2 } = this.state;
    data2[index].remark = e.target.value;
    this.setState({
      data2,
    });
  };
  /**
   * 作废
   */
  onUserCancelClick = (e, record) => {
    e.preventDefault();
    this.setState({
      loading2: true,
    });
    cshWriteOffBacklashService
      .cshWriteOffDoReservedCancel(record.id)
      .then(res => {
        if (res.status === 200) {
          message.success(`此次核销反冲作废成功`);
          this.getWaitReserveDetail();
          this.getWriteOffUserReservedDetail();
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`此次核销反冲作废失败：${e.response.data.message}`);
          this.setState({
            loading2: false,
          });
        }
      });
  };
  /**
   * 重新发起
   */
  onUserReservedAgainClick = (e, record, index) => {
    e.preventDefault();
    if (!record.reversedAmount) {
      message.warning(`请输入本次核销反冲金额`);
    } else {
      this.setState({
        loading2: true,
      });
      let id = record.id;
      let reversedAmount = record.reversedAmount;
      let remark = record.remark;
      let attachmentOid = record.attachmentOid;
      cshWriteOffBacklashService
        .cshWriteOffDoReservedAgain(id, reversedAmount, remark, attachmentOid)
        .then(res => {
          if (res.status === 200) {
            message.success(`此核销反冲重新发起成功`);
            this.getWaitReserveDetail();
            this.getWriteOffUserReservedDetail();
          }
        })
        .catch(e => {
          if (e.response) {
            message.error(`此次核销反冲重新发起失败：${e.response.data.message}`);
            this.setState({
              loading2: false,
            });
          }
        });
    }
  };
  /**
   * 我发起的核销反冲搜索按钮
   */
  search2 = param => {
    this.setState(
      {
        loading2: true,
        page2: 0,
        searchParam2: param,
      },
      () => {
        this.getWriteOffUserReservedDetail();
      }
    );
  };
  /**
   * 我发起的核销反冲清空按钮
   */
  clear2 = () => {
    this.setState(
      {
        loading2: true,
        page2: 0,
        searchParam2: {},
      },
      () => {
        this.getWriteOffUserReservedDetail();
      }
    );
  };
  /**
   * 切换面板事件
   */
  onTabPaneChange = key => {
    if (key === '1') {
      this.setState({ nowData: 'data1' });
    } else {
      this.setState({ nowData: 'data2' });
    }
    this.setState({
      nowRecord: {},
      nowIndex: -1,
    });
  };
  /**
   * 附件弹窗确定事件
   */
  onEditViewUploadOk = info => {
    //临时用来存储返回的fileList数组里的attachmentOID集合
    let attachmentOidArray = [];
    //得到当前的data,index,record
    let { nowData, nowIndex, nowRecord } = this.state;
    let { data1, data2 } = this.state;
    info.fileList.map(item => {
      attachmentOidArray.push(item.response.attachmentOID);
    });
    if (nowData === 'data1') {
      data1[nowIndex].attachmentOid = attachmentOidArray.join(',');
      data1[nowIndex].attachments = info.fileList;
      this.setState({
        data1,
        attachmentVisible: false,
      });
    } else if (nowData === 'data2') {
      data2[nowIndex].attachmentOid = attachmentOidArray.join(',');
      data2[nowIndex].attachments = info.fileList;
      this.setState({
        data2,
        attachmentVisible: false,
      });
    }
  };
  /**
   * 面板切换事件
   */
  onChangeTabs = key => {
    if (key === 'backlashRechecking') {
      this.clear1();
    } else {
      this.clear2();
    }
    this.setState({ nowStatus: key }, () => {
      this.props.dispatch(
        routerRedux.replace({
          pathname: '/financial-management/csh-write-off-backlash?tab=' + this.state.nowStatus,
        })
      );
    });
  };
  renderContent = () => {
    //待反冲核销
    const { searchForm1, data1, pagination1, loading1, columns1 } = this.state;
    //我发起的核销反冲
    const { searchForm2, data2, pagination2, loading2, columns2 } = this.state;
    let content = null;
    switch (this.state.nowStatus) {
      case 'backlashRechecking':
        content = (
          <div>
            <SearchArea
              searchForm={searchForm1}
              submitHandle={this.search1}
              clearHandle={this.clear1}
              wrappedComponentRef={inst => (this.formRef = inst)}
              maxLength={4}
              key="1"
            />
            <div className="divider" />
            <Table
              scroll={{ x: 1280 }}
              rowKey={record => record['id']}
              columns={columns1}
              dataSource={data1}
              pagination={pagination1}
              size="middle"
              loading={loading1}
              bordered
              expandedRowRender={record => {
                return (
                  <div>
                    <Row
                      gutter={24}
                      type="flex"
                      justify="start"
                      style={{
                        marginLeft: '-9px',
                        borderBottom: '1px solid #D0D0D0',
                        paddingBottom: '8px',
                      }}
                    >
                      <Col span={3} style={{ textAlign: 'right' }}>
                        {' '}
                        报销单付款行
                      </Col>
                      <Col span={2}>
                        {record.cashWriteOffReserveExpReport.currency}&nbsp;
                        {record.cashWriteOffReserveExpReport.amount}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>收款方：{record.cashWriteOffReserveExpReport.payeeName}</span>
                          }
                        >
                          收款方：{record.cashWriteOffReserveExpReport.payeeName}
                        </Popover>
                      </Col>
                      <Col span={4} offset={1}>
                        计划付款日期：{moment(
                          record.cashWriteOffReserveExpReport.schedulePaymentDate
                        ).format('YYYY-MM-DD')}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                            </span>
                          }
                        >
                          关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                        </Popover>
                      </Col>
                      <Col span={6} className="over-range">
                        <Popover
                          content={
                            <span>备注：{record.cashWriteOffReserveExpReport.description}</span>
                          }
                        >
                          备注：{record.cashWriteOffReserveExpReport.description}
                        </Popover>
                      </Col>
                    </Row>
                    <Row
                      gutter={24}
                      type="flex"
                      justify="start"
                      style={{ paddingTop: '8px', marginLeft: '-9px' }}
                    >
                      <Col span={3} style={{ textAlign: 'right' }}>
                        {' '}
                        被核销单据行
                      </Col>
                      <Col span={2}>
                        {record.cashWriteOffReservePrepaymentRequisition.currency}&nbsp;
                        {record.cashWriteOffReservePrepaymentRequisition.amount}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              {' '}
                              收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                            </span>
                          }
                        >
                          收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                        </Popover>
                      </Col>
                      <Col span={4} offset={1}>
                        计划付款日期：{moment(
                          record.cashWriteOffReservePrepaymentRequisition.requisitionPaymentDate
                        ).format('YYYY-MM-DD')}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              关联合同：{
                                record.cashWriteOffReservePrepaymentRequisition.contractNumber
                              }
                            </span>
                          }
                        >
                          关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}
                        </Popover>
                      </Col>
                      <Col span={6} className="over-range">
                        <Popover
                          content={
                            <span>
                              备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                            </span>
                          }
                        >
                          备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                        </Popover>
                      </Col>
                    </Row>
                  </div>
                );
              }}
            />
          </div>
        );
        break;
      case 'backlashRechecked':
        content = (
          <div>
            <SearchArea
              searchForm={searchForm2}
              submitHandle={this.search2}
              clearHandle={this.clear2}
              wrappedComponentRef={inst => (this.formRef = inst)}
              maxLength={4}
              key="2"
            />
            <div className="divider" />
            <Table
              scroll={{ x: 1650 }}
              rowKey={record => record['id']}
              columns={columns2}
              dataSource={data2}
              size="middle"
              loading={loading2}
              bordered
              pagination={pagination2}
              expandedRowRender={record => {
                return (
                  <div>
                    <Row
                      gutter={24}
                      type="flex"
                      justify="start"
                      style={{
                        marginLeft: '-9px',
                        borderBottom: '1px solid #D0D0D0',
                        paddingBottom: '8px',
                      }}
                    >
                      <Col span={3} style={{ textAlign: 'right' }}>
                        {' '}
                        报销单付款行
                      </Col>
                      <Col span={2}>
                        {record.cashWriteOffReserveExpReport.currency}&nbsp;
                        {record.cashWriteOffReserveExpReport.amount}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span> 收款方：{record.cashWriteOffReserveExpReport.payeeName}</span>
                          }
                        >
                          收款方：{record.cashWriteOffReserveExpReport.payeeName}
                        </Popover>
                      </Col>
                      <Col span={4} offset={1}>
                        计划付款日期：{moment(
                          record.cashWriteOffReserveExpReport.schedulePaymentDate
                        ).format('YYYY-MM-DD')}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                            </span>
                          }
                        >
                          关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                        </Popover>
                      </Col>
                      <Col span={6} className="over-range">
                        <Popover
                          content={
                            <span> 备注：{record.cashWriteOffReserveExpReport.description}</span>
                          }
                        >
                          备注：{record.cashWriteOffReserveExpReport.description}
                        </Popover>
                      </Col>
                    </Row>
                    <Row
                      gutter={24}
                      type="flex"
                      justify="start"
                      style={{ paddingTop: '8px', marginLeft: '-9px' }}
                    >
                      <Col span={3} style={{ textAlign: 'right' }}>
                        {' '}
                        被核销单据行
                      </Col>
                      <Col span={2}>
                        {record.cashWriteOffReservePrepaymentRequisition.currency}&nbsp;
                        {record.cashWriteOffReservePrepaymentRequisition.amount}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                            </span>
                          }
                        >
                          收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                        </Popover>
                      </Col>
                      <Col span={4} offset={1}>
                        计划付款日期：{moment(
                          record.cashWriteOffReservePrepaymentRequisition.requisitionPaymentDate
                        ).format('YYYY-MM-DD')}
                      </Col>
                      <Col span={4} className="over-range">
                        <Popover
                          content={
                            <span>
                              关联合同：{
                                record.cashWriteOffReservePrepaymentRequisition.contractNumber
                              }
                            </span>
                          }
                        >
                          关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}
                        </Popover>
                      </Col>
                      <Col span={6} className="over-range">
                        <Popover
                          content={
                            <span>
                              备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                            </span>
                          }
                        >
                          备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                        </Popover>
                      </Col>
                    </Row>
                  </div>
                );
              }}
            />
          </div>
        );
        break;
    }
    return content;
  };
  /**
   * 渲染函数
   */
  render() {
    //附件
    const { attachmentVisible, nowRecord, nowData } = this.state;
    //查看单据详情弹窗
    const { modalVisible, modalContent, modalTitle } = this.state;
    //面板
    const { tabs, nowStatus } = this.state;
    return (
      <div>
        <Tabs onChange={this.onChangeTabs} defaultActiveKey={nowStatus}>
          {tabs.map(tab => {
            return <TabPane tab={tab.name} key={tab.key} />;
          })}
        </Tabs>
        {this.renderContent()}
        {/* 附件弹窗 */}
        <EditViewUpload
          visible={attachmentVisible}
          onCancel={() => {
            this.setState({ attachmentVisible: false });
          }}
          onOk={this.onEditViewUploadOk}
          attachmentType="CASH_WRITE_OFF"
          multiple={false}
          // 控制附件是否可编辑
          disabled={nowData === 'data2' && nowRecord.status !== 'N'}
          showUploadList={true}
          defaultFileList={nowRecord.attachments}
        />
        {/* 查看单据详情弹窗 */}
        <ViewDetailsModal
          title={modalTitle}
          visible={modalVisible}
          content={modalContent}
          onCancel={this.onModalCancel}
        />
      </div>
    );
  }
}
/**
 * router
 */

/**
 * redux
 */
function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(CshWriteOffBacklash);
