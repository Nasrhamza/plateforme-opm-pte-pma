const router = require('express').Router();
const { createUser, getAll, updateUser, deleteUser, exportUsersCsv } = require('../controllers/users.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { validateUserCreate, validateUserUpdate } = require('../middlewares/validate');

router.use(authMiddleware, adminOnly);

router.post('/', validateUserCreate, createUser);
router.get('/export', exportUsersCsv);
router.get('/', getAll);
router.put('/:id', validateUserUpdate, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
