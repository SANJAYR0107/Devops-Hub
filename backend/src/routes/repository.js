const express = require('express');
const router = express.Router();
const { isValidGithubUrl } = require('../utils/validation');
const { cloneRepository, cleanupWorkspace } = require('../services/gitService');
const { analyzeRepository } = require('../services/analyzerService');
const { buildDockerImage, runDockerContainer } = require('../services/dockerService');

/**
 * @route POST /api/repository/analyze
 * @description Validates, clones, analyzes, builds, and runs the repository
 */
router.post('/analyze', async (req, res) => {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
        return res.status(400).json({ error: 'Repository URL is required.' });
    }

    if (!isValidGithubUrl(repositoryUrl)) {
        return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    let clonedPath = null;
    try {
        // Feature 3: Clone Repository
        clonedPath = await cloneRepository(repositoryUrl);

        // Feature 4 & 5: Analyze Repository & Docker Detection
        const analysis = analyzeRepository(clonedPath);

        const urlParts = repositoryUrl.split('/');
        const projectName = urlParts[urlParts.length - 1].replace('.git', '');

        let dockerStatus = 'Not Started';
        let containerStatus = 'Not Started';
        let imageTag = null;
        let containerId = null;

        if (analysis.dockerfileExists) {
            // Feature 6: Docker Build
            dockerStatus = 'Building';
            imageTag = await buildDockerImage(clonedPath, projectName);
            dockerStatus = 'SUCCESS';

            // Feature 7: Docker Run
            containerStatus = 'Starting';
            containerId = await runDockerContainer(imageTag, projectName);
            containerStatus = 'RUNNING';
        } else {
            dockerStatus = 'Skipped (No Dockerfile)';
        }

        // We skip cleanup for now so the container can keep running or so we can inspect it.
        // In a real scenario, we might want to clean up depending on the retention policy.
        
        return res.status(200).json({
            message: 'Pipeline completed',
            repositoryUrl: repositoryUrl,
            projectName: projectName,
            analysis: analysis,
            dockerBuildStatus: dockerStatus,
            containerStatus: containerStatus,
            imageTag: imageTag,
            containerId: containerId
        });

    } catch (error) {
        console.error('[ERROR] analyze route failed:', error);
        // if (clonedPath) cleanupWorkspace(clonedPath);
        return res.status(500).json({ error: error.message || 'Pipeline failed' });
    }
});

module.exports = router;
