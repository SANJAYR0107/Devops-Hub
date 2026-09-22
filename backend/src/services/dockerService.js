const { spawn } = require('child_process');
const net = require('net');

function getFreePort() {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.listen(0, () => {
            const port = srv.address().port;
            srv.close((err) => {
                if (err) reject(err);
                else resolve(port);
            });
        });
        srv.on('error', reject);
    });
}

/**
 * Builds a Docker image for the given local path
 * @param {string} localPath 
 * @param {string} projectName 
 * @param {function} logger Optional callback for streaming logs
 * @returns {Promise<string>} Image tag
 */
function buildDockerImage(localPath, projectName, logger = console.log) {
    return new Promise((resolve, reject) => {
        const imageTag = `devopshub/${projectName.toLowerCase()}:local`;
        logger(`[INFO] Building Docker image ${imageTag}...`);

        const dockerBuild = spawn('docker', ['build', '-t', imageTag, '.'], {
            cwd: localPath
        });

        dockerBuild.stdout.on('data', (data) => logger(data.toString().trim()));
        dockerBuild.stderr.on('data', (data) => logger(data.toString().trim()));

        dockerBuild.on('close', (code) => {
            if (code === 0) {
                logger(`[INFO] Docker image built successfully: ${imageTag}`);
                resolve(imageTag);
            } else {
                logger(`[ERROR] Docker build failed with code ${code}`);
                reject(new Error(`Docker build failed`));
            }
        });
    });
}

/**
 * Runs a Docker container from the built image
 * @param {string} imageTag 
 * @param {string} projectName 
 * @param {function} logger Optional callback for streaming logs
 * @returns {Promise<object>} Object containing container ID and mapped port
 */
async function runDockerContainer(imageTag, projectName, logger = console.log) {
    const freePort = await getFreePort();
    return new Promise((resolve, reject) => {
        const containerName = `devopshub-container-${projectName.toLowerCase()}-${Date.now()}`;
        logger(`[INFO] Running Docker container ${containerName} on port ${freePort}...`);

        // We run in detached mode, mapping port 8080 (assuming standard for now)
        // to the dynamically assigned host port.
        const dockerRun = spawn('docker', [
            'run', '-d', 
            '--name', containerName, 
            '-p', `${freePort}:8080`, 
            imageTag
        ]);

        dockerRun.stdout.on('data', (data) => logger(data.toString().trim()));
        dockerRun.stderr.on('data', (data) => logger(data.toString().trim()));

        dockerRun.on('close', (code) => {
            if (code === 0) {
                logger(`[INFO] Container started successfully.`);
                resolve({ containerId: containerName, port: freePort });
            } else {
                logger(`[ERROR] Container failed to start with code ${code}`);
                reject(new Error(`Container failed to start`));
            }
        });
    });
}

module.exports = { buildDockerImage, runDockerContainer };
