import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import User from "../../api/User";

class MenuAppBar extends React.Component {
    state = {
        auth: true,
        anchorEl: null,
        username: User.getUser().name
    };

    handleChange = event => {
        this.setState({ auth: event.target.checked });
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    logout = () => {
      localStorage.clear();
      window.location.reload();
    };

    render() {
        const { auth, anchorEl, username } = this.state;
        const open = Boolean(anchorEl);

        return (
            <div className="toolbar">
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="h5" color="inherit">
                            Cloud Storage
                        </Typography>
                        <div style={{flexGrow:1}}/>
                        <div>
                            <span>Hello {username}</span>
                            <IconButton
                                aria-owns="menu-appbar"
                                aria-haspopup="true"
                                onClick={this.handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={open}
                                onClose={this.handleClose}
                            >
                                <MenuItem onClick={this.logout}>Logout</MenuItem>
                            </Menu>
                        </div>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default MenuAppBar;
