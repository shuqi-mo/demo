import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss'
import { Provider } from 'react-redux'
import store from './store'
import Home from './Home'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <Home/>
    </Provider>
);
