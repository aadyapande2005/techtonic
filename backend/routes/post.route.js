import express from 'express';
import { verifyjwt } from '../middleware/verifyjwt.js';

import { getposts } from '../controllers/post/getposts.js';
import { getpost } from '../controllers/post/getpost.js';
import { getpostsbytopic } from '../controllers/post/getpostsbytopic.js';
import { generatepost } from '../controllers/post/generatepost.js';
import { generatemultipleposts } from '../controllers/post/generatemultipleposts.js';
import { likepost } from '../controllers/post/likepost.js';
import { unlikepost } from '../controllers/post/unlikepost.js';
import { savepost } from '../controllers/post/savepost.js';
import { unsavepost } from '../controllers/post/unsavepost.js';
import { getlikes } from '../controllers/post/getlikes.js';
import { deletepost } from '../controllers/post/deletepost.js';
import { get_posts_by_similarity } from '../controllers/post/get_posts_by_similarity.js';

const postroutes = express();

postroutes.get('/', getposts);
postroutes.get('/topic/:topic', getpostsbytopic);
postroutes.get('/getpost/:postid', getpost);
postroutes.get('/like/:postid', verifyjwt, likepost);
postroutes.get('/unlike/:postid', verifyjwt, unlikepost);
postroutes.get('/save/:postid', verifyjwt, savepost);
postroutes.get('/unsave/:postid', verifyjwt, unsavepost);
postroutes.get('/getlikes/:postid', getlikes);
postroutes.get('/similar/:search_query', get_posts_by_similarity);
postroutes.post('/createpost', verifyjwt, generatepost);
postroutes.post('/createposts', verifyjwt, generatemultipleposts);
postroutes.delete('/deletepost/:postid', verifyjwt, deletepost)


export default postroutes;