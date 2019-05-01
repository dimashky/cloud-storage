import axios from 'axios';

let server_address = window.location.origin;

axios.defaults.baseURL = `${server_address}/api/`;
axios.defaults.headers.Accept = 'application/json';

const access_token = localStorage.getItem('access_token');
axios.defaults.headers.Authorization = `Bearer ${access_token}`;

export default axios;
