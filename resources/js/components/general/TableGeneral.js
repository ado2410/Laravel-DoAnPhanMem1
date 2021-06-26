import { Checkbox, IconButton, List, ListItem, ListItemAvatar, ListItemText, Menu, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, withStyles } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import React from "react";

const useStyles = (theme) => ({
    tableContainer: {
        
    },
    table: {
        minWidth: 'max-content',
    }
});

class TableGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedList: [],
            loaded: false,
            anchorEl: null,
            itemIndex: 0,
            openMenu: false,
        };
    }

    componentDidUpdate(prevProps, prevStates) {
        //Cập nhật dataSource và defaultChecked
        if (JSON.stringify(prevProps.dataSource) !== JSON.stringify(this.props.dataSource) || JSON.stringify(prevProps.checkedValues) !== JSON.stringify(this.props.checkedValues)) {
            this.setState({ loaded: false }, () => {
                const dataSource = this.props.dataSource;
                let checkedList = [];
                //Nếu có checked
                if (this.props.checked) {
                    const checkedValues = this.props.checkedValues;
                    if (dataSource) {
                        dataSource.map(row => {
                                checkedList.push(checkedValues.values.includes(row[checkedValues.key]));
                        });
                    }    
                }
                this.setState({ dataSource: dataSource, checkedList: checkedList, loaded: true }, () => {
                    if (this.state.checkedList && this.props.checked)
                        this.onItemCheck(0, this.state.checkedList[0]);
                });
            });
        }
    }

    //Click vào nút item action
    onMoreClick(event, index) {
        this.setState({itemIndex: index, anchorEl: event.currentTarget, openMenu: true});
    }

    //Đóng menu item
    onMenuClose() {
        this.setState({anchorEl: null, openMenu: false});
    }

    //Nút action được nhấn
    onItemAction(id, row) {
        this.props.onItemAction(id, row);
        this.onMenuClose();
    }

    //Item được check
    onItemCheck(index, checked) {
        const _new = this.state.checkedList.slice();
        _new[index] = checked;
        this.setState({ checkedList: _new }, () => {
            const primaryKey = this.props.checkedValues.key;
            const checkedItems = [];
            this.state.checkedList.map((item, index2) => {
                if (item) {
                    checkedItems.push(this.state.dataSource[index2]);
                }
            });
            this.props.onItemCheck(primaryKey, checkedItems);
        });
    }

    render() {
        const { classes, columns, dataSource, actions, checked } = this.props;
        const { checkedList, loaded, anchorEl, openMenu, itemIndex } = this.state;
        
        return(
            <TableContainer className={classes.tableContainer} component={Paper}>
                <Table className={classes.table} stickyHeader>
                    <TableHead>
                        <TableRow key="row">
                            {checked ?
                                <TableCell key="checkbox"></TableCell>
                            : ''}
                            {columns.map((column) => (
                                <TableCell key={column.name}>{column.label}</TableCell>
                            ))}
                            {actions ?
                                <TableCell key="action">Hành động</TableCell>
                            : ''}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loaded ?
                            dataSource.map((row, index) => (
                                <TableRow key={'row' + index}>
                                    {/*Checkbox*/}
                                    {checked ?
                                        <TableCell key={'checkbox' + index}>
                                            <Checkbox
                                                defaultChecked={checkedList[index]}
                                                onChange={(e) => this.onItemCheck(index, e.target.checked)}
                                            />
                                        </TableCell>
                                    : ''}
                                    {columns.map((column) => (
                                        <TableCell key={column.name + index}>
                                            {column.display ?
                                                column.display(row)
                                            :
                                                row[column.name]}
                                        </TableCell>
                                    ))}
                                    {/*Nút actions*/}
                                    {actions ?
                                        <TableCell>
                                            <IconButton onClick={(event) => this.onMoreClick(event, index)}><MoreVert /></IconButton>
                                        </TableCell>
                                    : ''}
                                </TableRow>
                            ))
                        : 'Dữ liệu bảng trống'}
                    </TableBody>
                </Table>
                {/*Khi người dùng mở menu*/}
                <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={() => this.onMenuClose()}
                    getContentAnchorEl={null}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <List>
                        {actions ?
                            actions.map((action) => (
                                action.visible ?
                                    <ListItem button onClick={() => this.onItemAction(action.id, dataSource[itemIndex])}>
                                        <ListItemAvatar>
                                            {action.icon}
                                        </ListItemAvatar>
                                        <ListItemText>{action.title}</ListItemText>
                                    </ListItem>
                                : ''
                            ))
                        : ''}
                    </List>
                </Menu>
            </TableContainer>
        );
    }
}

TableGeneral.defaultProps = {
    columns: [], //Cột hiển thị
    dataSource: [], //Nguồn dữ liệu
    actions: null, //Các button hành động
    checked: true, //Có hiển thị checkbox không
    checkedValues: {key: 'id', values: []}, //Giá trị checkbox
    onItemAction: () => {}, //Sự kiện hành động của item được check
    onItemCheck: () => {}, //Sự kiện item được check
}

export default (withStyles)(useStyles)(TableGeneral);