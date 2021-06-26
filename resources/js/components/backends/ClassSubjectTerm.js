import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class ClassSubjectTerm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: "Quản lý đăng ký tín chỉ",
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số lớp học phần : {info.class_subject_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: "class_subject_terms",
                hide: ['show', 'edit', 'import'],
            },
            columns: [
                { name: "code", label: "Mã học phần" },
                { name: "subject_name", label: "Tên học phần" },
                { name: "credit_number", label: "Số tín chỉ" },
                { name: "teacher_full_name", label: "Giảng viên" },
            ]
        };

        const input = [
            { name: "class_subject_id", label: "Lớp học phần", type: "combobox", multiple: 'true', data: "class_subjects", required: "create", disabled: "edit" },
        ];

        return (
            <IndexGeneral
                index={index}
                input={input}
            />
        );
    }
}