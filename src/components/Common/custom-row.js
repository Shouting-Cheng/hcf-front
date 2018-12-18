import React, { Component } from 'react';
import { Row } from 'antd';
import { DropTarget } from 'react-dnd';

import { connect } from 'react-redux';
import uuid from '../../utils/uuid';

const cardSource = {
    drop(props, monitor, component) {
        if (monitor.didDrop()) return;

        let item = monitor.getItem();

        let box = {
            type: item.text,
            id: uuid(),
            props: {},
            text: '',
            parent: props.id,
        };

        props.dispatch({
            type: 'components/addComponent',
            payload: box,
        });
    },
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    };
}

class CustomRow extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        if (this.props.getRef) {
            this.props.getRef(this);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.refName != this.props.refName) {
            if (window.refs && this.props.refName && window.refs[this.props.refName]) {
                delete window.refs[this.props.refName];
            }
            window.refs = window.refs || {};

            if (nextProps.refName) {
                window.refs[nextProps.refName] = this;
            }
        }
    }

    render() {
        const { connectDropTarget, gutter, children, style } = this.props;

        return (
            connectDropTarget &&
            connectDropTarget(
                <div className={this.props.className} style={style || {}}>
                    <Row gutter={gutter}>{children}</Row>
                </div>
            )
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(
    mapStateToProps,
    null,
    null,
    { withRef: true }
)(DropTarget('box', cardSource, collect, { withRef: true })(CustomRow));
