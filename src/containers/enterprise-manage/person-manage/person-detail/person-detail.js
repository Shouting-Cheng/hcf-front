/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import BankCard from 'containers/enterprise-manage/person-manage/person-detail/person-detail-components/bank-card';
import SomeIdCard from 'containers/enterprise-manage/person-manage/person-detail/person-detail-components/some-id-card';
import BasicInfo from 'containers/enterprise-manage/person-manage/person-detail/person-detail-components/basic-info';
import VendorInfo from 'containers/enterprise-manage/person-manage/person-detail/person-detail-components/vendor-info';
import moment from 'moment';
import { deepCopy } from 'utils/extend';
import 'styles/enterprise-manage/person-manage/person-detail/person-detail.scss';
import PDService from 'containers/enterprise-manage/person-manage/person-detail/person-detail.service';
import { Button, Icon, message, Modal, DatePicker } from 'antd';
import {
  personObjDefault,
  bankAccountDefault,
  contactCardDefault,
  vendorInfoDefault,
  vendorInfoDefaultWithPerson,
} from 'containers/enterprise-manage/person-manage/person-detail/person-detail.model';

class PersonDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      CREATE_DATA_TYPE: true,
      loading: true,
      showSelectTime: false, //选择离职时间的模态框
      hireTime: null, //离职时间
      data: [],
      BasicInfoEditing: false, //基本信息：是否编辑
      VendorEditing: false, //供应商信息：是否编辑
      personObj: {}, //人员信息对象，包含基本信息与扩展字段信息
      bankCards: [], //银行卡
      contactCards: [], //证件信息
      hasCtripVendor: false, //是否有携程
      vendorInfo: vendorInfoDefault, //供应商
    };
  }

  componentDidMount() {
    this.initPage(this.props.match.params.userOid);
  }

  initPage(oid) {
    if (oid === 'NEW') {
      //这是新增
      this.setState({
        personObj: deepCopy(personObjDefault),
        // bankCards: bankAccountDefault,
        // contactCards: contactCardDefault,
        // vendorInfo: vendorInfoDefault,
        BasicInfoEditing: true,
      });
    } else {
      bankAccountDefault.userOid = this.props.match.params.userOid;
      contactCardDefault.userOid = this.props.match.params.userOid;

      this.getPersonDetail();

      this.getBankCards();

      this.getContactCards();

      //this.setCtripVendor();
    }

    //人员导入方式：this.props.company.createDataType如果是 1002，属于接口导入
    // 新增与导入按钮需要隐藏
    let CREATE_DATA_TYPE = parseInt(this.props.company.createDataType) != 1002;
    this.setState({
      CREATE_DATA_TYPE,
    });
  }

  //是否有供应商信息
  setCtripVendor = () => {
    this.setState(
      {
        hasCtripVendor: true, //统一全部都显示，不受fp控制了
      },
      () => {
        this.getSupplierInfo();
      }
    );
  };

  //获取人员信息
  getPersonDetail = userOid => {
    let _userOid = this.props.match.params.userOid;
    if (userOid) {
      _userOid = userOid;
    }
    //编辑更新
    PDService.getPersonDetail(_userOid).then(res => {
      let data = res.data;
      if (data.gender === 0) {
        data.genderName = this.$t('pdc.basic.info.male');
      } else if (data.gender === 1) {
        data.genderName = this.$t('pdc.basic.info.female');
      } else {
        data.genderName = this.$t('pdc.basic.info.unknem');
      }
      if (data.countryCode === undefined) {
        data.mobileCode = '86';
        data.countryCode = 'CN';
      }
      this.setState(
        {
          personObj: data,
        },
        () => {
          if (
            this.state.personObj.customFormValues &&
            this.state.personObj.customFormValues.length > 0
          ) {
            this.getPersonDetailEnumerationList();
          }
        }
      );
    });
  };
  //获取扩展字段中的值列表
  getPersonDetailEnumerationList = () => {
    let personObj = this.state.personObj;
    let customFormValues = personObj.customFormValues;
    for (let i = 0; i < customFormValues.length; i++) {
      if (customFormValues[i].messageKey === 'cust_list') {
        let dataSource = JSON.parse(customFormValues[i].dataSource);
        if (dataSource && dataSource.customEnumerationOid) {
          PDService.getListByCustomEnumerationOid(dataSource.customEnumerationOid)
            .then(res => {
              this.setPersonDetailEnumerationList(res.data, customFormValues[i]);
            })
            .catch(err => {});
        }
      }
    }
  };

  //设置扩展字段中的值列表
  //把值列表挂在对应字段上
  setPersonDetailEnumerationList = (customEnumerationList, filed) => {
    let personObj = deepCopy(this.state.personObj);
    let customFormValues = personObj.customFormValues;
    for (let i = 0; i < customFormValues.length; i++) {
      if (customFormValues[i].fieldOid === filed.fieldOid) {
        customFormValues[i].customEnumerationList = customEnumerationList;
        //每设置一次，都需要更新一下
        //后端可能返回的是值列表值对应的code（value），不是messageKey，需要找一下
        //参见bug13014
        this.setState({
          personObj: personObj,
        });
      }
    }
  };

  //获取银行信息
  getBankCards = () => {
    //编辑更新
    PDService.getBankCards(this.props.match.params.userOid).then(res => {
      this.setState({
        bankCards: res.data,
      });
    });
  };

  //获取证件信息
  getContactCards = () => {
    //编辑更新
    PDService.getContactCards(this.props.match.params.userOid).then(res => {
      this.setState({
        contactCards: res.data,
      });
    });
  };

  //获取供应商信息
  getSupplierInfo = () => {
    PDService.getSupplierInfo(this.props.match.params.userOid).then(res => {
      //需要用deepCopy，不然有对象引用导致的缓存
      let _vendorInfo = deepCopy(vendorInfoDefaultWithPerson);
      _vendorInfo.userOid = this.props.match.params.userOid;
      let vendorInfo = null;
      //如果有供应商信息
      if (!!res.data) {
        vendorInfo = Object.assign(_vendorInfo, res.data);
      } else {
        vendorInfo = _vendorInfo;
      }
      this.setState(
        {
          vendorInfo: vendorInfo,
        },
        () => {}
      );
    });
  };

  //保存基本信息
  savedBasicInfoData = person => {
    this.props.match.params.userOid = person.userOid;
    //更新了人员信息，重新初始化页面
    this.initPage(person.userOid);
    this.BasicInfoToNoEditing();
  };
  //个人基本信息:编辑
  BasicInfoToEditing = () => {
    this.setState({
      BasicInfoEditing: true,
    });
  };
  //个人基本信息
  BasicInfoToNoEditing = () => {
    this.setState({
      BasicInfoEditing: false,
    });
  };

  //创建银行卡后
  //或者编辑银行卡后
  createCardOver = () => {
    this.getBankCards();
  };
  //创建证件后
  createContactCardOver = () => {
    this.getContactCards();
  };

  //保存供应商信息
  savedVendorExtendData = obj => {
    this.getSupplierInfo();
    this.VendorToNoEditing();
  };
  //个人供应商信息:编辑
  VendorToEditing = () => {
    this.setState({
      VendorEditing: true,
    });
  };
  //个人供应商信息
  VendorToNoEditing = () => {
    this.setState({
      VendorEditing: false,
    });
  };

  //离职该员工
  setResignDate = () => {
    let date = this.state.hireTime;
    if (date) {
      date = moment(date).format('YYYY-MM-DD');
      PDService.setResignDate(this.props.match.params.userOid, date)
        .then(res => {
          //操作成功
          message.success(this.$t('pm.detail.person.operation.ok'));
          this.getPersonDetail();
          this.setState({
            showSelectTime: false,
            hireTime: null,
          });
        })
        .catch(res => {});
    } else {
      //请选择离职时间
      message.success(this.$t('pm.detail.person.select.time'));
    }
  };
  //撤销离职
  cancelResign = () => {
    PDService.cancelResign(this.props.match.params.userOid)
      .then(res => {
        //操作成功
        message.success(this.$t('pm.detail.person.operation.ok'));
        this.getPersonDetail();
      })
      .catch(res => {});
  };
  //重新入职
  rehire = () => {
    PDService.rehire(this.props.match.params.userOid)
      .then(res => {
        //操作成功
        message.success(this.$t('pm.detail.person.operation.ok'));
        this.getPersonDetail();
      })
      .catch(res => {});
  };
  setResignDateModel = () => {
    this.setState({
      showSelectTime: true,
      hireTime: null,
    });
  };
  hideSelectTime = () => {
    this.setState({
      hireTime: null,
      showSelectTime: false,
    });
  };
  handleChangeHireTime = time => {
    this.setState({
      hireTime: time,
    });
  };
  //根据员工状态渲染顶部按钮
  //   status: 1001,//不传代表只查询在职，1001也是在职，1002待离职员工，1003离职员工
  renderTopBtnByStatus = user => {
    if (user.userOid && this.props.tenantMode) {
      if (user.status === 1002) {
        return (
          <div>
            <Button onClick={this.setResignDateModel}>
              {/*修改离职时间*/}
              {this.$t('pm.detail.alt.leave.time')}
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button onClick={this.cancelResign}>
              {/*撤销离职*/}
              {this.$t('pm.detail.alt.leave')}
            </Button>
          </div>
        );
      } else if (user.status === 1003) {
        return (
          <div>
            <Button onClick={this.rehire}>
              {/*重新入职*/}
              {this.$t('pm.detail.rehire')}
            </Button>
          </div>
        );
      } else if (user.status === 1001) {
        return (
          <div>
            <Button onClick={this.setResignDateModel}>
              {/*离职该员工*/}
              {this.$t('pm.detail.left.person')}
            </Button>
          </div>
        );
      } else {
        return <div />;
      }
    } else {
      return <div />;
    }
  };

  //基本信息
  renderEditBtn = val => {
    if (!val && this.state.CREATE_DATA_TYPE && this.props.tenantMode) {
      return (
        <div className="f-left person-detail-edit-icon" onClick={this.BasicInfoToEditing}>
          <Icon type="edit" />
          <span className="edit-text">
            {/*编辑*/}
            {this.$t('common.edit')}
          </span>
        </div>
      );
    } else {
      return <div />;
    }
  };

  //渲染银行卡信息，必须与租户管理员权限且不是接口导入模式，才能编辑
  renderBankCards = cards => {
    if (cards.length > 0) {
      let dom = [];
      cards.map((data, index) => {
        dom.push(
          <div key={'is-empty-bank-card' + index} className="f-left bank-card-item">
            <BankCard
              count={cards.length}
              isShowEditBtn={this.props.tenantMode && this.state.CREATE_DATA_TYPE}
              createCardOver={this.createCardOver}
              cardInfo={data}
              key={'is-empty-bank-card' + index}
            />
          </div>
        );
      });
      //加一个空银行卡：有限制条件的
      if (this.props.tenantMode && this.state.CREATE_DATA_TYPE) {
        dom.push(
          <div key={'is-empty-bank-card' + cards.length - 1} className="f-left bank-card-item">
            <BankCard
              count={cards.length}
              isEmpty={true}
              createCardOver={this.createCardOver}
              cardInfo={bankAccountDefault}
              key={'is-empty-bank-card'}
            />
          </div>
        );
      }

      return (
        <div className="bank-card-list">
          {dom}
          <div className="clear" />
        </div>
      );
    } else {
      if (this.props.tenantMode && this.state.CREATE_DATA_TYPE) {
        return (
          <div className="bank-card-list">
            <div className="f-left bank-card-item">
              <BankCard
                count={cards.length}
                isEmpty={true}
                createCardOver={this.createCardOver}
                cardInfo={bankAccountDefault}
                key={'is-empty-bank-card'}
              />
            </div>
            <div className="clear" />
          </div>
        );
      } else {
        return <span />;
      }
    }
  };

  //渲染证件信息，必须与租户管理员权限且不是接口导入模式，才能编辑
  renderContactCards = cards => {
    if (cards.length > 0) {
      let dom = [];
      cards.map((data, index) => {
        dom.push(
          <div key={'is-empty-id-card' + index} className="f-left id-card-item">
            <SomeIdCard
              isShowEditBtn={this.props.tenantMode && this.state.CREATE_DATA_TYPE}
              createCardOver={this.createContactCardOver}
              cardInfo={data}
              key={'is-empty-id-card' + index}
            />
          </div>
        );
      });
      //加一个空证件：有限制条件的
      if (this.props.tenantMode && this.state.CREATE_DATA_TYPE) {
        dom.push(
          <div key={'is-empty-id-card' + cards.length - 1} className="f-left bank-card-item">
            <SomeIdCard
              isEmpty={true}
              createCardOver={this.createContactCardOver}
              cardInfo={contactCardDefault}
              key={'is-empty-id-card'}
            />
          </div>
        );
      }

      return (
        <div className="bank-card-list">
          {dom}
          <div className="clear" />
        </div>
      );
    } else {
      if (this.props.tenantMode && this.state.CREATE_DATA_TYPE) {
        return (
          <div className="bank-card-list">
            <div className="f-left id-card-item">
              <SomeIdCard
                isEmpty={true}
                createCardOver={this.createContactCardOver}
                cardInfo={contactCardDefault}
                key={'is-empty-id-card'}
              />
            </div>
            <div className="clear" />
          </div>
        );
      } else {
        return <span />;
      }
    }
  };

  //供应商
  renderVendorEditBtn = val => {
    if (!val && this.props.tenantMode && this.state.CREATE_DATA_TYPE) {
      return (
        <div className="f-left person-detail-edit-icon" onClick={this.VendorToEditing}>
          <Icon type="edit" />
          <span className="edit-text">
            {/*编辑*/}
            {this.$t('common.edit')}
          </span>
        </div>
      );
    } else {
      return <div />;
    }
  };

  //是否渲染 携程供应商
  renderCtripVendor = val => {
    if (val) {
      return (
        <div className="vendor-info-wrap">
          <div className="card-wrap-title">
            <div className="f-left">
              {/*供应商信息*/}
              {this.$t('pm.detail.vendor.info')}
            </div>
            {this.renderVendorEditBtn(this.state.VendorEditing)}
            <div className="clear" />
          </div>
          <VendorInfo
            savedData={this.savedVendorExtendData}
            toEditing={this.VendorToEditing}
            toNoEditing={this.VendorToNoEditing}
            vendorObj={this.state.vendorInfo}
            originEditingStatus={this.state.VendorEditing}
          />
        </div>
      );
    } else {
      return <div />;
    }
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: window.location.href.indexOf('enterprise-manage/org-structure')!==-1 ? '/enterprise-manage/org-structure' : `/setting/employee`,
      })
    );
    // this.context.router.push(menuRoute.getRouteItem('person-manage').url);
  };

  renderInfoByUseIsNew = user => {
    if (user.userOid) {
      return (
        <div>
          <div className="pd-card-wrap">
            <div className="card-wrap-title">
              {/*银行卡信息*/}
              {this.$t('pm.detail.bank.info')}
            </div>
            {this.renderBankCards(this.state.bankCards)}
          </div>
          <div className="pd-id-card-wrap">
            <div className="card-wrap-title">
              {/*证件信息*/}
              {this.$t('pm.detail.id.info')}
            </div>
            {this.renderContactCards(this.state.contactCards)}
          </div>
          {/*根据配置，是否渲染携程供应商*/}
          {this.renderCtripVendor(this.state.hasCtripVendor)}
        </div>
      );
    } else {
      return '';
    }
  };

  render() {
    return (
      <div className="person-detail-wrap" style={{ padding: '12px 14px 50px' }}>
        <div className="person-detail-top-wrap">
          {this.renderTopBtnByStatus(this.state.personObj)}
        </div>
        <div className="basic-info-wrap">
          <div className="basic-info-title">
            <div className="f-left">
              {/*个人基本信息*/}
              {this.$t('pm.detail.basic.info')}
            </div>
            {this.renderEditBtn(this.state.BasicInfoEditing)}
            <div className="clear" />
          </div>

          {/*这个地方直接写组件，不依赖于state渲染，导致组件componentWillMount钩子没有执行*/}
          <BasicInfo
            savedData={this.savedBasicInfoData}
            toEditing={this.BasicInfoToEditing}
            toNoEditing={this.BasicInfoToNoEditing}
            basicInfoData={this.state.personObj}
            originEditingStatus={this.state.BasicInfoEditing}
          />
        </div>
        {this.renderInfoByUseIsNew(this.state.personObj)}
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {/*返回*/}
          {this.$t('common.back')}
        </a>

        <div className="person-detail-wrap-for-model" />
        <Modal
          getContainer={() => {
            return document.getElementsByClassName('person-detail-wrap-for-model')[0];
          }}
          closable
          width={600}
          className="show-select-hire-time-modal"
          title={this.$t('pm.detail.person.set.left.time')} //设置离职时间
          visible={this.state.showSelectTime}
          footer={null}
          onCancel={this.hideSelectTime}
          destroyOnClose={true}
        >
          <div className="hire-time-content">
            <DatePicker
              className="hire-time-content-date"
              format={'YYYY-MM-DD'}
              value={this.state.hireTime}
              defaultValue={this.state.hireTime}
              onChange={this.handleChangeHireTime}
            />
          </div>
          <div className="hire-time-footer">
            <Button className="hire-time-cancel" onClick={this.hideSelectTime}>
              {this.$t('common.cancel')}
            </Button>
            <Button type="primary" onClick={this.setResignDate}>
              {this.$t('common.ok')}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

PersonDetail.propTypes = {};

function mapStateToProps(state) {
  return {
    profile: state.user.proFile,
    user: state.user.user,
    company: state.user.company,
    tenantMode: true,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(PersonDetail);
