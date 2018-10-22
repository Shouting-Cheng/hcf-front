import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Input,
  Row,
  Col,
  InputNumber,
  message,
  Menu,
  Badge,
  Icon,
  Popover,
  Dropdown,
  Tag,
} from 'antd';
import config from 'config';
import { routerRedux } from 'dva/router';
import contractService from 'containers/contract/contract-approve/contract.service';
import 'styles/contract/my-contract/my-contract.scss';
import moment from 'moment';
import SearchArea from 'components/Widget/search-area';
import debounce from 'lodash.debounce';
const Search = Input.Search;
import CustomTable from 'components/Widget/custom-table';
import { messages } from 'utils/utils';
import PropTypes from 'prop-types';

const statusList = [
  { value: 1001, label: messages('common.editing') },
  { value: 1002, label: messages('common.approving') },
  { value: 1003, label: messages('common.withdraw') },
  { value: 1004, label: messages('common.approve.pass') },
  { value: 1005, label: messages('common.approve.rejected') },
  { value: 6001, label: messages('my.contract.state.hold') },
  { value: 6002, label: messages('my.contract.state.cancel') },
  { value: 6003, label: messages('my.contract.state.finish') },
];

class MyContract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchForm: [
        // { type: 'input', colSpan: 6, id: 'contractNumber', label: this.$t({ id: "my.contract.number" }/*合同编号*/) },
        {
          type: 'input',
          colSpan: 6,
          id: 'contractName',
          label: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          event:"CONTRACT_NAME"
        },
        {
          type: 'list',
          colSpan: 6,
          id: 'companyId',
          label: this.$t({ id: 'my.contract.contractCompany' } /*公司*/),
          listType: 'company',
          valueKey: 'id',
          labelKey: 'name',
          options: [],
          event: 'id',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          single: true,
          event:"COMPANY_ID"
        },
        {
          type: 'list',
          colSpan: 6,
          id: 'contractTypeId',
          label: this.$t({ id: 'my.contract.type' } /*合同类型*/),
          single: true,
          labelKey: 'contractTypeName',
          valueKey: 'id',
          listType: 'contract_type',
          listExtraParams: { companyId: this.props.company.id },
          event:"CONTRACT_TYPE_ID"
        },
        {
          type: 'select',
          colSpan: 6,
          id: 'status',
          label: this.$t({ id: 'common.column.status' } /*状态*/),
          options: statusList,
          event:"STATUS"
        },
        {
          type: 'items',
          colSpan: 6,
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'signDateFrom',
              label: this.$t({ id: 'my.contract.signDate.from' } /*签署日期从*/),
              event:"SIGN_DATE_FROM"
            },
            {
              type: 'date',
              id: 'signDateTo',
              label: this.$t({ id: 'my.contract.signDate.to' } /*签署日期至*/),
              event:"SIGN_DATE_TO"
            },
          ],
        },
        {
          type: 'value_list',
          colSpan: 6,
          id: 'partnerCategory',
          label: this.$t({ id: 'my.contract.partner.category' } /*合同方类型*/),
          valueListCode: 2107,
          options: [],
          event: 'CON_PARTNER_TYPE',
        },
        {
          type: 'list',
          listType: 'select_payee_name_code',
          colSpan: 6,
          id: 'partnerId',
          label: this.$t({ id: 'my.contract.partner' } /*合同方*/),
          single: true,
          valueKey: 'id',
          disabled: true,
          labelKey: 'name',
          event:"PARTNER_ID"
        },
        {
          type: 'select',
          id: 'currency',
          label: this.$t({ id: 'expense.reverse.currency.code' } /*币种*/),
          options: [],
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
          event:"CURRENCY"
        },
        {
          type: 'items',
          colSpan: 6,
          id: 'amountRange',
          items: [
            {
              type: 'inputNumber',
              id: 'amountFrom',
              label: this.$t({ id: 'my.contract.amount.from' } /*合同金额从*/),
              event:"AMOUNT_FROM"
            },
            {
              type: 'inputNumber',
              id: 'amountTo',
              label: this.$t({ id: 'my.contract.amount.to' } /*合同金额至*/),
              event:"AMOUNT_TO"
            },
          ],
        },
        {
          type: 'input',
          colSpan: 6,
          id: 'remark',
          label: this.$t({ id: 'common.comment' } /*备注*/),
          event:"REMARK"
        },
      ],
      searchParams: {},
      columns: [
        {
          title: this.$t({ id: 'my.contract.number' } /*合同编号*/),
          dataIndex: 'contractNumber',
          width: 180,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          dataIndex: 'contractName',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.contractCompany' } /*合同公司*/),
          dataIndex: 'companyName',
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        /*{ title: this.$t({ id: "my.contract.type" }/!*合同类型*!/), dataIndex: 'contractTypeName',align: 'center',
          render: desc=><span><Popover content={desc}>{desc? desc : ""}</Popover></span>
        },*/

        {
          title: this.$t({ id: 'my.contract.signDate' } /*签署日期*/),
          dataIndex: 'signDate',
          width: 100,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={moment(desc).format('YYYY-MM-DD')}>
                {desc ? moment(desc).format('YYYY-MM-DD') : '-'}
              </Popover>
            </span>
          ),
        },
        {
          title: this.$t('my.contract.part'),
          dataIndex: 'partnerCategoryName',
          align: 'center',
          render: (value, record) => {
            return value ? (
              <div>
                {value}
                <span className="ant-divider" />
                {record.partnerName}
              </div>
            ) : (
              '-'
            );
          },
        },
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          width: '5%',
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.amount' } /*合同金额*/),
          dataIndex: 'amount',
          width: 110,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover>
            </span>
          ),
        },
        /* {
           title: this.$t({ id: "common.comment" }/!*备注*!/), dataIndex: 'desc',
           render: desc=><span><Popover content={desc}>{desc? desc : ""}</Popover></span>
         },*/
        {
          title: this.$t({ id: 'common.column.status' } /*状态*/),
          dataIndex: 'status',
          align: 'center',
          width: '110px',
          render: value => (
            <Badge status={this.$statusList[value].state} text={this.$statusList[value].label} />
          ),
        },
      ],
      data: [],
      contractType: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
      },
      company: '',
      //NewContract: menuRoute.getRouteItem('new-contract', 'key'), //新建合同
      //ContractDetail: menuRoute.getRouteItem('contract-detail', 'key'), //合同详情
    };
    this.searchNumber = debounce(this.searchNumber, 500);
  }

  componentDidMount() {
    //this.getList();
    this.getContractType();
  }

  getContractType = () => {
    let params = {
      companyId: this.props.company.id,
    };
    contractService.getContractTypeByCompany(params).then(response => {
      this.setState({ contractType: response.data });
    });
  };

  /*getList = () => {
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    contractService.getContractList(page, pageSize, searchParams).then((res) => {
      if (res.status === 200) {
        this.setState({
          loading: false,
          data: res.data || [],
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: page + 1,
            onChange: this.onChangePaper,
            showTotal: total => this.$t({ id: "common.total" }, { total:total }/!*共搜索到 {total} 条数据*!/)
          }
        })
      }
    }).catch(() => {
      this.setState({ loading: false });
      message.error(this.$t({ id: "common.error" }/!*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*!/))
    })
  };*/

  searchNumber = e => {
    this.setState(
      {
        searchParams: { ...this.state.searchParams, contractNumber: e },
      },
      () => {
        this.customTable.search({ ...this.state.searchParams, contractNumber: e });
      }
    );
  };

  //搜索
  search = values => {
    values.signDateFrom && (values.signDateFrom = moment(values.signDateFrom).format('YYYY-MM-DD'));
    values.signDateTo && (values.signDateTo = moment(values.signDateTo).format('YYYY-MM-DD'));
    if(values.companyId && values.companyId[0]){
      values.companyId = values.companyId[0];
    }
    if(values.contractTypeId && values.contractTypeId[0]){
      values.contractTypeId = values.contractTypeId[0];
    }
    if(values.partnerId && values.partnerId[0]){
      values.partnerId = values.partnerId[0];
    }
    this.setState({ searchParams:{...this.state.searchParams, ...values} }, () => {
      this.customTable.search({ ...this.state.searchParams, ...values });
    });
  };

  change = (e) =>{
    const { searchParams } = this.state;
    if(e && e.target && e.target.value){
      searchParams.contractNumber = e.target.value;
    }else{
      searchParams.contractNumber = '';
    }
    this.setState({searchParams});
  }

  clear = () => {
    const { searchForm } = this.state;
    searchForm[6].disabled = true;
    this.setState({
      searchForm,
    });
    this.eventHandle('id', null);
    this.eventHandle('code', null);
  };

  //合同详情
  rowClick = record => {
    //this.context.router.push(this.state.ContractDetail.url.replace(':id', record.id).replace(':from', "contract"));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/my-contract/contract-detail/${record.id}`,
      })
    );
  };

  eventHandle = (type, value) => {
    let searchForm = this.state.searchForm;
    const { searchParams } = this.state;
    switch (type) {
      case 'CON_PARTNER_TYPE': {
        searchParams.partnerCategory = value;
        this.setState({searchParams});
        if (value) {
          searchForm[6].disabled = false;
          searchForm[6].listExtraParams = {
            empFlag: value === 'EMPLOYEE' ? 1001 : 1002,
            pageFlag: true,
          };
          this.formRef.setValues({ partnerId: [] });
        } else {
          this.formRef.setValues({ partnerId: [] });
          searchForm[6].disabled = true;
        }
        break;
      }
      case 'CONTRACT_NAME': {
        searchParams.contractName = value;
        break;
      }
      case 'CONTRACT_TYPE_ID': {
        searchParams.contractTypeId = value;
        break;
      }
      case 'STATUS': {
        searchParams.status = value;
        break;
      }
      case 'SIGN_DATE_FROM': {
        if(value){
          searchParams.signDateFrom = moment(value).format('YYYY-MM-DD')
        }else{
          searchParams.signDateFrom = '';
        }
        break;
      }
      case 'SIGN_DATE_TO': {
        if(value){
          searchParams.signDateTo = moment(value).format('YYYY-MM-DD')
        }else{
          searchParams.signDateTo = '';
        }
        break;
      }
      case 'PARTNER_ID': {
        searchParams.partnerId = value;
        break;
      }
      case 'CURRENCY': {
        searchParams.currency = value;
        break;
      }
      case 'AMOUNT_FROM': {
        searchParams.amountFrom = value;
        break;
      }
      case 'AMOUNT_TO': {
        searchParams.amountTo = value;
        break;
      }
      case 'REMARK': {
        searchParams.remark = value;
      break;
    }
      this.setState({searchParams});
    }

    /*if (type === 'id') {  //合同类型
      this.formRef._reactInternalInstance._renderedComponent._instance.setValues({
        contractTypeId: undefined
      });
      searchForm.map(item => {
        if (item.id === 'contractTypeId') {
          if (value) {
            item.listExtraParams = { companyId: value };
            item.disabled = false
          } else {
            item.disabled = true
          }
        }
      })
      searchForm.map(item => {
        if (item.id === 'partnerId') {
          item.listExtraParams = { companyId: value };
          if (value && this.state.contractType) {
            item.disabled = false;
          }
          else {
            item.disabled = true;
          }
        }
      });

      this.setState({ searchForm, company: value });

    } else if (type === 'CON_PARTNER_TYPE') { //合同方
      /!*this.formRef._reactInternalInstance._renderedComponent._instance.setValues({
        partnerId: value === 'EMPLOYEE' ? [] : ''
      });*!/
      searchForm.map(item => {
        if (item.id === 'partnerId') {
          if (value === 'EMPLOYEE') { //员工
            item.type = 'list';
            item.labelKey = 'fullName';
            item.listType = "contract_user";
            item.listExtraParams = { companyId: this.state.company };
          } else if (value === 'VENDER') { //供应商
            item.type = 'list';
            item.labelKey = 'venNickname';
            item.listType = "select_vendor";
            item.listExtraParams = { companyId: this.state.company }
          }
          if (value && this.state.company) {
            item.disabled = false;
          }
          else {
            item.disabled = true;
          }
        }
      });
    }*/
    this.setState({ searchForm });
  };

  //新建
  handleCreate = e => {
    //this.context.router.push(this.state.NewContract.url.replace(':contractTypeId', e.key));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/my-contract/new-contract/${e.key}`,
      })
    );
  };

  render() {
    const { loading, searchForm, columns, data, pagination, contractType } = this.state;
    return (
      <div className="my-contract">
        <SearchArea
          searchForm={searchForm}
          eventHandle={this.eventHandle}
          submitHandle={this.search}
          clearHandle={this.clear}
          maxLength={4}
          wrappedComponentRef={inst => (this.formRef = inst)}
        />
        <Row gutter={24} style={{ marginBottom: 12, marginTop: 12 }}>
          <Col span={18}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu onClick={this.handleCreate}>
                  {contractType.map(item => (
                    <Menu.Item key={item.id}>{item.contractTypeName}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button type="primary">
                {this.$t({ id: 'menu.new-contract' })}
                <Icon type="down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span={6}>
            <Search
              placeholder={this.$t('my.please.input.number')}
              onSearch={this.searchNumber}
              onChange={this.change}
              className="search-number"
              enterButton
            />
          </Col>
        </Row>
        <CustomTable
          ref={ref => (this.customTable = ref)}
          columns={columns}
          tableKey="id"
          onClick={this.rowClick}
          url={`${config.contractUrl}/api/contract/header/update/query`}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const wrappedMyContract = Form.create()(MyContract);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedMyContract);
