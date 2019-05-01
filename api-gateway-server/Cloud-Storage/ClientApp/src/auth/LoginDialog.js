import Swal from 'sweetalert2';
import RegisterDialog from './RegisterDialog';
import User from '../api/User';

export default async function LoginDialog() {
    let { value: user } = await Swal.fire({
        title: 'User Login',
        text: 'Enter Username and Password here.',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Register',
        html:
        '<div>Enter Username and Password here.</div>' +
        '<input id="user-username" required style="margin: 4px" placeholder="Username" type="text" class="swal2-input">' +
        '<input id="user-password" required style="margin: 4px" placeholder="Password" type="password" class="swal2-input">',
        preConfirm: function () {
            let email = document.getElementById('user-username').value,
                password = document.getElementById('user-password').value;
            if (!email || !password) {
                Swal.showValidationMessage('Please Fill all fields above.');
                return false;
            }
            Swal.resetValidationMessage();
            return new Promise(function (resolve) {
                User.login(email, password)
                    .then(res => resolve(res))
                    .catch(err => {
                        Swal.showValidationMessage(err.message);
                        Swal.hideLoading();
                    });
            });
        },
        onOpen: function () {
            document.getElementById('user-username').focus();
        }
    });

    if (!user) {
        user = await RegisterDialog();
    }

    return user;
};