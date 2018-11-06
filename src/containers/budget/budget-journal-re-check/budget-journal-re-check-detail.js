/**
 * Created by 13576 on 2017/10/20.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Spin,
  Popover,
  Button,
  Collapse,
  Table,
  Select,
  Modal,
  message,
  Popconfirm,
  notification,
  Icon,
  Badge,
  Row,
  Col,
  Input,
  Steps,
  Affix,
} from 'antd';
const Step = Steps.Step;
import 'styles/budget/budget-journal-re-check/budget-journal-re-check-detail.scss';
import httpFetch from 'share/httpFetch';
import config from 'config';
import budgetJournalService from 'containers/budget/budget-journal-re-check/budget-journal-re-check.service';

import ApproveBar from 'components/Widget/Template/approve-bar';

class BudgetJournalReCheckDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      params: {},
      spinLoading: true,
      headerAndListData: {},
      totalAmount: 0,
      pageSize: 10,
      page: 0,
      total: 0,
      pagination: {
        current: 0,
        page: 0,
        total: 0,
        pageSize: 10,
      },
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll,
      },
      organization: {},
      fileList: [],
      infoData: {},
      passLoading: false,
      rejectLoading: false,
      columns: [
        {
          /*公司*/
          title: this.$t({ id: 'budgetJournal.companyId' }),
          key: 'companyName',
          dataIndex: 'companyName',
          width: '8%',
          render: companyName => <Popover content={companyName}>{companyName}</Popover>,
        },
        {
          /*部门*/
          title: this.$t({ id: 'budgetJournal.unitId' }),
          key: 'departmentName',
          dataIndex: 'departmentName',
          width: '8%',
          render: unitName => <Popover content={unitName}>{unitName}</Popover>,
        },
        {
          /*人员*/
          title: this.$t({ id: 'budgetJournal.employeeId' }),
          key: 'employeeName',
          dataIndex: 'employeeName',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*预算项目*/
          title: this.$t({ id: 'budgetJournal.item' }),
          key: 'itemName',
          dataIndex: 'itemName',
          width: '16%',
          render: itemName => <Popover content={itemName}>{itemName}</Popover>,
        },
        {
          /*期间*/
          title: this.$t({ id: 'budgetJournal.periodName' }),
          key: 'periodName',
          dataIndex: 'periodName',
          width: '6%',
        },
        {
          /*季度*/
          title: this.$t({ id: 'budgetJournal.periodQuarter' }),
          width: '6%',
          key: 'periodQuarterName',
          dataIndex: 'periodQuarterName',
        },
        {
          /*年度*/
          title: this.$t({ id: 'budgetJournal.periodYear' }),
          key: 'periodYear',
          dataIndex: 'periodYear',
          width: '8%',
        },
        {
          /*币种*/
          title: this.$t({ id: 'budgetJournal.currency' }),
          key: 'currency',
          dataIndex: 'currency',
          width: '8%',
        },
        {
          /*汇率*/
          title: this.$t({ id: 'budgetJournal.rate' }),
          key: 'rate',
          dataIndex: 'rate',
          width: '8%',
        },
        {
          /*金额*/
          title: this.$t({ id: 'budgetJournal.amount' }),
          key: 'amount',
          dataIndex: 'amount',
          render: recode => (
            <Popover content={this.filterMoney(recode)}>{this.filterMoney(recode)}</Popover>
          ),
        },
        {
          /*本币今额*/
          title: this.$t({ id: 'budgetJournal.functionalAmount' }),
          key: 'functionalAmount',
          dataIndex: 'functionalAmount',
          render: recode => (
            <Popover content={this.filterMoney(recode)}>{this.filterMoney(recode)}</Popover>
          ),
        },
        {
          /*数字*/
          title: this.$t({ id: 'budgetJournal.quantity' }),
          key: 'quantity',
          dataIndex: 'quantity',
          with: '8%',
        },
        {
          /*备注*/
          title: this.$t({ id: 'budgetJournal.remark' }),
          key: 'remark',
          dataIndex: 'remark',
          render: remark => <Popover content={remark}>{remark}</Popover>,
        },
      ],
    };
  }

  componentWillMount = () => {
    this.getToleAmount();
    this.getBudgetJournalHead();
    this.getBudgetJournalLine();
  };

  //获取日记账总金额
  getToleAmount() {
    let infoDate = this.state.infoDate;
    budgetJournalService
      .getTotalCurrencyAmount(this.props.match.params.journalCode)
      .then(response => {
        let totalAmount = response.data;
        this.setState({ infoDate, totalAmount });
      });
  }

  //获取日记账头
  getBudgetJournalHead() {
    const budgetCode = this.props.match.params.journalCode;
    budgetJournalService.getBudgetJournalHeaderDetil(budgetCode).then(request => {
      this.getDimensionByStructureId(request.data.structureId);
      let headerData = request.data;
      headerData.attachmentOID.map(item => {
        this.getFileByAttachmentOID(item);
      });
      let headerAndListData = {
        dto: request.data,
        list: [],
      };
      this.setState(
        {
          headerData: headerData,
          headerAndListData: headerAndListData,
          infoData: headerData,
        },
        () => {
          this.getToleAmount();
        }
      );
    });
  }

  //获取日记账行
  getBudgetJournalLine() {
    let params = {};
    params.page = this.state.page;
    params.size = this.state.pageSize;
    this.setState({
      loading: true,
      spinLoading: true,
    });
    const budgetCode = this.props.match.params.journalCode;
    budgetJournalService
      .getBudgetJournalLineDetil(budgetCode, params)
      .then(response => {
        this.setState({
          loading: false,
          spinLoading: false,
        });
        let listData = response.data;
        this.setState({
          data: listData,
          total: Number(response.headers['x-total-count']),
          pagination: {
            total: Number(response.headers['x-total-count']),
            onChange: this.onChangePager,
            current: this.state.page + 1,
          },
        });
      })
      .catch(e => {
        this.setState({
          loading: false,
          spinLoading: false,
        });
        message.error(e.response.data.message);
      });
  }

  //分页点击
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getBudgetJournalLine();
        }
      );
  };

  //根据attachmentOID，查询附件
  getFileByAttachmentOID = value => {
    budgetJournalService
      .getFileByAttachmentOID(value)
      .then(resp => {
        let fileList = this.state.fileList;
        fileList.addIfNotExist(resp.data);
        this.setState({
          fileList: fileList,
        });
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'budgetJournal.getAttachmentFail' })},${e.response.data.message}`
        );
      });
  };

  //根据预算日记账编码查询预算日记账头行
  getDataByBudgetJournalCode = () => {
    const budgetCode = this.props.match.params.journalCode;
    budgetJournalService.getBudgetJournalHeaderLine(budgetCode).then(request => {
      let listData = request.data.list;
      let headerData = request.data.dto;
      this.getDimensionByStructureId(headerData.structureId);
      headerData.attachmentOID.map(item => {
        this.getFileByAttachmentOID(item);
      });

      this.setState({
        headerAndListData: request.data,
        infoData: headerData,
        data: listData,
        total: listData.length,
      });
    });
  };

  //根据预算表id，获得维度
  getDimensionByStructureId = value => {
    httpFetch
      .get(
        `${
        config.budgetUrl
        }/api/budget/journals/getLayoutsByStructureId?enabled=true&structureId=${value}`
      )
      .then(resp => {
        this.getColumnsAndDimensionhandleData(resp.data);
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'budgetJournal.getDimensionFail' })},${e.response.data.message}`
        );
      });
  };

  //根据预算表的维度.获取维度Columuns
  getColumnsAndDimensionhandleData(dimensionList) {
    let columns = this.state.columns;
    for (let i = 0; i < dimensionList.length; i++) {
      const item = dimensionList[i];
      const priority = item.sequenceNumber;
      columns.push({
        title: `${item.dimensionName}`,
        key: `dimension${priority}ValueName`,
        dataIndex: `dimension${priority}ValueName`,
        render: recode => <Popover content={recode}>{recode}</Popover>,
      });
    }
    this.setState(
      {
        columns,
      },
      () => {
        this.setState({
          spinLoading: false,
        });
      }
    );
  }

  //通过
  handlePass = values => {
    message.warning(this.$t({ id: 'budgetJournal.passHint' }));
    this.setState({ spinLoading: true });
    const id = this.state.headerAndListData.dto && this.state.headerAndListData.dto.id;
    let data = [];
    data.addIfNotExist(id);
    budgetJournalService
      .passJournal(values, data)
      .then(request => {
        message.success(this.$t({ id: 'common.operate.success' }));
        this.props.dispatch(
          routerRedux.push({
            pathname: `/budget/budget-journal-re-check`,
          })
        );
      })
      .catch(e => {
        this.setState({ spinLoading: false });
        message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
      });
  };

  //驳回
  handleReject = values => {
    this.setState({ rejectLoading: true });
    const id = this.state.headerAndListData.dto && this.state.headerAndListData.dto.id;
    let data = [];
    data.addIfNotExist(id);
    budgetJournalService
      .rejectJournal(values, data)
      .then(request => {
        message.success(this.$t({ id: 'common.operate.success' }));
        this.props.dispatch(
          routerRedux.push({
            pathname: `/budget/budget-journal-re-check`,
          })
        );
        this.setState({ rejectLoading: false });
      })
      .catch(e => {
        this.setState({ rejectLoading: false });
        message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
      });
  };

  //返回列表页
  HandleReturn = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/budget/budget-journal-re-check`,
      })
    );
  };

  //返回状态
  getStatus = () => {
    const infoData = this.state.infoData;
    switch (infoData.status) {
      case 'NEW': {
        return <Badge status="processing" text={infoData.statusName} />;
      }
      case 'SUBMIT': {
        return <Badge status="warning" text={infoData.statusName} />;
      }
      case 'SUBMIT_RETURN': {
        return <Badge status="warning" text={infoData.statusName} />;
      }
      case 'REJECT': {
        return <Badge status="error" text={infoData.statusName} />;
      }
      case 'CHECKED': {
        return <Badge status="default" text={infoData.statusName} />;
      }
      case 'CHECKING': {
        return <Badge status="default" text={infoData.statusName} />;
      }
      case 'POSTED': {
        return <Badge status="default" text={infoData.statusName} />;
      }
      case 'BACKLASH_SUBMIT': {
        return <Badge status="default" text={infoData.statusName} />;
      }
      case 'BACKLASH_CHECKED': {
        return <Badge status="default" text={infoData.statusName} />;
      }
      default: {
        return <Badge status="default" text={infoData.statusName} />;
      }
    }
  };

  //获得总金额
  getAmount = () => {
    const data = this.state.data;
    let sum = 0;
    data.map(item => {
      sum += item.functionalAmount;
    });
    return 'CNY' + ' ' + sum.toFixed(2);
  };

  //获取附件
  getFile = () => {
    const fileList = this.state.fileList;
    let file_arr = [];
    fileList.map(link => {
      file_arr.push(
        <div key={link.fileURL}>
          <a href={link.fileURL} target="_blank">
            <Icon type="paper-clip" /> {link.fileName}
          </a>{' '}
        </div>
      );
    });
    return file_arr.length > 0 ? file_arr : '-';
  };

  render() {
    const { data, columns, infoData, spinLoading, rejectLoading } = this.state;
    return (
      <div style={{ paddingBottom: 100 }} className="budget-journal-re-check-detail">
        <div className="base-info">
          <div className="base-info-header">
            {this.$t({ id: 'budgetJournal.basicInformation' })}
          </div>

          <Row className="base-info-cent">
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.status' })}:</div>
              <div className="beep-info-text">{this.getStatus()}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.journalCode' })}:</div>
              <div className="beep-info-text">
                {infoData.journalCode ? infoData.journalCode : '-'}
              </div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.amount' })}:</div>
              <div className="beep-info-text">{this.state.totalAmount}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.employeeId' })}:</div>
              <div className="beep-info-text">
                {infoData.employeeName ? infoData.employeeName : '-'}
              </div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.unitId' })}:</div>
              <div className="beep-info-text">{infoData.unitName ? infoData.unitName : '-'}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.createdDate' })}:</div>
              <div className="beep-info-text">{String(infoData.createdDate).substring(0, 10)}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">
                {this.$t({ id: 'budgetJournal.journalTypeId' })}:
              </div>
              <div className="beep-info-text">{infoData.journalTypeName}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.structureId' })}:</div>
              <div className="beep-info-text">{infoData.structureName}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.scenarioId' })}:</div>
              <div className="beep-info-text">{infoData.scenario}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.versionId' })}:</div>
              <div className="beep-info-text">{infoData.versionName}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">
                {this.$t({ id: 'budgetJournal.periodStrategy' })}:
              </div>
              <div className="beep-info-text">{infoData.periodStrategyName}</div>
            </Col>
            <Col span={8}>
              <div className="base-info-title">{this.$t({ id: 'budgetJournal.attachment' })}:</div>
              <div className="beep-info-text">{this.getFile()}</div>
            </Col>
          </Row>
        </div>
        <Spin spinning={this.state.spinLoading}>
          <Table
            columns={columns}
            dataSource={data}
            loading={this.state.loading}
            bordered
            size="middle"
            scroll={{ x: '150%' }}
            rowKey={recode => {
              return recode.id;
            }}
            pagination={this.state.pagination}
          />
        </Spin>
        <div className="bottom-bar bottom-bar-approve">
          <ApproveBar
            backUrl={`/budget/budget-journal-re-check`}
            passLoading={spinLoading}
            style={{ paddingLeft: 20 }}
            rejectLoading={rejectLoading}
            handleApprovePass={this.handlePass}
            handleApproveReject={this.handleReject}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BudgetJournalReCheckDetail);
