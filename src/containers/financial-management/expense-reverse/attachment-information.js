/**
 * Created by jsq on 2018/6/19.
 */
import React from 'react'
import { Modal, Upload } from 'antd'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'

class AttachmentInformation extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: false,
      data: []
    }
  }
  componentWillReceiveProps(nextProps) {
    let params = {...nextProps};
    if(params.visible){
      this.getAttInfo(params.sourceReportLineId);
    }
  }

  getAttInfo(id){
    reverseService.getAttInfo(id).then(response=>{
      let option = [];
      response.data.attachments.map(item=>option.push({
        uid: item.attachmentOid,
        name: item.fileName,
        status: 'done',
        url: item.fileURL
      }));
      this.setState({
        data: option,
        visible: true
      })
    })
  }

  handleCancel = ()=>{
    this.props.close && this.props.close();
    this.setState({visible: false})
  };

  render(){
    return(
      <div className="attachment-information">
        <Modal
          className="select-cost-type"
          title={this.$t('acp.fileInfo')}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="45%"
          footer={false}
        >
          {this.state.data.length===0 ? <div>{this.$t('exp.no.fileInfo.tips')}</div>:
            <Upload defaultFileList={this.state.data}/>
          }
        </Modal>
    </div>)
  }
}

// AttachmentInformation.contextTypes = {
//   router: React.PropTypes.object
// };


export default AttachmentInformation;
