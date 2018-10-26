import React, { Component } from 'react';
import { Table, Row, Col, Popconfirm, Divider, Popover, Select, InputNumber, message } from 'antd';
import { connect } from 'react-redux';

import ListSelector from 'widget/list-selector';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';

class NewShare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      defaultApportion: {},
      columns: [
        {
          title: '公司',
          dataIndex: 'company',
          width: 200,
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Select
                disabled={record.isCreateByApplication}
                ref={ref => {
                  this['company' + index] = ref;
                }}
                value={record.company ? record.company.name : ''}
                onFocus={() => {
                  this.showSelector(index, 'company', 'select_company_reimburse');
                }}
              />
            ) : (
              <Popover content={record.company ? record.company.name : ''}>
                <span>{record.company ? record.company.name : ''}</span>
              </Popover>
            );
          },
        },
        {
          title: '部门',
          dataIndex: 'department',
          width: 200,
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Select
                disabled={record.isCreateByApplication}
                ref={ref => {
                  this['department' + index] = ref;
                }}
                value={record.department ? record.department.name : ''}
                onFocus={() => {
                  this.showSelector(index, 'department', 'select_department_reimburse');
                }}
              />
            ) : (
              <Popover content={record.department ? record.department.name : ''}>
                <span>{record.department ? record.department.name : ''}</span>
              </Popover>
            );
          },
        },
        {
          title: '分摊金额',
          dataIndex: 'cost',
          width: 160,
          key: 'cost',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <div style={{ textAlign: 'right' }}>
                <InputNumber
                  precision={2}
                  value={value}
                  onChange={val => this.costChange(index, val)}
                />
              </div>
            ) : (
              <span style={{ textAlign: 'right' }}>{this.toDecimal2(value)}</span>
            );
          },
        },
      ],
      loading: false,
      x: false,
      isRefresh: false,
      showSelector: false,
      index: 0,
      selectType: '',
      selectKey: '',
      dataCache: {},
      costCenterData: {},
      applicationCol: {
        title: '关联申请单',
        width: 240,
        dataIndex: 'applicationCode',
        key: 'applicationCode',
        render: (value, record) => {
          return <a>{record.application && record.application.businessCode}</a>;
        },
      },
      optionCol: {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        width: 120,
        render: (value, record, index) => {
          return record.status == 'edit' || record.status == 'new' ? (
            <div>
              <a onClick={() => this.save(index)}>保存</a>
              <Divider type="vertical" />
              <a onClick={() => this.cancel(index)}>取消</a>
            </div>
          ) : (
            <div>
              <a onClick={() => this.edit(index)}>编辑</a>
              {!record.defaultApportion && <Divider type="vertical" />}
              <Popconfirm
                placement="top"
                title={'确认删除？'}
                onConfirm={() => {
                  this.delete(index);
                }}
                okText="确定"
                cancelText="取消"
              >
                {!record.defaultApportion && <a>删除</a>}
              </Popconfirm>
            </div>
          );
        },
      },
    };
  }

  componentDidMount() {
    this.setState(
      {
        defaultApportion: this.props.params.defaultApportion,
        relatedApplication: this.props.params.relatedApplication,
        isRefresh: this.props.isRefresh,
      },
      () => {
        let cols = this.state.columns;

        if (this.state.relatedApplication) {
          cols.splice(0, 0, this.state.applicationCol);
        }

        if (
          this.state.defaultApportion.costCenterItems &&
          this.state.defaultApportion.costCenterItems.length
        ) {
          this.state.defaultApportion.costCenterItems.map(o => {
            cols.push({
              title: o.fieldName,
              dataIndex: o.costCenterOID,
              key: o.costCenterOID,
              width: 180,
              render: (value, record, index) => {
                return record.status == 'edit' || record.status == 'new' ? (
                  <Select
                    labelInValue
                    value={value}
                    onChange={val => this.centerChange(index, val, o.costCenterOID)}
                    onFocus={() => this.handleFocus(o.costCenterOID)}
                  >
                    {this.state.costCenterData[o.costCenterOID] &&
                      this.state.costCenterData[o.costCenterOID].map(item => {
                        return (
                          <Select.Option key={parseInt(item.id)} value={parseInt(item.id)}>
                            {item.name}
                          </Select.Option>
                        );
                      })}
                  </Select>
                ) : (
                  <span>{record[o.costCenterOID].label}</span>
                );
              },
            });
          });
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
        //     columns.push({ title: o.fieldName, dataIndex: o.costCenterOID, key: o.costCenterOID })
        // })
        let optionCol = this.state.optionCol;

        if (!this.state.relatedApplication && !this.state.defaultApportion.costCenterItems.length) {
          optionCol.fixed = '';
        }

        //cols.push(this.state.optionCol);

        let width = this.state.relatedApplication ? 800 : 560;
        this.setState({
          columns: cols,
          flag: true,
          x: this.state.defaultApportion.costCenterItems.length
            ? width + this.state.defaultApportion.costCenterItems.length * 180
            : width,
        });
      }
    );
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
  };

  //弹出框选取后
  selectOk = values => {
    let data = this.state.data;
    let record = data[this.state.index];

    record[this.state.selectKey] = values.result[0];

    this.props.handleOk && this.props.handleOk(data);
    this.setState({ data, showSelector: false });
  };

  //费用改变时触发
  costChange = (index, value) => {
    let data = this.state.data;
    let record = data[index];
    record.cost = value;
    this.props.handleOk && this.props.handleOk(data, true);
    this.setState({ data });
  };

  //成本中心变化
  centerChange = (index, value, oid) => {
    let data = this.state.data;
    let record = data[index];
    record[oid] = value;
    this.props.handleOk && this.props.handleOk(data);
    this.setState({ data });
  };

  //保存
  save = index => {
    let data = this.state.data;
    let record = data[index];
    let error = false;

    if (!record.company || !record.company.id) {
      message.error('公司不能为空！');
      error = true;
    }
    if (!record.department || !record.department.departmentId) {
      message.error('部门不能为空！');
      error = true;
    }
    if (!record.cost || parseFloat(record.cost) <= 0) {
      message.error('分摊金额不能为空或小于等于0');
      error = true;
    }

    if (
      this.state.defaultApportion.costCenterItems &&
      this.state.defaultApportion.costCenterItems.length
    ) {
      this.state.defaultApportion.costCenterItems.map(o => {
        if (!record[o.costCenterOID] || !record[o.costCenterOID].key) {
          message.error('成本中心不能为空！');
          error = true;
        }
      });
    }

    if (error) return;

    record.status = 'normal';
    record.cost = this.toDecimal2(record.cost);
    this.props.handleOk && this.props.handleOk(data);
    this.setState({ data });
  };

  //成本中心得到焦点时
  handleFocus = oid => {
    if (this.state.costCenterData[oid]) return;

    let costCenterData = { ...this.state.costCenterData };
    reimburseService.getCostList(oid).then(res => {
      costCenterData[oid] = res.data;
      this.setState({ costCenterData });
    });
  };

  //删除一行
  delete = index => {
    this.props.deleteShare && this.props.deleteShare(index);
  };

  //编辑
  edit = index => {
    let data = this.state.data;
    let record = data[index];
    record.status = 'edit';
    let dataCache = { ...record };
    this.setState({ data, dataCache });
  };

  //取消
  cancel = index => {
    let data = this.state.data;
    if (data[index].status == 'edit') {
      data[index] = { ...this.state.dataCache, status: 'normal' };
      this.props.handleOk && this.props.handleOk(data, true);
      this.setState({ data, dataCache: null });
    } else if (data[index].status == 'new') {
      data.splice(index, 1);
      this.props.handleOk && this.props.handleOk(data, true);
      this.setState({ data, dataCache: null });
    }
  };

  //四舍五入 保留两位小数
  toDecimal2 = x => {
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
  };

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
            />
          </Col>
        </Row>
        <ListSelector
          single={true}
          visible={showSelector}
          type={this.state.selectType}
          onCancel={() => {
            this.setState({ showSelector: false });
          }}
          onOk={this.selectOk}
          extraParams={{
            tenantId: this.props.user.tenantId,
            setOfBooksId: this.props.company.setOfBooksId,
          }}
          selectedData={[]}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.login.user,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(NewShare);

// export default NewShare
