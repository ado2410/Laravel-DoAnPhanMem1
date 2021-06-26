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
                title: 'Lớp học phần',
                primaryKey: 'id',
                model: 'class_subjects',
                childModel: 'class_subject_students',
                type: 'list',
                show: ['pagination', 'search'],
            },
            list: {
                title: 'title',
                description: row =>
                    <React.Fragment>
                        <Typography variant="body2">Giảng viên: { row.teacher_first_name + ' ' + row.teacher_last_name }</Typography>
                        <Typography variant="body2">Số lượng sinh viên: { row.student_number }</Typography>
                    </React.Fragment>,
            },
        };

        return (
            <IndexGeneral
                index={index}
            />
        );
    }
}