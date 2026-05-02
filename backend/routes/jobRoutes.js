const express = require('express');
const router = express.Router();

const { 
  getJobs, 
  getDeletedJobs,
  createJob, 
  updateJob, 
  deleteJob,
  restoreJob,
  hardDeleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/trash')
  .get(getDeletedJobs);

router.route('/')
  .get(getJobs)
  .post(createJob);

router.route('/:id/restore')
  .put(restoreJob);

router.route('/:id/hard')
  .delete(hardDeleteJob);

router.route('/:id')
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;
