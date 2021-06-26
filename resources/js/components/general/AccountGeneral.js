import React from 'react';
import { CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Paper, Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import { Email, Face, LocationOn, Lock, Today, Wc } from '@material-ui/icons';
import { Context, rootURL } from '../Global';
import { withRouter } from 'react-router';

const useStyles = (theme) => ({
    show: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    showHeader: {
        padding: 10,
        minWidth: 300,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    showAvatar: {
        borderRadius: '50%',
        width: 200,
        height: 200,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    showContent: {
        padding: 10,
    },
    showText: {
        margin: 5,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: 20,
    },
    showTextIcon: {
        marginRight: 10,
    }
});

class AccountGeneral extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: 0,
            loading: false,
        }
    }

    componentDidMount() {
        console.log(this.props.image);
    }

    onTabChange(value) {
        this.setState({tab: value});
    }

    onAvatarClick() {
        document.getElementById('user_avatar').click();
    }

    onAvatarChange(event, id) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let data = {
                avatar: e.target.result,
            }
            axios.post('/api/users/' + id + '/change_avatar', data).then( res => {
                const status = res.data;
                this.context.setState({notification: status});
                this.setState({loading: false});
            });
        }
        reader.readAsDataURL(event.target.files[0]);
        this.setState({loading: true});
    }

    onPasswordClick() {
        const data = {
            email: this.context.state.login.user.name,
        }
        this.setState({loading: true});
        axios.post('/api/send_code', data).then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            if(status.type === 'success') {
                this.setState({loading: false});
                this.props.history.push(rootURL + '/reset_password/' + status.data.email);
            }
        });
    }

    render() {
        const { classes, data, image } = this.props;
        const { tab, loading } = this.state;

        return (
            <div className={classes.show}>
                <Paper className={classes.showHeader} color>
                    <img className={classes.showAvatar} style={{backgroundImage: 'url("' + image + '")'}} />
                    <Typography variant="h6">{data.first_name + ' ' + data.last_name}</Typography>
                    <Typography variant="body2">@{data.user_name}</Typography>
                </Paper>
                <Tabs value={tab} onChange={(event, value) => this.onTabChange(value)}>
                    <Tab label="Thông tin cá nhân" />
                    <Tab label="Thêm" />
                </Tabs>
                <div className={classes.showContent}>
                    {!loading ?
                        tab === 0 ?
                            <>
                                <div className={classes.showText}>
                                    <Email className={classes.showTextIcon} /> <Typography>{data.email}</Typography>
                                </div>
                                <div className={classes.showText}>
                                    <Wc className={classes.showTextIcon} /> <Typography>{data.gender == 0 ? 'Nam' : 'Nữ'}</Typography>
                                </div>
                                <div className={classes.showText}>
                                    <Today className={classes.showTextIcon} /> <Typography>{data.dob}</Typography>
                                </div>
                                <div className={classes.showText}>
                                    <LocationOn className={classes.showTextIcon} /> <Typography>{data.address + ", thành phố " + data.city_name + ", " + data.country_name}</Typography>
                                </div>
                            </>
                        : tab === 1 ?
                            <List>
                                <ListItem button onClick={() => this.onAvatarClick()}>
                                    <ListItemAvatar>
                                        <Face />
                                    </ListItemAvatar>
                                    <ListItemText>Cập nhật ảnh đại diện</ListItemText>
                                    <input id="user_avatar" type="file" name="avatar" style={{display: 'none'}} onChange={(event) => this.onAvatarChange(event, data.user_id)}/>
                                </ListItem>
                                <ListItem button onClick={() => this.onPasswordClick()}>
                                    <ListItemAvatar>
                                        <Lock />
                                    </ListItemAvatar>
                                    <ListItemText>Đổi mật khẩu</ListItemText>
                                </ListItem>
                            </List>
                        : <CircularProgress />
                    : <CircularProgress />}
                </div>
            </div>
        );
    }
}

AccountGeneral.defaultProps = {
    data: null,
    image: null,
}

AccountGeneral.contextType = Context;

export default withRouter(withStyles(useStyles)(AccountGeneral));