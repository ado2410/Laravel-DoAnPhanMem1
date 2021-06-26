import React from 'react';
import ShowGeneral from '../general/ShowGeneral';
import AccountGeneral from '../general/AccountGeneral';
import { Context } from '../Global';

export default class Account extends React.Component {
    constructor(props) {
        super(props);
    }

    test() {
        axios.post('/api/users/test').then( res => {
            console.log(res);
        });
    }

    render() {
        const login = this.context.state.login;

        const show = {
            primaryKey: 'user_id',
            showImage: true,
            title: 'full_name',
            description: 'user_name',
            display: (data, image) => <AccountGeneral data={data} image={image} />,
        }

        return (
            <ShowGeneral
                showId={login.user.id}
                show={show}
                model='users'
            />
        );
    }
}

Account.contextType = Context;