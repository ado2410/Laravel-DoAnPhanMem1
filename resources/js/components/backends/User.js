import React from 'react';
import { Chip, Typography } from '@material-ui/core';
import IndexGeneral from '../general/IndexGeneral';
import AccountGeneral from '../general/AccountGeneral';
import { Context } from '../Global';

/*
    Ghi chú: //<Thông tin> - <kiểu dữ liệu> - <giá trị mặc định>
    const index = {
        config: { //Thông số cài đặt - dictionary
            title: Tiêu đề - string
            description: Giới thiệu - string
            type: , //Loại hiển thị - list: list(danh sách), table(bảng), null(kiểu bảng) - table
            primaryKey: , //Khóa chính - string
            model: , //Model - string
            childModel: , //Model con xuất hiện khi click chuột vào một item trong danh sách, áp dụng khi type là kiểu list - string
            hide: , //Ẩn công cụ gì? - ArrayList:["create", "edit", "show", "delete"] - null
        },
        columns: [ //Danh sách các trường dữ liệu xuất hiện trong kiểu table - array
            {
                name: , //Tên thuộc tính - string
                label: , //Hiển thị thuộc tính - string
                display: (<tên hàng>) => { <chỉnh sửa...> } , //Format hiển thị cho rows.
            },
            {...},
            {...},
        ],
        list: { //Kiểu hiển thị dữ liệu list
            title: , //Tiêu đề list
            description: , //Thông tin phụ
        }
    };

    edit: [ //
            {
                name: , //Tên thuộc tính - string
                label: , //Hiển thị - string
                type: , //Kiểu input (html input) - string
                required: , //Yêu cầu bắt buộc phải nhập - list: all(tất cả), create(khi tạo mới), edit(khi chỉnh sửa), null(Không có) - null
                disabled: , //Disable khi nào - list: all(tất cả), create(khi tạo mới), edit(khi chỉnh sửa), null(Không có) - default: null
                default: , // Giá trị mặc định - object - default: null
                select: , //Kiểu lựa chọn - boolean - default: false
                data: , //Dữ liệu cho kiểu lựa chọn - array {id: <id lựa chọn> , name: <Tên hiển thị>}
            },
            {...},
            {...},
        ];

    show: {
        primaryKey: , //Khóa chính - string
        showImage: , //Hiển thị hình ảnh - boolean - default: false,
        title: Tiêu đề - string
        description: Giới thiệu - string
        details: {
            {
                name: , //Tên thuộc tính - string
                label: , //Hiển thị thuộc tính - string
                display: (<biến dữ liệu>) => { <chỉnh sửa...> } , //Format hiển thị.
            },
            {...},
            {...},
        }
    };
*/

class User extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: 0,
        }
    }

    render() {
        const index = {
            config: {
                title: 'Quản lý tài khoản',
                description: info => 
                    <React.Fragment>
                        <Typography variant="body1">Tổng số tài khoản: {info.user_number}</Typography>
                        <Typography variant="body1">Số lượng tài khoản admin: {info.admin_number}</Typography>
                        <Typography variant="body1">Số lượng tài khoản giảng viên: {info.teacher_number}</Typography>
                        <Typography variant="body1">Số lượng tài khoản sinh viên: {info.student_number}</Typography>
                    </React.Fragment>,
                primaryKey: 'user_id',
                model: 'users',
            },
            filters: [
                {name: 'filter_role_id', label: 'Tài khoản', type: 'checkbox', data: 'filter_roles'},
            ],
            columns: [
                { name: "user_name", label: "Tên người dùng" },
                { name: "role_id", label: "Vai trò", display: row => <Chip label={ row.role_name } color={ row.role_id == 1 ? "secondary" : "primary" } />},
                { name: "email", label: "Email" },
                { name: "first_name", label: "Họ" },
                { name: "last_name", label: "Tên" },
            ]
        };

        const input = [
            { name: "name", label: "Tên tài khoản", required: "create", disabled: "edit",  default: ""},
            { name: "password", label: "Mật khâu", type: "password", required: "create", default: "" },
            { name: "confirm_password", label: "Xác nhận mật khẩu", type: "password", required: "create" },
            { name: "email", label: "Email", type: "email", required: "all", default: "" },
            { name: "avatar", label: "Ảnh đại diện", type: "file", accept: ".png, .jpg", default: "" },
            { name: "first_name", label: "Họ", required: "all", default: "" },
            { name: "last_name", label: "Tên", required: "all", default: "" },
            { name: "gender", label: "Giới tính", type: "combobox", required: "all", data: "gender" },
            { name: "dob", label: "Ngày sinh", type: "date", required: "all", default: "2000-01-01" },
            { name: "phone", label: "Số điện thoại", type: "number", required: "all", default: "" },
            { name: "city_id", label: "Thành phố", type: "combobox", required: "all", data: "cities" },
            { name: "address", label: "Địa chỉ", required: "all", default: "" },
            { name: "role_id", label: "Vai trò", type: "combobox", required: "create", disabled: "edit", data: "roles" },
            { name: "class_id", label: "Lớp", type: "combobox", data: "classes" },
        ];

        const show = {
            primaryKey: 'user_id',
            showImage: true,
            title: 'full_name',
            description: 'user_name',
            info: [
                {label: 'Họ tên', name: 'full_name'},
                {label: 'Tên người dùng', name: 'user_name'},
                {label: 'Giới tính', display: data => data.gender === 0 ? "Nam" : "Nữ"},
                {label: 'Ngày sinh', name: 'dob'},
                {label: 'Địa chỉ', display: data => data.address + ", " + data.city_name + ", " + data.country_name},
                {label: 'Vai trò', display: data => <Chip label={ data.role_name } color={ data.role_id == 1 ? "secondary" : "primary" } />},
            ],
            display: (data, image) => <AccountGeneral data={data} image={image} />
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

User.contextType = Context;

export default User;