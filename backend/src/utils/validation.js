/**
 * Validates if the given URL is a valid GitHub repository URL.
 * It strictly expects: https://github.com/<username>/<repository>
 * @param {string} url - The URL to validate
 * @returns {boolean}
 */
function isValidGithubUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname !== 'github.com') return false;
        
        // Path should be /<username>/<repository>
        // It can optionally end with .git
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length !== 2) return false;

        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    isValidGithubUrl
};
