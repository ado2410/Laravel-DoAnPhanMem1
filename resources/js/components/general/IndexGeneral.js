import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Fade, FormControlLabel, Hidden, InputAdornment, Menu, MenuItem, Paper, TableContainer, TextField, Typography, withStyles } from '@material-ui/core';
import { Alert, Autocomplete, Pagination } from '@material-ui/lab';
import { Add, Delete, Edit, ExpandMore, Person, PlaylistAdd, Refresh, Search, TouchApp } from '@material-ui/icons';
import ShowGeneral from './ShowGeneral';
import InputGeneral from './InputGeneral'
import { Context, getAPI, getAPIParams } from '../Global';
import TableGeneral from './TableGeneral';
import ListGeneral from './ListGeneral';
import { withRouter } from 'react-router-dom';

const useStyles = (theme) => ({
    root: {
        padding: 10,
    },
    pagination: {
        marginTop: theme.spacing(2),
    },
    form: {
        minWidth: 300,
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    center: {
        canDisplay: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    actionButton: {
        '& > *': {
            marginRight: theme.spacing(1),
        },
    }
});

class IndexGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            description: [],
            dialog: 0,
            keyword: null,
            currentPage: 1,
            pageNumber: 0,
            checkedValues: [],
            deleteRelation: 0,
            fileUploading: false,
            loading: true,
            anchorEl: null,
        }
    }

    componentDidMount() {
        this.setState({
            currentPage: (getAPIParams('page') ? parseInt(getAPIParams('page')): 1),
            keyword: (getAPIParams('keyword') ? getAPIParams('keyword') : '')
        });
        this.view();
    }
    
    //Hiển thị và cập nhật lại view
    view() {
        this.setState({loading: true});
        axios.get(getAPI()).then( res => {
            const dataSource = res.data.dataSource.data;
            const description = res.data.description;
            const pageNumber = Math.ceil(res.data.dataSource.total/res.data.dataSource.per_page);
            this.setState({dataSource: dataSource, pageNumber: pageNumber, description: description}, () => {
                this.setState({loading: false});
                if (this.state.currentPage > this.state.pageNumber && this.state.pageNumber > 0)
                    this.setState({currentPage: this.state.pageNumber}, () => this.onAddressChange())
                else if (this.state.currentPage < 1 && this.state.pageNumber > 0)
                    this.setState({currentPage: 1}, () => this.onAddressChange())
            });
        });
    }

    //Nút action của một item được nhấp chuột
    onItemAction(action_id, row) {
        if (action_id == 0)
            this.show(row[this.props.index.config.primaryKey]);
        else if (action_id == 1)
            this.edit(row[this.props.index.config.primaryKey]);
        else if (action_id == 2)
            this.destroy(row[this.props.index.config.primaryKey]);
    }

    //Một item được click
    onItemClick(row) {
        this.props.history.push(this.props.index.config.model + '/' + row[this.props.index.config.primaryKey] + '/' + this.props.index.config.childModel);
    }

    //Mở khung
    openDialog(id) {
        this.setState({ dialog: id });
    }

    //Đóng khung
    closeDialog() {
        this.setState({dialog: 0});
    }
    
    //Mở khung thông tin
    show(id) {
        this.setState({ id: id });
        this.openDialog(1);
    }

    //Mở khung tạo
    create() {
        this.openDialog(2);
    }

    //Mở khung chỉnh sửa
    edit(id) {
        this.setState({ id: id });
        this.openDialog(3);
    }

    //Mở khung xóa
    destroy(id) {
        this.setState({ id: id, deleteRelation: 0 });
        this.openDialog(4);
    }

    //Mở khung xóa các lựa chọn
    destroySelected() {
        this.openDialog(5);
    }

    //Mở khung import
    import() {
        this.openDialog(6);
    }

    //Xác nhận tạo
    createSubmit() {
        this.view();
        this.closeDialog();
    }

    //Xác nhận chỉnh sửa
    editSubmit() {
        this.view();
        this.closeDialog();
    }

    //Xác nhận xóa
    destroySubmit(id = null) {
        let ids = id ? [id] : this.state.checkedValues;
        const data = {
            ids: ids,
            deleteRelation: this.state.deleteRelation,
        }
        axios.delete(getAPI(true) + '/' + '0', {data: data}).then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            if (status.type === 'success') {
                this.view();
                this.closeDialog();
            }
            else {
                this.setState({deleteRelation: 1});
            }
        });
    }

    //Thay đổi bộ lọc
    onFiltersChange(filterName, ids) {
        console.log(ids);
        this.onAddressChange([{name: filterName, value: JSON.stringify(ids)}]);
    }

    onFilterChange(filterName, id, checked) {
        if (id === null)
            return;
        let filter = getAPIParams(filterName);
        let filterArray = filter === null ? [] : JSON.parse(filter);
        if (checked) {
            if (!filterArray.includes(id))
                filterArray.push(id);
        }
        else {
            const index = filterArray.findIndex((element) => element == id);
            console.log(index);
            if (index != -1)
                filterArray.splice(index, 1);
        }

        filter = JSON.stringify(filterArray);
        this.onAddressChange([{name: filterName, value: filter}]);
    }

    //Khi người dùng nhập tìm kiếm
    onSearchingInputChange(event) {
        if (event.key === 'Enter' && event.target.value !== '') {
            this.setState({keyword: event.target.value, currentPage: 1}, () => this.onAddressChange());
        }
    }

    //Khi người dùng tìm kiếm
    onSearchingChange(event) {
        if (event.target.value === '') {
            this.setState({keyword: event.target.value, currentPage: 1}, () => this.onAddressChange());
        }
    }

    //Có sự thay dổi địa chỉ (về parameters)
    onAddressChange(addParams=[]) {
        let params = [
            {name: 'page', value: this.state.currentPage},
            {name: 'keyword', value: this.state.keyword}
        ];
        params = params.concat(addParams);
        console.log(params);
        let url = getAPI(false, params).split('?')[1];
        this.props.history.replace('?' + url);
        this.view();
    }

    //Khi chuyển trang
    onPageChange(e, page) {
        this.setState({currentPage: page}, () => this.onAddressChange());
    }

    //File import tải lên có sự thay đổi
    onImportChange(e) {
        let reader = new FileReader();
        reader.onload = (e) => {
            this.setState({import: e.target.result, fileUploading: false});
        }
        reader.readAsText(e.target.files[0]);
        this.setState({fileUploading: true});
    }

    //Xác nhận upload file import
    onImportSubmit(e) {
        e.preventDefault();
        if (this.state.import && !this.state.fileUploading) {
            const data = {
                import: this.state.import
            };
            axios.post(getAPI(true) + "/import", data).then( res => {
                const status = res.data;
                this.context.setState({notification: status});
                if (status.type === 'success') {
                    this.view();
                    this.closeDialog();
                }
            });
        }
    }

    //Khi item được check
    onItemCheck(key, items) {
        let checkedValues = [];
        items.map(item => checkedValues.push(item[key]));
        console.log(checkedValues)
        this.setState({checkedValues: checkedValues});
    }

    //Kiểm tra xem element có được phép hiển thị không
    canDisplay(element) {
        const index = this.props.index;
        return (!index.config.show || index.config.show.includes(element)) && (!index.config.hide || !index.config.hide.includes(element));
    }

    //Nút hành dộng được nhấn
    onActionClick(event) {
        this.setState({anchorEl: event.currentTarget});
    }

    //Tắt menu hành dộng
    onActionClose() {
        this.setState({anchorEl: null});
    }

    render() {
        const { classes, index, input, show } = this.props;
        const { dataSource, description, dialog, id, pageNumber, status, keyword, loading, anchorEl } = this.state;
        const actions = [
            {id: 0, title: 'Xem', icon: <Person />, visible: this.canDisplay("show")},
            {id: 1, title: 'Chỉnh sửa', icon: <Edit />, visible: this.canDisplay("edit")},
            {id: 2, title: 'Xóa', icon: <Delete />, visible: this.canDisplay("delete")},
        ];

        return (
            <div className={classes.root}>
                {/*Tiêu đề*/}
                <Typography
                    gutterBottom
                    variant="h3"
                >
                    { index.config.title }
                </Typography>
                <Divider />
                <Typography
                    gutterBottom
                    variant="body2"
                >
                    {index.config.description ?
                        index.config.description(description) : ''}
                </Typography>
                {/*Nút hành động*/}
                <Hidden mdUp implementation="css">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(event) => this.onActionClick(event)}
                        startIcon={<TouchApp />}
                    >
                        Hành động
                    </Button>
                </Hidden>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={() => this.onActionClose()}
                >
                    <MenuItem
                        onClick={() => {
                            this.onAddressChange();
                            this.onActionClose();
                        }}
                    >
                        Refresh
                    </MenuItem>
                    {this.canDisplay('create') ?
                        <MenuItem
                            onClick={(event) => {
                                this.create(event);
                                this.onActionClose();
                            }}
                        >
                            Tạo mới
                        </MenuItem>
                    : ''}
                    {this.canDisplay('import') ?
                        <MenuItem
                            onClick={(event) => {
                                this.import(event);
                                this.onActionClose();
                            }}
                        >
                            Nhập từ file
                        </MenuItem>
                    : ''}
                    {this.canDisplay('delete') ?
                        <MenuItem
                            onClick={(event) => {
                                this.destroySelected(event);
                                this.onActionClose();
                            }}
                        >
                            Xóa lựa chọn
                        </MenuItem>
                    : ''}
                </Menu>
                <Hidden smDown implementation="css">
                    <Typography
                        gutterBottom
                        variant="h6"
                    >
                        Hành động
                    </Typography>
                    <div className={classes.actionButton}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.onAddressChange()}
                            startIcon={<Refresh />}
                        >
                            Refresh
                        </Button>
                        {this.canDisplay('create') ?
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={(event) => this.create(event)}
                                startIcon={<Add />}
                            >
                                Tạo mới
                            </Button>
                        : ''}
                        {this.canDisplay('import') ?
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={(event) => this.import(event)}
                                startIcon={<PlaylistAdd />}
                            >
                                Nhập từ file
                            </Button>
                        : ''}
                        {this.canDisplay('delete') ?
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={(event) => this.destroySelected(event)}
                                startIcon={<Delete />}
                            >
                                Xóa lựa chọn
                            </Button>
                        : ''}
                    </div>
                </Hidden>
                {/*Tìm kiếm*/}
                {this.canDisplay("search") ?
                        keyword !== null ?
                            <div>
                                <TextField
                                    type="search"
                                    label="Tìm kiếm"
                                    defaultValue={ keyword }
                                    variant="outlined"
                                    margin="normal"
                                    onKeyPress={ (event) => this.onSearchingInputChange(event) }
                                    onChange={ (event) => this.onSearchingChange(event) }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        )}}
                                />
                            </div>
                        : ''
                    : ''}
                {/*Bộ lọc*/}
                {(this.canDisplay("filter") && index.filters) ? 
                <>
                    <Divider />
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                        >
                            <Typography>Bộ lọc</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div style={{width: '100%'}}>
                                {index.filters.map(filter => {
                                    const filterData = JSON.parse(getAPIParams(filter.name));
                                    return description[filter.data] ?
                                        <>
                                            <Typography>{filter.label}</Typography>
                                            {filter.type === 'checkbox' ?
                                                description[filter.data].map(item => (
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                defaultChecked={
                                                                    filterData ? 
                                                                    filterData.includes(item.id)
                                                                    : false
                                                                }
                                                                onChange={(event) => this.onFilterChange(filter.name, item.id, event.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={item.name}
                                                    />
                                                ))
                                            : filter.type === 'choicebox' ?
                                                <Autocomplete
                                                    multiple
                                                    fullWidth={true}
                                                    options={description[filter.data]}
                                                    defaultValue={filterData ? description[filter.data].filter(item => filterData.includes(item.id)) : []}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(event, values) => {
                                                        let ids = [];
                                                        values.map(value => ids.push(value.id));
                                                        this.onFiltersChange(filter.name, ids);
                                                    }}
                                                    renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="standard"
                                                        placeholder="Chọn..."
                                                    />
                                                    )}
                                                />
                                            : ''}
                                        </>
                                    : ''
                                })}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </>
                : ''}
                {/*View chính*/}
                {loading ?
                    <CircularProgress />
                : ''}
                <Fade in={!loading}>
                    <div style={{marginTop: 10, marginBottom: 10}}>
                        {index.config.type === 'list' ?
                            <ListGeneral
                                list={index.list}
                                dataSource={dataSource}
                                actions={(this.canDisplay('show') || this.canDisplay('create') || this.canDisplay('edit')) ? actions : null }
                                onItemClick={(row) => this.onItemClick(row)}
                                onItemAction={(action_id, row) => this.onItemAction(action_id, row)}
                            />
                        : index.config.type === 'custom' ?
                            <>
                                {index.custom(dataSource, description, (params) => this.onAddressChange(params))}
                            </>
                        :
                            <TableGeneral
                                checkedValues={{key: index.config.primaryKey, values: []}}
                                columns={index.columns}
                                dataSource={dataSource}
                                actions={(this.canDisplay('show') || this.canDisplay('create') || this.canDisplay('edit')) ? actions : null}
                                onItemAction={(action_id, row) => this.onItemAction(action_id, row)}
                                onItemCheck={(key, items) => this.onItemCheck(key, items)}
                            />
                        }
                    </div>
                </Fade>
                {/*Chọn trang*/}
                {this.canDisplay("pagination") ?
                    <Pagination
                        className={classes.pagination}
                        page={this.state.currentPage}
                        count={pageNumber}
                        color="primary"
                        onChange={(event, page) => this.onPageChange(event, page)}
                    />
                : ''}
                {/*Dialog*/}
                <Dialog
                    open={dialog != 0 }
                    onClose={() => this.closeDialog() }
                >
                    <DialogTitle>
                        {dialog === 1 ?
                            'Thông tin'
                        : dialog === 2 ?
                            'Thêm mới'
                        : dialog === 3 ?
                            'Chỉnh sửa'
                        : dialog === 4 ?
                            'Xóa'
                        : dialog === 5 ?
                            'Xóa lựa chọn'
                        : dialog === 6 ?
                            'Nhập từ file'
                        : 'Chưa đặt tên'
                        }
                    </DialogTitle>
                    <DialogContent>
                        {(dialog === 1  && show) ?
                            <ShowGeneral
                                showId={id}
                                onEditClick={() => this.edit(id)}
                                model={index.config.model}
                                show={show}
                            />
                        : (dialog === 2 && input) ?
                            <InputGeneral
                                onSubmit={() => this.createSubmit()}
                                input={input}
                                model={index.config.model}
                            />
                        : (dialog === 3  && input) ?
                            <InputGeneral
                                onSubmit={() => this.editSubmit()}
                                inputId={id }
                                input={input}
                                model={index.config.model}
                            />
                        : dialog === 4 ?
                            <div className={classes.center}>
                                <Typography variant="body1">Bạn có muốn xóa?</Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Delete />}
                                    onClick={ () => this.destroySubmit(id) }
                                >
                                    Xóa
                                </Button>
                            </div>
                        : dialog === 5 ?
                            <div className={classes.center}>
                                <Typography>Bạn có muốn xóa các lựa chọn?</Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Delete />}
                                    onClick={ () => this.destroySubmit() }
                                >
                                    Xóa
                                </Button>
                            </div>
                        : dialog === 6 ?
                            <form className={classes.form} onSubmit={(event) => this.onImportSubmit(event)}>
                                <TextField
                                    fullWidth
                                    label="Nhập file"
                                    type="file"
                                    required={true}
                                    onChange={(e) => this.onImportChange(e)}
                                    accept=".csv"
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Thêm vào
                                </Button>
                            </form>
                        : 'Hành động không tồn tại!'}
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(withStyles(useStyles)(IndexGeneral));

IndexGeneral.contextType = Context;