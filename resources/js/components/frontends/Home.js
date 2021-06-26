import { Card, CardActionArea, CardContent, Grid, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { withRouter } from 'react-router';
import { Context, rootURL } from '../Global';

const useStyles = (theme) => ({
    root: {
        marginTop: '10px',
    },
    card: {
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    }
});

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;
        return(
            <Grid className={classes.root} container spacing={3}>
                <Grid item xs={12}>
                    <Card onClick={() => this.props.history.push(rootURL + '/class_subjects')}>
                        <CardActionArea className={classes.card}>
                            <img src={rootURL + '/storage/images/system/cource-logo.png'} width="200px" />
                            <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Lớp học phần
                            </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                {this.context.state.login.user.role_id === 2 ?
                        <Grid item xs={12}>
                            <Card onClick={() => this.props.history.push(rootURL + '/terms')}>
                                <CardActionArea className={classes.card}>
                                    <img src={rootURL + '/storage/images/system/login-logo.png'} width="200px" />
                                    <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        Đăng ký tín chỉ
                                    </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                : <></>}
                {this.context.state.login.user.role_id === 2 ?
                    <Grid item xs={12}>
                        <Card onClick={() => this.props.history.push(rootURL + '/marks')}>
                            <CardActionArea className={classes.card}>
                                <img src={rootURL + '/storage/images/system/mark-logo.png'} width="200px" />
                                <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Xem điểm
                                </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                : <></>}
            </Grid>
        );
    }
}

export default withRouter(withStyles(useStyles)(Home));

Home.contextType = Context;