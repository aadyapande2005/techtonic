import express from 'express';
import { verifyjwt } from '../middleware/verifyjwt.js';

const authroutes = express();

import { register } from '../controllers/auth/register.js';
import { login } from '../controllers/auth/login.js';
import { logout } from '../controllers/auth/logout.js';
import { isLoggedIn } from '../controllers/auth/isLoggedIn.js';


authroutes.post('/register', register);
authroutes.post('/login', login);
authroutes.get('/logout', verifyjwt, logout);
authroutes.get('/islogin', verifyjwt, isLoggedIn);


export default authroutes;

