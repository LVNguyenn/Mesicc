const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');

router.get('/stored/songs', meController.storedSongs)
router.get('/stored/users',meController.storedUsers)
router.post('/handle-form-actions', meController.handleFormActions)
router.delete('/:id/force', meController.forceDestroy)
router.get('/trash/songs', meController.trashSongs)
router.get('/sign-in',meController.sign_in)
router.get('/sign-up',meController.sign_up)
router.post('/signup',meController.signup)
router.post('/signin',meController.signin)
router.get('/:userid',meController.user)
router.post('/authen',meController.authen)
router.post('/update',meController.update)
router.post('/comment',meController.comment)
router.post('/del/comment',meController.delcmt)
//user
module.exports = router;