import React, { Component } from 'react';
import { Row, Col, Spin, Modal, Popover } from 'antd';
import moment from 'moment';
import config from 'config';

class DocumentBasicInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      detailLoading: true,
      //图片附件预览
      previewVisible: false,
      previewImage: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.businessCode) {
      this.setState({ detailLoading: false });
    }
    this.setState({
      data: nextProps.params,
    });
  }
  renderList = (title, value, linkId) => {
    return (
      <Row
        style={{ fontSize: '12px', lineHeight: '32px', overflow: 'hidden' }}
        className="list-info"
      >
        <Col span={8}>
          <Row>
            <Col
              style={{
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              span={20}
            >
              <span title={title}>{title}</span>
            </Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              :
            </Col>
          </Row>
        </Col>
        <Col
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          span={16}
        >
          {linkId ? (
            <a title={value}>{value}</a>
          ) : (
              <span title={value} className="content">
                {value}
              </span>
            )}
        </Col>
      </Row>
    );
  };
  /**
   * 点击链接 图片预览
   */
  onPreviewClick = (e, src) => {
    e.preventDefault();
    this.setState({
      previewVisible: true,
      previewImage: src,
    });
  };

  isImage = file => {
    let sections = (file.fileName || file.name).split('.');
    let extension = sections[sections.length - 1];
    let imageExtension = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    return imageExtension.has(extension);
  };

  /**
   * 预览取消
   */
  previewCancel = () => {
    this.setState({
      previewVisible: false,
    });
  };
  render() {
    const { data, detailLoading } = this.state;
    //图片预览
    const { previewImage, previewVisible } = this.state;
    return (
      <Spin spinning={detailLoading}>
        <div style={{ marginBottom: '14px', marginTop: 16 }} className="header-title">
          <Row style={{ borderBottom: '1px solid #ececec' }}>
            <Col span={8}>{data.formName}</Col>
            <Col span={4}>
              {!this.props.noHeader
                ? this.renderList(this.$t('common.document.code'), data.businessCode)
                : null}
            </Col>
            <Col span={4}>
              {!this.props.noHeader
                ? this.renderList(
                  this.$t('common.apply.data'),
                  moment(data.createdDate).format('YYYY-MM-DD')
                )
                : null}
            </Col>
            <Col span={4}>
              {!this.props.noHeader
                ? this.renderList(this.$t('common.create.person'), data.createByName)
                : null}
            </Col>
            <Col span={4}>{this.props.children}</Col>
          </Row>
        </div>
        <Row>
          <Col span={16}>
            <Row>
              {this.state.data.infoList &&
                !!this.state.data.infoList.length &&
                this.state.data.infoList.map((item, index) => {
                  return (
                    <Col key={index} span={6}>
                      {item && this.renderList(item.label, item.value, item.linkId)}
                    </Col>
                  );
                })}
            </Row>
            <Row>
              {this.state.data.customList &&
                !!this.state.data.customList.length &&
                this.state.data.customList.map((item, index) => {
                  return (
                    <Col key={index} span={6}>
                      {this.renderList(item.label, item.value)}
                    </Col>
                  );
                })}
            </Row>
            <Row>
              <Col span={24}>
                <Row
                  style={{ fontSize: '12px', lineHeight: '32px', overflow: 'hidden' }}
                  className="list-info"
                >
                  <Col span={2}>
                    <Row>
                      <Col
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'right',
                        }}
                        span={20}
                      >
                        <span>{this.$t('common.comment')}</span>
                      </Col>
                      <Col span={4} style={{ textAlign: 'center' }}>
                        :
                      </Col>
                    </Row>
                  </Col>
                  <Col
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    span={22}
                  >
                    <span title={data.remark} className="content">
                      {data.remark}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
            {data.attachments && data.attachments.length > 0 ? (
              <Row>
                <Col span={24}>
                  <Row
                    style={{ fontSize: '12px', lineHeight: '32px', overflow: 'hidden' }}
                    className="list-info"
                  >
                    <Col span={2}>
                      <Row>
                        <Col
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                          }}
                          span={20}
                        >
                          <span>{this.$t('common.attachments')}</span>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                          :
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      span={16}
                    >
                      {data.attachments.map((item, index) => {
                        return (
                          <Col
                            key={index}
                            span={6}
                            style={{
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'left',
                              lineHeight: '32px',
                            }}
                          >
                            {!this.isImage(item) ? (
                              <a
                                href={`${config.baseUrl}/api/attachments/download/${
                                  item.attachmentOID
                                  }?access_token=${
                                  sessionStorage.getItem('token')
                                  }`}
                              >
                                {item.fileName}
                              </a>
                            ) : (
                                <a onClick={e => this.onPreviewClick(e, item.thumbnailUrl)}>
                                  {item.fileName}
                                </a>
                              )}
                          </Col>
                        );
                      })}
                    </Col>
                  </Row>
                </Col>
              </Row>
            ) : null}
          </Col>
          <Col span={8}>
            <div style={{ float: 'right' }}>
              <div style={{ textAlign: 'right', fontSize: 14 }} className="amount-title">
                {this.$t('common.amount')}
              </div>
              <div style={{ fontSize: '20px' }} className="amount-content">
                {data.currencyCode} {this.filterMoney(data.totalAmount)}
              </div>
            </div>
            <div style={{ float: 'right', marginRight: '50px' }}>
              <div style={{ textAlign: 'right', fontSize: 14 }} className="status-title">
                {this.$t('common.column.status')}
              </div>
              <div style={{ fontSize: '20px' }} className="status-content">
                {this.$statusList[data.statusCode]
                  ? this.$statusList[data.statusCode].label
                  : data.statusCode}
              </div>
            </div>
          </Col>
        </Row>
        <Modal
          bodyStyle={{ height: '50vh' }}
          visible={previewVisible}
          footer={null}
          onCancel={this.previewCancel}
          closable={false}
        >
          <img alt="pictures" style={{ width: '100%', height: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
    );
  }
}
export default DocumentBasicInfo;
