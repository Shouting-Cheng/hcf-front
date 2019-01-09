import React, { Component } from "react"
import {  Row, Col, Popconfirm, Divider, Popover, Select, InputNumber, message } from "antd"
import Table from 'widget/table'
import { connect } from 'dva';
import ListSelector from "widget/list-selector"
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'

class NewShare extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            defaultApportion: {},
            columns: [
                {
                  title: this.$t('exp.company'), dataIndex: "companyName", width: 200,
                  render: (desc,record)=> {
                    return <Popover content={props.expDetail ? record.company.name : desc}><span>{props.expDetail ? record.company.name : desc ? desc : ""}</span></Popover>
                  }
                },
                {
                  title: this.$t('common.department'), dataIndex: "departmentName", width: 200,
                  render: (desc,record)=> {
                    return <Popover content={props.expDetail? record.department.name :desc}><span>{props.expDetail? record.department.name :desc ? desc : ""}</span></Popover>
                  }
                },
                {   //分摊金额
                    title: this.$t('expense.apportion.amount'), dataIndex: "cost", width: 160, key: "cost", render: (value, record, index) => {
                        return (record.status == "edit" || record.status == "new") ? (
                            <div style={{ textAlign: "right" }}>
                                <InputNumber precision={2} value={this.props.mode?value : -value} onChange={(val) => this.costChange(index, val)} />
                            </div>
                        ) : <span style={{textAlign: "right"}}>{this.toDecimal2(this.props.mode?value : -value)}</span>
                    }
                },
            ],
            loading: false,
            x: false,
            isRefresh: false,
            showSelector: false,
            index: 0,
            selectType: "",
            selectKey: "",
            dataCache: {},
            costCenterData: {},
            applicationCol: {
                title: this.$t('request.edit.related.application')/*关联申请单*/, width: 240, dataIndex: "applicationCode", key: "applicationCode", render: (value, record) => {
                    return <a>{record.application && record.application.businessCode}</a>
                }
            },
            optionCol: {
                title: this.$t('common.operation'), dataIndex: "id", key: "id", fixed: "right", width: 120, render: (value, record, index) => {
                    return (
                        (record.status == "edit" || record.status == "new") ?
                            (
                                <div>
                                    <a onClick={() => this.save(index)}>{this.$t('common.save')}</a>
                                    <Divider type="vertical"></Divider>
                                    <a onClick={() => this.cancel(index)}>{this.$t('common.cancel')}</a>
                                </div>
                            ) :
                            (
                                <div>
                                    <a onClick={() => this.edit(index)}>{this.$t('common.edit')}</a>
                                    {(!record.defaultApportion) && <Divider type="vertical"></Divider>}
                                    <Popconfirm placement="top" title={this.$t('configuration.detail.tip.delete')} onConfirm={() => { this.delete(index) }} okText="确定" cancelText="取消">
                                        {!record.defaultApportion && <a>{this.$t('common.delete')}</a>}
                                    </Popconfirm>
                                </div>
                            )
                    )
                }
            }
        }
    }

    componentDidMount() {
        this.setState({
            defaultApportion: this.props.params.defaultApportion,
            relatedApplication: this.props.params.relatedApplication,
            isRefresh: this.props.isRefresh
        }, () => {
            let cols = this.state.columns;

            if (this.state.relatedApplication) {
                cols.splice(0, 0, this.state.applicationCol);
            }

            if (this.state.defaultApportion.costCenterItems && this.state.defaultApportion.costCenterItems.length) {
                this.state.defaultApportion.costCenterItems.map(o => {
                    cols.push({
                        title: o.fieldName, dataIndex: o.dimensionId, key: o.dimensionId, width: 180, render: (value, record, index) => {
                            return (record.status == "edit" || record.status == "new") ? (
                                <Select labelInValue value={value} onChange={(val) => this.centerChange(index, val, o.dimensionId)} onFocus={() => this.handleFocus(o.dimensionId)} >
                                    {
                                        this.state.costCenterData[o.dimensionId] && this.state.costCenterData[o.dimensionId].map(item => {
                                            return (
                                                <Select.Option key={parseInt(item.id)} value={parseInt(item.id)}>{item.name}</Select.Option>
                                            )
                                        })
                                    }
                                </Select>
                            ) : <span>{record[o.dimensionId].label}</span>
                        }
                    })
                })
            }

            // let columns = [
            //     {
            //         title: "关联申请单", dataIndex: "applicationCode", key: "applicationCode", fixed: "left", width: 100, render: (value, record) => {
            //             return (
            //                 <Popover content={value}>
            //                     <div style={{ maxWidth: 70, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}><a>{value}</a></div>
            //                 </Popover>
            //             )
            //         }
            //     },
            //     {
            //         title: "组织", dataIndex: "origanzation", key: "companyName", fixed: "left", width: 200, render: (value, record) => {
            //             return (<Popover content={<div><span>公司：{record.companyName}</span><br />
            //                 <span>部门：{record.departmentName}</span></div>}>
            //                 <span>公司：{record.companyName}</span><br />
            //                 <span>部门：{record.departmentName}</span>
            //             </Popover>)
            //         }
            //     },
            // ]

            // if (!this.state.relatedApplication) {
            //     columns = [
            //         {
            //             title: "组织", dataIndex: "origanzation", key: "origanzation", fixed: "left", width: 200, render: (value, record) => {
            //                 return (<Popover content={<div><span>公司：{record.companyName}</span><br />
            //                     <span>部门：{record.departmentName}</span></div>}>
            //                     <span>公司：{record.companyName}</span><br />
            //                     <span>部门：{record.departmentName}</span>
            //                 </Popover>)
            //             }
            //         },
            //     ]
            // }

            // this.state.defaultApportion.costCenterItems.map(o => {
            //     columns.push({ title: o.fieldName, dataIndex: o.dimensionId, key: o.dimensionId })
            // })
            let optionCol = this.state.optionCol;

          /*  if (!this.state.relatedApplication && !this.state.defaultApportion.costCenterItems.length) {
                optionCol.fixed = "";
            }
*/
            //cols.push(this.state.optionCol);

            let width = this.state.relatedApplication ? 800 : 560;
          //  this.setState({ columns: cols, flag: true, x: this.state.defaultApportion.costCenterItems.length ? width + (this.state.defaultApportion.costCenterItems.length) * 180 : width });
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isRefresh !== this.state.isRefresh) {
            this.setState({ data: nextProps.data, isRefresh: nextProps.isRefresh });
        }
    }

    //显示选择弹出框
    showSelector = (index, selectKey, selectType) => {
        this[selectKey + index].blur();
        this.setState({ showSelector: true, index, selectType, selectKey });
    }

    //弹出框选取后
    selectOk = (values) => {
        let data = this.state.data;
        let record = data[this.state.index];

        record[this.state.selectKey] = values.result[0];

        this.props.handleOk && this.props.handleOk(data);
        this.setState({ data, showSelector: false })
    }

    //费用改变时触发
    costChange = (index, value) => {
        let data = this.state.data;
        let record = data[index];
        record.cost = value;
        this.props.handleOk && this.props.handleOk(data, true);
        this.setState({ data })
    }

    //成本中心变化
    centerChange = (index, value, oid) => {
        let data = this.state.data;
        let record = data[index];
        record[oid] = value;
        this.props.handleOk && this.props.handleOk(data);
        this.setState({ data })
    }

    //保存
    save = (index) => {
        let data = this.state.data;
        let record = data[index];
        let error = false;

        if (!record.company || !record.company.id) {
            message.error(this.$t('exp.validate.company'));
            error = true;
        }
        if (!record.department || !record.department.departmentId) {
            message.error(this.$t('exp.validate.dept'));
            error = true;
        }
        if (!record.cost || parseFloat(record.cost) <= 0) {
            message.error(this.$t('exp.validate.detail.amount'));
            error = true;
        }

        if (this.state.defaultApportion.costCenterItems && this.state.defaultApportion.costCenterItems.length) {
            this.state.defaultApportion.costCenterItems.map(o => {
                if (!record[o.dimensionId] || !record[o.dimensionId].key) {
                    message.error(this.$t('exp.validate.cos'));
                    error = true;
                }
            })
        }

        if (error) return;


        record.status = "normal";
        record.cost = this.toDecimal2(record.cost);
        this.props.handleOk && this.props.handleOk(data);
        this.setState({ data });
    };

    //成本中心得到焦点时
    handleFocus = (dimensionId) => {
        if (this.state.costCenterData[dimensionId]) return;

        let costCenterData = { ...this.state.costCenterData };
        reimburseService.getCostList(dimensionId).then(res => {
            costCenterData[dimensionId] = res.data;
            this.setState({ costCenterData });
        })
    };

    //删除一行
    delete = (index) => {
        this.props.deleteShare && this.props.deleteShare(index);
    }

    //编辑
    edit = (index) => {
        let data = this.state.data;
        let record = data[index];
        record.status = "edit";
        let dataCache = { ...record };
        this.setState({ data, dataCache });
    }

    //取消
    cancel = (index) => {
        let data = this.state.data;
        if (data[index].status == "edit") {
            data[index] = { ...this.state.dataCache, status: "normal" };
            this.props.handleOk && this.props.handleOk(data, true);
            this.setState({ data, dataCache: null });
        } else if (data[index].status == "new") {
            data.splice(index, 1);
            this.props.handleOk && this.props.handleOk(data, true);
            this.setState({ data, dataCache: null });
        }
    }

    //四舍五入 保留两位小数
    toDecimal2 = (x) => {

        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }
    render() {
      const { data, columns, loading, x, showSelector } = this.state;

      return (
            <div>
                <Row style={{ marginTop: 10 }} className="invoice-info-row">
                    <Col span={24} offset={0}>
                        <Table
                            rowKey={record => record.rowKey}
                            loading={loading}
                            columns={columns}
                            dataSource={data}
                            scroll={{ x: x }}
                            bordered
                        >
                        </Table>
                    </Col>
                </Row >
                <ListSelector
                    single={true}
                    visible={showSelector}
                    type={this.state.selectType}
                    onCancel={() => { this.setState({ showSelector: false }) }}
                    onOk={this.selectOk}
                    extraParams={{ tenantId: this.props.user.tenantId, setOfBooksId: this.props.company.setOfBooksId }}
                    selectedData={[]} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })((NewShare));

// export default NewShare
