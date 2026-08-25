const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { analyzeRepository } = require('../src/services/analyzerService');

test('Analyzer Service', async (t) => {
    let tempDir;

    t.beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devops-hub-test-'));
    });

    t.afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    await t.test('Detect Node.js project', () => {
        fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.technology, 'Node.js');
    });

    await t.test('Detect React project', () => {
        fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ dependencies: { react: '^18.0.0' } }));
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.technology, 'React');
    });

    await t.test('Detect Python project', () => {
        fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'flask');
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.technology, 'Python');
    });

    await t.test('Detect Java Maven project', () => {
        fs.writeFileSync(path.join(tempDir, 'pom.xml'), '<project></project>');
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.technology, 'Java Maven');
    });

    await t.test('Detect Java Gradle project', () => {
        fs.writeFileSync(path.join(tempDir, 'build.gradle'), '');
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.technology, 'Java Gradle');
    });

    await t.test('Detect Dockerfile presence', () => {
        fs.writeFileSync(path.join(tempDir, 'Dockerfile'), 'FROM ubuntu');
        const result = analyzeRepository(tempDir);
        assert.strictEqual(result.dockerfileExists, true);
        assert.strictEqual(result.technology, 'Unknown');
    });

    await t.test('Unsupported technology throws error', () => {
        assert.throws(() => {
            analyzeRepository(tempDir); // Empty directory
        }, /Unsupported technology/);
    });
});
