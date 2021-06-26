import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class Class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý lớp sinh hoạt',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số lớp : {info.class_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'classes',
                childModel: 'class_students',
                type: 'list',
                hide: ['import', 'show', 'edit'],
            },
            filters: [
                {name: 'filter_grade_id', label: 'Khóa', type: 'choicebox', data: 'filter_grades'},
                {name: 'filter_major_id', label: 'Ngành', type: 'choicebox', data: 'filter_majors'},
                {name: 'filter_faculty_id', label: 'Khoa', type: 'checkbox', data: 'filter_faculties'},
            ],
            list: {
                title: 'class_name',
                description: row =>
                    <React.Fragment>
                        <Typography variant="body2">Số lượng sinh viên: { row.student_number }</Typography>
                        <Typography variant="body2">Chuyên ngành: {row.major_name}</Typography>
                    </React.Fragment>,
            },
        };

        const input = [
            { name: "major_id", label: "Chuyên ngành", required: "all", type: "combobox", data: "majors", default: ""},
            { name: "grade_id", label: "Khóa", required: "all", type: "combobox", data: "grades", default: ""},
        ];

        return (
            <IndexGeneral
                index={index}
                input={input}
            />
        );
    }
}