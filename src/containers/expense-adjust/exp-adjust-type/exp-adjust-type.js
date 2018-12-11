import React, { Component } from 'react'
import { connect } from 'dva'
import config from 'config'
import {  Badge, Button, Popover, message, Checkbox, Divider } from 'antd'
import SearchArea from 'widget/search-area'
import SlideFrame from 'widget/slide-frame'
import baseService from 'share/base.service'
import expAdjustService from 'containers/expense-adjust/exp-adjust-type/exp-adjust-type.service'
import NewExpAdjustType from 'containers/expense-adjust/exp-adjust-type/new-exp-adjust-type'
import CustomTable from 'widget/custom-table'
import { routerRedux } from 'dva/router';

class ExpAdjustType extends Component {
    constructor(props) {
        super(props);

        const adjustType = {
            '1001': this.$t('exp.adjust.exp.detail'),
            '1002': this.$t('exp.adjust.exp.add')
        };
        this.state = {
            loading: true,
            data: [],
            page: 0,
            pageSize: 10,
            setOfBookList: [],
            setOfBooksId: Number(this.props.match.params.setOfBooksId) ? this.props.match.params.setOfBooksId : this.props.company.setOfBooksId,
            pagination: {
              total: 0,
              showQuickJumper: true,
              showSizeChanger: true
            },
            searchForm: [
                { type: 'select', id: 'setOfBooksId', colSpan: 6, label: this.$t({ id: 'adjust.setOfBooks' }/*账套*/), options: [],
                  labelKey: 'name', valueKey: 'id', isRequired: 'true', event: 'SETOFBOOKSID',
                  defaultValue: Number(this.props.match.params.setOfBooksId) ? this.props.match.params.setOfBooksId : this.props.company.setOfBooksId
                },
                { type: 'select', id: 'adjustTypeCategory', label: this.$t('adjust.adjustTypeCategory'), colSpan: 6,event: 'CATE', valueKey: 'value',
                  options: [
                    {label: this.$t('exp.adjust.exp.detail'), value: '1001' },
                    {label: this.$t('exp.adjust.exp.add'), value: '1002' }
                  ],
                },
                {
                    type: 'input', colSpan: 6, id: 'expAdjustTypeCode', label: this.$t({ id: 'adjust.expAdjustTypeCode' }/**单据类型代码*/)
                },
                {
                    type: 'input', colSpan: 6, id: 'expAdjustTypeName', label: this.$t({ id: 'adjust.expAdjustTypeName' }/**单据类型名称*/)
                }
            ],
            columns:
                [
                    {
                        title: this.$t({ id: 'adjust.setOfBooks' }/*账套*/), dataIndex: 'setOfBooksName', width: '17%',
                        render: (value, record) => {
                            return (
                                <span>{record.setOfBooksCode}-{record.setOfBooksName}</span>
                            )
                        }
                    },
                    {
                        title: this.$t({ id: 'adjust.expAdjustTypeCode' }/**单据类型代码*/), dataIndex: 'expAdjustTypeCode', width: '10%',
                        render: expAdjustTypeCode => (
                            <Popover content={expAdjustTypeCode}>{expAdjustTypeCode}</Popover>
                        )
                    },
                    {
                        title: this.$t({ id: 'adjust.expAdjustTypeName' }/**单据类型名称*/), dataIndex: 'expAdjustTypeName', width: '13%',
                        render: expAdjustTypeName => (
                            <Popover content={expAdjustTypeName}>
                                {expAdjustTypeName}
                            </Popover>)
                    },
                    {
                        title: this.$t({ id: 'adjust.adjustTypeCategory' }/**调整类型*/), dataIndex: 'adjustTypeCategory', width: '9%',
                        render: adjustTypeCategory => {
                            return (
                                <span>{adjustType[adjustTypeCategory]}</span>
                            )
                        }
                    },
                    {
                        title: this.$t({ id: 'adjust.budgetFlag' }/**预算管控*/), dataIndex: 'budgetFlag', width: '8%',
                        render: (bugetFlag, record) => (
                            <Checkbox checked={bugetFlag} onClick={(e) => this.onBudgetFlagClick(e, record)} />
                        )
                    },
                    {
                        title: this.$t({ id: 'adjust.accountFlag' }/**核算*/), dataIndex: 'accountFlag', width: '5%',
                        render: (accountFlag, record) => record.adjustTypeCategory === '1001' ?
                            <Checkbox checked={accountFlag} onClick={(e) => this.onAccountFlagClick(e, record)} /> : "-"
                    },
                    {
                        title: this.$t({ id: 'adjust.formName' }/**关联表单类型*/), dataIndex: 'formName', width: '13%',
                        render: formName => (
                            <Popover content={formName}>{formName}</Popover>
                        )
                    },
                    {
                        title: this.$t({ id: 'adjust.enabled' }/**状态*/), dataIndex: 'enabled', width: '7%',
                        render: enabled => (
                            <Badge status={enabled ? 'success' : 'error'}
                                text={enabled ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })} />
                        )
                    },
                    {
                        title: this.$t({ id: 'common.operation' }), key: 'operation',
                        render: (text, record) => (
                            <span>
                                <a onClick={(e) => this.editItem(e, record)}>{this.$t({ id: 'common.edit' })}</a>
                                <Divider type="vertical" />
                                <a onClick={() => this.handleDistribute(record)}>{this.$t({ id: 'adjust.company.distribution' })/**公司分配*/}</a>
                                <Divider type="vertical" />
                                <a onClick={(e) => this.deleteItem(e, record)}>{this.$t({ id: 'common.delete' })}</a>
                            </span>
                        )
                    }
                ],
            searchParams: {
                setOfBooksId: Number(this.props.match.params.setOfBooksId) ? this.props.match.params.setOfBooksId : this.props.company.setOfBooksId,
                expAdjustTypeCode: '',
                expAdjustTypeName: ''
            },
            showSlideFrame: false,
            nowType: {},
            //侧滑页面title
            slideFrameTitle: this.$t({ id: 'adjust.new.expAdjustType' }/**新建费用调整单类型*/)
        }
    }
    //核算点击事件
    onAccountFlagClick = (e, record) => {
        this.setState({
            loading: true
        });
        expAdjustService.updateBudgetorAccountFlag(record.id, !record.accountFlag, record.budgetFlag).then(res => {
            if (res.status === 200) {
              message.success(this.$t('common.operate.success'));
              this.customTable.search({...this.state.searchParams});
            }
        }).catch(e => {
            if (e.response) {
                message.error(`${this.$t('common.operate.filed')},${e.response.data.message}`);
            }
        })
    }
    //预算管控点击事件
    onBudgetFlagClick = (e, record) => {
        this.setState({
            loading: true
        });
        expAdjustService.updateBudgetorAccountFlag(record.id, record.accountFlag, !record.budgetFlag).then(res => {
            if (res.status === 200) {
              message.success(this.$t('common.operate.success'));
              this.customTable.search({...this.state.searchParams});
            }
        }).catch(e => {
            if (e.response) {
                message.error(`${this.$t('common.operate.filed')},${e.response.data.message}`);
                this.setState({
                    loading: false
                });
            }
        });
    }
    //点击编辑
    editItem = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            nowType: record,
            showSlideFrame: true,
            slideFrameTitle: this.$t({ id: 'adjust.edit.expAdjustType' }/**编辑费用调整单类型*/)
        });
    };
    //点击公司分配
    handleDistribute = (record) => {
      this.props.dispatch(routerRedux.replace({
        pathname: '/document-type-manage/exp-adjust-type/distribution-company-exp-adjust-type/:setOfBooksId/:id'
          .replace(':setOfBooksId', record.setOfBooksId).replace(':id', record.id)
        })
      )
    };
    //点击删除
    deleteItem = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        expAdjustService.deleteExpAdjustTypeById(record.id).then(res => {
            if (res.status === 200) {
                message.success(this.$t({ id: 'adjust.delete.success' }/**删除成功*/));
              this.customTable.search(this.state.searchParams);
            }
        }).catch(e => {
            if (e.response) {
                message.error(this.$t({ id: 'adjust.delete.fail' }/**删除失败*/) + `${e.response.data.message}`)
            }
        });
    }
    componentWillMount() {
      this.getSetOfBookList();
    }
    componentWillReceiveProps = (nextProps) => {

    }
    //获取账套列表数据
    getSetOfBookList = () => {
        baseService.getSetOfBooksByTenant().then(res => {
            let list = [];
            res.data.map(item => {
                list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` })
            });
            let form = this.state.searchForm;
            form[0].options = list;
            this.setState({ searchForm: form });
        })
    };

    //分页点击
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState(
                {
                    page: page - 1,
                    loading: true,
                },
                () => {
                  this.customTable.search();
                })
        }
    };
    //点击搜索按钮
    search = (result) => {
      let searchParams = {
        ...result,
          setOfBooksId: result.setOfBooksId ? result.setOfBooksId : this.props.company.setOfBooksId,
      };

        this.setState({searchParams},
            () => {
              this.customTable.search(searchParams);
            }
        )
    };
    //账套切换事件
    searchEventHandle = (event, value) => {
        if (event == 'SETOFBOOKSID') {
            this.setState({
                setOfBooksId: value,
              searchParams:{
                ...this.state.searchParams,
                setOfBooksId: value
              }
            },
                () => {
                  this.customTable.search(this.state.searchParams);
                })
        }
        if(event === 'CATE'){
          let searchParams = this.state.searchParams;
          searchParams.adjustTypeCategory = value;
          this.setState({searchParams})
        }
    };
    //点击清除按钮
    clear = () => {
        this.setState({
            page: 0,
            searchParams: {
                setOfBooksId: this.props.company.setOfBooksId,
            },
            setOfBooksId: this.props.company.setOfBooksId
        },
            () => {
              this.customTable.search(this.state.searchParams);
            })
    };
    //点击新建按钮
    handleNew = () => {
        if (!this.state.setOfBooksId) {
            message.warning(this.$t({ id: 'adjust.new.warn' }/**新建前请选择账套*/));
            return;
        }
        this.setState({ showSlideFrame: true, nowType: { setOfBooksId: this.state.setOfBooksId }, slideFrameTitle: this.$t({ id: 'adjust.new.expAdjustType' }/**新建费用调整单类型*/) })
    };
    //关掉侧滑页面之后
    afterClose = (flag) => {
        this.setState({ showSlideFrame: false },
            () => {
                if (flag) {
                    this.customTable.search(this.state.searchParams);
                }
            })
    };
    //slideFrame的close事件
    onSlideFrameClose = () => {
        this.setState({ showSlideFrame: false });
    }
    //渲染函数，每个Component必须要有的方法
    render() {
        const { searchForm, pagination, columns, data, loading, showSlideFrame, nowType, slideFrameTitle } = this.state;
        return (
            <div className="pre-payment-container">
                <h3 className="header-title">{this.$t({ id: 'adjust.expense.adjust.type.define' })/**费用调整单类型定义*/}</h3>
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    maxLength={4}
                    eventHandle={this.searchEventHandle}
                    wrappedComponentRef={(inst) => this.formRef = inst}
                />
              <div className='divider'/>
                <div className="table-header">
                  <div className="table-header-buttons">
                    <Button type="primary" onClick={this.handleNew}>{this.$t({ id: 'common.create' })}</Button>
                  </div>
                </div>
              <CustomTable
                ref={ref => this.customTable = ref}
                columns={columns}
                params={{setOfBooksId: this.state.setOfBooksId}}
                url={`${config.expenseUrl}/api/expense/adjust/types/query`}
              />
                <SlideFrame
                    title={slideFrameTitle}
                    show={showSlideFrame}
                    onClose={this.onSlideFrameClose}>
                  <NewExpAdjustType
                    onClose={this.afterClose}
                    params={{ expAdjustType: nowType, flag: showSlideFrame }}/>
                </SlideFrame>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        company: state.user.company
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(ExpAdjustType);
