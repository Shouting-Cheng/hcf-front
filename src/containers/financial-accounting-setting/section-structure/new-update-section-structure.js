/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Input, Switch, Select, Form, Icon, notification,message } from 'antd'
import baseService from 'share/base.service'
import accountingService from 'containers/financial-accounting-setting/section-structure/section-structure.service';
import 'styles/financial-accounting-setting/section-structure/new-update-section-structure.scss'

const FormItem = Form.Item;
const Option = Select.Option;

class NewUpdateSectionStructure extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      isFirstRender: true,
      setOfBook: [],
      section: {}
    }
  }

  componentDidMount(){
    console.log(this.props)
    this.getSetOfBook();
    this.setState({
      enabled: this.props.params.id ? this.props.params.enabled : true,
      section: this.props.params,
      setOfBooksId: this.props.params.setOfBooksId
    });
  }
  componentWillReceiveProps(nextprops){
    console.log(nextprops)
    let params = nextprops.params;
    if(!this.props.params.visible&&nextprops.params.visible){
      this.setState({
        enabled: true,
        setOfBooksId: nextprops.params.setOfBooksId,
      })
    }
    if(JSON.stringify(params)!=='{}'){
      if(!!params.setOfBooksId&&this.state.isFirstRender){
        this.setState({
          //enabled: true,
          setOfBooksId: nextprops.params.setOfBooksId,
          isFirstRender: false
        })
      }
    }else {
      this.setState({
        isFirstRender: true,
        loading: false
      })
    }
    if(!nextprops.params.visible&&this.props.params.visible){
      this.props.form.resetFields();
    }
  }

  getSetOfBook(){
    baseService.getSetOfBooksByTenant().then((response)=>{
      let setOfBook = [];
      response.data.map((item)=>{
        setOfBook.push({label: item.setOfBooksName, value: item.id})
      });
      this.setState({
        setOfBook
      })
    })
  }

  handleSubmit = (e)=> {
    e.preventDefault();
    this.setState({
      loading: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err){
        if(typeof this.state.section.id === 'undefined'){
          values.tenantId = this.props.company.tenantId;
          accountingService.addSectionStructure(values).then(response=>{
            message.success(this.$t({id:"structure.saveSuccess"})); /*保存成功！*/
            this.props.form.resetFields();
            this.setState({loading: false});
            this.props.close(true);
          }).catch(e=>{
            if(e.response){
              message.error(`${this.$t({id:"common.save.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode }`);
              this.setState({loading: false});
            }
          });
        }else {
          values.id = this.state.section.id;
          values.versionNumber = this.state.section.versionNumber;
          accountingService.updateSectionStructure(values).then(response=>{
            this.props.form.resetFields();
            this.props.close(true);
            message.success(this.$t({id:"common.operate.success"}));
          }).catch(e=>{
            if(e.response){
              if(e.response){
                message.error(`${this.$t({id:"common.operate.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode }`);
                this.setState({loading: false});
              }
            }
          })
        }
      }
    })
  };

  onCancel = ()=>{
    notification.close('section');
    this.setState({isFirstRender: true,loading: false});
    this.props.form.resetFields();
    this.props.close(false)
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled,
      loading: false
    }))
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, section, setOfBook, enabled } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return(
      <div className="new-update-section-structure">
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label={this.$t({id:'section.setOfBook'})  /*账套*/}>
            {getFieldDecorator('setOfBooksId', {
              initialValue: this.state.setOfBooksId,
              rules: [{
                required: true,
                message: this.$t({id: "common.please.select"})
              }]
            })(
              <Select disabled={!!section.id} className="input-disabled-color" placeholder={ this.$t({id:"common.please.select"})}>
                {
                  setOfBook.map((item)=><Option key={item.value}>{item.label}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id:'section.structure.code'})  /*科目段结构代码*/}>
            {getFieldDecorator('segmentSetCode', {
              initialValue: section.segmentSetCode,
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"})
              }]
            })(
              <Input disabled={typeof section.id ==='undefined' ? false : true} className="input-disabled-color" placeholder={ this.$t({id:"common.please.enter"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id:'section.structure.name'})  /*科目段结构名称*/}>
            {getFieldDecorator('segmentSetName', {
              initialValue: section.segmentSetName,
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"})
              }]
            })(
              <Input className="input-disabled-color" placeholder={ this.$t({id:"common.please.enter"})}/>
            )}
          </FormItem>
          {
            this.props.params.visible&&
            <FormItem {...formItemLayout}
                      label={this.$t({id:"common.column.status"})} colon={true}>
              {getFieldDecorator('enabled', {
                valuePropName:"checked",
                initialValue: enabled
              })(
                <div>
                  <Switch defaultChecked={enabled}  checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                  <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? this.$t({id:"common.status.enable"}) : this.$t({id:"common.disabled"}) }</span>
                </div>)}
            </FormItem>
          }

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"  loading={this.state.loading}>{this.$t({id:"common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id:"common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

const WrappedNewUpdateSectionStructure = Form.create()(NewUpdateSectionStructure);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateSectionStructure);
