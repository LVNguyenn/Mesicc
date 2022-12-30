const express = require('express');
const router = express.Router();

const songController = require('../app/controllers/SongController');

router.get('/create', songController.create)
router.post('/store', songController.store)
router.get('/:id/edit', songController.edit)
router.post('/handle-form-actions', songController.handleFormActions)
router.put('/:id', songController.update)
router.patch('/:id/restore', songController.restore)
router.delete('/:id', songController.destroy)
router.delete('/:id/force', songController.forceDestroy)
router.get('/:slug', songController.show)
router.get('/playlist/:userid/:id',songController.playlist)
module.exports = router;
