import express from 'express';
import { verifyjwt } from '../middleware/verifyjwt.js';

const userroutes = express();

import { getuser } from '../controllers/user/getuser.js';
import { getusers } from '../controllers/user/getusers.js';
import { updateuser } from '../controllers/user/updateuser.js';
import { deleteuser } from '../controllers/user/deleteuser.js';
import { getuserlikes } from '../controllers/user/getuserlikes.js';
import { getusersavedposts } from '../controllers/user/getusersavedposts.js';


userroutes.get('/', getusers);
userroutes.get('/public/:userid', getuser);
userroutes.get('/profile/:userid', verifyjwt, getuser);
userroutes.get('/post/liked', verifyjwt, getuserlikes);
userroutes.get('/post/saved', verifyjwt, getusersavedposts);
userroutes.put('/:userid', verifyjwt, updateuser)
userroutes.delete('/:userid', verifyjwt, deleteuser);


export default userroutes;