import { Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Menu, Paper, Tooltip } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import React from "react";

export default class ListGeneral extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
            itemIndex: 0,
            openMenu: false,
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
    onItemAction(action_id, row) {
        this.onMenuClose();
        this.props.onItemAction(action_id, row);
    }

    //Item được click
    onItemClick(row) {
        this.props.onItemClick(row);
    }

    render() {
        const { list, dataSource, actions } = this.props;
        const { anchorEl, openMenu, itemIndex } = this.state;
        return(
            <List component={Paper}>
                {dataSource ?
                    dataSource.map((row, index) => (
                        <>
                        <ListItem key={row[list.title]} button onClick={() => this.onItemClick(row)}>
                            {/*Avatar*/}
                            <ListItemAvatar>
                                <Avatar src="" />
                            </ListItemAvatar>
                            {/*Tiêu đề*/}
                            <ListItemText primary={row[list.title]} secondary={list.description(row)}/>
                            {/*Button hành động*/}
                            {actions ?
                                <ListItemSecondaryAction>
                                    <IconButton onClick={(event) => this.onMoreClick(event, index)}><MoreVert /></IconButton>
                                </ListItemSecondaryAction>
                            : ''}
                        </ListItem>
                        {index < dataSource.length-1 ?
                            <Divider />
                        : ''}
                        </>
                    ))
                : 'Dữ liệu bảng trống!'}
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
            </List>
        );
    }
}

ListGeneral.defaultProps = {
    list: [], //List
    dataSource: [], //nguồn dữ liệu
    actions: [], //Nút hành động
    onItemAction: () => {}, //Nút action của item được chọn
    onItemClick: () => {}, //Sự kiện item được chọn
}