import React, { Component } from 'react'
import { connect } from 'dva'
import {Col, Badge, Button, Table, Checkbox, message, Icon } from 'antd'
import config from 'config'
import expAdjustService from 'containers/expense-adjust/exp-adjust-type/exp-adjust-type.service'
import ListSelector from 'widget/list-selector'
import CustomTable from 'widget/custom-table'
import { routerRedux } from 'dva/router';

class DistributionCompanyExpAdjustType extends Component {
    //构造函数，一般用来做初始化的工作
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            pagination: { total: 0 },
            page: 0,
            pageSize: 10,
            showListSelector: false,
            columns: [
                { title: this.$t('supplier.company.code'), dataIndex: 'companyCode' },
                { title: this.$t('supplier.company.name'), dataIndex: 'companyName' },
                { title: this.$t('supplier.company.type'), dataIndex: 'companyType' },
                {
                    title: this.$t('common.enabled'), dataIndex: 'enabled', render: (value, record) => {
                        return <Checkbox onClick={(e) => this.handleEnabledClick(e, record)} checked={value}></Checkbox>
                    }
                }
            ],
            data: [],
            companyTypeList: [
                { label: this.$t('adjust.setOfBooks'), id: 'setOfBooksCode' },
                { label: this.$t('adjust.expAdjustTypeCode'), id: 'expAdjustTypeCode' },
                { label: this.$t('adjust.expAdjustTypeName'), id: 'expAdjustTypeName' },
                { label: this.$t('adjust.expAdjustType.type'), id: 'enabled' }
            ],
            companyTypeInfo: {},
            selectorItem: {}
        }
    }
    //是否启用
    handleEnabledClick = (e, record) => {
        console.log(record);
        let params = [];
        params.push({
            id: record.id,
            enabled: e.target.checked
        });
        expAdjustService.batchUpdateAssignCompany(params).then(res => {
            if (res.status === 200) {
                message.success(this.$t('common.operate.success'));
              this.customTable.search({expAdjustTypeId: this.props.match.params.id})
            }
        }).catch(e => {
            if (e.response) {
                message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
            }
        });
    }
    //生命周期函数，在constructor之后在render之前执行
    componentWillMount = () => {
       // this.getCompanyList();
        this.getBasicInfo();
    };
   /* //获取该费用调整单类型已经分配的公司
    getCompanyList = () => {
        let params = {
            expAdjustTypeId: this.props.match.params.id,
            page: this.state.page,
            size: this.state.pageSize
        };
        expAdjustService.getDistributiveCompany(params).then(res => {
            this.setState({
                loading: false,
                data: res.data,
                pagination: {
                  total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                  onChange: this.onChangePaper,
                  current: this.state.page + 1,
                  showTotal: total => formatMessage({ id: 'common.total' }, { total: `${total}` })
                }
            });
        });
    };*/
   /* //分页点击
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState(
                {
                    page: page - 1,
                    loading: true,
                },
                () => {
                    this.getCompanyList();
                })
        }
    };*/
    //根据传递过来的费用调整单类型id获取record数据
    getBasicInfo = () => {
        expAdjustService.getExpenseAdjustTypeById(this.props.match.params.id).then(res => {
            let selectorItem = {
                title: this.$t("budget.item.batchCompany"),
                url: `/auth/api/expense/adjust/type/assign/companies/filter`,
                searchForm: [
                    { type: 'input', colSpan: 8, id: 'companyCode', label: this.$t('supplier.company.code') },
                    { type: 'input', colSpan: 8, id: 'companyName', label: this.$t('supplier.company.name') },
                    { type: 'input', colSpan: 8, id: 'companyCodeFrom', label: this.$t('chooser.data.companyCode.from'/*公司代码从*/) },
                    { type: 'input', colSpan: 8, id: 'companyCodeTo', label: this.$t('chooser.data.companyCode.to'/*公司代码至*/) }
                ],
                columns: [
                    { title: this.$t('supplier.company.code'), dataIndex: 'companyCode' },
                    { title: this.$t('supplier.company.name'), dataIndex: 'name' },
                    { title: this.$t('supplier.company.type'), dataIndex: 'companyTypeName', render: value => value ? value : '-' }
                ],
                key: 'id'
            };
            this.setState({
                companyTypeInfo: res.data.expenseAdjustType, selectorItem
            });
        });
    };
    //点击批量分配公司按钮
    handleListShow = (flag) => {
        this.setState({ showListSelector: flag });
    };
    //确定批量分配公司
    handleListSelectorOk = (values) => {
        let params = [];
        values.result.map(item => {
            params.push({
                expAdjustTypeId: this.props.match.params.id,
                companyId: item.id,
                companyCode: item.companyCode,
                enabled: item.enabled
            });
        });
        expAdjustService.batchAssignCompany(params).then(res => {
            if (res.status === 200) {
              message.success(this.$t('common.operate.success'));
              this.handleListShow(false);
                this.customTable.search({expAdjustTypeId: this.props.match.params.id})
            }
        }).catch((e) => {
            if (e.response) {
                message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`)
            }
        });
    };
    //返回
    handleBack = () => {
      this.props.dispatch(routerRedux.replace({
        pathname: '/document-type-manage/exp-adjust-type/:setOfBooksId'
          .replace(':setOfBooksId', this.props.match.params.setOfBooksId)
      }))
    };
    //每个组件都会有的渲染函数
    render() {
      const { pagination, columns, data, loading, companyTypeInfo, companyTypeList, showListSelector, selectorItem } = this.state;
      let periodRow = [];
      let periodCol = [];

      companyTypeList.map((item, index) => {
        index <= 2 && periodCol.push(
          <Col span={6} style={{marginBottom: '15px'}} key={item.id}>
            <div style={{color: '#989898'}}>{item.label}</div>
            <div style={{wordWrap:'break-word'}}>
              {item.id === 'setOfBooksCode' ?
                companyTypeInfo[item.id] ? companyTypeInfo[item.id] + ' - ' + companyTypeInfo.setOfBooksName : '-' :
                companyTypeInfo[item.id]}
            </div>
          </Col>
        );
        if (index === 2) {
          periodRow.push(
            <Col style={{background:'#f7f7f7',padding:'20px 25px 0',borderRadius:'6px 6px 0 0'}} key="1">
              {periodCol}
            </Col>
          );
        }
        if (index === 3) {
          periodRow.push(
              <Col span={6} style={{marginBottom: '15px'}} key={item.id}>
                <div style={{color: '#989898'}}>{item.label}</div>
                <Badge status={companyTypeInfo[item.id] ? 'success' : 'error'}
                       text={companyTypeInfo[item.id] ? this.$t('common.enabled') : this.$t('common.disabled')} />
              </Col>
          );
        }
      });
        return (
            <div className='company-distribution'>
              <div className="jsq" style={{background: '#f5f5f5', width: '100%', height: '80', borderRadius:'4'}}>
                {periodRow}
              </div>

                <div className='table-header'>
                    <div className='table-header-buttons'>
                        <Button type='primary' onClick={() => this.handleListShow(true)}>{this.$t("budget.item.batchCompany")}</Button>
                    </div>
                </div>
              <CustomTable
                ref={ref => this.customTable = ref}
                columns={columns}
                params={{expAdjustTypeId: this.props.match.params.id,}}
                url={`${config.baseUrl}/api/expense/adjust/type/assign/companies/query`}
              />
                <ListSelector visible={showListSelector}
                    selectorItem={selectorItem}
                    extraParams={{ expAdjustTypeId: this.props.match.params.id }}
                    onCancel={() => this.handleListShow(false)}
                    onOk={this.handleListSelectorOk} />
                <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />{this.$t('common.back')}</a>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}
// const wrappedCompanyDistribution = Form.create()(injectIntl(DistributionCompanyExpAdjustType));
export default connect(mapStateToProps, null, null, { withRef: true })(DistributionCompanyExpAdjustType);
