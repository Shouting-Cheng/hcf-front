import React from 'react';
import { connect } from 'dva';
import {
  Spin,
  Popover,
  Button,
  Collapse,
  Affix,
  Table,
  message,
  Icon,
  Badge,
  Row,
  Col,
  Steps,
  Popconfirm,
} from 'antd';
const Step = Steps.Step;
import ApproveHistoryWorkFlow from 'containers/budget/budget-journal/approve-history-work-flow.js';
import 'styles/budget/budget-journal/budget-journal-detail-submit.scss';
import budgetJournalService from 'containers/budget/budget-journal/budget-journal.service';
import ApproveHistory from 'containers/financial-management/reimburse-review/approve-history-work-flow';

class BudgetJournalDetailSubmit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinLoading: true,
      loading: true,
      data: [],
      HistoryData: [],
      headerAndListData: {},
      totalAmount: 0,
      headerData: {},
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
      columns: [
        {
          /*公司*/
          title: this.$t({ id: 'budgetJournal.companyId' }),
          key: 'companyName',
          dataIndex: 'companyName',
          width: '5%',
          render: companyName => <Popover content={companyName}>{companyName}</Popover>,
        },
        {
          /*部门*/
          title: this.$t({ id: 'budgetJournal.unitId' }),
          key: 'departmentName',
          dataIndex: 'departmentName',
          width: '5%',
          render: departmentName => <Popover content={departmentName}>{departmentName}</Popover>,
        },
        {
          /*员工*/
          title: this.$t({ id: 'budgetJournal.employee' }),
          key: 'employeeName',
          dataIndex: 'employeeName',
          width: '5%',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*预算项目*/
          title: this.$t({ id: 'budgetJournal.item' }),
          key: 'itemName',
          dataIndex: 'itemName',
          width: '10%',
          render: itemName => <Popover content={itemName}>{itemName}</Popover>,
        },
        {
          /*期间*/
          title: this.$t({ id: 'budgetJournal.periodName' }),
          key: 'periodName',
          dataIndex: 'periodName',
        },
        {
          /*季度*/
          title: this.$t({ id: 'budgetJournal.periodQuarter' }),
          key: 'periodQuarterName',
          dataIndex: 'periodQuarterName',
        },
        {
          /*年度*/
          title: this.$t({ id: 'budgetJournal.periodYear' }),
          key: 'periodYear',
          dataIndex: 'periodYear',
        },
        {
          /*币种*/
          title: this.$t({ id: 'budgetJournal.currency' }),
          key: 'currency',
          dataIndex: 'currency',
        },
        {
          /*汇率*/
          title: this.$t({ id: 'budgetJournal.rate' }),
          key: 'rate',
          dataIndex: 'rate',
          render: rate => <Popover content={rate}>{rate}</Popover>,
        },
        {
          /*金额*/
          title: this.$t({ id: 'budgetJournal.amount' }),
          key: 'amount',
          dataIndex: 'amount',
          width: 180,
          render: recode => (
            <Popover content={this.filterMoney(recode)}>{this.filterMoney(recode)}</Popover>
          ),
        },
        {
          /*本币今额*/
          title: this.$t({ id: 'budgetJournal.functionalAmount' }),
          key: 'functionalAmount',
          dataIndex: 'functionalAmount',
          width: 180,
          render: recode => (
            <Popover content={this.filterMoney(recode)}>{this.filterMoney(recode)}</Popover>
          ),
        },
        {
          /*数字*/
          title: this.$t({ id: 'budgetJournal.quantity' }),
          key: 'quantity',
          dataIndex: 'quantity',
        },
        {
          /*备注*/
          title: this.$t({ id: 'budgetJournal.remark' }),
          key: 'remark',
          dataIndex: 'remark',
          render: remark => <Popover content={remark}>{remark}</Popover>,
        },
      ],
      // budgetJournalPage: menuRoute.getRouteItem('budget-journal', 'key'),    //预算日记账
    };
  }
  //获取审批历史数据
  getApproveHistory(headerData) {
    let params = {};
    params.entityType = headerData.documentType;
    params.entityOID = headerData.documentOid;
    budgetJournalService.getBudgetJournalApproveHistory(params).then(response => {
      this.setState({ historyData: response.data });
    });
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

  formatMoney = (number, decimals = 2, isString = false) => {
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
      dec = typeof dec_point === 'undefined' ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.ceil(n * k) / k;
      };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, '$1' + sep + '$2');
    }

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    }

    console.log(s.join(dec));

    if (isString === true) {
      return s.join(dec);
    } else {
      return <span className="money-cell">{s.join(dec)}</span>;
    }
  };

  //根据attachmentOID，查询附件
  getFileByAttachmentOID = value => {
    let valueData = {};
    valueData.oid = value;
    budgetJournalService
      .getFileByAttachmentOID(valueData)
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

  //获取日记账头
  getBudgetJournalHead() {
    const budgetCode = this.props.match.params.journalCode;
    budgetJournalService.getBudgetJournalHeaderDetil(budgetCode).then(request => {
      this.getDimensionByStructureId(request.data.structureId);
      let headerData = request.data;
      //获取审批历史数据
      this.getApproveHistory(headerData);
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
    });
    const budgetCode = this.props.match.params.journalCode;
    budgetJournalService
      .getBudgetJournalLineDetil(budgetCode, params)
      .then(response => {
        this.setState({
          loading: false,
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

  //根据预算表id，获得维度
  getDimensionByStructureId = value => {
    let params = {};
    params.enabled = true;
    params.structureId = value;
    budgetJournalService.getDimensionByStructureId(params).then(resp => {
      this.getColumnsAndDimensionhandleData(resp.data);
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

  //返回列表页
  HandleReturn = () => {
    let path = this.state.budgetJournalDetailReCheckPage.url;
    this.context.router.push(path);
  };

  //返回状态
  getStatus = () => {
    const infoData = this.state.infoData;
    switch (infoData.status) {
      case 1001: {
        return <Badge status="processing" text={'编辑中'} />;
      }
      case 1003: {
        return <Badge status="default" text={'撤回'} />;
      }
      case 1005: {
        return <Badge status="error" text={'审批驳回'} />;
      }
      case 1004: {
        return <Badge status="success" text={'审批通过'} />;
      }
      case 1002: {
        return <Badge status="warning" text={'审批中'} />;
      }
      case 5001: {
        return <Badge status="default" text={'复核'} />;
      }
      case 5002: {
        return <Badge status="default" text={'反冲提交'} />;
      }
      case 5003: {
        return <Badge status="default" text={'反冲审核'} />;
      }
      default: {
        return <Badge status="default" text={infoData.statusName} />;
      }
    }
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

  //撤回
  handleRevocation = () => {
    let header = this.state.headerData;
    if (header.formOid) {
      //工作流
      message.warning('工作流撤回');
      this.setState({ spinLoading: true });
      const dataValue = {
        entities: [
          {
            entityOID: this.state.headerAndListData.dto.documentOid,
            entityType: this.state.headerAndListData.dto.documentType,
          },
        ],
      };
      budgetJournalService
        .revocationJournalWorkflow(dataValue)
        .then(item => {
          // this.context.router.push(this.state.budgetJournalPage.url);
          this.props.dispatch(
            routerRedux.push({
              pathname: `/budget/budget-journal`,
            })
          );
        })
        .catch(e => {});
    } else {
      //非工作流
      message.warning('复核撤回');
      const headerIds = [];
      headerIds.push(this.state.headerData.id);
      budgetJournalService
        .revocationJournal(this.props.user.id, headerIds)
        .then(item => {
          // this.context.router.push(this.state.budgetJournalPage.url);
          this.props.dispatch(
            routerRedux.push({
              pathname: `/budget/budget-journal`,
            })
          );
        })
        .catch(e => {});
    }
  };

  //返回
  HandleReturn = () => {
    // this.context.router.push(this.state.budgetJournalPage.url);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/budget/budget-journal`,
      })
    );
  };

  //审批中返回，撤回按钮
  getCheckingButton() {
    return this.state.infoData.status === 1002 ? (
      <Button className="button-Revocation" type="primary" onClick={this.handleRevocation}>
        {this.$t({ id: 'budgetJournal.returnCommit' })}
      </Button>
    ) : (
      ''
    );
  }

  render() {
    const { data, columns, infoData, pagination, headerData, historyData } = this.state;
    return (
      <div className="budget-journal-detail-submit">
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
            bordered
            size="middle"
            scroll={{ x: '150%' }}
            rowKey={recode => {
              return recode.id;
            }}
            pagination={pagination}
          />

          <div className="collapse">
            <ApproveHistory infoData={historyData} loading={false} />
          </div>

          <Affix
            offsetBottom={0}
            style={{
              position: 'fixed',
              bottom: 0,
              marginLeft: '-35px',
              width: '100%',
              height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
              background: '#fff',
              lineHeight: '50px',
            }}
          >
            <div>
              <Button
                className="button-return"
                style={{ marginLeft: '20px', marginRight: '8px' }}
                onClick={this.HandleReturn}
              >
                {this.$t({ id: 'budgetJournal.return' })}
              </Button>
              {this.state.infoData.status === 1002 ? (
                <Popconfirm
                  placement="topLeft"
                  title={this.$t({ id: 'budgetJournal.returnCommit' })}
                  onConfirm={this.handleRevocation}
                  okText={this.$t({ id: 'common.ok' })}
                  cancelText={this.$t({ id: 'common.cancel' })}
                >
                  <Button
                    className="button-Revocation"
                    type="primary"
                    style={{ marginLeft: '20px', marginRight: '8px' }}
                  >
                    {this.$t({ id: 'budgetJournal.returnCommit' })}
                  </Button>
                </Popconfirm>
              ) : (
                ''
              )}
            </div>
          </Affix>
        </Spin>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    organization: state.user.organization,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BudgetJournalDetailSubmit);
