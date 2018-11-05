/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//成本中心详情
//成本中心项导入
//成本中心项人员导入
import React from 'react';
import { connect } from 'dva';

import {
    Table, Button, Badge, message, Icon, Input, Menu,
    Dropdown, Modal, Upload, Popover
} from 'antd';
import ImportErrInfo from 'widget/Template/import-err-info';
import FileSaver from 'file-saver';
import CCService from 'containers/setting/cost-center/cost-center.service';
import BasicInfo from 'widget/basic-info';
import 'styles/setting/cost-center/cost-center-detail.scss';
import { SelectDepOrPerson } from 'widget/index';

import ExportModal from 'widget/Template/export-modal/export-modal';

import { routerRedux } from 'dva/router';

class CostCenterDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,

            showImportBankModel: false,//导入弹窗
            showImportBankModelForPerson: false,
            showImportErrInfo: false,
            showImportErrInfoForPerson: false,

            progressImportErrInfo: 1,
            transactionOID: null,
            errorsList: [],
            fileList: [],
            flieUploading: false,//文件是否正在上传

            editing: false,
            //成本中心项列表
            data: [],
            pagination: {
                total: 0,
                page: 0,
                pageSize: 10,
            },
            //被选择了的成本中心项
            selectedRowKeys: [],
            depNeedMoveOut: [],//被选择了的成本中心项
            costCenterItemName: "",//输入搜索成本中心项名称与code
            columns: [
                {
                    //成本中心项名称
                    title: this.$t("cost.center.detail.name"),
                    dataIndex: "name",
                    width: '15%',
                    render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
                },
                {
                    //编码
                    title: this.$t("cost.center.detail.code"),
                    dataIndex: "code",
                    width: '15%',
                    render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
                },
                {
                    //序号
                    title: this.$t("cost.center.detail.index"),
                    dataIndex: "sequenceNumber",
                    width: '10%'
                },
                {
                    //经理
                    title: this.$t("cost.center.detail.manager"),
                    dataIndex: "managerFullName",
                    width: '15%',
                    render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
                },
                {
                    //全员可见性
                    title: this.$t("cost.center.detail.showall"),
                    dataIndex: "publicFlag",
                    width: '15%',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
                },
                {
                    //状态
                    title: this.$t("cost.center.detail.status"),
                    dataIndex: 'enabled',
                    width: '15%',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: "id",
                    render: (text, record) => (
                        <span>
                            <a onClick={(e) => this.editCostCenterItem(e, record)}>
                                {/*编辑*/}
                                {this.$t("common.edit")}
                            </a>
                            &nbsp;&nbsp;&nbsp;
              <a onClick={(e) => this.detailCostCenterItem(e, record)}>
                                {/*详情*/}
                                {this.$t("common.detail")}
                            </a>
                        </span>)
                }
            ],
            updateState: false,
            infoList: [
                {
                    //成本中心名称
                    type: 'input',
                    label: this.$t("cost.center.detail.name1"),
                    id: 'name',
                    disabled: true
                },
                {
                    //编码
                    type: 'input',
                    label: this.$t("cost.center.detail.code"),
                    id: 'code',
                    disabled: true
                },
                {
                    //账套名称
                    type: 'input',
                    label: this.$t("cost.center.detail.sobName"),
                    id: 'setOfBooksName',
                    disabled: true
                },
                {
                    //序号
                    type: 'input',
                    label: this.$t("cost.center.detail.index"),
                    id: 'sequenceNumber',
                    disabled: true
                },
                {
                    //状态
                    type: 'switch',
                    label: this.$t("cost.center.detail.status"),
                    id: 'enabled'
                },
            ],
            infoData: {},
            //成本中心列表
            // costCenter: menuRoute.getRouteItem('cost-center'),
            //成本中心项：编辑与新增
            // newCostCenterItem: menuRoute.getRouteItem('new-cost-center-item'),
            //成本中心项：详情
            // CostCenterItemDetail: menuRoute.getRouteItem('cost-center-item-detail'),
        };
    }

    componentDidMount() {
        this.getCostCenterDetail();
        //记住页码
        let _pagination = this.getBeforePage();
        let pagination = this.state.pagination;
        pagination.page = _pagination.page;
        pagination.current = _pagination.page + 1;
        this.setState({
            pagination,
        }, () => {
            this.clearBeforePage();
            this.getList();
        })
    }

    getCostCenterDetail() {
        CCService.getCostCenterDetail(this.props.match.params.id)
            .then((response) => {
                this.setState({
                    infoData: response.data,
                })
            });
    }

    //得到列表数据
    //isClearRowSelection boolean是否清空选中的
    getList(isClearRowSelection) {
        this.setState({ loading: true });
        const { pagination } = this.state;
        let params = {
            page: pagination.page,
            size: pagination.pageSize,
            keyword: this.state.costCenterItemName,
            sort: null//是否按照code排序
        }
        CCService.getCostCenterItemsAll(this.props.match.params.id, params)
            .then((response) => {
                if (isClearRowSelection) {
                    this.clearRowSelection()
                }
                response.data.map((item) => {
                    item.key = item.id;
                });
                pagination.total = response.total;
                pagination.current = params.page + 1;
                this.setState({
                    data: response.data,
                    loading: false,
                    pagination
                })
            });
    }

    //分页点击
    onChangePager = (pagination, filters, sorter) => {
        this.setState({
            pagination: {
                page: pagination.current - 1,
                pageSize: pagination.pageSize
            }
        }, () => {
            this.getList();
        })
    };
    //新增成本中心项
    handleNew = () => {
        // let path = this.state.newCostCenterItem.url.replace(":id", this.props.params.id).replace(":itemId", "NEW");
        // path = path.replace(":itemId", "NEW");
        // this.context.router.push(path);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-detail/cost-center-item/new-cost-center-item/${this.props.match.params.id}/NEW`,
            })
        );
    };
    //成本中心项编辑
    editCostCenterItem = (e, record) => {
        // this.setBeforePage(this.state.pagination);
        // let path = this.state.newCostCenterItem.url.replace(":id", this.props.params.id);
        // path = path.replace(':itemId', record.costCenterItemOID);
        // this.context.router.push(path);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-detail/cost-center-item/new-cost-center-item/${this.props.match.params.id}/${record.costCenterItemOID}`,
            })
        );
    };
    //成本中心项详情
    detailCostCenterItem = (e, record) => {
        // this.setBeforePage(this.state.pagination);
        // let path = this.state.CostCenterItemDetail.url.replace(":id", this.props.match.params.id);
        // path = path.replace(":itemId", record.costCenterItemOID);
        // this.context.router.push(path);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-detail/cost-center-item/cost-center-item-detail/${this.props.match.params.id}/${record.costCenterItemOID}`,
            })
        );
    };

    //批量添加人员
    batchAddPerson = (arr) => {
        if (arr.length < 1) {
            //请选择人员
            message.warn(this.$t("cost.center.detail.please.selecy"));
            return;
        }
        let userOIDs = [];
        arr.map((item) => {
            userOIDs.push(item.userOID)
        })

        let params = {
            userOIDs: userOIDs,
            costCenterItemOIDs: this.state.selectedRowKeys,
            selectMode: "default",
            costCenterOID: this.props.match.params.id
        }
        CCService.costCenterItemAssociateUsersDTO(params)
            .then((res) => {
                //操作成功
                message.success(this.$t("cost.center.detail.success"));
            })
    }

    //选中项发生变化的时的回调
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys: selectedRowKeys });
    };
    //批量启用禁用
    //type enabled启用 disabled禁用
    handleBatch = (type) => {
        let enable = false;
        if (type === 'enabled') {
            enable = true;
        }
        CCService.batchUpdate(this.state.selectedRowKeys, enable).then(res => {
            if (res.status === 200) {
                message.success(this.$t('common.operate.success'));
                this.getList(true);
            }
        })
    }
    //选择/取消选择某行的回调
    handleSelectRow = (record, selected) => {
        let depNeedMoveOut = this.state.depNeedMoveOut;
        if (selected) {
            depNeedMoveOut.push(record.costCenterItemOID)
        } else {
            depNeedMoveOut.delete(record.costCenterItemOID)
        }
        this.setState({ depNeedMoveOut })
    };
    //选择/取消选择所有行的回调
    handleSelectAllRow = (selected, selectedRows, changeRows) => {
        let depNeedMoveOut = this.state.depNeedMoveOut;
        if (selected) {
            changeRows.map(item => {
                depNeedMoveOut.push(item.costCenterItemOID)
            })
        } else {
            changeRows.map(item => {
                depNeedMoveOut.delete(item.costCenterItemOID)
            })
        }
        this.setState({ depNeedMoveOut })
    };

    //换页后根据OIDs刷新选择框
    refreshRowSelection() {
        let selectedRowKeys = [];
        this.state.depNeedMoveOut.map(costCenterItemOID => {
            this.state.data.map((item, index) => {
                if (item.costCenterItemOID === costCenterItemOID)
                    selectedRowKeys.push(index);
            })
        });
        this.setState({ selectedRowKeys });
    }

    //清空选择框：选了的成本中心项
    clearRowSelection() {
        this.setState({ depNeedMoveOut: [], selectedRowKeys: [] });
    }

    //返回成本中心
    backToCostCenter = () => {
        // let path = this.state.costCenter.url;
        // this.context.router.push(path);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center`,
            })
        );
    }
    //搜索成本中心项
    emitEmptyForDep = () => {
        this.userNameInput.focus();
        this.setState({ costCenterItemName: '' }, () => {
            this.onChangeCostCenterItemName();
        });
    }
    //搜索成本中心项
    onChangeCostCenterItemName = (e) => {
        let costCenterItemName = "";
        if (e) {
            costCenterItemName = e.target.value;
        }
        this.setState({
            costCenterItemName: costCenterItemName,
            loading: true
        }, () => {
            this.getList(true);
        });
    }

    handleImportShow = () => {
        this.setState({
            showImportBankModel: true
        })
    }

    handleImportShowForPerson = () => {
        this.setState({
            showImportBankModelForPerson: true
        })
    }

    cancelImport = () => {
        this.setState({
            showImportBankModel: false
        })
    }
    cancelImportForPerson = () => {
        this.setState({
            showImportBankModelForPerson: false
        })
    }
    //人员导入的错误信息-start
    showImportErrInfo = () => {
        this.setState({
            showImportErrInfo: true
        })
    }
    showImportErrInfoForPerson = () => {
        this.setState({
            showImportErrInfoForPerson: true
        })
    }
    hideImportErrInfo = () => {
        this.setState({
            showImportErrInfo: false
        })
    }
    hideImportErrInfoForPerson = () => {
        this.setState({
            showImportErrInfoForPerson: false
        })
    }


    //成本中心导入的错误信息-end
    handleFileUpload = () => {
        const { fileList } = this.state;
        const formData = new FormData();
        // fileList.forEach((file) => {
        //   formData.append('files[]', file);
        // });
        formData.append('file', fileList[0]);
        this.setState({
            uploading: true,
            flieUploading: true,
        });

        CCService.importTemplateCostCenterOID(this.props.match.params.id, formData)
            .then((res) => {
                this.setState({
                    fileList: [],
                    uploading: false,
                    flieUploading: false,
                    showImportBankModel: false,
                    transactionOID: res.data.transactionOID//这个transactionOID在导出错误信息的时候，需要用到
                }, () => {
                    this.showImportErrInfo();
                    this.showTransactionLogDialog(this.state.transactionOID);   // 将参数传给dialog
                });
            })
            .catch((res) => {
                this.setState({
                    uploading: false,
                    flieUploading: false,
                });
            })
    }

    //人员导入的错误信息-end
    handleFileUploadForPerson = () => {
        const { fileList } = this.state;
        const formData = new FormData();
        // fileList.forEach((file) => {
        //   formData.append('files[]', file);
        // });
        formData.append('file', fileList[0]);
        this.setState({
            uploading: true,
            flieUploading: true,
        });

        CCService.importTemplateCostCenterPersonOID(formData)
            .then((res) => {
                this.setState({
                    fileList: [],
                    uploading: false,
                    flieUploading: false,
                    showImportBankModelForPerson: false,
                    transactionOID: res.data.transactionOID//这个transactionOID在导出错误信息的时候，需要用到
                }, () => {
                    this.showImportErrInfoForPerson();
                    this.showTransactionLogDialog(this.state.transactionOID);   // 将参数传给dialog
                });
            })
            .catch((res) => {
                this.setState({
                    uploading: false,
                    flieUploading: false,
                });
            })
    }

    showTransactionLogDialog = (transactionOID) => {
        CCService.getCostCenterBatchTransactionLog(transactionOID)
            .then((res) => {
                let data = res.data;
                if (data.totalEntities === 0) {
                    return;
                } else {
                    let errors = data.errors;
                    let errorsList = this.getErrorDataByerrors(errors);
                    let progressImportErrInfo = this.getProgressByData(data);
                    this.setState({
                        progressImportErrInfo,
                        errorsList
                    })
                    if ((data.successEntities + data.failureEntities) != data.totalEntities) {
                        let gapTime = 500;
                        setTimeout(() => {
                            //请求频率涉及到一个算法
                            this.showTransactionLogDialog(this.state.transactionOID);   // 将参数传给dialog
                        }, gapTime)
                    } else {
                        //导入完成了
                        this.getList(true);
                        if (this.state.errorsList.length === 0 && progressImportErrInfo === 100) {
                            message.success(this.$t("common.operate.success"));
                            this.hideImportErrInfo();
                            this.hideImportErrInfoForPerson();
                        }
                    }
                }
            })
    }
    //获取百分进度
    getProgressByData = (data) => {
        return Math.round((data.failureEntities + data.successEntities) * 100 / data.totalEntities);
    }
    //通过错误信息，解析成表格
    getErrorDataByerrors = (errs) => {
        let data = [];
        for (let key in errs) {
            let row = {};
            row.line = errs[key];
            if (row.line.length > 1) {
                let _line = [];
                for (let i = 0; i < row.line.length; i++) {
                    _line.push(row.line[i]);
                    if (i < row.line.length - 1) {
                        _line.push(",");
                    }
                }
                row.line = _line;
            }
            row.msg = key;
            data.push(row);
        }
        return data;
    }
    //下载模板：成本中心项
    downloadTemplate = () => {
        CCService.downloadCostCenterItemTemplate()
            .then((res) => {
                let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                // 成本中心项模板
                let name = this.$t("cost.center.detail.temp");
                FileSaver.saveAs(b, `${name}.xlsx`);
            })
            .catch((res) => {
            })
    }
    //下载模板：成本中心项-人员
    downloadTemplatePerson = () => {
        CCService.downloadCostCenterItemPersonTemplate()
            .then((res) => {
                let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                // 成本中心项模板
                let name = this.$t("cost.center.detail.temp.person");
                FileSaver.saveAs(b, `${name}.xlsx`);
            })
            .catch((res) => {
            })
    }
    //成本中心项导入错误信息
    exportFailedLog = () => {
        CCService.exportCostCenterBatchTransactionLog(this.state.transactionOID)
            .then((res) => {
                let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                // 成本中心项导入错误信息
                let name = this.$t("cost.center.detail.error");
                FileSaver.saveAs(b, `${name}.xlsx`);
            })
            .catch((res) => {
            })
    }
    //成本中心项-人员导入错误信息
    exportFailedLogForPerson = () => {
        CCService.exportCostCenterPersonBatchTransactionLog(this.state.transactionOID)
            .then((res) => {
                let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                // 成本中心项-人员导入错误信息
                let name = this.$t("cost.center.detail.temp.person");
                FileSaver.saveAs(b, `${name}.xlsx`);
            })
            .catch((res) => {
            })
    }

    render() {
        const {
      columns, data, loading, pagination,
            infoList, infoData, updateState, editing
    } = this.state;
        let rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
            onSelect: this.handleSelectRow,
            onSelectAll: this.handleSelectAllRow
        };
        //公司模式不能操作
        // if(!this.props.tenantMode){
        //   rowSelection = null;
        // }
        const suffix = this.state.costCenterItemName ? <Icon type="close-circle" onClick={this.emitEmptyForDep} /> : null;
        const menu = (
            <Menu>
                <Menu.Item key={1}>
                    <div onClick={() => {
                        this.handleImportShow()
                    }}>
                        {/*导入成本中心项*/}
                        {this.$t("cost.center.detail.import")}
                    </div>
                </Menu.Item>

                <Menu.Item key={2}>
                    <div onClick={() => {
                        this.handleImportShowForPerson()
                    }}>
                        {/*导入成本中心项-人员*/}
                        {this.$t("cost.center.detail.import.person")}
                    </div>
                </Menu.Item>

            </Menu>
        );
        const props = {
            onRemove: (file) => {
                this.setState(({ fileList }) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                this.setState(({ fileList }) => ({
                    fileList: [file],
                }));
                return false;
            },
            fileList: this.state.fileList,
        };
        return (
            <div className="cost-center-detail">
                <BasicInfo infoList={infoList}
                    isHideEditBtn={true}
                    infoData={infoData}
                    updateState={updateState}
                    loading={editing} />
                <div className="table-header">
                    <div className="table-header-title">
                        {this.$t("common.total", { total: pagination.total })}
                    </div>
                    {/* 共total条数据 */}
                    <div className="table-header-buttons">
                        {/*批量添加员工*/}
                        <div className="f-left">
                            <SelectDepOrPerson
                                buttonType={"primary"}
                                title={this.$t("cost.center.detail.batchadd")}
                                buttonDisabled={this.state.depNeedMoveOut.length < 1 || !this.props.tenantMode}
                                onlyPerson={true}
                                onConfirm={this.batchAddPerson} />
                        </div>
                        <Dropdown.Button onClick={this.handleNew} overlay={menu} disabled={!this.props.tenantMode}>
                            {/*新建成本中心项*/}
                            {
                                this.$t("cost.center.detail.new")
                            }
                        </Dropdown.Button>

                        <div style={{
                            display: 'inline-block',
                        }}>
                            <ExportModal
                                type={"btn"}
                                exportTitle={this.$t("export.modal")}//导出
                                exportType="COST_CENTER_ITEM"
                                exportCondition={{
                                    setOfBooksId: this.state.infoData.setOfBooksId
                                }}
                                exportCommand={"cost_center_item_with_user"}
                            ></ExportModal>

                        </div>

                        <Button onClick={() => this.handleBatch('enabled')}
                            disabled={this.state.depNeedMoveOut.length < 1}>{this.$t('common.enabled'/*启用*/)}</Button>
                        <Button onClick={() => this.handleBatch('disabled')}
                            disabled={this.state.depNeedMoveOut.length < 1}>{this.$t('common.disabled'/*禁用*/)}</Button>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 8px 4px 20px',
                            border: '1px solid #91d5ff',
                            backgroundColor: '#e6f7ff',
                            borderRadius: 4
                        }}>
                            <Icon type="info-circle" style={{ color: '#1890ff' }} />
                            <span>&nbsp;{this.$t("common.total.selected2", { total: this.state.selectedRowKeys.length })}</span>
                        </div>

                        <div className="table-header-inp f-right">
                            {/*输入成本中心项名称或编码*/}
                            <Input
                                className='cost-center-item-name-search'
                                key={'costCenterItemName-search'}
                                placeholder={this.$t('cost.center.detail.inp.search')}
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={suffix}
                                value={this.state.costCenterItemName}
                                onChange={this.onChangeCostCenterItemName}
                                ref={node => this.userNameInput = node}
                            />
                        </div>
                    </div>
                </div>
                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    rowKey="costCenterItemOID"
                    bordered
                    onChange={this.onChangePager}
                    rowSelection={rowSelection}
                    size="middle" />

                {/*成本中心项*/}
                <Modal
                    closable
                    width={800}
                    className="pm-import-person-modal"
                    title={this.$t("person.manage.im")}//导入
                    visible={this.state.showImportBankModel}
                    footer={null}
                    onCancel={this.cancelImport}
                    destroyOnClose={true}
                >
                    <div className="import-person-modal-wrap">

                        <div className="f-left import-person-modal-left">
                            <div>
                                <p>
                                    {/*1.创建导入文件*/}
                                    {this.$t("bank.customBank.im.tip1")}
                                </p>
                                <p>
                                    {/*2.严格按照导入模板整理数据，检查必输事项是否缺少数据*/}
                                    {this.$t("bank.customBank.im.tip2")}
                                </p>
                                <p>
                                    {/*3.关闭文件后，方可进行数据导入*/}
                                    {this.$t("bank.customBank.im.tip3")}
                                </p>
                            </div>
                            <div className="download-list-item"
                                onClick={this.downloadTemplate}
                            >
                                {/*点击下载模板成本中心项*/}
                                {this.$t("cost.center.detail.temp")}
                            </div>

                        </div>
                        <div className="f-right import-person-modal-right">
                            <div className="import-person-right-tips">
                                {/*上传模板*/}
                                {this.$t("bank.customBank.upload.temp")}
                            </div>
                            <div className="upload-file-wrap">

                                <Upload {...props}>
                                    <Button>
                                        <Icon type="upload" />
                                        {/*选择一个文件*/}
                                        {this.$t("person.manage.select.file")}
                                    </Button>
                                </Upload>
                                <Button
                                    className="upload-file-start"
                                    type="primary"
                                    onClick={this.handleFileUpload}
                                    disabled={this.state.fileList.length === 0}
                                    loading={this.state.flieUploading}
                                >
                                    {/*?上传中:开始上传*/}
                                    {this.state.flieUploading ? this.$t("person.manage.uploading") : this.$t("person.manage.start.upload")}
                                </Button>

                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </Modal>
                {/*成本中心项*/}
                <ImportErrInfo
                    progress={this.state.progressImportErrInfo}
                    cancel={this.hideImportErrInfo}
                    exportErrInfo={this.exportFailedLog}
                    errorsList={this.state.errorsList}
                    visible={this.state.showImportErrInfo} />

                {/*成本中心项-人员*/}
                <Modal
                    closable
                    width={800}
                    className="pm-import-person-modal"
                    title={this.$t("person.manage.im")}//导入
                    visible={this.state.showImportBankModelForPerson}
                    footer={null}
                    onCancel={this.cancelImportForPerson}
                    destroyOnClose={true}
                >
                    <div className="import-person-modal-wrap">
                        <div className="f-left import-person-modal-left">
                            <div>
                                <p>
                                    {/*1.创建导入文件*/}
                                    {this.$t("bank.customBank.im.tip1")}
                                </p>
                                <p>
                                    {/*2.严格按照导入模板整理数据，检查必输事项是否缺少数据*/}
                                    {this.$t("bank.customBank.im.tip2")}
                                </p>
                                <p>
                                    {/*3.关闭文件后，方可进行数据导入*/}
                                    {this.$t("bank.customBank.im.tip3")}
                                </p>
                            </div>
                            <div className="download-list-item"
                                onClick={this.downloadTemplatePerson}
                            >
                                {/*点击下载模板成本中心项-员工*/}
                                {this.$t("cost.center.detail.temp.person")}
                            </div>

                        </div>
                        <div className="f-right import-person-modal-right">
                            <div className="import-person-right-tips">
                                {/*上传模板*/}
                                {this.$t("bank.customBank.upload.temp")}
                            </div>
                            <div className="upload-file-wrap">

                                <Upload {...props}>
                                    <Button>
                                        <Icon type="upload" />
                                        {/*选择一个文件*/}
                                        {this.$t("person.manage.select.file")}
                                    </Button>
                                </Upload>
                                <Button
                                    className="upload-file-start"
                                    type="primary"
                                    onClick={this.handleFileUploadForPerson}
                                    disabled={this.state.fileList.length === 0}
                                    loading={this.state.flieUploading}
                                >
                                    {/*?上传中:开始上传*/}
                                    {this.state.flieUploading ? this.$t("person.manage.uploading") : this.$t("person.manage.start.upload")}
                                </Button>

                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </Modal>
                {/*成本中心项-人员*/}
                <ImportErrInfo
                    progress={this.state.progressImportErrInfo}
                    cancel={this.hideImportErrInfoForPerson}
                    exportErrInfo={this.exportFailedLogForPerson}
                    errorsList={this.state.errorsList}
                    visible={this.state.showImportErrInfoForPerson} />

                <a className="back" onClick={this.backToCostCenter}>
                    <Icon type="rollback" style={{ marginRight: '5px' }} />
                    {
                        this.$t('common.back')
                    }
                </a>
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {
        profile: state.user.profile,
        user: state.user.currentUser,
        company: state.user.company,
        tenantMode: true,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CostCenterDetail);
