import React from "react";
import { Button } from '@material-ui/core';
import IndexGeneral from "../general/IndexGeneral";
import { Context, getAPI, rootURL } from "../Global";
import { withRouter } from "react-router";

class Log extends React.Component {
    constructor(props) {
        super(props);
    }

    onRollbackClick() {
        axios.get('/api/rollback').then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            this.props.history.push(rootURL + '/logs');
        });
    }

    render() {
        const index = {
            config: {
                title: 'Log',
                description: info => 
                    <React.Fragment>
                        <Button variant="contained" color="secondary" onClick={() => this.onRollbackClick()}>Rollback</Button>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'logs',
                show: ['pagination', 'search']
            },
            columns: [
                { name: "id", label: "Mã log" },
                { name: "table_name", label: "Tên bảng" },
                { name: "step", label: "Bước", },
                { name: "type", label: "Loại lệnh", display: row => row.type === 0 ? 'Thêm' : row.type === 1 ? 'Chỉnh sửa' : row.type === 2 ? 'Xóa' : 'Chưa biết'},
                { name: "record_id", label: "Mã dòng" },
                { name: "data", label: "Dữ liệu cũ" },
                { name: "created_at", label: "Thời gian thực hiện" },
            ]
        };

        return (
            <IndexGeneral
                index={index}
            />
        );
    }
}

Log.contextType = Context;

export default withRouter(Log);