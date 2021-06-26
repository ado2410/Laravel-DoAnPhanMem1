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
                title: "Quản lý học kì",
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số học kì : {info.term_number}</Typography>
                    </React.Fragment>,
                primaryKey: "id",
                model: "terms",
                childModel: "class_subject_terms",
                type: "list",
                hide: ['show', 'import'],
            },
            filters: [
                {name: 'filter_class_id', label: 'Lớp', type: 'choicebox', data: 'filter_classes'},
                {name: 'filter_opening_id', label: 'Trạng thái', type: 'checkbox', data: 'filter_opening'},
            ],
            list: {
                title: 'class_name',
                description: row =>
                    <React.Fragment>
                        <Typography variant="body2">Học kì: { row.starting_year + ' ' + row.end_year }</Typography>
                        <Typography variant="body2">Tổng số học phần: { row.class_subject_number }</Typography>
                        <Typography variant="body2">Thời gian đăng ký tín chỉ: { row.registration_start + ' - ' + row.registration_end }</Typography>
                        {!row.open_registration ?
                            <div style={{color: '#ff0000'}}>
                                Đã đóng đăng ký
                            </div>
                        : (Date.now() > Date.parse(row.registration_start) && Date.now() < Date.parse(row.registration_end)) ?
                            <div style={{color: '#11bf1a'}}>Còn mở đăng ký</div>
                        : Date.now() < Date.parse(row.registration_start) ?
                            <div style={{color: '#2279e3'}}>Chưa tới thời gian đăng ký</div>
                        : <div style={{color: '#ffbb00'}}>Đã hết hạn đăng ký</div>
                        }
                    </React.Fragment>,
            }
        };

        const input = [
            { name: "class_id", label: "Lớp", required: 'create', disabled: 'edit', type: "combobox", data: "classes", default: ""},
            { name: "starting_year", label: "Năm bắt đầu", type: "number", required: 'create', disabled: 'edit', default: ""},
            { name: "end_year", label: "Năm kết thúc", type: "number", required: 'create', disabled: 'edit', default: "" },
            { name: "open_registration", label: "Mở đăng ký tín chỉ", required: "all", type: "combobox", data: "open_registration", default: ""},
            { name: "registration_start", label: "Ngày bắt đầu đăng ký", type: "datetime-local",  default: ""},
            { name: "registration_end", label: "Hạn đăng ký", type: "datetime-local",  default: ""},
        ];

        const show = {
            primaryKey: 'id',
            showImage: true,
            title: 'name',
            description: 'id',
            info: [
                {label: 'Tên học phần', name: 'name'},
                {label: 'Học kì', name: 'year'},
                { label: "Trạng thái", display: row => 
                    (Date.now() > Date.parse(row.registration_start) && Date.now() < Date.parse(row.registration_end)) ?
                        <div style={ {color: '#11bf1a'} }>Còn mở</div>
                    :   <div style={ {color: '#ff0000'} }>Đã đóng</div>},
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