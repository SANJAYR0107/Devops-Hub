const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const WORKSPACE_DIR = path.join(__dirname, '..', '..', '..', 'workspace');

/**
 * Clones a GitHub repository into a temporary workspace directory.
 * @param {string} repositoryUrl 
 * @param {function} logger Optional callback for streaming logs
 * @returns {Promise<string>} - The absolute path to the cloned repository
 */
function cloneRepository(repositoryUrl, logger = console.log) {
    return new Promise((resolve, reject) => {
        // Ensure workspace directory exists
        if (!fs.existsSync(WORKSPACE_DIR)) {
            fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
        }

        // Generate a unique folder name to prevent collisions
        const urlParts = repositoryUrl.split('/');
        const projectName = urlParts[urlParts.length - 1].replace('.git', '');
        const uniqueId = crypto.randomBytes(4).toString('hex');
        const targetPath = path.join(WORKSPACE_DIR, `${projectName}-${uniqueId}`);

        logger(`[INFO] Cloning ${repositoryUrl} into ${targetPath}...`);

        const gitProcess = spawn('git', ['clone', repositoryUrl, targetPath]);

        let stdoutData = '';
        let stderrData = '';

        gitProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdoutData += chunk;
            logger(chunk.trim());
        });

        gitProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderrData += chunk;
            logger(chunk.trim());
        });

        gitProcess.on('close', (code) => {
            if (code === 0) {
                logger(`[INFO] Successfully cloned ${projectName}`);
                resolve(targetPath);
            } else {
                logger(`[ERROR] Git clone failed. Exit code: ${code}`);
                reject(new Error(`Repository clone failed`));
            }
        });

        gitProcess.on('error', (err) => {
            logger(`[ERROR] Failed to start git process: ${err.message}`);
            reject(err);
        });
    });
}

/**
 * Cleans up a workspace directory
 * @param {string} dirPath 
 */
function cleanupWorkspace(dirPath) {
    try {
        if (fs.existsSync(dirPath) && dirPath.includes('workspace')) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`[INFO] Cleaned up workspace: ${dirPath}`);
        }
    } catch (error) {
        console.error(`[ERROR] Failed to cleanup workspace: ${dirPath}`, error);
    }
}

module.exports = {
    cloneRepository,
    cleanupWorkspace
};
