import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import LoginDialog from './auth/LoginDialog';
import User from './api/User';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

async function init() {
    let access_token = localStorage.getItem('access_token');
    let current_user = await User.checkAccessToken(access_token);
    if (!access_token || !current_user) {
	    current_user= await LoginDialog();
    }

    User.setUser(current_user, current_user.accessToken);
    console.log("hello user: "+ current_user.name);
    ReactDOM.render(
        <BrowserRouter basename={baseUrl}>
            <App />
        </BrowserRouter>,
        rootElement);
}

init();

registerServiceWorker();
