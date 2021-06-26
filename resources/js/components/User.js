import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { Dehaze, Menu as MenuIcon } from '@material-ui/icons';
import * as Frontend from './frontends';
import { baseURL, Context, rootURL } from './Global';
import { Link, Route, Switch, withRouter } from 'react-router-dom';
import Admin from './Admin';

const useStyles = (theme) => ({
    root: {

    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    appBarLogo: {
        marginRight: theme.spacing(2),
    },
    appBarExpansion: {
        [theme.breakpoints.up('md')]: {
            display: 'none',
          },
    },
    appBarLeft: {
        flexGrow: 1,
        [theme.breakpoints.down('sm')]: {
            display: 'none',
          },
    },
    appBarLeftMobile: {
        [theme.breakpoints.up('md')]: {
            display: 'none',
          },
    },
    appBarSpace: {
        [theme.breakpoints.down('sm')]: {
            flexGrow: 1,
          },
    },
    guest: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
            textAlign : 'center',//for texts
            justifyContent: 'center',
        },
        '& img': {
            maxWidth: '100%',
        },
    },
    guestManual: {
        marginTop: '50px',
        border: 'solid 1px',
    },
    accountMenu : {
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '50%',
    },
    content: {
        marginTop: 10,
        flexGrow: 1,
      },
});

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            drawerExpansion: false,
        }
    }

    componentDidMount() {
        this.context.setState({page: {model: 'home'}});
    }

    openMenu(e, menuId) {
        this.setState({ anchorEl: e.currentTarget, menuId: menuId });
    }

    closeMenu() {
        this.setState({ anchorEl: null, menuId: null });
    }

    onAddressChange(url) {
        this.props.history.push(rootURL + url);
        this.closeMenu();
    }

    log() {
        if (this.context.state.login.status === 'yes') {
            axios.defaults.baseURL = baseURL();
            axios.get('api/logout').then( res => {
                const data = res.data;
                if (data.type === 'success') {
                    this.context.setState({login: {status: 'no'}});
                    this.props.history.push(rootURL + '/');
                }
            });
        }
        else {
            //this.context.setState({ login: {status: 'login'} });
            this.props.history.push(rootURL + '/login');
        }
        this.closeMenu();
    }

    //Sự kiện khi nhấn nút mở rộng
    onAppbarExpansionClick() {
        this.setState({drawerExpansion: !this.state.drawerExpansion});
    }

    render() {

        const { classes } = this.props;
        const { drawerExpansion } = this.state;
        const login = this.context.state.login;
        return (
            <div className={classes.root}>
                <AppBar className={classes.appBar} position="fixed">
                    <Toolbar>
                        {(login.status === 'yes' && login.user.role_id == 1) ?
                            <IconButton edge="start" className={classes.appBarExpansion} color="inherit" onClick={() => this.onAppbarExpansionClick()}>
                                <Dehaze />
                            </IconButton>
                        : ''}
                        <IconButton edge="start" className={classes.appBarLogo} color="inherit">
                            <img src={rootURL + '/storage/images/system/icon.png'} width="50px" />
                        </IconButton>
                        <div className={classes.appBarLeft}>
                            {(login.status === 'no' || (login.status === 'yes' && login.user.role_id != 1)) ?
                                <Button color="inherit" onClick={ () => this.onAddressChange('/') }>Trang chủ</Button>
                                : <Typography>UDCK ADMIN</Typography>
                            }
                            {login.status === 'yes' ? (login.user.role_id === 2 ?
                                <React.Fragment>
                                    <Button color="inherit" onClick={ () => this.onAddressChange('/class_subjects') }>Danh sách học phần</Button>
                                    <Button color="inherit" onClick={ () => this.onAddressChange('/marks') }>Điểm</Button>
                                    <Button color="inherit" onClick={ () => this.onAddressChange('/terms') }>Đăng ký tín chỉ</Button>
                                </React.Fragment>
                                : login.user.role_id === 3 ?
                                    <React.Fragment>
                                        <Button color="inherit" onClick={ () => this.onAddressChange('/class_subjects') }>Danh sách học phần</Button>
                                        <Button color="inherit" onClick={ () => this.onAddressChange('/') }>Chấm điểm</Button>
                                    </React.Fragment>
                                : '')
                            : ''}
                        </div>
                        {(login.status === 'no' || (login.status === 'yes' && login.user.role_id != 1)) ?
                            <Button color="inherit" className={classes.appBarLeftMobile} onClick={ (e) => this.openMenu(e, 1) }>Chức năng</Button>
                        : ''}
                        <div className={classes.appBarSpace} />
                        { login.status === "yes" ?
                            <Button color="inherit" onClick={ (e) => this.openMenu(e, 2) }>
                                <Typography color="inherit">{login.user.first_name + ' ' + login.user.last_name}</Typography>
                                <IconButton color="inherit" onClick={ (e) => this.openMenu(e, 2) }>
                                    <img src={rootURL + '/storage/images/users/' + login.user.id + '.png'} className={ classes.accountMenu }/>
                                </IconButton>
                            </Button>
                        :
                            <Button color="inherit" onClick={() => this.log()}>Đăng nhập</Button>
                        }
                    </Toolbar>
                </AppBar>
                <Menu
                    anchorEl={this.state.anchorEl}
                    open={this.state.menuId === 1}
                    onClose={() => this.closeMenu()}
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
                    <MenuItem onClick={() => this.onAddressChange('/')}>Trang chủ</MenuItem>
                    {login.status === 'yes' ? (login.user.role_id === 2 ?
                        <div>
                            <MenuItem onClick={() => this.onAddressChange('/class_subjects')}>Danh sách học phần</MenuItem>
                            <MenuItem onClick={() => this.onAddressChange('/marks')}>Điểm</MenuItem>
                            <MenuItem onClick={() => this.onAddressChange('/terms')}>Đăng ký tín chỉ</MenuItem>
                        </div>
                    : login.user.role_id === 3 ?
                        <div>
                            <MenuItem onClick={() => this.onAddressChange('/class_subjects')}>Danh sách học phần</MenuItem>
                            <MenuItem onClick={() => this.onAddressChange('/')}>Chấm điểm</MenuItem>
                        </div>
                    : <></>) : <></>}
                </Menu>
                <Menu
                    anchorEl={this.state.anchorEl}
                    open={this.state.menuId === 2}
                    onClose={() => this.closeMenu()}
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
                    <MenuItem onClick={() => this.onAddressChange('/account')}>Tài khoản</MenuItem>
                    <MenuItem onClick={() => this.log()}>Đăng xuất</MenuItem>
                </Menu>
                <div className={classes.content}>
                    <Toolbar />
                    {login.status === 'yes' ? (
                        login.user.role_id === 1 ?
                            <Admin drawerExpansion={drawerExpansion} onDrawerClose={() => this.onAppbarExpansionClick()} />
                        : login.user.role_id === 2 || login.user.role_id === 3 ?
                            <Switch>
                                <Route exact path={rootURL}><Frontend.Home /></Route>
                                <Route exact path={rootURL + '/class_subjects'}><Frontend.ClassSubject /></Route>
                                <Route exact path={rootURL + '/class_subjects/:class_subject_id/class_subject_students'} render={(props) =>
                                    login.user.role_id === 3 ? 
                                    <Frontend.ClassSubjectStudent_Teacher {...props} />
                                :
                                    <Frontend.ClassSubjectStudent_Student {...props} />
                                }/>
                                <Route exact path={rootURL + '/terms'}><Frontend.Term /></Route>
                                <Route exact path={rootURL + '/terms/:term_id/class_subject_terms'} render={(props) => <Frontend.ClassSubjectTerm {...props} />} />
                                <Route exact path={rootURL + '/marks'}><Frontend.Mark /></Route>
                                <Route exact path={rootURL + '/account'}><Frontend.Account /></Route>
                            </Switch>
                        : <Typography>Chưa có trang chủ cho người dùng có vai trò này</Typography>
                    )
                    :   <div className={classes.guest}>
                            <img src={rootURL + '/storage/images/system/logo.png'} />
                            <Typography variant="h4"><b>Chào mừng đến với trang hệ thống đào tạo của UDCK</b></Typography>
                            <Typography variant="h5">Vui lòng <Link onClick={() => this.log()}>đăng nhập</Link> để sử dụng hệ thống!</Typography>
                            <div className={classes.guestManual}>
                                <Typography variant="h5"><b>Hướng dẫn sử dụng</b></Typography>
                                <Typography variant="body1"><b>Bước 1:</b> Nhấn chuột vào nút <b>Đăng nhập</b> góc trên bên phải giao diện website.</Typography>
                                <img src={rootURL + '/storage/images/system/guide-1.png'} />
                                <Typography variant="body1"><b>Bước 2:</b> Nhập <b>Tên tài khoản</b> và <b>Mật khẩu</b> và nhấn vào nút <b>Đăng nhập</b> để đăng nhập.</Typography>
                                <img src={rootURL + '/storage/images/system/guide-2.png'} />
                                <Typography variant="h5"><b>Hết!</b></Typography>
                            </div>
                        </div>}
                </div>
            </div>
        );
    }
}

User.contextType = Context;

export default withRouter(withStyles(useStyles)(User))  