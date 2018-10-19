/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Icon, message, Spin, Row, Col } from 'antd'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/new-updata-line-mode-data-rules.scss'
import LineModelChangeRules from 'containers/financial-accounting-setting/accounting-source/line-model-change-rules'
import DataRulesForm from 'containers/financial-accounting-setting/accounting-source/data-rules-form'
import {formatMessage} from 'share/common'


class NewUpDataLineModeDataRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changeRulesData: [],
      isNew: true,
      params: {},
      buttonRender: false,
      spinningLoading: false,
      newChangeRulesRender: false,
      changeDataParams: {},
      renderNewChangeRules: [],
      //控制下方转换规则是否显示
      changeRulesRender: true,
      saveCount: 0
    }
  }

  componentWillMount() {
    if (JSON.stringify(this.props.params) != "{}" && this.props.params.timestamp) {
      if (this.props.params.isNew) {
        this.setState({
          params,
          isNew: true,
          buttonRender: false,
          newChangeRulesRender: false,
          changeRulesRender: true
        }, () => { });
      } else if (this.props.params.isNew === false) {
        let buttonRender = (this.props.params.params.record.dataRule === "VALUE_OF_RULE") ? true : false
        this.setState({
          params: this.props.params,
          isNew: false,
          newChangeRulesRender: false,
          buttonRender,
          changeRulesRender: true
        }, () => {
          if (this.props.params.params.record.dataRule === "VALUE_OF_RULE") {
            this.getChangeRules();
          }
        });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.visible && this.props.params.visible) {
      this.setState({ saveCount: 0 });
    }
    if (JSON.stringify(nextProps.params) != "{}" && nextProps.params && nextProps.params.timestamp != this.props.params.timestamp) {
      this.renderNewChangeRules(nextProps.params);
      if (nextProps.params.isNew) {
        this.setState({
          params: nextProps.params,
          changeDataParams: {
            ...nextProps.params,
          },
          isNew: true,
          buttonRender: false,
          newChangeRulesRender: false,
        }, () => {
        });
      } else if (nextProps.params.isNew === false) {
        let buttonRender = (nextProps.params.record.dataRule === "VALUE_OF_RULE") ? true : false;
        this.setState({
          params: nextProps.params,
          isNew: false,
          buttonRender,
          newChangeRulesRender: false,
          changeDataParams: {
            ...nextProps.params,
            isNew: true,
          },
        }, () => {
          //存在转换规则的时候
          if (nextProps.params.record.dataRule === "VALUE_OF_RULE") {
            this.setState({
              changeRulesRender: true
            });
            this.getChangeRules(nextProps.params.record.id);
          } else {
            this.setState({
              changeRulesData: []
            })
          }
        });
      }
    }
  }

  //获取转换规则
  getChangeRules = (modelDataRuleId) => {
    this.setState({
      spinningLoading: true,
    })
    let params = {};
    params.modelDataRuleId = modelDataRuleId;
    accountingService.getSourceLineModelChangeRules(params).then((response) => {
      this.setState({
        changeRulesData: response.data,
        spinningLoading: false,
      })
    }).catch((e) => {
      message.error(e.response.data.message);
    })

  }


  onCancel = () => {
    this.props.close(false)
  };


  //渲染转换规则
  renderChangeRules = () => {
    const { changeRulesData, isNew, params } = this.state
    let renderChangeRules = [];
    if (!isNew && params.record.dataRule === "VALUE_OF_RULE") {
      changeRulesData.map((item) => {
        let changeDataParams = {
          changeData: item,
          ...this.state.params,
          isNew: false
        };
        renderChangeRules.push(
          <div key={item.id} style={{ marginTop: "24px" }}>
            <LineModelChangeRules
              key={item.id}
              status="SHOW"
              upDataEvent={this.changeRulesUpDataEvent}
              params={changeDataParams}
            />
          </div>
        )
      })
    }
    return renderChangeRules;
  }


  //渲染新建的转化规则
  renderNewChangeRules = (params) => {
    let renderNewChangeRules = [];
    renderNewChangeRules.push(
      <LineModelChangeRules
        key={1}
        status="NEW"
        params={params}
        upDataEvent={this.changeRulesUpDataEvent}
        cancelHandle={this.cancelHandle}
      />
    )
    this.setState({
      renderNewChangeRules
    })
  }


  //点击添加变化规则
  addApply = () => {
    this.setState({
      newChangeRulesRender: true
    })
  }

  changeRulesUpDataEvent = () => {
    this.setState({
      newChangeRulesRender: false,
      changeRulesData: []
    }, () => {
      this.getChangeRules(this.props.params.record.id);
    })
  }


  //保存或者更新取值规则
  upDataHandle = (value) => {
    if (value && value.dataRule === 'VALUE_OF_RULE') {
      this.setState({
        saveCount: this.state.saveCount + 1
      });
      this.props.setParams({value:value, saveCount:this.state.saveCount});
    } else {
      this.props.close({value:value,saveCount:this.state.saveCount});
    }
  }

  cancelHandle = () => {
    this.setState({
      newChangeRulesRender: false,
    })
  }

  //当取值规则发生变化时
  //当取值规则不为通过规则转化时，隐藏添加转化规则的按钮和页面内容
  changeDataRule = (value) => {
    if (this.props.params.isNew === false) {
      if (value === 'VALUE_OF_RULE') {
      } else {
        this.setState({
          buttonRender: false,
          changeRulesRender: false
        });
      }
    }
  }

  render() {
    const { changeRulesRender, isNew, params, buttonRender, newChangeRulesRender, changeDataParams, renderNewChangeRules } = this.state;

    return (
      <div className="new-updata-line-mode-data-rules">
        {
          this.state.params.timestamp ?
            (<DataRulesForm
              params={params}
              upDataHandle={this.upDataHandle}
              changeDataRule={this.changeDataRule}
            />) : ""
        }
        <Spin spinning={this.state.spinningLoading}>
          <div style={{ marginTop: "24px" }}>
            {
              buttonRender ?
                <Row>
                  <Col offset={3} span={18} >
                    <Button type="dashed" style={{ high: 40, width: "100%" }} onClick={this.addApply}><Icon type="plus" />{formatMessage({ id: "accounting.source.addChangeRule" })} </Button>
                  </Col>
                </Row> : ""

            }
          </div>
          {
            changeRulesRender ?
              <div>
                <div style={{ marginTop: "24px" }}>
                  {
                    newChangeRulesRender && this.props.params.timestamp ? renderNewChangeRules : ""
                  }
                </div>
                <div style={{ marginTop: "24px" }}>
                  {this.renderChangeRules()}
                </div>
              </div> : null
          }
        </Spin>

      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(NewUpDataLineModeDataRules);
