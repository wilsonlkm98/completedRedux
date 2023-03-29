import '../css/Login.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
//import authApi from '../redux/authApi';
import authApi from '../services/user/auth';
import { loginFailure, loginRequest, loginSuccess, saveUser } from '../redux/slices/userSlice';


function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const login = useSelector(state => state.user);

    // async function handleLogin() {
    //   if (username === 'admin' && password === 'admin') {
    //     navigate('/home')
    //   }
    // }

    async function handleLogin(event) {
        event.preventDefault();
        dispatch(loginRequest());
        try {
            const res = await authApi.login({ username, password });
            // console.log('Res', res.data);  
            dispatch(loginSuccess())   
            console.log('login',login)    
            if (res.status === 200) {
                
                dispatch(saveUser(res.data))
                console.log('Success')
                navigate('/home');
            }
        }
        catch (error) {
            console.log("error:", error.response.data)
            dispatch(loginFailure(error.response.data));
        }

    }

    return (
        <div className="login-page">
            <h2 className="login-heading">Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
                <button className="login-button" type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
