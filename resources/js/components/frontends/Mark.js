import React from 'react';
import IndexGeneral from '../general/IndexGeneral';
import TableGeneral from '../general/TableGeneral';

export default class Mark extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const termColumns = [
            {name: "year", label: "Học kì" },
            {name: 'mark', label: 'Thang điểm 10' },
            {label: 'Thang điểm 4', display: row => row.mark * 4 / 10},
            {label: 'Điểm chữ', display: row => row.mark >= 8.5 ? 'A' : row.mark >= 7 ? 'B' : row.mark >= 5.5 ? 'C' : row.mark >= 4 ? 'D' : 'F'},
        ];
        
        const index = {
            config: {
                title: 'Điểm',
                primaryKey: 'class_subject_student_id',
                model: 'marks',
                description: info => 
                    <React.Fragment>
                        <TableGeneral columns={termColumns} dataSource={info.marks} checked={false}/>
                    </React.Fragment>,
                childModel: 'class_subject_students',
                show: ['pagination', 'search', 'filter'],
            },
            filters: [
                {name: 'filter_term_id', label: 'Học kì', type: 'checkbox', data: 'filter_terms'},
            ],
            columns: [
                { name: "subject_code", label: "Mã học phần" },
                { name: "subject_name", label: "Tên học phần" },
                { name: "credit_number", label: "Số tín chỉ" },
                { name: "term_name", label: "Tên học kì" },
                { name: "year", label: "Năm học" },
                { name: "diligent_point", label: "Điểm chuyên cần" },
                { name: "midterm_point", label: "Điểm giữa kìa" },
                { name: "final_point", label: "Điểm cuối kì" },
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
                { name: "updated_at", label: "Ngày cập nhật" },
            ],
        };

        return (
            <IndexGeneral index={index} />
        );
    }
}