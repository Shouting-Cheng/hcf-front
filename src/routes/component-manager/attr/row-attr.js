import React, { Component } from 'react';

import { Form } from 'antd';

import { connect } from 'dva';
import CommonAttrForm from './common-attr-form';

const types = [
    {
        label: 'default',
        value: 'default',
    },
    {
        label: 'primary',
        value: 'primary',
    },
    {
        label: 'dashed',
        value: 'dashed',
    },
    {
        label: 'danger',
        value: 'danger',
    },
];

@connect(({ components }) => ({
    components,
}))

class RowAttr extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formItems: [
                {
                    label: 'gutter',
                    key: 'gutter',
                    type: 'input',
                    tooltip: '栅格间隔',
                },
                {
                    label: 'margin',
                    key: 'style.margin',
                    type: 'input',
                    tooltip: '外边距',
                },
                {
                    label: 'padding',
                    key: 'style.padding',
                    type: 'input',
                    tooltip: '内边距',
                },
                {
                    label: 'background',
                    key: 'style.backgroundColor',
                    type: 'color',
                    tooltip: '背景颜色',
                }
            ],
        };
    }

    render() {
        const {
            components: { selectedId },
            components: { components },
        } = this.props;

        return (
            <CommonAttrForm
                formItems={this.state.formItems}
                selectedId={selectedId}
                components={components}
            />
        );
    }
}

export default Form.create()(RowAttr);

