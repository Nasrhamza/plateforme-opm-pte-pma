const router = require('express').Router();
const ctrl = require('../controllers/reportConfig.controller');
const runCtrl = require('../controllers/reportRun.controller');
const { authMiddleware } = require('../middlewares/auth');
const { validateReportPayload } = require('../middlewares/validate');
const { refreshJobs } = require('../services/scheduler');

router.use(authMiddleware);

router.post('/', validateReportPayload, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id', validateReportPayload, ctrl.update);
router.delete('/:id', ctrl.remove);

router.post('/:id/run', runCtrl.runOnce);
router.get('/:id/export', runCtrl.exportOnce);
router.post('/_scheduler/refresh', async (req, res) => {
  await refreshJobs();
  res.json({ ok: true });
});

module.exports = router;
