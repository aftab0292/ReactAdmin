import * as actionTypes from './actionTypes';
import Axios from '../../connection/axios';

export const getAccessToken = (clientId, clientSecret, email, password) => dispatch => {
    Axios.post('oauth/token', {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: email,
        password: password,
        scope: ''
    }).then(({ data }) => {
        dispatch(authSuccess(data.access_token, data.refresh_token, data.expires_in));
    });
};

export const refreshAccessToken = (clientId, clientSecret, refreshToken) => dispatch => {
    Axios.post('oauth/token', {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refreshToken: refreshToken,
        scope: ''
    }).then(({ data }) => {
        dispatch(authSuccess(data.access_token, data.refresh_token, data.expires_in));
    });
};

export const authSuccess = (accessToken, refreshToken, expiresIn) => dispatch => {
    console.log('authsuccess');
    const expirationDate = new Date((new Date).getTime() + expiresIn * 1000);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('expirationDate', expirationDate);
    dispatch(setToken(accessToken, refreshToken, expirationDate));
};

export const setToken = (accessToken, refreshToken, expirationDate) => {
    return {
        type: actionTypes.SET_TOKEN,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expirationDate: expirationDate
    }
}

export const checkAuthState = (accessToken, refreshToken, expirationDate) => dispatch => {
    dispatch(setStatus('loading'));
    if (!accessToken) {
        if (localStorage.getItem('accessToken')) {
            if (new Date(localStorage.getItem('expirationDate')) > (new Date())) {
                dispatch(setToken(
                    localStorage.getItem('accessToken'),
                    localStorage.getItem('refreshToken'),
                    localStorage.getItem('expirationDate')
                ));
            } else {
                dispatch(authLogout());
            }
        } else {
            dispatch(setStatus('notAuthenticated'));
        }
    } else {
        if (expirationDate > (new Date())) {
            dispatch(setStatus('authenticated'));
        } else {
            dispatch(authLogout);
        }
    }
}

export const setStatus = status => {
    return {
        type: actionTypes.SET_STATUS,
        status: status
    }
}

export const authLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
};