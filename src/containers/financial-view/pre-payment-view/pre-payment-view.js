import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import SearchArea from 'widget/search-area';
import baseService from 'share/base.service';
import { Input, Button, Table, Badge, Divider, message, Popover, Row, Col, Modal } from 'antd';
const Search = Input.Search;
import prePaymentService from './pre-payment-view.service';
import moment from 'moment';
//import ExcelExporter from 'widget/excel-exporter'
import ListSelector from 'widget/list-selector';
//import FileSaver from 'file-saver'
import PayDetail from 'containers/pay/pay-workbench/payment-detail'; //支付详情
import { routerRedux } from 'dva/router';

class PerPaymentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /**
       * 查询条件
       */
      searchForm: [
        {
          type: 'list',
          id: 'companyId',
          label: '单据公司',
          colSpan: '6',
          listType: 'available_company',
          valueKey: 'id',
          labelKey: 'name',
          single: true,
        },
        {
          type: 'select',
          id: 'typeId',
          label: '单据类型',
          colSpan: 6,
          getUrl: `${
            config.prePaymentUrl
          }/api/cash/pay/requisition/types/queryByEmployeeId?userId=${this.props.user.id}`,
          options: [],
          method: 'get',
          valueKey: 'id',
          labelKey: 'typeName',
        },
        {
          type: 'list',
          id: 'applyId',
          label: '申请人',
          colSpan: '6',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          listType: 'bgtUser',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
        },
        {
          type: 'select',
          id: 'status',
          label: '状态',
          colSpan: '6',
          options: [
            { value: 1001, label: '编辑中' },
            { value: 1002, label: '审批中' },
            { value: 1003, label: '撤回' },
            { value: 1004, label: '审批通过' },
            { value: 1005, label: '审批驳回' },
          ],
          valueKey: 'value',
          labelkey: 'label',
        },
        {
          type: 'list',
          id: 'unitId',
          label: '单据部门',
          colSpan: '6',
          listType: 'department',
          labelKey: 'name',
          valueKey: 'departmentId',
          single: true,
        },
        {
          type: 'items',
          id: 'applyDate',
          colSpan: 6,
          items: [
            { type: 'date', id: 'applyDateFrom', label: '申请日期从' },
            { type: 'date', id: 'applyDateTo', label: '申请日期至' },
          ],
        },
        {
          type: 'items',
          id: 'amount',
          colSpan: 6,
          items: [
            { type: 'input', id: 'amountFrom', label: '本币金额从' },
            { type: 'input', id: 'amountTo', label: '本币金额至' },
          ],
        },
        {
          type: 'items',
          id: 'noWriteAmount',
          colSpan: 6,
          items: [
            { type: 'input', id: 'noWriteAmountFrom', label: '未核销金额从' },
            { type: 'input', id: 'noWriteAmountTo', label: '未核销金额至' },
          ],
        },
        {
          type: 'input',
          id: 'remark',
          label: '备注',
          colSpan: 6,
        },
      ],
      /**
       * 表格
       */
      columns: [
        {
          title: '单据编号',
          dataIndex: 'requisitionNumber',
          width: '120',
          render: (requisitionNumber, record) => {
            return (
              <Popover content={requisitionNumber}>
                <a onClick={() => this.handleLink(record)}>{requisitionNumber}</a>
              </Popover>
            );
          },
        },
        {
          title: '单据公司',
          dataIndex: 'companyName',
          width: '120',
          render: desc => <Popover content={desc}>{desc || '-'}</Popover>,
        },
        {
          title: '单据部门',
          dataIndex: 'unitName',
          width: '100',
          render: desc => <Popover content={desc}>{desc || '-'}</Popover>,
        },
        {
          title: '单据类型',
          dataIndex: 'typeName',
          width: '120',
          render: typeName => {
            return <Popover content={typeName}>{typeName}</Popover>;
          },
        },
        {
          title: '申请人',
          dataIndex: 'employeeName',
          width: '80',
          render: desc => <Popover content={desc}>{desc || '-'}</Popover>,
        },
        {
          title: '申请日期',
          dataIndex: 'requisitionDate',
          width: '120',
          render: requisitionDate => {
            return <span>{moment(requisitionDate).format('YYYY-MM-DD')}</span>;
          },
        },
        {
          title: '本币金额',
          dataIndex: 'advancePaymentAmount',
          width: '100',
          render: advancePaymentAmount => {
            return <span>{this.filterMoney(advancePaymentAmount, 2)}</span>;
          },
        },
        {
          title: '已付金额',
          dataIndex: 'paidAmount',
          width: '100',
          render: paidAmount => {
            return <span>{this.filterMoney(paidAmount, 2)}</span>;
          },
        },
        {
          title: '已退款金额',
          dataIndex: 'returnAmount',
          width: '100',
          render: returnAmount => {
            return <span>{this.filterMoney(returnAmount, 2)}</span>;
          },
        },
        {
          title: '已核销金额',
          dataIndex: 'writedAmount',
          width: '100',
          render: writedAmount => {
            return <span>{this.filterMoney(writedAmount, 2)}</span>;
          },
        },
        {
          title: '未核销金额',
          dataIndex: 'noWritedAmount',
          width: '100',
          render: noWritedAmount => {
            return <span>{this.filterMoney(noWritedAmount, 2)}</span>;
          },
        },
        {
          title: '备注',
          dataIndex: 'description',
          width: '120',
          render: description => {
            return <Popover content={description}>{description}</Popover>;
          },
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '100',
          render: status => {
            return (
              <Badge
                status={this.$statusList[status].state}
                text={this.$statusList[status].label}
              />
            );
          },
        },
        {
          title: '查看信息',
          dataIndex: 'view',
          render: (view, record, index) => {
            return (
              <div>
                <a onClick={e => this.onReqClick(e, record, index)}>申请单</a>
                <Divider type="vertical" />
                <a
                  onClick={e => {
                    this.onPayClick(e, record, index);
                  }}
                >
                  支付明细
                </a>
                <Divider type="vertical" />
                <a onClick={e => this.onWriteOffClick(e, record, index)}>核销明细</a>
              </div>
            );
          },
        },
      ],
      loading: true,
      pagination: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [],
      searchParam: {},
      showChild: false,
      detailId: undefined,
      page: 0,
      pageSize: 10,
      /**
       * 弹窗-申请单，支付明细，核销明细
       */
      lsVisible: false,
      extraParams: {},
      selectorItem: {},
      /**
       * 导出
       */
      excelVisible: false,
      btLoading: false,
      exportColumns: [
        { title: '单据编号', dataIndex: 'requisitionNumber' },
        { title: '单据公司', dataIndex: 'companyName' },
        { title: '单据部门', dataIndex: 'unitName' },
        { title: '单据类型', dataIndex: 'typeName' },
        { title: '申请人', dataIndex: 'employeeName' },
        { title: '创建人', dataIndex: 'createByName' },
        { title: '申请日期', dataIndex: 'stringRequisitionDate' },
        { title: '本币金额', dataIndex: 'advancePaymentAmount' },
        { title: '已付金额', dataIndex: 'paidAmount' },
        { title: '已退金额', dataIndex: 'returnAmount' },
        { title: '已核销金额', dataIndex: 'writedAmount' },
        { title: '未核销金额', dataIndex: 'noWritedAmount' },
        { title: '状态', dataIndex: 'statusName' },
        { title: '备注', dataIndex: 'description' },
      ],
      payRequisitionDetail: '/pre-payment/my-pre-payment/pre-payment-detail/:id/:flag', //预付款详情,
    };
  }

  handleLink(record) {
    // this.context.router.push(this.state.payRequisitionDetail.url.replace(':id', record.id).replace(':flag', 'preFinalQuery'))
    //  this.props.dispatch(
    //     routerRedux.push({
    //       pathname: this.state.payRequisitionDetail.url,
    //    })
    //   );

    this.props.dispatch(
      routerRedux.replace({
        pathname: `/pre-payment/my-pre-payment/pre-payment-detail/${record.id}/preFinalQuery`,
      })
    );
  }

  /**
   * 生命周期函数，constructor之后render之前
   */
  componentWillMount = () => {
    this.getList();
  };
  /**
   * 点击核销明细超链接
   */
  onWriteOffClick = (e, record, index) => {
    e.preventDefault();
    let { extraParams, selectorItem } = this.state;
    selectorItem = {
      title: '查看核销明细',
      url: `${config.payUrl}/api/payment/cash/write/off/of/prepayment/detail`,
      searchForm: [
        {
          type: 'input',
          id: 'requisitionNumber',
          label: '预付款单单号',
          disabled: true,
          colSpan: '6',
          defaultValue: record.requisitionNumber,
        },
        {
          type: 'input',
          id: 'typeName',
          label: '预付款单类型',
          disabled: true,
          colSpan: '6',
          defaultValue: record.typeName,
        },
        { type: 'input', id: 'documentNumber', label: '报账单单号', colSpan: '6' },
        { type: 'input', id: 'documentFormName', label: '报账单类型', colSpan: '6' },
      ],
      columns: [
        { title: '报账单单号', dataIndex: 'documentNumber' },
        { title: '序号', dataIndex: 'documentLineNumber' },
        { title: '报账单类型', dataIndex: 'documentFormName' },
        { title: '申请人', dataIndex: 'documentApplicantName' },
        {
          title: '交易日期',
          dataIndex: 'writeOffDate',
          render: (writeOffDate, record, index) => {
            return <span>{moment(writeOffDate).format('YYYY-MM-DD')}</span>;
          },
        },
        { title: '币种', dataIndex: 'currency' },
        {
          title: '核销金额',
          dataIndex: 'writeOffAmount',
          render: (writeOffAmount, record, index) => {
            return <span>{this.filterMoney(writeOffAmount, 2)}</span>;
          },
        },
        { title: '备注', dataIndex: 'remark' },
        { title: '核销状态', dataIndex: 'statusDescription' },
      ],
      key: 'id',
    };
    extraParams = {
      prepaymentRequisitionId: record.id,
    };
    this.setState({
      lsVisible: true,
      extraParams,
      selectorItem,
    });
  };
  /**
   * 点击支付明细超链接
   */
  onPayClick = (e, record, index) => {
    e.preventDefault();
    let { extraParams, selectorItem } = this.state;
    const advancePaymentAmount = this.filterMoney(record.advancePaymentAmount, 2, true);
    const operationTypeList = {
      reserved: '反冲',
      refund: '退票',
      payment: '付款',
      return: '退款',
    };
    selectorItem = {
      title: '支付明细',
      url: `${config.payUrl}/api/cash/transaction/details/getDeatils/by/documentId`,
      searchForm: [
        {
          type: 'input',
          id: 'requisitionNumber',
          label: '预付款单单号',
          disabled: true,
          defaultValue: record.requisitionNumber,
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'typeName',
          label: '预付款单类型',
          disabled: true,
          defaultValue: record.typeName,
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'advancePaymentAmount',
          label: '预付款单金额',
          disabled: true,
          defaultValue: advancePaymentAmount,
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'billCode',
          label: '付款流水号',
          colSpan: '6',
        },
      ],
      columns: [
        {
          title: '付款流水号',
          dataIndex: 'billcode',
          render: (desc, record) => (
            <Popover content={desc}>
              <a onClick={() => this.viewPayDetail(record.id)}>{desc || '-'}</a>
            </Popover>
          ),
        },
        {
          title: '操作类型',
          dataIndex: 'operationType',
          render: operationType => {
            return <span>{operationTypeList[operationType]}</span>;
          },
        },
        {
          title: '付款方账户',
          dataIndex: 'draweeAccount',
          render: (draweeAccount, record, index) => {
            let content = (
              <div>
                <div>
                  <span>户名：</span>
                  <span>{record.draweeAccountName}</span>
                </div>
                <div>
                  <span>账号：</span>
                  <span>{record.draweeBankNumber}</span>
                </div>
              </div>
            );
            return <Popover content={content}>{content}</Popover>;
          },
        },
        {
          title: '付款日期',
          dataIndex: 'scheduleDate',
          render: scheduleDate => {
            return <span>{moment(scheduleDate).format('YYYY-MM-DD')}</span>;
          },
        },
        { title: '币种', dataIndex: 'currency' },
        {
          title: '付款金额',
          dataIndex: 'amount',
          render: amount => {
            return <span>{this.filterMoney(amount, 2)}</span>;
          },
        },
        {
          title: '收款方账户',
          dataIndex: 'payeeAccount',
          render: (payeeAccount, record, index) => {
            let content = (
              <div>
                <div>
                  <span>户名：</span>
                  <span>{record.payeeAccountName}</span>
                </div>
                <div>
                  <span>账号：</span>
                  <span>{record.payeeAccountNumber}</span>
                </div>
              </div>
            );
            return <Popover content={content}>{content}</Popover>;
          },
        },
        { title: '收款方', dataIndex: 'partnerCategoryName' },
        { title: '收款人', dataIndex: 'draweeName' },
      ],
      key: 'id',
    };
    extraParams = {
      headerId: record.id,
      documentCategory: 'PREPAYMENT_REQUISITION',
    };
    this.setState({
      lsVisible: true,
      extraParams,
      selectorItem,
    });
  };

  //查看支付流水详情
  viewPayDetail = id => {
    this.setState({
      showChild: true,
      detailId: id,

      detailFlag: 'PAYDETAIL',
    });
  };

  //弹出框关闭
  onClose = () => {
    this.setState({
      showChild: false,
    });
  };

  /**
   * 点击申请单超链接
   */
  onReqClick = (e, record, index) => {
    e.preventDefault();
    let { extraParams, selectorItem } = this.state;
    selectorItem = {
      title: '关联的申请单',
      url: `${config.baseUrl}/api/prepayment/requisition/release/prepayment/query`,
      searchForm: [
        {
          type: 'input',
          id: 'requisitionNumber',
          label: '预付款单单号',
          disabled: true,
          defaultValue: record.requisitionNumber,
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'typeName',
          label: '预付款单类型',
          disabled: true,
          defaultValue: record.typeName,
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'applicationCode',
          label: '申请单单号',
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'applicationType',
          label: '申请单类型',
          colSpan: '6',
        },
      ],
      columns: [
        { title: '申请单单号', dataIndex: 'applicationCode' },
        { title: '申请单类型', dataIndex: 'applicationType' },
        { title: '申请人', dataIndex: 'applyName' },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          render: applyDate => {
            return <span>{moment(applyDate).format('YYYY-MM-DD')}</span>;
          },
        },
        { title: '币种', dataIndex: 'currency' },
        {
          title: '金额',
          dataIndex: 'amount',
          render: amount => {
            return <span>{this.filterMoney(amount, 2)}</span>;
          },
        },
        {
          title: '关联金额',
          dataIndex: 'releaseAmount',
          render: releaseAmount => {
            return <span>{this.filterMoney(releaseAmount, 2)}</span>;
          },
        },
        { title: '备注', dataIndex: 'description' },
      ],
      key: 'applicationCode',
    };
    extraParams = {
      prepaymentHeaderId: record.id,
    };
    this.setState({
      lsVisible: true,
      extraParams,
      selectorItem,
    });
  };
  /**
   * 获取预付款单财务查询
   */
  getList = () => {
    let { page, pageSize, searchParam } = this.state;
    let params = {
      page: page,
      size: pageSize,
      companyId: searchParam.companyId ? searchParam.companyId : '',
      requisitionNumber: searchParam.requisitionNumber ? searchParam.requisitionNumber : '',
      typeId: searchParam.typeId ? searchParam.typeId : '',
      status: searchParam.status ? searchParam.status : '',
      unitId: searchParam.unitId ? searchParam.unitId : '',
      applyId: searchParam.applyId ? searchParam.applyId : '',
      applyDateFrom: searchParam.applyDateFrom
        ? moment(searchParam.applyDateFrom).format('YYYY-MM-DD')
        : '',
      applyDateTo: searchParam.applyDateTo
        ? moment(searchParam.applyDateTo).format('YYYY-MM-DD')
        : '',
      amountFrom: searchParam.amountFrom ? searchParam.amountFrom : '',
      amountTo: searchParam.amountTo ? searchParam.amountTo : '',
      noWriteAmountFrom: searchParam.noWriteAmountFrom ? searchParam.noWriteAmountFrom : '',
      noWriteAmountTo: searchParam.noWriteAmountTo ? searchParam.noWriteAmountTo : '',
      remark: searchParam.remark ? searchParam.remark : '',
    };
    prePaymentService
      .getList(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            data: res.data,
            loading: false,
            pagination: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page + 1,
              onChange: this.onChangeCheckedPage,
              onShowSizeChange: this.onShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共搜到 ${total} 条数据`,
            },
          });
        }
      })
      .catch(e => {
        message.error('加载数据失败');
      });
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        loading: true,
        page: current - 1,
        pageSize,
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage = page => {
    if (page - 1 !== this.state.page) {
      this.setState(
        {
          loading: true,
          page: page - 1,
        },
        () => {
          this.getList();
        }
      );
    }
  };
  /**
   * 搜索
   */
  searh = params => {
    if(params.companyId && params.companyId[0]){
      params.companyId = params.companyId[0];
    }
    if(params.unitId && params.unitId[0]){
      params.unitId = params.unitId[0];
    }
    if(params.applyId && params.applyId[0]){
      params.applyId = params.applyId[0];
    }
    this.setState(
      {
        loading: true,
        page: 0,
        searchParam: params,
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 清空
   */
  clear = () => {
    this.setState(
      {
        loading: true,
        page: 0,
        searchParam: {},
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 点击导出按钮
   */
  onExportClick = () => {
    alert('暂不支持导出！');
    // this.setState({
    //     btLoading: true,
    //     excelVisible: true
    // });
  };
  /**
   * 导出取消
   */
  onExportCancel = () => {
    this.setState({
      btLoading: false,
      excelVisible: false,
    });
  };
  /**
   * 确定导出
   */
  export = result => {
    let hide = message.loading('正在生成文件，请等待......');

    let setOfBooksId = this.props.company.setOfBooksId;
    const exportParams = this.state.searchParam;
    prePaymentService
      .export(result, setOfBooksId, exportParams)
      .then(res => {
        if (res.status === 200) {
          message.success('操作成功');
          let fileName = res.headers['content-disposition'].split('filename=')[1];
          let f = new Blob([res.data]);
          FileSaver.saveAs(f, decodeURIComponent(fileName));
          this.setState({
            btLoading: false,
          });
          hide();
        }
      })
      .catch(e => {
        message.error('下载失败，请重试!');
        this.setState({
          btLoading: false,
        });
        hide();
      });
  };
  /**
   * 根据预付款单单号搜索
   */
  onDocumentSearch = value => {
    this.setState(
      {
        loading: true,
        page: 0,
        searchParam: { requisitionNumber: value },
      },
      () => {
        this.getList();
      }
    );
  };

  wrapClose = content => {
    let id = this.state.detailId;
    const newProps = {
      params: { id: id, refund: true, flag: this.state.showChild },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };

  /**
   * 渲染函数
   */
  render() {
    //查询条件
    const { searchForm, showChild } = this.state;
    //返回列表
    const { columns, pagination, loading, data } = this.state;
    //弹窗
    const { lsVisible, extraParams, selectorItem } = this.state;
    //导出
    const { exportColumns, excelVisible, btLoading } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.searh}
          clearHandle={this.clear}
          maxLength={4}
        />
        <div className="divider" />
        <div className="table-header">
          <div className="table-header-buttons">
            <Row>
              <Col span={18}>
                <Button loading={btLoading} type="primary" onClick={this.onExportClick}>
                  导出预付款单
                </Button>
              </Col>
              <Col span={6}>
                <Search
                  placeholder="请输入预付款单单号"
                  onSearch={this.onDocumentSearch}
                  enterButton
                />
              </Col>
            </Row>
          </div>
        </div>
        <Table
          scroll={{ x: 1850 }}
          rowKey={record => record['id']}
          columns={columns}
          size="middle"
          bordered
          loading={loading}
          pagination={pagination}
          dataSource={data}
        />
        {/* 弹出框 */}
        <ListSelector
          selectorItem={selectorItem}
          extraParams={extraParams}
          visible={lsVisible}
          onOk={() => this.setState({ lsVisible: false })}
          onCancel={() => this.setState({ lsVisible: false })}
          hideRowSelect={true}
          hideFooter={true}
          modalWidth={'70%'}
        />
        {/* 导出 */}
        {/* <ExcelExporter
                    visible={excelVisible}
                    onOk={this.export}
                    columns={exportColumns}
                    fileName={"预付款单"}
                    onCancel={this.onExportCancel}
                    excelItem={"PREPAYMENT_FINANCIAL_QUERY"}
                /> */}
        <Modal
          visible={showChild} //支付明细弹窗
          footer={[
            <Button key="back" size="large" onClick={this.onClose}>
              {this.$t({ id: 'pay.backlash.goback' })}
            </Button>,
          ]}
          width={1200}
          closable={false}
          onCancel={this.onClose}
        >
          <div>{this.wrapClose(PayDetail)}</div>
        </Modal>
      </div>
    );
  }
}

/**
 * redux
 */

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(PerPaymentView);
