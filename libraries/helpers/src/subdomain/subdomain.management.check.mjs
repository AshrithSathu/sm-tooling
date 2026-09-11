import assert from 'node:assert/strict';
import { getCookieUrlFromDomain } from './subdomain.management.ts';
assert.equal(getCookieUrlFromDomain('https://postiz-app-production-7abe.up.railway.app'), 'postiz-app-production-7abe.up.railway.app');
assert.equal(getCookieUrlFromDomain('https://app.example.com'), 'app.example.com');
assert.equal(getCookieUrlFromDomain('http://localhost:5000'), 'localhost');
console.log('Cookie domains pass for Railway, custom domains, and localhost.');
