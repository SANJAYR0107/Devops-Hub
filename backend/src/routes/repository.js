const express = require('express');
const router = express.Router();
const { isValidGithubUrl } = require('../utils/validation');
const { pipelineQueue } = require('../services/jobQueue');
const sseService = require('../services/sseService');

/**
 * @route POST /api/repository/analyze
 * @description Validates URL, enqueues the job, and returns the jobId
 */
router.post('/analyze', async (req, res) => {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
        return res.status(400).json({ error: 'Repository URL is required.' });
    }

    if (!isValidGithubUrl(repositoryUrl)) {
        return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    try {
        const job = await pipelineQueue.add('analyze-repo', { repositoryUrl });
        return res.status(202).json({
            message: 'Pipeline job accepted',
            jobId: job.id
        });
    } catch (error) {
        console.error('[ERROR] analyze route failed:', error);
        return res.status(500).json({ error: error.message || 'Failed to enqueue job' });
    }
});

/**
 * @route GET /api/repository/stream/:jobId
 * @description Establishes an SSE connection for live updates on a specific job
 */
router.get('/stream/:jobId', (req, res) => {
    const { jobId } = req.params;
    sseService.addClient(jobId, req, res);
});

module.exports = router;
