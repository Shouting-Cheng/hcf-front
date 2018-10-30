import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config';
import { Tabs, Input, Button, Table, Form, Checkbox, message, Switch, Icon, Spin, Modal } from 'antd';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

import moment from 'moment';
import BraftEditor from 'braft-editor';
import ImageUpload from 'components/Widget/image-upload';
import ListSelector from 'components/Widget/list-selector';
import UploadFile from 'components/Widget/upload';
import announcementService from 'containers/setting/announcement-information/announcement-information.service';
import 'styles/setting/announcement-information/announcement-information-detail.scss';
import 'braft-editor/dist/braft.css';

class AnnouncementInformationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleTemp: false,
      loading: false,
      pageLoading: false,
      tableLoading: false,
      isOutLink: false,
      isEnabled: true,
      defaultImageList: [],
      imageList: [],
      content: "",
      info: {},
      columns: [
        { title: this.$t('announcement.info.company.code'/*公司代码*/), dataIndex: 'companyCode' },
        { title: this.$t('announcement.info.company.name'/*公司名称*/), dataIndex: 'name' },
      ],
      data: [],
      page: 0,
      size: 10,
      pagination: {},
      companySelectorShow: false,
      fileUploadVisible: false,
      tempTarget: {},
      tempImgList: [],
    };
  }

  componentDidMount() {
    this.props.match.params.OID && this.getInfo();
    this.getAnnouncementTemp();
  }

  getInfo = () => {
    this.setState({ pageLoading: true });
    announcementService.getAnnouncementDetail(this.props.match.params.OID).then(res => {
      this.setState({
        pageLoading: false,
        info: res.data,
        isOutLink: res.data.outLink,
        isEnabled: res.data.enable,
        defaultImageList: [res.data.attachmentDTO],
        imageList: [res.data.attachmentDTO],
        content: res.data.content,
      });
    });
  };

  getAnnouncementTemp = () => {
    announcementService.getAnnouncementTemp()
      .then(res => {
        this.setState(
          {
            tempImgList: res.data,
          },
        );
      });
  };
  onTabChange = (key) => {
    key === 'company' && this.getCompanyList();
  };

  onCheckboxChange = (e) => {
    this.setState({ isOutLink: e.target.checked });
  };

  //改变状态
  handleStatusChange = (status) => {
    this.setState({ isEnabled: status });
  };

  //上传封面图片
  handleUploadImage = (values) => {
    this.setState({ imageList: values });
  };

  //提交
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!this.state.imageList.length) {
          message.error(this.$t('announcement.info.please.choose.image'/*请选择封面图片*/));
        } else {
          this.handleSave(values);
        }
      }
    });
  };

  //保存
  handleSave = (values) => {
    let content = this.state.content;
    //以下是为了在移动端防止图片过大而无法完全显示的问题
      let img_arr = content.match(/<img.*?>/g);
      img_arr && img_arr.map((img, index) => {
        if (img.match(/width="auto"/) && img.match(/height="auto"/)) {
          img = img.replace(/width="auto"/, '');
          img = img.replace(/height="auto"/, '');
          img = img.replace(/width:auto;height:auto;/, '');
        }
        content = content.replace(content.match(/<img.*?>/g)[index], img);
      });
    //以下是因为移动端无法正确显示<em>和<i>，因此加上css属性实现斜体
    content = content.replace(/<em>/g, '<em style="font-style: italic">');
    content = content.replace(/<i>/g, '<i style="font-style: italic">');
    values.enable = this.state.isEnabled;
    values.attachmentOID = this.state.imageList[0].attachmentOID;
    !this.props.tenantMode && (values.companyOID = this.props.company.companyOID);
    values.content = content;
    values.preferredDate = moment(new Date());
    this.props.match.params.OID && (values.carouselOID = this.props.match.params.OID);
    this.setState({ loading: true });
    announcementService[this.props.match.params.OID ? 'updateAnnouncement' : 'newAnnouncement'](values).then(res => {
      if (res.status === 200) {
        this.setState({ loading: false });
        message.success(this.$t('common.save.success', { name: '' }));
        this.handleCancel();
      }
    }).catch(e => {
      this.setState({ loading: false });
      message.error(`${this.$t('common.save.filed'/*保存失败*/)}，${e.response.data.message}`);
    });

  };

  //取消
  handleCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/announcement-information`,
      }),
    );
  };

  showCompanySelector = (flag) => {
    this.setState({ companySelectorShow: flag });
  };

  //获取分配公司列表
  getCompanyList = () => {
    const { page, size } = this.state;
    this.setState({ tableLoading: true });
    announcementService.getCompanyList(page, size, this.props.match.params.OID).then(res => {
      this.setState({
        tableLoading: false,
        data: res.data,
        pagination: {
          current: page + 1,
          onChange: this.onChangePaper,
        },
      });
    });
  };

  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  //分配公司
  handleListOk = (result) => {
    let companyList = [];
    result.result.map(item => {
      companyList.push(item.companyOID);
    });
    if (!companyList.length) {
      message.warning(this.$t('announcement.info.please.choose.company'/*请选择公司*/));
    } else {
      announcementService.handleCompanyDistribute([this.props.match.params.OID], companyList).then(() => {
        this.showCompanySelector(false);
        this.getCompanyList();
        message.success(this.$t('announcement.info.company.distribute.success')/*公司分配成功*/);
      }).catch(e => {
        message.error(`${this.$t('common.operate.filed'/*操作失败*/)}，${e.response.data.message}`);
      });
    }
  };

  handleContentChange = (content) => {
    this.setState({ content:content });
  };

  //富文本中上传图片
  handleImageUpload = (param) => {
    const formData = new FormData();
    formData.append('attachmentType', 'CARROUSEL_IMAGES');
    formData.append('file', param.file);
    announcementService.handleImageUpload(formData).then(res => {
      param.success({ url: res.data.fileURL });
    }).catch(e => {
      param.error();
      message.error(`${this.$t('announcement.info.upload.image.fail'/*图片上传失败*/)}，${e.response.data.message}`);
    });
  };

  //上传文件
  handleFileUpload = (fileList) => {
    let content = this.state.content;
    fileList.map(item => {
      content += `<a href="${item.response.fileURL}" target="">${item.response.fileName}</a>`;
    });
    this.editorInstance.setContent(content, 'html');
    this.handleContentChange(content);
    this.setState({ fileUploadVisible: false });
  };

  showTempModal = () => {
    this.setState({ visibleTemp: true });
  };
  handleOkTemp = () => {
    let tempImgList = this.state.tempImgList;
    //默认显示的
    // let defaultImageList = this.state.defaultImageList;
    //上传用的
    // let imageList = this.state.imageList;
    let tempTarget = null;
    tempImgList.map(item => {
      if (item.selected) {
        tempTarget = item;
      }
    });

    //如果用户没有选择模板
    if (tempTarget === null) {
      this.setState({ visibleTemp: false });
      return;
    }

    tempTarget.iconUrl = tempTarget.templateUrl;
    tempTarget.fileURL = tempTarget.templateUrl;
    tempTarget.fileName = tempTarget.templateName;

    this.setState({
      visibleTemp: false,
      tempTarget: tempTarget,
      imageList: [tempTarget],
      defaultImageList: [tempTarget],
    });

  };
  handleCancelTemp = () => {
    this.setState({ visibleTemp: false });
  };
  selectTempImg = (item) => {
    let tempImgList = this.state.tempImgList;
    tempImgList.map(item => {
      item.selected = false;
    });
    item.selected = true;
    this.setState({
      tempImgList,
    });
  };

  renderImgList = (imgs) => {
    if (imgs.length < 1) {
      return <div className="img-radio">
        {/*没有设置模板*/}
        {this.$t('announcement.info.notemp')}
      </div>;
    } else {
      return <div className="img-list-wrap">
        {imgs.map((item, index) => {
          return <div className="img-wrap f-left" key={index} onClick={() => {
            this.selectTempImg(item);
          }}>
            <div className="img-target">
              <img src={item.templateUrl}/>
            </div>
            <div className="img-radio">
              {item.selected ? <Icon type="check-circle" className="checked"/> : <Icon type="check-circle"/>}
              &nbsp;&nbsp;
              {item.templateName}
            </div>
          </div>;
        })}
        <div className="clear"></div>
      </div>;
    }
  };

  render() {
    const {
      loading, pageLoading, tableLoading, isEnabled,
      defaultImageList, info, columns, data,
      pagination, companySelectorShow, content, fileUploadVisible,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const controls = [
      'undo', 'redo', 'split', 'text-align', 'font-size', 'font-family', 'line-height', 'text-color',
      'bold', 'italic', 'underline', 'strike-through', 'superscript',
      'subscript', 'split', 'headings', 'list_ul', 'list_ol',
      'blockquote', 'code', 'split', 'link', 'split', 'media',
    ];
    const extendControls = [{
      type: 'button',
      text: <Icon type="file-add"/>,
      hoverTitle: this.$t('announcement.info.upload.file'/*上传文件*/),
      className: 'file-add',
      onClick: () => this.setState({ fileUploadVisible: true }),
    }];

    return (
      <div className="announcement-information-detail">
        <Tabs onChange={this.onTabChange}>
          <TabPane tab={this.$t('announcement.info.detail'/*公告详情*/)} key='detail'>
            <Spin spinning={pageLoading}>
              <Form className="form-container">
                <FormItem {...formItemLayout} label={this.$t('announcement.info.title'/*标题*/)}>
                  {getFieldDecorator('title', {
                    rules: [{
                      required: true,
                      message: this.$t('common.please.enter'/*请输入*/),
                    }, {
                      max: 24,
                      message: '最多输入24个字',
                    }],
                    initialValue: info.title,
                  })(
                    <Input placeholder={this.$t('common.please.enter'/*请输入*/)}/>,
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t('announcement.info.to.outer.link'/*跳转外部链接*/)}>
                  {getFieldDecorator('outLink', {
                    valuePropName: 'checked',
                    initialValue: info.outLink,
                  })(
                    <Checkbox onChange={this.onCheckboxChange}>
                      {this.$t('announcement.info.to.outer.link.notice'/*勾选该选项，则直接按正文中第一个链接跳转到链接页面*/)}
                    </Checkbox>,
                  )}
                </FormItem>

                <FormItem {...formItemLayout}
                          label={<span className="ant-form-item-required">
                  {this.$t('announcement.info.outer.image'/*封面图片*/)}</span>}
                >
                  <Button type="primary" onClick={this.showTempModal}>
                    {/*从模板中选择*/}
                    {this.$t('announcement.info.s.fromtemp')}
                  </Button>
                  <br/>
                  &nbsp;
                  <br/>
                  <ImageUpload attachmentType="CARROUSEL_IMAGES"
                               uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                               maxNum={1}
                               fileType={['jpg', 'jpeg', 'bmp', 'gif', 'png']}
                               fileSize={5}
                               defaultFileList={defaultImageList}
                               isShowDefault={true}
                               onChange={this.handleUploadImage}/>
                  <div className="image-attention">
                    {this.$t('announcement.info.upload.image.notice'/*推荐尺寸750*320;支持jpg, jpeg, bmp, gif, png类型文件, 5M以内*/)}
                  </div>
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t('common.column.status'/*状态*/)}>
                  {getFieldDecorator('enable')(
                    <div>
                      <Switch checked={isEnabled}
                              checkedChildren={<Icon type="check"/>}
                              unCheckedChildren={<Icon type="cross"/>}
                              onChange={this.handleStatusChange}/>
                      <span
                        className="enabled-type">{isEnabled ? this.$t('common.status.enable') : this.$t('common.status.disable')}</span>
                    </div>,
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t('announcement.info.text'/*正文*/)}>
                  <BraftEditor height={200}
                               controls={controls}
                               language={this.props.language.locale}
                               contentFormat="html"
                               initialContent={content}
                               extendControls={extendControls}
                               media={{
                                 image: true,
                                 video: false,
                                 audio: false,
                                 externalMedias: {
                                   image: false,
                                   video: false,
                                   audio: false,
                                 },
                                 uploadFn: this.handleImageUpload,
                               }}
                               ref={instance => this.editorInstance = instance}
                               onChange={this.handleContentChange}/>
                </FormItem>
                <div className="btn">
                  <Button type="primary"
                          loading={loading}
                          onClick={this.handleSubmit}>
                    {this.$t('common.save')}
                  </Button>
                  <Button onClick={this.handleCancel} className="cancel-btn">{this.$t('common.back')}</Button>
                </div>
              </Form>
            </Spin>
          </TabPane>
          {this.props.match.params.OID && this.props.tenantMode && (
            <TabPane tab={this.$t('announcement.company.distribute'/*公司分配*/)} key='company'>
              <div className="table-header">
                <div className="table-header-buttons">
                  <Button type="primary" onClick={() => this.showCompanySelector(true)}>
                    {this.$t('announcement.info.distribute.company'/*分配公司*/)}
                  </Button>
                </div>
              </div>
              <Table rowKey="id"
                     loading={tableLoading}
                     columns={columns}
                     dataSource={data}
                     pagination={pagination}
                     bordered
                     size="middle"/>
              <ListSelector type='deploy_company_by_carousel'
                            visible={companySelectorShow}
                            onOk={this.handleListOk}
                            extraParams={{ source: this.props.match.params.id }}
                            onCancel={() => this.showCompanySelector(false)}/>
              <a className="back-icon" onClick={this.handleCancel}><Icon type="rollback"/>
                {this.$t('common.back')}
              </a>
            </TabPane>
          )}
        </Tabs>
        {fileUploadVisible && (
          <Modal title={this.$t('announcement.info.upload.file'/*上传文件*/)}
                 visible={fileUploadVisible}
                 footer={<Button onClick={() => this.setState({ fileUploadVisible: false })}>
                   {this.$t('common.cancel')}
                 </Button>}>
            <UploadFile uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                        attachmentType="OTHER"
                        fileNum={1}
                        needAllResponse={true}
                        uploadHandle={this.handleFileUpload}/>
          </Modal>
        )}

        {/*选择轮播图模板的弹窗*/}

        <Modal
          title={this.$t('announcement.info.s.temp')}//选择模板
          width={490}
          className="select-carousel-temp-modal"
          maskCloseable={false}
          visible={this.state.visibleTemp}
          onOk={this.handleOkTemp}
          onCancel={this.handleCancelTemp}
        >
          {this.renderImgList(this.state.tempImgList)}
        </Modal>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
    language: state.languages,
    tenantMode: true,
  };
}

const WrappedAnnouncementInformationDetail = Form.create()(AnnouncementInformationDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedAnnouncementInformationDetail);
