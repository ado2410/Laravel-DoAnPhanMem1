import { Typography } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';

export default class Term extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const index = {
            config: {
                title: "Đăng ký tín chỉ",
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số học kì : {info.term_number}</Typography>
                    </React.Fragment>,
                primaryKey: "id",
                model: "terms",
                childModel: "class_subject_terms",
                type: "list",
                show: ['pagination', 'search'],
            },
            list: {
                title: 'year',
                description: row =>
                    <React.Fragment>
                        <Typography variant="body2">Tổng số học phần: { row.class_subject_number }</Typography>
                        <Typography variant="body2">Thời gian đăng ký tín chỉ: { row.registration_start + ' - ' + row.registration_end }</Typography>
                    </React.Fragment>,
            }
        };

        return (
            <IndexGeneral index={index} />
        );
    }
}