const { Queue, Worker } = require('bullmq');
const { connection } = require('../config/redis');
const { cloneRepository, cleanupWorkspace } = require('./gitService');
const { analyzeRepository } = require('./analyzerService');
const { buildDockerImage, runDockerContainer } = require('./dockerService');
const sseService = require('./sseService');

const QUEUE_NAME = 'pipeline-queue';

const pipelineQueue = new Queue(QUEUE_NAME, { connection });

const pipelineWorker = new Worker(QUEUE_NAME, async (job) => {
    const { repositoryUrl } = job.data;
    const jobId = job.id;
    let clonedPath = null;

    try {
        const logger = (msg) => {
            sseService.broadcast(jobId, { type: 'log', message: msg });
        };

        // Notify UI that processing started
        sseService.broadcast(jobId, { type: 'status', message: 'Processing started' });
        
        logger('Repository URL received');

        // Step 1: Clone
        sseService.broadcast(jobId, { type: 'progress', step: 'clone' });
        clonedPath = await cloneRepository(repositoryUrl, logger);
        logger('Repository cloned');

        // Step 2: Analyze
        sseService.broadcast(jobId, { type: 'progress', step: 'analyze' });
        const analysis = analyzeRepository(clonedPath);
        logger('Repository analyzed');
        if (analysis.technology) {
            logger(`${analysis.technology} project detected`);
        }

        const urlParts = repositoryUrl.split('/');
        const projectName = urlParts[urlParts.length - 1].replace('.git', '');

        let dockerStatus = 'Not Started';
        let containerStatus = 'Not Started';
        let imageTag = null;
        let containerId = null;
        let containerPort = null;

        if (analysis.dockerfileExists) {
            logger('Dockerfile found');
            
            // Step 3: Build
            sseService.broadcast(jobId, { type: 'progress', step: 'build' });
            dockerStatus = 'Building';
            imageTag = await buildDockerImage(clonedPath, projectName, logger);
            dockerStatus = 'SUCCESS';
            logger('Docker image built successfully');

            // Step 4: Run
            sseService.broadcast(jobId, { type: 'progress', step: 'run' });
            containerStatus = 'Starting';
            const runResult = await runDockerContainer(imageTag, projectName, logger);
            containerId = runResult.containerId;
            containerPort = runResult.port;
            containerStatus = 'RUNNING';
            logger('Container started');
        } else {
            dockerStatus = 'Skipped (No Dockerfile)';
        }

        const result = {
            repositoryUrl,
            projectName,
            analysis,
            dockerBuildStatus: dockerStatus,
            containerStatus,
            imageTag,
            containerId,
            port: containerPort
        };

        sseService.broadcast(jobId, { type: 'complete', result });
        
        // Wait a small moment to ensure events flush before closing SSE
        setTimeout(() => sseService.close(jobId), 1000);

        return result;

    } catch (error) {
        console.error(`[ERROR] Job ${job.id} failed:`, error);
        sseService.broadcast(job.id, { type: 'error', message: error.message || 'Pipeline failed' });
        setTimeout(() => sseService.close(job.id), 1000);
        throw error;
    } finally {
        if (clonedPath) {
            cleanupWorkspace(clonedPath);
        }
    }
}, { connection });

pipelineWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} has failed with ${err.message}`);
});

pipelineWorker.on('completed', (job, returnvalue) => {
    console.log(`Job ${job.id} has completed successfully`);
});

module.exports = {
    pipelineQueue
};
