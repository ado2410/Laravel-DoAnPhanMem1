import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, Drawer, Hidden, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Class, InsertDriveFile, MenuBook, People, School, Star } from '@material-ui/icons';
import * as Backend from './backends';
import * as Frontend from './frontends';
import { Context, rootURL } from './Global';
import { Route, Switch, withRouter } from 'react-router';

const useStyles = (theme) => ({
    root: {

    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    contentLeft: {
        zIndex: theme.zIndex.drawer,
        maxWidth: 250,
        position: 'fixed',
        height: '100%',
    },
    contentRight: {
        [theme.breakpoints.up('md')]: {
            marginLeft: 250,
          },
        flexGrow: 1,
    },
});

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        }
    }

    onDrawerClose() {
        this.props.onDrawerClose();
    }

    render() {
        const { classes, drawerExpansion } = this.props;
        const { drawer } = this.state;
        const login = this.context.state.login;

        const menu = (mobile) =>
            <List>
                {[
                    ['Quản lý tài khoản', <People />, 'users'],
                    ['Quản lý học phần', <MenuBook />, 'subjects'],
                    ['Quản lý lớp sinh hoạt', <School />, 'classes'],
                    ['Quản lý lớp học phần', <Class />, 'class_subjects'],
                    ['Quản lý học kỳ', <Star />, 'terms'],
                    ['Logs', <InsertDriveFile />, 'logs']
                ].map((item, index) => (
                    <ListItem
                        button
                        key={item[0]}
                        onClick={() => {
                            this.props.history.push(rootURL + '/' + item[2]);
                            if (mobile) {
                                this.onDrawerClose();
                            }
                        }}
                        disabled={window.location.href.includes(rootURL + '/' + item[2])}
                    >
                        <ListItemIcon>{item[1]}</ListItemIcon>
                        <ListItemText primary={item[0]} />
                    </ListItem>
                ))}
            </List>

        return (
            <div className={classes.root}>
                <Hidden smDown implementation="css">
                    <Card className={classes.contentLeft}>
                        {menu()}
                    </Card>
                </Hidden>
                <Drawer
                    variant="temporary"
                    open={drawerExpansion}
                    onClose={() => this.onDrawerClose()}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    {menu(true)}
                </Drawer>
                <main className={classes.contentRight}>
                    <Switch>
                        <Route exact path={rootURL + '/users'}>
                            <Backend.User />
                        </Route>
                        <Route exact path={rootURL + '/subjects'}>
                            <Backend.Subject />
                        </Route>
                        <Route exact path={rootURL + '/classes'}>
                            <Backend.Class />
                        </Route>
                        <Route exact path={rootURL + '/classes/:class_id/class_students'}>
                            <Backend.ClassStudent />
                        </Route>
                        <Route exact path={rootURL + '/class_subjects'}>
                            <Backend.ClassSubject />
                        </Route>
                        <Route exact path={rootURL + '/class_subjects/:class_subject_id/class_subject_students'}>
                            <Backend.ClassSubjectStudent />
                        </Route>
                        <Route exact path={rootURL + '/terms'}>
                            <Backend.Term />
                        </Route>
                        <Route exact path={rootURL + '/terms/:term_id/class_subject_terms'}>
                            <Backend.ClassSubjectTerm />
                        </Route>
                        <Route exact path={rootURL + '/logs'}>
                            <Backend.Log />
                        </Route>
                        <Route exact path={rootURL + '/account'}>
                            <Frontend.Account />
                        </Route>
                    </Switch>
                </main>
            </div>
        );
    }
}

Admin.contextType = Context;

export default withRouter(withStyles(useStyles, { withTheme: true})(Admin))