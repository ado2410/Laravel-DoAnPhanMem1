import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class Subject extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý học phần',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số học phần : {info.subject_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'subjects',
            },
            columns: [
                { name: "code", label: "Mã học phần" },
                { name: "name", label: "Tên học phần"},
                { name: "credit_number", label: "Số tín chỉ" },
            ]
        };

        const input = [
            { name: "code", label: "Mã học phần", required: "all",  default: ""},
            { name: "name", label: "Tên học phần", required: "all",  default: ""},
            { name: "credit_number", label: "Số tín chỉ", type: "number", required: "all", default: "" },
            { name: "avatar", label: "Ảnh", type: "file",  default: ""},
        ];

        const show = {
            primaryKey: 'id',
            showImage: true,
            title: 'name',
            description: 'code',
            info: [
                {label: 'Tên học phần', name: 'name'},
                {label: 'Mã học phần', name: 'code'},
                {label: 'Số tín chỉ', name: 'credit_number'},
            ]
        }

        return (
            <IndexGeneral
                index={index}
                input={input}
                show={show}
            />
        );
    }
}