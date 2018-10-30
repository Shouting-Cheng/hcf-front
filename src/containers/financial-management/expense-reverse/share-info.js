import React, { Component } from "react"
import { Table, Row, Col, Popconfirm, Divider, Popover, Select, InputNumber, message } from "antd"
import { connect } from 'dva';

//import reimburseService from 'containers/reimburse/reimburse.service'

class ShareInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            defaultApportion: {},
            columns: [
                {
                    title: this.$t('exp.company'), dataIndex: "companyName", width: 200, render: (value, record, index) => {
                        return <Popover content={value ? value : ""}>
                            <span>{value ? value : ""}</span>
                        </Popover>
                    }
                },
                {
                    title: this.$t('common.department'), dataIndex: "departmentName", width: 200, render: (value, record, index) =>
                        <Popover content={record.departmentName ? record.departmentName : ""}>
                            <span>{record.departmentName ? record.departmentName : ""}</span>
                        </Popover>
                },
                {
                    title: this.$t('expense.apportion.amount'), dataIndex: "amount", width: 160, key: "cost", render: (value, record, index) => {
                        return  this.filterMoney(value, 2)
                    }
                },
            ],
            loading: false,
            x: false,
            isRefresh: true,
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
            }
        }
    }

    componentDidMount() {

        // this.setState({
        //     defaultApportion: this.props.params.defaultApportion,
        //     relatedApplication: this.props.params.relatedApplication,
        //     isRefresh: this.props.isRefresh
        // }, () => {
        //     let cols = this.state.columns;

        //     if (this.state.relatedApplication) {
        //         cols.splice(0, 0, this.state.applicationCol);
        //     }

        //     if (this.state.defaultApportion.costCenterItems && this.state.defaultApportion.costCenterItems.length) {
        //         this.state.defaultApportion.costCenterItems.map(o => {
        //             cols.push({
        //                 title: o.fieldName, dataIndex: o.costCenterOID, key: o.costCenterOID, width: 180, render: (value, record, index) => {
        //                     return (record.status == "edit" || record.status == "new") ? (
        //                         <Select labelInValue value={value} onChange={(val) => this.centerChange(index, val, o.costCenterOID)} onFocus={() => this.handleFocus(o.costCenterOID)} >
        //                             {
        //                                 this.state.costCenterData[o.costCenterOID] && this.state.costCenterData[o.costCenterOID].map(item => {
        //                                     return (
        //                                         <Select.Option key={parseInt(item.id)} value={parseInt(item.id)}>{item.name}</Select.Option>
        //                                     )
        //                                 })
        //                             }
        //                         </Select>
        //                     ) : <span>{record[o.costCenterOID].label}</span>
        //                 }
        //             })
        //         })
        //     }

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
            //     columns.push({ title: o.fieldName, dataIndex: o.costCenterOID, key: o.costCenterOID })
            // })


        //     if (!this.state.relatedApplication && !this.state.defaultApportion.costCenterItems.length) {
        //         optionCol.fixed = "";
        //     }

        //     cols.push(this.state.optionCol);

        //     let width = this.state.relatedApplication ? 920 : 680;
        //     this.setState({ columns: cols, flag: true, x: this.state.defaultApportion.costCenterItems.length ? width + (this.state.defaultApportion.costCenterItems.length) * 180 : width });
        // });
    }

    componentWillReceiveProps(nextProps) {
       let params = nextProps.params;
       const { columns, isRefresh} = this.state;
        if(params.defaultApportion.costCenterItems.length>0&&isRefresh){
            columns.splice(-1,1);
            params.defaultApportion.costCenterItems.map(o => {
              columns.push({ title: o.fieldName, dataIndex: o.costCenterItemId, key: o.costCenterItemId,
                render: desc => <span>{desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'}</span>
              });
            });
          columns.push({ title: this.$t('expense.apportion.amount'), dataIndex: "amount", fixed: "right", width: 100, key: "amount", render: desc=>this.filterMoney(desc) });
        }
        if(!!nextProps.data){
          nextProps.data.map(item=>{
            item.costCenterItems.map(i=>{
              item [i.costCenterItemId] = i.costCenterItemName;
            })
          });
        }
       this.setState({ data:nextProps.data, isRefresh: nextProps.isRefresh, columns,x: params.defaultApportion.costCenterItems.length });

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
                            rowKey={record => record.id}
                            loading={loading}
                            columns={columns}
                            dataSource={data}
                            scroll={{ x: x }}
                            bordered
                        >
                        </Table>
                    </Col>
                </Row >
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

export default connect(mapStateToProps, null, null, { withRef: true })(ShareInfo);

// export default NewShare
