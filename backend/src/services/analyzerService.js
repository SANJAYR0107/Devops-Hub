const fs = require('fs');
const path = require('path');

/**
 * Analyzes the cloned repository for technologies and Dockerfile.
 * @param {string} localPath 
 * @returns {object} Analysis result
 */
function analyzeRepository(localPath) {
    console.log(`[INFO] Analyzing repository at ${localPath}...`);

    const result = {
        technology: 'Unknown',
        projectType: 'Unknown',
        dockerfileExists: false
    };

    try {
        const files = fs.readdirSync(localPath);

        // Check for Dockerfile
        if (files.includes('Dockerfile')) {
            result.dockerfileExists = true;
        }

        // Detect Technology
        if (files.includes('package.json')) {
            result.technology = 'Node.js';
            result.projectType = 'Web Application';
            
            const packageJson = JSON.parse(fs.readFileSync(path.join(localPath, 'package.json'), 'utf-8'));
            if (packageJson.dependencies && packageJson.dependencies.react) {
                result.technology = 'React';
                result.projectType = 'Frontend Web Application';
            }
        } else if (files.includes('requirements.txt')) {
            result.technology = 'Python';
            result.projectType = 'ML / Backend Application';
        } else if (files.includes('pom.xml')) {
            result.technology = 'Java Maven';
            result.projectType = 'Backend Application';
        } else if (files.includes('build.gradle')) {
            result.technology = 'Java Gradle';
            result.projectType = 'Backend Application';
        }

        if (result.technology === 'Unknown' && !result.dockerfileExists) {
            throw new Error('Unsupported technology');
        }

        console.log(`[INFO] Analysis complete:`, result);
        return result;

    } catch (error) {
        console.error(`[ERROR] Failed to analyze repository:`, error);
        throw error;
    }
}

module.exports = { analyzeRepository };
