import { Button, CircularProgress, Divider, Fade, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import IndexGeneral from '../general/IndexGeneral';
import TableGeneral from '../general/TableGeneral';
import { Context, getAPI } from '../Global';

const useStyles = (theme) => ({
    submit: {
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    }
});

class ClassSubjectTerm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: [],
            totalCredit: 0,
            selectedSubjects: [],
            loading: true,
        }
    }

    componentDidMount() {
        this.getRegistrationList();
    }

    //Khi người dùng chọn một item
    onItemCheck(key, items) {
        let totalCredit = 0;
        let subjects = [];
        items.map((item) => {
            totalCredit += item.credit_number;
            subjects.push(item.class_subject_id);
        });
        this.setState({ totalCredit: totalCredit, selectedSubjects: subjects });
    }

    //Cập nhật đăng ký
    register() {
        this.setState({loading: true});
        axios.post(getAPI(true) + '/register', {list: this.state.selectedSubjects}).then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            if (status.type === 'success') {
                this.getRegistrationList();
            }
        });
    }

    //Cập nhật danh sách
    getRegistrationList() {
        axios.get(getAPI(true) + '/register').then( res => {
            const values = res.data;
            this.setState({ checkedValues: {key: 'class_subject_id', values: values}, loading: false}, () => this.onItemCheck( 'class_subject_id', this.state.checkedValues.values));
        });
    }

    //In
    print() {
        const win = window.open(getAPI(true) + '/print', "_blank");
        /*axios.get(getAPI(true) + '/print').then( res => {
            const status = res.data;
            console.log(status);
        });*/
    }

    render() {
        const { loading, totalCredit } = this.state;
        const { classes } = this.props;

        const columns = [
            { name: "code", label: "Mã học phần" },
            { name: "subject_name", label: "Tên học phần" },
            { name: "credit_number", label: "Số tín chỉ" },
            { name: "teacher_full_name", label: "Giảng viên" },
        ];
        const index = {
            config: {
                title: "Đăng ký tín chỉ",
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số lớp học phần : {info.class_subject_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'class_subject_term_id',
                model: "class_subject_terms",
                type: "custom",
                show: [],
            },
            custom: dataSource =>
                <>
                    <Typography>Số lượng tín chỉ đăng ký: {totalCredit ? totalCredit : 0}</Typography>
                    <Divider />
                    {loading ?
                        <CircularProgress />
                    : ''}
                    <Fade in={!loading}>
                        <div>
                            <TableGeneral checked checkedValues={this.state.checkedValues} columns={ columns } dataSource={ dataSource } onItemCheck={(key, items) => this.onItemCheck(key, items)} />
                        </div>
                    </Fade>
                    <div className={classes.submit}>
                        <Button variant="contained" color="primary" onClick={() => this.register()}>Cập nhật lại đăng ký tín chỉ</Button>
                        <Button variant="contained" color="primary" onClick={() => this.print()}>In phiếu</Button>
                    </div>
                </>,
        };

        const input = [
            { name: "class_subject_id", label: "Lớp học phần", type: "combobox", data: "class_subjects", required: "create", disabled: "edit" },
        ];

        const show = {
            primaryKey: 'class_subject_term_id',
            showImage: true,
            title: 'class_subject_name',
            description: 'teacher_full_name',
            info: [
                {label: "Tên học phần", name: "class_subject_name" },
                {label: "Học phần", name: "subject_name" },
                {label: 'Giảng viên', name: 'teacher_full_name'},
                {label: 'Số lượng sinh viên', name: 'student_number'},
            ]
        }

        return (
            <IndexGeneral index={index} input={input} show={show}/>
        );
    }
}

ClassSubjectTerm.contextType = Context;

export default withStyles(useStyles)(ClassSubjectTerm);