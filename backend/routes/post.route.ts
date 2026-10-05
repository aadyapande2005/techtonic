import express from 'express';
import { verifyjwt } from '../middleware/verifyjwt.js';

import { getposts } from '../controllers/post/getposts.js';
import { getpost } from '../controllers/post/getpost.js';
import { getpostsbytopic } from '../controllers/post/getpostsbytopic.js';
import { generatepost } from '../controllers/post/generatepost.js';
import { generatemultipleposts } from '../controllers/post/generatemultipleposts.js';
import { likepost } from '../controllers/post/like/likepost.js';
import { unlikepost } from '../controllers/post/like/unlikepost.js';
import { getlikes } from '../controllers/post/like/getlikes.js';
import { savepost } from '../controllers/post/save/savepost.js';
import { unsavepost } from '../controllers/post/save/unsavepost.js';
import { deletepost } from '../controllers/post/deletepost.js';
import { get_posts_by_similarity } from '../controllers/post/get_posts_by_similarity.js';
import { createComment } from '../controllers/post/comment/createComment.js';
import { getComments } from '../controllers/post/comment/getComments.js';
import { recordView } from '../controllers/post/view/recordView.js';
import { uploadImage } from '../controllers/post/uploadImage.js';

const postroutes = express();

postroutes.get('/', getposts);
postroutes.get('/topic/:topic', getpostsbytopic);
postroutes.get('/getpost/:postid', getpost);
postroutes.get('/like/:postid', verifyjwt, likepost);
postroutes.get('/unlike/:postid', verifyjwt, unlikepost);
postroutes.get('/save/:postid', verifyjwt, savepost);
postroutes.get('/unsave/:postid', verifyjwt, unsavepost);
postroutes.get('/getlikes/:postid', getlikes);
postroutes.get('/:postid/comments', getComments);
postroutes.post('/:postid/comments', verifyjwt, createComment);
postroutes.post('/:postid/view', verifyjwt, recordView);
postroutes.get('/similar/:search_query', verifyjwt, get_posts_by_similarity);
postroutes.post('/createpost', verifyjwt, generatepost);
postroutes.post(
    '/upload-image',
    verifyjwt,
    express.raw({
        type: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
        limit: '5mb'
    }),
    uploadImage
);
postroutes.post('/createposts', verifyjwt, generatemultipleposts);
postroutes.delete('/deletepost/:postid', verifyjwt, deletepost)


export default postroutes;