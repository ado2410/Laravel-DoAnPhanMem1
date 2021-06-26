import { Button, CircularProgress, Paper, TextField, Typography, withStyles } from "@material-ui/core";
import React from "react";
import { Route, Switch, withRouter } from "react-router";
import { Context, getAPIParams, rootURL } from "../Global";

const useStyles = (theme) => ({
    root: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    form: {
        '& > *': {
        margin: theme.spacing(1),
        },
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 500,
        textAlign: 'center',
      },
    image: {
        marginTop: 50,
        marginBottom: 50,
    },
});


class PasswordReset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false,
        }
    }
    
    //Nhấn nút xác nhận gửi
    submit(event) {
        const email = this.props.match.params.email;
        if (email)
            this.resetPassword(event);
        else
            this.requestCode(event);
    }

    //Yêu cầu gửi code qua email
    requestCode(event) {
        event.preventDefault();
        const data = {
            email: event.target.email.value,
        }
        this.setState({isProcessing: true});
        axios.post('/api/send_code', data).then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            if(status.type === 'success') {
                this.props.history.push(rootURL + '/reset_password/' + status.data.email);
            }
            this.setState({isProcessing: false});
        });
    }

    //Yêu cầu reset lại mật khẩu
    resetPassword(event) {
        event.preventDefault();
        const data = {
            email: this.props.match.params.email,
            code: event.target.code.value,
            password: event.target.password.value,
            comfirmed_password: event.target.comfirmed_password.value,
        }
        axios.post('/api/reset_password', data).then( res => {
            const status = res.data;
            this.context.setState({notification: status});
            if(status.type === 'success') {
                if (this.context.state.login.status === 'no')
                    this.props.history.push(rootURL + '/login');
                else
                    this.props.history.push(rootURL + '/account');                    
            }
        });
    }

    render() {
        const { classes } = this.props;
        const { isProcessing } = this.state;

        return (
            <div className={classes.root}>
                `<Paper className={classes.paper}>
                    <img src={rootURL + '/storage/images/system/logo.png'} className={classes.image} />
                    {!isProcessing ?
                        <form
                            className={classes.form}
                            onSubmit={(event) => this.submit(event)}
                        >
                            <Switch>
                                {/*Router Nhập mẫ xác nhận và mật khẩu*/}
                                <Route
                                    exact
                                    path={rootURL + '/reset_password/:email'} render={ () =>
                                        <>
                                            <Typography variant={'body1'}>Đã gửi mã xác thực qua email. Mã xác nhận chỉ có hiệu lực trong 5 phút!</Typography>
                                            <Typography variant={'body1'}>Nhập mã xác thực.</Typography>
                                            <TextField
                                                required
                                                fullWidth
                                                name="code"
                                                type="number"
                                                label="Nhập mã xác nhận"
                                            />
                                            <TextField
                                                required
                                                fullWidth
                                                name="password"
                                                type="password"
                                                label="Nhập mật khẩu mới"
                                            />
                                            <TextField
                                                required
                                                fullWidth
                                                name="comfirmed_password"
                                                type="password"
                                                label="Nhập lại mật khẩu mới"
                                            />
                                        </>
                                    }
                                />
                                {/*Router nhập tên tài khoản hoặc email*/}
                                <Route
                                    exact
                                    path={rootURL + '/reset_password'}
                                    render={ () =>
                                        <>
                                            <Typography variant={'body1'}>Nhập tên tài khoản hoặc email.</Typography>
                                            <TextField
                                                required
                                                fullWidth
                                                name="email"
                                                label="Nhập username hoặc email"
                                            />
                                        </>
                                    }
                                />
                            </Switch>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Xác nhận
                            </Button>
                        </form>
                    :
                        <div>
                            <CircularProgress />
                        </div>
                    }
                </Paper>`
            </div>
        );
    }
}

PasswordReset.contextType = Context;

export default withRouter(withStyles(useStyles)(PasswordReset));