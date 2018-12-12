import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import PropTypes from 'prop-types';

const ResizeableTitle = (props) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable width={width} height={0} onResize={onResize}>
            <th {...restProps} />
        </Resizable>
    );
};

class CustomTable extends React.Component {
    state = {
        columns: []
    };

    componentDidMount() {
        this.setState({
            columns: this.props.columns,
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            columns: nextProps.columns
        })
    }

    components = {
        header: {
            cell: ResizeableTitle,
        },
    };

    handleResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return { columns: nextColumns };
        });
    };

    render() {
        const columns = this.state.columns.map((col, index) => ({
            ...col,
            onHeaderCell: column => ({
                width: column.width,
                onResize: this.handleResize(index),
            }),
        }));

        return (
            <Table
                rowKey={this.props.rowKey}
                bordered
                components={this.components}
                columns={columns}
                dataSource={this.props.dataSource}
                loading={this.props.loading}
                pagination={this.props.pagination}
                size={this.props.size}
                onRow={this.props.onRow}
                childrenColumnName={this.props.childrenColumnName}
                defaultExpandAllRows={this.props.defaultExpandAllRows}
                defaultExpandedRowKeys={this.props.defaultExpandedRowKeys}
                expandedRowKeys={this.props.expandedRowKeys}
                expandedRowRender={this.props.expandedRowRender}
                expandRowByClick={this.props.expandRowByClick}
                footer={this.props.footer}
                indentSize={this.props.indentSize}
                locale={this.props.locale}
                rowClassName={this.props.rowClassName}
                rowSelection={this.props.rowSelection}
                scroll={this.props.scroll}
                showHeader={this.props.showHeader}
                title={this.props.title}
                onChange={this.props.onChange}
                onExpand={this.props.onExpand}
                onExpandedRowsChange={this.props.onExpandedRowsChange}
                onHeaderRow={this.props.onHeaderRow}
            />
        );
    }
}


CustomTable.propTypes = {
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    prefixCls: PropTypes.string,
    useFixedHeader: PropTypes.bool,
    rowSelection: PropTypes.object,
    className: PropTypes.string,
    size: PropTypes.string,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    bordered: PropTypes.bool,
    onChange: PropTypes.func,
    locale: PropTypes.object,
    dropdownPrefixCls: PropTypes.string,
};

CustomTable.defaultProps = {
    dataSource: [],
    prefixCls: 'ant-table',
    useFixedHeader: false,
    className: '',
    size: 'default',
    loading: false,
    bordered: false,
    indentSize: 20,
    locale: {},
    rowKey: 'key',
    showHeader: true,
    defaultExpandAllRows: false,
    defaultExpandedRowKeys: [],
    expandedRowKeys: []
}




export default CustomTable


