import React, { Component } from 'react';
import BasicInfo from 'widget/basic-info';
import DocumentBasicInfo from 'widget/document-basic-info';
import ListSelector from 'widget/list-selector';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { func } from 'prop-types';

class DimensionDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoList: [
        //顶部基本信息字段
        {
            type: 'input',
            id: 'code',
            isRequired: true,
            disabled: true,
            label: this.$t({ id: 'person.group.code' }) + ' :',
        } /*人员组代码*/,
        {
            type: 'input',
            id: 'name',
            isRequired: true,
            label: this.$t({ id: 'person.group.name' }) + ' :',
        } /*人员组名称*/,
        {
            type: 'input',
            id: 'comment',
            isRequired: true,
            label: this.$t({ id: 'person.group.desc' }) + ' :',
        } /*描述*/,
        {
            type: 'switch',
            id: 'enabled',
            label: this.$t({ id: 'common.column.status' }) + ' :',
        } /*状态*/,
      ],
      infoData: {
        id: 1234,
        enabled: true,
        comment: 'abc',
        name: '123',
        code: '123'
      },
      edit: false,
    }
  }

  // componentDidMount() {
  //   var _this = this;
  //   setTimeout(function() {
  //     _this.setState({
  //       infoData: {
  //         id: 1234,
  //         enabled: true,
  //         comment: 'abc',
  //         name: '123',
  //         code: '123'
  //       }
  //     })
  //   }, 1000)
  // }

  onDimension = (e) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition/dimension-details/`,
      })
    );
  }

  render() {
    const { infoList, infoData, edit } = this.state;

    return (
      <div>
        demo维度定义
        <BasicInfo
          infoList={infoList}
          infoData={infoData}
          isHideEditBtn={true}
        />
        <a onClick={this.onDimension}>维度详情</a>
      </div>
    );
  }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(DimensionDefinition);
