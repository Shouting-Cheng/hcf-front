import React from 'react';
import { Badge } from 'antd';

export default {
    status: (value) => {
        return value ? <Badge status="success" text="启用" /> : <Badge status="error" text="禁用" />;
    },
};
