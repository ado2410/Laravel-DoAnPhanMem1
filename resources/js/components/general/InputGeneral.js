import { Button, MenuItem, TextField, Typography, withStyles } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import { Context, getAPI } from '../Global';

const useStyles = (theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    submit: {
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    }
});

class InputGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            files: {},
            autocompletes: {},
            fileUploadingCount: 0,
        }
    }

    componentDidMount() {
        axios.get(getAPI(true) + '/create').then( res => {
            const data = res.data;
            this.setState({ dataSource: data }, () => {console.log(this.state)}); 
        });

        if (this.props.inputId) {
            this.fill();
        }
    }

    //Lấy dữ liệu chỉnh sửa
    fill() {
        axios.get(getAPI(true) + '/' + this.props.inputId + '/edit').then( res => {
            const data = res.data;

            this.setState({ editData: data, loaded: true }, () => {console.log(this.state)});
        });
    }

    //Thay đổi combobox
    onAutoCompleteChange(name, values, isDefault, multiple) {
        let newValues = this.state.autocompletes;
        if (isDefault) {
            if (!newValues[name]) {
                newValues[name] = values;
            }
        }
        else {
            if(multiple) {
                let news = [];
                values.map(i => news.push(i['id']));
                newValues[name] = news;
            }
            else {
                newValues[name] = values['id'];
            }
        }
    }

    //Xác nhận gửi
    submit(event) {
        event.preventDefault();
        const user = {};
        this.props.input.map((field) => {
            if (field.type ===  'file' && event.target[field.name].value)
                user[field.name] = this.state.files[field.name];
            else if (field.type === 'combobox') {
                user[field.name] = this.state.autocompletes[field.name];
            }
            else
                user[field.name] = event.target[field.name].value;
        });

        if (this.props.inputId == null) {
            axios.post(getAPI(), user).then( res => {
                const status = res.data;
                this.context.setState({notification: status});
                if (status.type === 'success')
                    this.props.onSubmit();
            });
        } else {
            axios.put(getAPI(true) + '/' + this.props.inputId, user).then( res => {
                const status = res.data;
                this.context.setState({notification: status});
                if (status.type === 'success')
                    this.props.onSubmit();
            });
        }
        console.log(user);
    }

    //Khi file mới
    onFileChange(event, name) {
        let reader = new FileReader();
        const fileUploadingCount = this.state.fileUploadingCount;
        reader.onload = (e) => {
            const files = JSON.parse(JSON.stringify(this.state.files));
            files[name] = e.target.result;
            this.setState({files: files, fileUploadingCount: fileUploadingCount-1});
        }
        reader.readAsDataURL(event.target.files[0]);
        this.setState({fileUploadingCount: fileUploadingCount+1});
    }

    render() {
        const { classes, input, inputId } = this.props;
        const { loaded, dataSource, editData } = this.state;

        return (
            <>
                { loaded || !inputId ?
                    <form
                        className={classes.root}
                        onSubmit={(event) => this.submit(event)}
                    >
                        {input.map((field) => {
                            const multiple = field.multiple;
                            const defaultValue =
                                inputId ?
                                    (field.type === "datetime-local" ?
                                        editData[field.name].replaceAll(" ", "T")
                                        : editData[field.name]
                                    )
                                : (field.type === "datetime-local" && field.default) ?
                                    field.default.replaceAll(" ", "T")
                                : field.default
                            
                            const type = field.type;
                            const required = ((field.required === "create" && !inputId) || (field.required === "edit" && inputId) || field.required === "all") ? true : false;
                            const disabled = ((field.disabled === "create" && !inputId) || (field.disabled === "edit" && inputId) || field.disabled === "all") ? true : false;
                            const name = field.name;
                            const label = field.label;
                            const accept= field.accept;
                            const onChange = field.type === "file" ? (file) => this.onFileChange(file, field.name) : null;
                            
                            return (
                                <>
                                    {(type === "combobox" && dataSource) ?
                                        <Autocomplete
                                            key={name}
                                            multiple={multiple}
                                            options={dataSource[field.data]}
                                            getOptionLabel={ (option) => option.name }
                                            renderOption={(option) => <>{option.name}</>}
                                            defaultValue={dataSource[field.data].find(e => e.id === defaultValue)}
                                            onInputChange={(e, values) => this.onAutoCompleteChange(name, defaultValue, true, multiple)}
                                            onChange={(e,values) => this.onAutoCompleteChange(name, values, false, multiple)}
                                            disabled={disabled}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    combobox="true"
                                                    required={!multiple && required}
                                                    name={name}
                                                    label={label}
                                                    margin="normal"
                                                />}
                                    />
                                    : <TextField
                                            key={name}
                                            fullWidth
                                            defaultValue={defaultValue}
                                            type={type}
                                            required={required}
                                            disabled={disabled}
                                            name={name}
                                            label={label}
                                            accept={accept}
                                            onChange={onChange}
                                            inputProps={{accept: accept, step: 0.01}}
                                        />
                                    }
                                </>
                            )
                        })}
                        <div className={classes.submit}>
                            <Button variant="contained" color="secondary" type="submit">Xác nhận</Button>
                        </div>
                    </form>
                : ''}
            </>
        );
    }
}

export default withStyles(useStyles)(InputGeneral);

InputGeneral.contextType = Context;