import React from 'react';
import config from 'config';
import { connect } from 'dva';
import { Form, Row, Col, Badge,Card, Button, Table, Checkbox, message, Icon } from 'antd';
import contractService from 'containers/contract/contract-type/contract-type-define.service';
import ListSelector from 'components/Widget/list-selector';
import { routerRedux } from 'dva/router';

class CompanyDistribution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      companyTypeList: [
        { label: this.$t('adjust.setOfBooks'), id: 'setOfBooksCode' },
        { label: this.$t('contract.type.code'), id: 'contractTypeCode' },
        { label: this.$t('contract.type.name'), id: 'contractTypeName' },
        { label: this.$t('contract.type.status'), id: 'enabled' },
      ],
      companyTypeInfo: {},
      columns: [
        { title: this.$t('supplier.company.code'), dataIndex: 'companyCode' },
        { title: this.$t('supplier.company.name'), dataIndex: 'companyName' },
        {
          title: this.$t('supplier.company.type'),
          dataIndex: 'companyTypeName',
          render: type => <span>{type ? type : '-'}</span>,
        },
        {
          title: this.$t('common.enabled'),
          dataIndex: 'enabled',
          width: '8%',
          render: (enabled, record) => (
            <Checkbox defaultChecked={enabled} onChange={e => this.handleStatusChange(e, record)} />
          ),
        },
      ],
      data: [],
      pagination: {
        total: 0,
      },
      page: 0,
      pageSize: 10,
      showListSelector: false,
      selectorItem: {},
      //contractTypeDefine: menuRoute.getRouteItem('contract-type-define', 'key'), //合同类型定义
    };
  }

  componentDidMount() {
    this.getBasicInfo();
    this.getList();
  }

  getBasicInfo = () => {
    const { params } = this.props.match;
    contractService.getContractTypeInfo(params.setOfBooksId, params.id, { roleType: 'TENANT' }).then(res => {
        let selectorItem = {
          title: this.$t('budget.item.batchCompany'),
          url: `${config.contractUrl}/api/contract/type/${
            params.setOfBooksId
          }/companies/query/filter`,
          searchForm: [
            { type: 'input', id: 'companyCode', label: this.$t('supplier.company.code') },
            { type: 'input', id: 'companyName', label: this.$t('supplier.company.name') }, //公司名称
            {
              type: 'input',
              id: 'companyCodeFrom',
              label: this.$t('chooser.data.companyCode.from' /*公司代码从*/),
            },
            {
              type: 'input',
              id: 'companyCodeTo',
              label: this.$t('chooser.data.companyCode.to' /*公司代码至*/),
            },
          ],
          columns: [
            { title: this.$t('supplier.company.code'), dataIndex: 'companyCode' },
            { title: this.$t('supplier.company.name'), dataIndex: 'name' },
            {
              title: this.$t('supplier.company.type'),
              dataIndex: 'companyTypeName',
              render: value => value || '-',
            },
          ],
          key: 'id',
        };
        this.setState({ companyTypeInfo: res.data, selectorItem });
      });
  };

  getList = () => {
    const { params } = this.props.match;
    const { page, pageSize } = this.state;
    this.setState({ loading: true });
    contractService.getCompanyDistributionByContractType(page, pageSize, params.setOfBooksId, params.id).then(res => {
        if (res.status === 200) {
          this.setState({
            data: res.data,
            loading: false,
            pagination: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page + 1,
              onChange: this.onChangePaper,
              showTotal: total => formatMessage({ id: 'common.total' }, { total: `${total}` }),
            },
          });
        }
      });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  handleStatusChange = (e, record) => {
    let params = {
      id: record.id,
      enabled: e.target.checked,
      versionNumber: record.versionNumber,
    };
    contractService.updateCompanyDistributionStatus(this.props.match.params.setOfBooksId, params).then(res => {
        if (res.status === 200) {
          this.getList();
          message.success(this.$t('common.operate.success'));
        }
      })
      .catch(e => {
        message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
      });
  };

  handleListShow = flag => {
    this.setState({ showListSelector: flag });
  };

  handleListOk = values => {
    const { params } = this.props.match;
    let paramsValue = {};
    paramsValue.contractTypeId = this.props.match.params.id;
    paramsValue.companyIds = [];
    values.result.map(item => {
      paramsValue.companyIds.push(item.id);
    });
    if(paramsValue.companyIds.length === 0){
      message.warn(this.$t('common.select.one.more'));
      return;
    }
    contractService.distributionCompany(params.setOfBooksId, paramsValue).then(res => {
      if (res.status === 200) {
        message.success(this.$t('common.operate.success'));
        this.handleListShow(false);
        this.getList();
      }
    })
      .catch(e => {
        if (e.response) {
          message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
        }
      });
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/document-type-manage/contract-type`,
      })
    );
  };

  render() {
    const {
      loading,
      companyTypeList,
      companyTypeInfo,
      pagination,
      columns,
      data,
      showListSelector,
      selectorItem,
    } = this.state;
    let periodRow = [];
    let periodCol = [];
    companyTypeList.map((item, index) => {
      index <= 2 &&
        periodCol.push(
          <Col span={6} style={{ marginBottom: '15px' }} key={item.id}>
            <div>{item.label}</div>
            <div style={{ wordWrap: 'break-word' }}>
              {item.id === 'setOfBooksCode'
                ? companyTypeInfo[item.id]
                  ? companyTypeInfo[item.id] + ' - ' + companyTypeInfo.setOfBooksName
                  : '-'
                : companyTypeInfo[item.id]}
            </div>
          </Col>
        );
      if (index === 2) {
        periodRow.push(
          <Col
            style={{ padding: '20px 25px 0',borderRadius: '6px 6px 0 0' }}
            key="1"
          >
            {periodCol}
          </Col>
        );
      }
      if (index === 3) {
        periodRow.push(
          <Col span={6} style={{ marginBottom: '15px'}} key={item.id}>
            <div>{item.label}</div>
            <Badge
              status={companyTypeInfo[item.id] ? 'success' : 'error'}
              text={
                companyTypeInfo[item.id] ? this.$t('common.enabled') : this.$t('common.disabled')
              }
            />
          </Col>
        );
      }
    });
    return (
      <div>
        <div style={{background: '#f5f5f5'}}>
        <div style={{ background: '#f5f5f5', height: '80', borderRadius: '4' }}>
          {periodRow}
        </div>
        <div className="table-header" style={{marginTop:60,background: '#ffffff',paddingTop:10 }}>
          <div className="table-header-buttons">
            <Button
              type="primary"
              loading={showListSelector}
              onClick={() => this.handleListShow(true)}
            >
              {this.$t('budget.item.batchCompany') /*批量分配公司*/}
            </Button>
          </div>
        </div>
        </div>
        <Table
          rowKey={record => record.companyId}
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="middle"
        />
        <ListSelector
          visible={showListSelector}
          onCancel={() => this.handleListShow(false)}
          selectorItem={selectorItem}
          extraParams={{ contractTypeId: this.props.match.params.id }}
          onOk={this.handleListOk}
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {this.$t('common.back') /*返回*/}
        </a>
      </div>
    );
  }
}

const wrappedCompanyDistribution = Form.create()(CompanyDistribution);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedCompanyDistribution);
