import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js'; // Ensure this matches the export in index.ts

describe('API Health Check', () => {
    it('GET / should return 200 OK', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('FETMS Backend Running');
    });
});
