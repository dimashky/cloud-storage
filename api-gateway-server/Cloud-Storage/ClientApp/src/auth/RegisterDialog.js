import Swal from 'sweetalert2';
import LoginDialog from './LoginDialog';

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
                resolve();
            });
        },
        onOpen: function () {
            document.getElementById('user-username').focus();
        }
    });

    if (!user) {
        user = await LoginDialog();
    }

    return user;
};