import { Button, Card, CardActions, CardContent, CardMedia, Divider, Paper, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { baseURL, Context, getAPI, rootURL } from '../Global';

const useStyles = (theme) => ({
    card: {
        flexGrow: 1,
    },
    media: {
        backgroundPosition: 'center',
        paddingTop: '100%',
        height: 0,
    },
});

class ShowGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            image: rootURL + '/storage/images/' + this.props.model + '/0.svg',
            loaded: false,
        }
    }

    componentDidMount() {
        let path = '';
        if (this.props.model != null)
            path = baseURL() + '/api/' + this.props.model;
        else
            path = getAPI(true);
        axios.get(path + '/' + this.props.showId ).then( res => {
            const status = res.data;
            const data = status.data;
            if (status.type === 'success') {
                let image = '';
                if (status.imageExists)
                    image = baseURL() + '/storage/images/' + this.props.model + '/' + this.props.showId + '.png';
                else
                    image = rootURL + '/storage/images/' + this.props.model + '/0.svg';
                this.setState({loaded: true, data: data, image: image});
            }
        });
    }

    //Đặt ảnh mặc định
    setDefaultImage() {
        this.setState({ image: rootURL + '/storage/images/' + this.props.model + '/0.svg' });
    }

    //Nhấn nút chỉnh sửa
    onEditClick() {
        this.props.onEditClick();
    }

    render() {
        const { show, classes } = this.props;
        const { image, data, loaded } = this.state;

        return (
            loaded ?
                show.display ?
                    <Paper>
                        {show.display(data, image)}
                    </Paper>
                :
                    <Card className={classes.card}>
                        <CardContent>
                            {show.showImage ?
                                <CardMedia
                                    className={classes.media}
                                    image={image}
                                    title="Ảnh đại diện"
                                />
                            : ''}
                            <Typography variant="h4">{data[show.title]}</Typography>
                            <Typography variant="body2">@{ data[show.description] }</Typography>
                            <Divider />
                            <Typography variant="h6">Thông tin</Typography>
                            {show.info.map(info => (
                                <Typography variant="body2">
                                    {info.label}: {info.display ? info.display(data) : data[info.name] }
                                </Typography>
                            ))}
                        </CardContent>
                        <CardActions>
                            <Button
                                size="small"
                                onClick={ () => this.onEditClick() }
                            >
                                Chỉnh sửa
                            </Button>
                        </CardActions>
                    </Card>
            : ''
        );
    }
}

ShowGeneral.contextType = Context;

export default withStyles(useStyles)(ShowGeneral);

ShowGeneral.defaultProps = {
    showId: [], //Id hiển thị
    show: null, //Config
    model: [], //Model dữ liệu
    onEditClick: () => {}, //Nhấn nút chỉnh sửa
}