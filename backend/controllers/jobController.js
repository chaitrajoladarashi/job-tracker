const JobApplication = require('../models/JobApplication');

// @desc    Get all active job applications
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user.id, isDeleted: { $ne: true } }).sort({ dateApplied: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all deleted job applications (Trash)
// @route   GET /api/jobs/trash
exports.getDeletedJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user.id, isDeleted: true }).sort({ updatedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new job application
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const jobData = { ...req.body, user: req.user.id, isDeleted: false };
    const newJob = await JobApplication.create(jobData);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update job application
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const jobData = { ...req.body };
    const updatedJob = await JobApplication.findByIdAndUpdate(
      req.params.id, 
      jobData, 
      { new: true }
    );
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Soft delete job application (move to trash)
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await JobApplication.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }
    );
    res.status(200).json({ message: 'Job moved to trash' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore a deleted job application
// @route   PUT /api/jobs/:id/restore
exports.restoreJob = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updatedJob = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    res.status(200).json({ message: 'Job restored successfully', job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently delete job application
// @route   DELETE /api/jobs/:id/hard
exports.hardDeleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await JobApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
