import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class ClassSubjectStudent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý sinh viên lớp học phần',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số sinh viên trong lớp học phần : {info.student_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'class_subject_students',
                hide: ['show', 'import'],
            },
            columns: [
                { name: "name", label: "Mã sinh viên" },
                { name: "first_name", label: "Họ" },
                { name: "last_name", label: "Tên"},
                { name: "diligent_point", label: "Điểm chuyên cần"},
                { name: "midterm_point", label: "Điểm giữa kì"},
                { name: "final_point", label: "Điểm cuối kì"},
                { label: "Thang điểm 10", display: row => {
                    const mark = (row.diligent_point * 10 + row.midterm_point * 30 + row.final_point * 60)/100;
                    return mark ? mark : '';
               }},
                { label: "Thang điểm 4", display: row => {
                    const mark = 4*((row.diligent_point * 10 + row.midterm_point * 30 + row.final_point * 60)/100)/10;
                    return mark ? mark : '';
               }},
                { label: "Điểm chữ", display: row => {
                    const mark = (row.diligent_point * 10 + row.midterm_point * 30 + row.final_point * 60)/100;
                    return !mark ? '' : mark >= 8.5 ? 'A' : mark >= 7 ? 'B' : mark >= 5.5 ? 'C' : mark >= 4 ? 'D' : 'F';
               }},
            ],
        };

        const input = [
            { name: "student_id", label: "Sinh viên", required: "create", disabled: "edit", multiple: 'true', type: "combobox", data: "students", default: ""},
            { name: "diligent_point", label: "Điểm chuyên cần", type: "number", disabled: "create" },
            { name: "midterm_point", label: "Điểm giữa kì", type: "number", disabled: "create" },
            { name: "final_point", label: "Điểm cuối kì", type: "number", disabled: "create" },
        ];

        return (
            <IndexGeneral
                index={index}
                input={input}
            />
        );
    }
}