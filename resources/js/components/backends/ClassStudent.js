import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class ClassStudent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý sinh viên trong lớp',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số sinh viên : {info.student_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'class_students',
                hide: ["show", "edit", "import"],
            },
            columns: [
                { name: "name", label: "Mã sinh viên" },
                { name: "first_name", label: "Họ" },
                { name: "last_name", label: "Tên"},
            ],
        };

        const input = [
            { name: "student_id", label: "Sinh viên", required: "all", multiple: 'true', type: "combobox", data: "students", default: ""},
        ];

        const show = {
            primaryKey: 'user_id',
            showImage: true,
            title: 'full_name',
            description: 'class_name',
            info: [
                { label: 'Sinh viên', name: 'full_name' },
                { label: 'Lớp', name: 'class_name' },
                { label: 'Tên chuyên ngành', name: 'major_name' },
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