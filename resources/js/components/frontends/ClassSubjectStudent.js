import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export class Student extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Lớp học phần',
                primaryKey: 'id',
                model: 'class_subject_students',
                type: 'custom',
                show: [],
            },
            custom: dataSource =>
            <>
                <Typography gutterBottom variant="body2">Họ tên: {dataSource.first_name + " " + dataSource.last_name}</Typography>
                <Typography gutterBottom variant="body2">Điểm chuyên cần: {dataSource.diligent_point}</Typography>
                <Typography gutterBottom variant="body2">Điểm giữa kì: {dataSource.midterm_point}</Typography>
                <Typography gutterBottom variant="body2">Điểm cuối kì: {dataSource.final_point}</Typography>
            </>,
        };

        return (
            <IndexGeneral index={index} />
        );
    }
}

export class Teacher extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: 'Lớp học phần',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số sinh viên : {info.student_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'id',
                model: 'class_subject_students',
                show: ['show', 'edit', 'pagination', 'refresh'],
            },
            columns: [
                { name: "name", label: "Mã sinh viên" },
                { name: "first_name", label: "Họ" },
                { name: "last_name", label: "Tên"},
                { name: "diligent_point", label: "Điểm chuyên cần"},
                { name: "midterm_point", label: "Điểm giữa kì"},
                { name: "final_point", label: "Điểm cuối kì"},
                { label: "Điểm tổng", display: row => <>{(row.diligent_point * 10 + row.midterm_point * 30 + row.final_point * 60)/100}</>},
            ]
        };

        const input = [
            { name: "student_id", label: "Sinh viên", required: "create", disabled: "edit", type: "combobox", data: "students", default: ""},
            { name: "diligent_point", label: "Điểm chuyên cần", type: "number" },
            { name: "midterm_point", label: "Điểm giữa kì", type: "number" },
            { name: "final_point", label: "Điểm cuối kì", type: "number" },
        ];

        const show = {
            primaryKey: 'id',
            showImage: true,
            title: 'class_subject_name',
            description: 'teacher_full_name',
            info: [
                {label: "Tên lớp học phần", name: "class_subject_name" },
                {label: "Học phần", name: "subject_name" },
                {label: "Học kì", name: "term_name" },
                {label: 'Giảng viên', name: 'teacher_full_name'},
                {label: 'Số lượng sinh viên', name: 'student_number'},
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