const http = require('http');

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data,
                });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testAuthFlow() {
    console.log('Starting auth flow test...\n');

    // Test registration
    console.log('1. Registering new test user...');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
        username: 'freshtest',
        email: 'fresh@test.com',
        password: 'testpass123',
        name: 'Fresh Test User',
    });
    console.log(`   Status: ${registerRes.statusCode}`);
    console.log(`   Response: ${registerRes.body}\n`);

    // Test login
    console.log('2. Logging in with the same credentials...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
        email: 'fresh@test.com',
        password: 'testpass123',
    });
    console.log(`   Status: ${loginRes.statusCode}`);
    console.log(`   Response: ${loginRes.body}\n`);

    // Test login with wrong password
    console.log('3. Testing login with wrong password...');
    const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
        email: 'fresh@test.com',
        password: 'wrongpassword',
    });
    console.log(`   Status: ${wrongPassRes.statusCode}`);
    console.log(`   Response: ${wrongPassRes.body}\n`);
}

testAuthFlow().catch(console.error);
