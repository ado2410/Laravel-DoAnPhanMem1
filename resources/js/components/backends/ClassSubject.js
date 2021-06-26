import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class ClassSubject extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý lớp học phần',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số lớp học phần : {info.class_subject_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'class_subjects',
                childModel: 'class_subject_students',
                type: 'list',
                hide: ['show', 'import'],
            },
            filters: [
                {name: 'filter_teacher_id', label: 'Giảng viên', type: 'choicebox', data: 'filter_teachers'},
                {name: 'filter_subject_id', label: 'Môn học', type: 'choicebox', data: 'filter_subjects'},
            ],
            list: {
                title: 'title',
                description: row =>
                    <React.Fragment>
                        <Typography variant="body2">Giảng viên: { row.teacher_first_name + ' ' + row.teacher_last_name }</Typography>
                        <Typography variant="body2">Số lượng sinh viên: { row.student_number }</Typography>
                    </React.Fragment>,
            }
        };

        const input = [
            { name: "class_id", label: "Lớp", type: "combobox", disabled: 'edit', required: "create", data: "classes" },
            { name: "teacher_id", label: "Giảng viên", type: "combobox", required: "all", data: "teachers" },
            { name: "subject_id", label: "Môn học", type: "combobox", required: "all", data: "subjects" },
            { name: "max_slot", label: "Số lượng sinh viên tối đa", type: "number", required: "all" },
        ];

        return (
            <IndexGeneral
                index={index}
                input={input}
            />
        );
    }
}