import { Button, Paper, TextField, Typography, withStyles } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { Link, withRouter } from "react-router-dom";
import { Context, rootURL } from "../Global";

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
});


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    
    //Nhấn button login
    submit(event) {
        event.preventDefault();
        const data = {
            user_name: event.target.user_name.value,
            password: event.target.password.value,
        }
        //axios.defaults.baseURL = baseURL();
        axios.post('/api/login', data).then( res => {
            const status = res.data;
            const user = status.data;
            this.context.setState({notification: status});
            if (status.type === 'success') {
                if (window.location.href.includes(rootURL + '/login'))
                    if (user.role_id == 1)
                        this.props.history.push(rootURL + '/users');
                    else
                        this.props.history.push(rootURL + '/');
                this.context.setState({ login: { status: 'yes', user: user } });
            }
        });
    }

    render() {
        const { classes } = this.props;
        const { status } = this.state;

        return(
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <img src={rootURL + '/storage/images/system/logo.png'} />
                    <form className={classes.form} onSubmit={(event) => this.submit(event)}>
                        <TextField
                            required
                            fullWidth
                            name="user_name"
                            label="Tên tài khoản"
                        />
                        <TextField
                            required
                            fullWidth
                            name="password"
                            type="password"
                            label="Mật khẩu"
                        />
                        <Button variant="contained" color="primary" type="submit">Đăng nhập</Button>
                    </form>
                    <Link to={rootURL + '/reset_password'}>Quên mật khẩu?</Link>
                </Paper>
            </div>
        );
    }
}

Login.contextType = Context;

export default withRouter(withStyles(useStyles)(Login))