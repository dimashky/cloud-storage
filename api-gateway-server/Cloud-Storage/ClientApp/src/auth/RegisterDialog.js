import Swal from 'sweetalert2';
import LoginDialog from './LoginDialog';
import User from '../api/User';

export default async function RegisterDialog() {
    let { value: user } = await Swal.fire({
        title: 'User Resgister',
        text: 'Enter Username and Password here.',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Register',
        cancelButtonText: 'Login',
        html:
        '<div>Fill all fields below please.</div>' +
        '<input id="user-name" required style="margin: 4px" placeholder="Name" type="text" class="swal2-input">' +
        '<input id="user-username" required style="margin: 4px" placeholder="Email" type="email" class="swal2-input">' +
        '<input id="user-password" required style="margin: 4px" placeholder="Password" type="password" class="swal2-input">',
        preConfirm: function () {
            let email = document.getElementById('user-username').value,
                password = document.getElementById('user-password').value,
                name = document.getElementById('user-name').value;
            if (!name || !email || !password) {
                Swal.showValidationMessage('Please Fill all fields above.');
                return false;
            }
            Swal.resetValidationMessage();
            return new Promise(function (resolve) {
                User.register(name, email, password)
                    .then(res => resolve(res))
                    .catch(err => {
                        Swal.showValidationMessage(err.message);
                        Swal.hideLoading();
                    });
            });
        },
        onOpen: function () {
            document.getElementById('user-name').focus();
        }
    });

    if (!user) {
        user = await LoginDialog();
    }

    return user;
};