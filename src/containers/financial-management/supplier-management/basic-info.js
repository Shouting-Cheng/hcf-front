import React from 'react';
import { Form, Card, Row, Col, Badge, Icon } from 'antd';
import SearchArea from 'components/Widget/search-area';
import moment from 'moment';
import 'styles/components/basic-info.scss';
import PropTypes from 'prop-types';
/**
 * 基本信息组件
 * @params infoList   渲染表单所需要的配置项，详见search-area组件的 searchForm 表单列表
 * @params infoData  基本信息数据
 * @params updateHandle  点击保存时的回调
 * @params updateState  保存状态，保存成功设为true，保存失败设为false，用于判断修改界面是否关闭
 * @params eventHandle 表单的onChange事件
 * @params loading 表单保存时保存按钮loading
 */

class BasicInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      infoList: [],
      searchForm: [],
      infoData: {},
      cardShow: true,
    };
  }

  componentWillMount() {
    this.setState({ infoList: this.props.infoList });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        infoData: nextProps.infoData,
        loading: nextProps.loading,
      },
      () => {
        if (nextProps.updateState) {
          this.handelCancel();
        }
      }
    );
  }

  //点击 "编辑"
  editInfo = () => {
    let values = {};
    let searchForm = [].concat(this.state.infoList);
    searchForm.map((item, index) => {
      item.defaultValue && delete item.defaultValue;
      if (item.type === 'badge' || item.type === 'file') {
        searchForm.splice(index, 1);
      } else {
        values[item.id] = this.state.infoData[item.id];
      }
    });
    this.setState({ searchForm, cardShow: false }, () => {
      this.formRef.setValues(values);
    });
  };

  setValues = values => {
    this.formRef.setValues(values);
  };

  //渲染基本信息显示页
  renderGetInfo(item) {
    if (item.type === 'switch') {
      return (
        <Badge
          status={this.state.infoData[item.id] ? 'success' : 'error'}
          text={
            this.state.infoData[item.id]
              ? this.$t('common.status.enable') /*启用*/
              : this.$t('common.status.disable') /*禁用*/
          }
        />
      );
    } else if (item.type === 'select' || item.type === 'value_list') {
      item.options &&
        item.options.map(option => {
          //有options选项时显示label值
          if (this.state.infoData[item.id] === option.value) {
            this.state.infoData[item.id] = option.label;
          }
        });
      return (
        item.defaultValue && (
          <div style={{ wordWrap: 'break-word' }}>{item.defaultValue.label || '-'}</div>
        )
      );
    } else if (item.type === 'list') {
      if (!item.defaultValue) return;
      let returnRender;
      let returnList = [];
      if (item.defaultValue.length <= 5) {
        item.defaultValue.map(list => {
          returnList.push(list[item.labelKey]);
        });
        returnRender = <div style={{ wordWrap: 'break-word' }}>{returnList.join() || '-'}</div>;
      } else {
        returnRender = (
          <div style={{ wordWrap: 'break-word' }}>
            {this.$t('common.total.selected', {
              total: item.defaultValue.length,
            }) /* 已选 {total} 条 */}
          </div>
        );
      }
      return returnRender;
    } else if (item.type === 'date') {
      //时间
      const dateValue = moment(this.state.infoData[item.id]).format('YYYY-MM-DD');
      return (
        this.state.infoData[item.id] && (
          <div style={{ wordWrap: 'break-word' }}>{dateValue || '-'}</div>
        )
      );
    } else if (item.type === 'badge') {
      //状态
      return this.state.infoData[item.id] ? (
        <Badge
          status={this.state.infoData[item.id].status}
          text={this.state.infoData[item.id].value}
        />
      ) : (
        '-'
      );
    } else if (item.type === 'file') {
      //附件
      let file_arr = [];
      this.state.infoData[item.id] &&
        this.state.infoData[item.id].map(link => {
          file_arr.push(
            <div key={link.fileURL}>
              <a href={link.fileURL} target="_blank">
                <Icon type="paper-clip" /> {link.fileName}
              </a>
            </div>
          );
        });
      return file_arr.length > 0 ? file_arr : '-';
    } else {
      return <div style={{ wordWrap: 'break-word' }}>{this.state.infoData[item.id] || '-'}</div>;
    }
  }

  getInfo() {
    let children = [];
    let rows = [];
    let infoList = [].concat(this.state.infoList);
    infoList.map((item, index) => {
      //获取默认值
      item.defaultValue = this.state.infoData[item.id];

      //规则定义的有效时间
      if (item.items) {
        item.items.map(index => {
          index.defaultValue = moment(this.state.infoData[index.id], 'YYYY-MM-DD');
          if (this.state.infoData[index.id] === null) {
            index.defaultValue = undefined;
          }
        });
      }

      //格式化日期的默认值
      if (item.type === 'date') {
        item.defaultValue = moment(item.defaultValue, 'YYYY-MM-DD');
      }

      children.push(
        <Col span={8} style={{ marginBottom: '15px' }} key={item.id}>
          <div style={{ color: '#989898' }}>{item.label}</div>
          {this.renderGetInfo(item)}
        </Col>
      );
      if ((index + 1) % 3 === 0) {
        rows.push(<Row key={index}>{children}</Row>);
        children = [];
      }
      if (index + 1 === infoList.length && (index + 1) % 3 !== 0) {
        rows.push(<Row key={index}>{children}</Row>);
      }
    });
    return rows;
  }

  handleUpdate = params => {
    this.props.updateHandle(params);
  };

  handelCancel = () => {
    this.setState({ cardShow: true });
  };

  handelEvent = (e, event) => {
    this.props.eventHandle(event, e ? (e.target ? e.target.value : e) : null);
  };

  render() {
    const { cardShow, searchForm, loading } = this.state;
    let domRender;
    if (cardShow) {
      domRender = (
        <Card title={this.$t('common.baseInfo') /* 基本信息 */}>
          <Row>{this.getInfo()}</Row>
        </Card>
      );
    } else {
      domRender = (
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.handleUpdate}
          clearHandle={this.handelCancel}
          eventHandle={this.handelEvent}
          wrappedComponentRef={inst => (this.formRef = inst)}
          okText={this.$t('common.save') /* 保存 */}
          clearText={this.$t('common.cancel') /* 取消 */}
          loading={loading}
        />
      );
    }
    return <div className="basic-info">{domRender}</div>;
  }
}

BasicInfo.propTypes = {
  infoList: PropTypes.array.isRequired, //传入的基础信息列表
  infoData: PropTypes.object.isRequired, //传入的基础信息值
  updateHandle: PropTypes.func.isRequired, //更新表单事件
  updateState: PropTypes.bool.isRequired, //更新状态（true／false）
  loading: PropTypes.bool, //保存按钮状态（true／false）
  eventHandle: PropTypes.func, //表单的onChang事件
};

BasicInfo.defaultProps = {
  eventHandle: () => {},
};

const WrappedBasicInfo = Form.create()(BasicInfo);

export default WrappedBasicInfo;
