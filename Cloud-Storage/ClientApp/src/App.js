import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import Toolbar from './components/Layouts/Toolbar';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme/muiTheme';
import "./assets/styles/index.css";

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <Toolbar />
                <Layout>
                    <Home />
                </Layout>
            </MuiThemeProvider>
        );
    }
}
