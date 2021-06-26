import React from "react";

//Context
export const Context = React.createContext();
export const rootURL = '/dapm/public';
export const baseURL = () => {return 'http://' + location.host + rootURL};

export default class Global extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: {
                model: 'users',
            },
            Notification: null, //Thông báo
            login: { status: null}, // status: yes, no, login
        }
    }

    render() {
        return (
            <Context.Provider value={{state: this.state, setState: (values, callback) => this.setState(values)}}>
                {this.props.children}
            </Context.Provider>
        );
    }
}

//Lấy địa address API của address hiện tại
export function getAPI(deleteParams=false, modifiedParams=[]) {
    let href = window.location.href;
    if (deleteParams) {
        let paramPos = href.search('\\?');
        if (paramPos !== -1)
            href = href.slice(0, paramPos);
    } else {
        var url = new URL(href);
        modifiedParams.map((param) => (
            url.searchParams.set(param.name, param.value)
        ));
        href = url.toString();
    }
    const position = baseURL().length;
    return [href.slice(0, position), '/api', href.slice(position)].join('')
}

//Lấy params của API address
export function getAPIParams(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}