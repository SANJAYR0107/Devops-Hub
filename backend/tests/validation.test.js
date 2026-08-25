const test = require('node:test');
const assert = require('node:assert');
const { isValidGithubUrl } = require('../src/utils/validation');

test('GitHub URL validation', async (t) => {
    await t.test('Valid GitHub URL should pass', () => {
        assert.strictEqual(isValidGithubUrl('https://github.com/user/project'), true);
        assert.strictEqual(isValidGithubUrl('https://github.com/user/project.git'), true);
    });

    await t.test('Invalid GitHub URL should be rejected', () => {
        assert.strictEqual(isValidGithubUrl('https://example.com/project'), false);
        assert.strictEqual(isValidGithubUrl('http://github.com/user'), false); // Needs repo
        assert.strictEqual(isValidGithubUrl('invalid-url'), false);
        assert.strictEqual(isValidGithubUrl(null), false);
    });
});
