const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const envVars = {};
for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
        const firstEqualsIndex = line.indexOf('=');
        if (firstEqualsIndex > 0) {
            const key = line.substring(0, firstEqualsIndex).trim();
            const value = line.substring(firstEqualsIndex + 1).trim();
            // Remove wrapping quotes if present
            const unquotedValue = value.replace(/^['"](.*)['"]$/, '$1');
            envVars[key] = unquotedValue;
        }
    }
}

// Environments to push the secrets to
const environments = ['production', 'preview', 'development'];

const { spawnSync } = require('child_process');

for (const [key, value] of Object.entries(envVars)) {
    // Process string to convert literal \n to actual newlines if present
    const actualValue = value.replace(/\\n/g, '\n');

    for (const env of environments) {
        try {
            console.log(`Pushing ${key} to ${env}...`);
            const childResult = spawnSync(`vercel`, ['env', 'add', key, env], {
                input: actualValue,
                encoding: 'utf-8',
                shell: true
            });
            
            if (childResult.status === 0) {
                console.log(`Successfully added ${key} to ${env}.`);
            } else {
                console.log(`Failed or already exists ${key} in ${env}: ${childResult.stderr || childResult.stdout}`);
            }
        } catch (error) {
            console.error(`Error adding ${key} to ${env}:`, error.message);
        }
    }
}

console.log('All secrets pushed to Vercel! Now run `vercel --prod` to re-deploy with these variables.');
