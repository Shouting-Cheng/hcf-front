/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react'
import config from 'config'
import httpFetch from 'share/httpFetch'
// import menuRoute from 'routes/menuRoute'
import { Form, Affix, Button, message, Row, Col } from 'antd'

import PrePaymentCommon from 'containers/pre-payment/my-pre-payment/pre-payment-common'
// import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss'
import 'styles/contract/my-contract/contract-detail.scss'

import ApproveBar from 'widget/Template/approve-bar'
import prePaymentService from "containers/pre-payment/my-pre-payment/me-pre-payment.service"
import prePaymentReCheckService from 'containers/pre-payment/pre-payment-re-check/pre-payment-re-check.service'

import { connect } from 'dva'

class PrePaymentDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            dLoading: false,
            headerData: {},
            passLoading: false,
            rejectLoading: false
        }
    }

    componentDidMount() {
        this.getInfo();
    }

    //获取预付款头信息
    getInfo = () => {
        prePaymentService.getHeadById(this.props.match.params.id).then(res => {
            this.setState({
                headerData: res.data,
            })
        }).catch(() => {
            message.error('数据加载失败，请重试')
        })
    };

    //通过
    handleApprovePass = (remark) => {

        const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;

        this.setState({ loading: true });

        prePaymentReCheckService.approvePass(id, remark, this.props.user.id).then(res => {
            if (res.status === 200) {
                message.success("操作成功！");
                this.setState({ loading: false });
                this.onCancel()
            }
        }).catch(e => {
            this.setState({ loading: false });
            message.error(`操作失败，${e.response.data.message}`)
        })
    };


    //不通过
    handleApproveReject = (remark) => {

        const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;

        this.setState({ loading: true });

        prePaymentReCheckService.approveReject(id, remark, this.props.user.id).then(res => {
            if (res.status === 200) {
                message.success("操作成功！");
                this.setState({ loading: false });
                this.onCancel()
            }
        }).catch(e => {
            this.setState({ loading: false });
            message.error(`操作失败，${e.response.data.message}`)
        })
    };


    //取消
    onCancel = () => {
        this.context.router.push(this.state.myContract.url);
    };

    render() {

        const { loading, dLoading, headerData, passLoading, rejectLoading } = this.state;

        const newState =
            (<div>
                <Button type="primary" onClick={this.onSubmit} loading={loading} style={{ margin: '0 20px' }}>提 交</Button>
                <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>返 回</Button>
            </div>);

        const otherState =
            (<div>
                <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>返 回</Button>
            </div>);


        return (
            <div className="contract-detail pre-payment-detail">
                <PrePaymentCommon flag={false} params={this.state.headerData} contractEdit={true} id={this.props.match.params.id} />
                {
                    (headerData.status && headerData.status != 1004 && headerData) ? <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
                        <Row>
                            <Col span={18}>
                                <ApproveBar passLoading={passLoading}
                                    style={{ paddingLeft: 20 }}
                                    backUrl={'/pre-payment/pre-payment-recheck'}
                                    rejectLoading={rejectLoading}
                                    handleApprovePass={this.handleApprovePass}
                                    handleApproveReject={this.handleApproveReject} />
                            </Col>
                        </Row>
                    </Affix> : (<Affix offsetBottom={0} className="bottom-bar">
                        <Button onClick={this.onCancel} className="back-btn">{this.$t({ id: "common.back" }/*返回*/)}</Button>
                    </Affix>)
                }

            </div >
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    }
}

const wrappedPrePaymentDetail = Form.create()(PrePaymentDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPrePaymentDetail)
