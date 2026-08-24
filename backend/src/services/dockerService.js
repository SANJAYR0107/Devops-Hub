const { spawn } = require('child_process');

/**
 * Builds a Docker image for the given local path
 * @param {string} localPath 
 * @param {string} projectName 
 * @returns {Promise<string>} Image tag
 */
function buildDockerImage(localPath, projectName) {
    return new Promise((resolve, reject) => {
        const imageTag = `devopshub/${projectName.toLowerCase()}:local`;
        console.log(`[INFO] Building Docker image ${imageTag}...`);

        const dockerBuild = spawn('docker', ['build', '-t', imageTag, '.'], {
            cwd: localPath
        });

        dockerBuild.stdout.on('data', (data) => console.log(data.toString()));
        dockerBuild.stderr.on('data', (data) => console.error(data.toString()));

        dockerBuild.on('close', (code) => {
            if (code === 0) {
                console.log(`[INFO] Docker image built successfully: ${imageTag}`);
                resolve(imageTag);
            } else {
                reject(new Error(`Docker build failed`));
            }
        });
    });
}

/**
 * Runs a Docker container from the built image
 * @param {string} imageTag 
 * @param {string} projectName 
 * @returns {Promise<string>} Container ID
 */
function runDockerContainer(imageTag, projectName) {
    return new Promise((resolve, reject) => {
        const containerName = `devopshub-container-${projectName.toLowerCase()}`;
        console.log(`[INFO] Running Docker container ${containerName}...`);

        // We run in detached mode, mapping port 8080 (assuming standard for now)
        // In the future, port should be dynamically detected.
        const dockerRun = spawn('docker', [
            'run', '-d', 
            '--name', containerName, 
            '-p', '8080:8080', 
            imageTag
        ]);

        dockerRun.on('close', (code) => {
            if (code === 0) {
                console.log(`[INFO] Container started successfully.`);
                resolve(containerName);
            } else {
                reject(new Error(`Container failed to start`));
            }
        });
    });
}

module.exports = { buildDockerImage, runDockerContainer };
