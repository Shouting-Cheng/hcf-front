import {messages} from "share/common";
import React from 'react'
import { connect } from 'react-redux'

import { Button, Table, Badge, message, Row, Col, Input } from 'antd';
import supplierManagementService from 'containers/financial-management/supplier-management/supplier-management.service';
import 'styles/financial-management/supplier-management/supplier-detail.scss'
import EditableCell from 'containers/financial-management/supplier-management/editable-cell'
import BankPicker from 'containers/financial-management/supplier-management/bank-picker'
import menuRoute from 'routes/menuRoute'
import moment from 'moment'

class SupplierDetail extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      loading: false,
      data:[],
      params:{},
      batchCompany: true,
      editFlag:true,
      index:null,
      pagination: {
        current: 1,
        page: 1,
        total:0,
        disuse:0,
        pageSize:10,
        showQuickJumper:true,
      },
      bankParams:{
        bankAccount: "",
        bankOpeningBank: "",
        bankOpeningCity: "",
        bankOperatorNumber: "",
        bankVenIdentifier: "",
        venType: 1000,
        venInfoId: null,
        webUpdateDate: "--",
        newAddFlag: false,
        editFlag: false,
        loading: true,
        copyData: null
      },
      showBankPicker:false,
      venNickOid:'',
      id:'',
      headInfo:{},
      cacheData:[],
      columns: [
        { /*序号*/ title: messages('supplier.management.index'),width:'5%', dataIndex: 'id', render: (value, record, index) => index + 1 },
        { /*银行账号*/
          title: messages('supplier.bank.account'), key: "bankAccount", dataIndex: 'bankAccount',width:'15%',
          render: (value,record,index) => this.renderColumns(value, record, 'bankAccount',index),
        },
        { /*银行开户行*/
          title: messages('supplier.bank.branch'), dataIndex: 'bankOpeningBank',
          render: (value, record, index) => this.renderColumns(value, record, 'bankOpeningBank',index)
        },
        { /*银行开户行号*/
          title:messages('supplier.bank.branch.number'),dataIndex:'bankOperatorNumber',
          render:(value,record,index) => this.renderColumns(value, record, 'bankOperatorNumber',index)
        },
        { /*开户行城市*/
          title:messages('supplier.bank.city'),dataIndex:'bankOpeningCity',
          render:(value,record,index) => this.renderColumns(value, record, 'bankOpeningCity',index)
        },
        { /*状态*/
          title:messages('common.column.status'),dataIndex:'venType',width:'7%',render:(record)=> record === 1001 ? <Badge status='success' text={messages('supplier.management.using')}/> : record === 1002 ? <Badge status='error' text={messages('supplier.management.disuse')}/> : <Badge status='processing' text={messages('supplier.management.newAdd')}/>
        },
        { /*最近更新时间*/
          title:messages('supplier.management.lastUpdate'),key:'updateTime',dataIndex:'updateTime',render:(record) => moment(record).format('YYYY-MM-DD HH:mm:ss')
        },
        {title: messages('common.operation'), width:'10%', key: 'operation', render: (text, record, index) => (
            this.checkPageRole('VENDORMAINTENANCE', 2) && <span>
            {record.editable ? <a href="#" onClick={(e) => this.saveItem(e, record,index)}>{messages('supplier.a.save')}</a> :<a href="#" onClick={(e) => this.editItem(record.id,index)}>{messages('common.edit')}</a>}
            <span className="ant-divider" />
            {record.editable ? <a href="#" onClick={(e) => this.cancel(record.id,index)}>{messages('supplier.a.cancel')}</a> : record.venType === 1002 ?<a onClick={(e) => this.disableBank(e,record,index)}  href="#">{messages('supplier.a.enable')}</a> : <a onClick={(e) => this.disableBank(e,record,index)}  href="#">{messages('supplier.a.disable')}</a>}
          </span>)
        },
      ],
      suppierManagement:menuRoute.getRouteItem('supplier-maintain'),
      buttonRoleSwitch:this.checkPageRole('VENDORMAINTENANCE', 2)
    }
  }

  componentWillMount() {
    let {bankParams} = this.state;
    bankParams.venInfoId = this.props.params.id;
    this.setState({id:this.props.params.id,bankParams},()=>{
      this.getInfo();
      this.getList();
    })
  }

  //渲染可编辑表格
  renderColumns(text, record, column,index) {
    return (
      <EditableCell
        editable={record.editable}
        value={text}
        column={column}
        id={record.id}
        showBank={(id)=>this.showBank(id,index)}
        onChange={value => this.handleChange(value, record.id, column,index)}
      />
    );
  }

  //编辑
  editItem = (key,index) =>{
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData,index: index});
    }
  };

  //取消
  cancel(key,index) {
    const newData = [...this.state.data];
    const cacheData = [...this.state.cacheData];
    const target = newData.filter(item => key === item.id)[0];
    if(key === undefined){
      newData.splice(index,1);
      this.setState({ data: newData });
      return;
    }
    if (target) {
      Object.assign(target,cacheData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.setState({ data: newData });
    }
  }

  handleChange(value, key, column,index) {
    const newData = [...this.state.data];
    newData[index][column] = value;
    this.setState({ data: newData });
  }

  //选择银行
  chooseBank = (record)=>{
    let {id,index} = this.state;
    const newData = [...this.state.data];
    newData[index].bankOpeningBank = record.bankBranchName;
    newData[index].bankOperatorNumber = record.bankCode;
    newData[index].bankOpeningCity = record.openAccount;
      this.setState({ data: newData });
  };


  //验证银行必填信息
  validateData = (record)=>{
    
    return new Promise((resolve, reject) =>{
     if (!record.bankAccount) {
       message.error(messages('supplier.bank.accountNo'))
       return reject(false);
     } else if (!record.bankOpeningBank) {
       message.error(messages('supplier.bank.branchs'))
       return reject(false);
     } else if (!record.bankOperatorNumber) {
       message.error(messages('supplier.bank.branchNo'))
       return reject(false);
     } else if (!record.bankOpeningCity) {
       message.error(messages('supplier.bank.address'))
       return reject(false);
     } else {
       return resolve(true);
     }
   })
  }
  
  //更新银行账号
  saveItem = (e,record,index) =>{
    e.preventDefault();
    let newData = [...this.state.data];
    let {bankParams} = this.state;
    if(record.id === undefined){   //新建银行信息
      this.validateData(record).then(()=>{
        bankParams.bankAccount = record.bankAccount;
        bankParams.bankOpeningBank = record.bankOpeningBank;
        bankParams.bankOpeningCity = record.bankOpeningCity;
        bankParams.bankOperatorNumber = record.bankOperatorNumber;
        supplierManagementService.updateSupplierBank(bankParams).then(res =>{
          if(res.data.code === "0000"){
            newData[index] = res.data.body[0];
            newData[index].editable = false;
            message.success(`${messages('common.save.success',{name:""})}`);
            this.setState({data:newData,cacheData:newData},()=>{
              this.getInfo()
            })
          }else{
              message.error(res.data.msg)
          }
        }).catch(() => {
          message.error(`${messages('common.save.filed')}`);
        })
      })
    }else{                                  //编辑银行信息
      record.updateTime = new Date().getTime()
      supplierManagementService.updateSupplierBank(record).then(res =>{
        if(res.data.code === "0000"){
          message.success(`${messages('common.save.success',{name:""})}`);
          newData[index].editable = false;
          this.setState({data:newData,cacheData:newData},()=>{
            this.getInfo()
          })
        }else{
          message.error(res.data.msg)
        }
      }).catch(() => {
        message.error(`${messages('common.save.filed')}`);
      })
    }
  };

  disableBank = (e,record,index)=>{
    e.preventDefault();
    let newData = [...this.state.data];
    this.setState({loading:true});
    record.updateTime  = new Date().getTime();
    supplierManagementService.disableSupplierBank(record).then(res =>{
      if(res.data.code === "0000"){
        record.venType === 1001 ? newData[index].venType = 1002 : newData[index].venType = 1001;
        newData[index].updateTime = new Date();
        this.setState({data:newData,cacheData:newData,loading:false},()=>{
          this.getInfo()
        });
        message.success(`${messages('common.save.success',{name:""})}`);
      }else{
        this.setState({loading:false});
        message.error(res.data.msg)
      }
    }).catch(() => {
      this.setState({loading:false});
      message.error(`${messages('common.save.filed')}`);
    })
  };

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };

  getInfo(){
    supplierManagementService.getSupplierDetail(this.props.params.id).then(res =>{
      this.setState({headInfo:res.data.body[0],venNickOid:res.data.body[0].venNickOid})
    })
  }

  getList(){
    let{pagination,params,id} = this.state;
    params.pageNum = pagination.page;
    params.pageSize = pagination.pageSize;
    params.venInfoId = id;
    supplierManagementService.getSupplierBankInfo(params).then((response)=>{
      pagination.total = response.data.total;
      let list = response.data.venBankAccountBeans;
      list.map(item=>{
        item.editable = false
      });
      let cacheData = list.map(item =>({...item}));
      this.setState({
        loading: false,
        data: list,
        cacheData:cacheData,
        pagination
      })
    })
  }

  //更新供应商
  updateInfo = ()=>{
    let {headInfo,venNickOid} = this.state;
    headInfo.venNickOid = venNickOid;
    supplierManagementService.updateSupplierInfo(headInfo).then(res =>{
      if(res.data.code === "0000"){
        message.success(`${messages('common.save.success',{name:""})}`);
        this.getInfo();
        this.closeEdit()
      }else{
        message.error(res.data.msg)
      }
    }).catch(() => {
      message.error(`${messages('common.save.filed')}`);
    })
  };

  disableSupplier = ()=>{
    let {headInfo} = this.state;
    let params = {
      id:this.props.params.id,
      venType:headInfo.venType
    };
    supplierManagementService.updateSupplierInfo(params).then(res =>{
      if(res.status === 200){
        message.success(`${messages('common.save.success',{name:""})}`);
        this.getInfo()
      }
    }).catch(() => {
      message.error(`${messages('common.save.filed')}`);
    })
  };

  //头部信息编辑open
  openEdit =()=>{
    this.setState({editFlag:false})
  };

  closeEdit = ()=>{
    this.setState({editFlag:true})
  };

  onChangeVenNickOid = (e)=>{
    this.setState({venNickOid:e.target.value})
  };

  //新增一行可编辑银行信息
  handleAddRow = ()=>{
    const {  data } = this.state;
    let isHasNew = data.some( item =>{
      return item.venType === 1000
    })
    if(!isHasNew){
      const newData = {
        bankAccount: '',
        bankOpeningBank: '',
        bankOperatorNumber:'',
        bankOpeningCity:'',
        venType:1000,
        editable:true
      };
      data.unshift(newData)
      this.setState({
        data: data,
      });
    }
  };

  handleCancel = () => {
    this.setState({ showBankPicker: false })
  };

  showBank = (id,index)=>{
    this.setState({ showBankPicker: true,id:id ,index:index})
  };

  goBack = () => {
    this.context.router.push(this.state.suppierManagement.url)
  };

  render(){
    const { buttonRoleSwitch,loading, data, columns, pagination, venNickOid, headInfo,editFlag,showBankPicker } = this.state;
    
    return(
      <div className="supplier-detail">
        <div className='header-line'>
          <Row type='flex' align='middle'>
            <Col span={4}>{messages('supplier.management.detail')}</Col>
            <Col span={16}/>
            <Col span={4}><Button onClick={this.goBack}>{messages('common.back')}</Button></Col>
          </Row>
        </div>
        <Row>
          <Col span={6}>
            <span className='supplier-title'>{messages('supplier.management.name')}:</span>
            <span className='supplier-value'>{headInfo.venNickname}</span>
          </Col>
          <Col span={6}>
            <span className='supplier-title'>{messages('supplier.management.supplierStatus')}:</span>
            <span className='supplier-value'>{headInfo.venType === 1001 ? messages('supplier.management.using') : messages('supplier.management.disuse')}</span>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <span className='supplier-title'>{messages('supplier.management.operatorNumber')}:</span>
            <span className='supplier-value'>{headInfo.venOperatorNumber}</span>
          </Col>
          <Col span={6}>
            <span className='supplier-title'>{messages('supplier.management.operatorName')}:</span>
            <span className='supplier-value'>{headInfo.venOperatorName}</span>
          </Col>
          <Col span={12}>
            <span className='supplier-title'>{messages('supplier.management.lastUpdate')}:</span>
            <span className='supplier-value'>{moment(headInfo.updateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          </Col>
        </Row>
        <Row type="flex" align="middle">
          <Col span={8}>
            <div className='supplier-title'>{messages('supplier.management.outerId')}:</div>
            <Input className='supplier-input' value={venNickOid} disabled={editFlag} onChange={this.onChangeVenNickOid}/>
          </Col>
          { buttonRoleSwitch && <Col span={6}>
            {editFlag ? <span className='supplier-title'><a onClick={this.openEdit}>{messages('common.edit')}</a></span> : <span className='supplier-title'><a onClick={this.updateInfo}>{messages('common.save')}</a><a onClick={this.closeEdit}>{messages('common.cancel')}</a></span>}
          </Col> }
        </Row>
        {buttonRoleSwitch && <div className="table-header">
          <div className='table-header-buttons'>
            <Button type='primary' onClick={this.handleAddRow}>{messages('supplier.add.bank.account')}</Button>
            <Button onClick={this.disableSupplier}>{headInfo.venType === 1001 ? messages('supplier.detail.disableSuppier') : messages('supplier.detail.enableSuppier')}</Button>
          </div>
        </div> }
        <Table
          loading={loading}
          dataSource={data}
          pagination={pagination}
          columns={columns}
          bordered
          rowKey='id'
          size="middle"
          onChange={this.onChangePager}
        />
        <BankPicker visible={showBankPicker}
                    onCancel={this.handleCancel}
                    onChoose={(record) => this.chooseBank(record)}/>
      </div>
    )
  }
}

SupplierDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SupplierDetail);
