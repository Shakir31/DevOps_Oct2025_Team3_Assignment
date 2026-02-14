const request = require('supertest');
const app = require('../app');

describe('Security Tests', () => {
  // SQL Injection Tests
  test('should prevent SQL injection in user queries', async () => {
    const maliciousInput = "admin' OR '1'='1";
    
    const response = await request(app)
      .get('/api/users')
      .query({ search: maliciousInput })
      .set('Authorization', 'Bearer valid-token');
    
    // Should not return all users even with SQL injection attempt
    expect(response.status).not.toBe(200);
  });

  // XSS Tests
  test('should sanitize XSS inputs', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/users')
      .send({
        username: xssPayload,
        email: 'test@example.com',
        password: 'password123'
      })
      .set('Authorization', 'Bearer valid-token');
    
    // Response should not contain raw script tags
    expect(JSON.stringify(response.body)).not.toContain('<script>');
  });

  test('should not allow admin routes without admin token', async () => {
    const response = await request(app)
      .get('/admin')
      .set('Authorization', 'Bearer user-token');
    
    expect([401, 403]).toContain(response.status);
  });

  test('should reject malicious file uploads', async () => {
    const maliciousFile = Buffer.from('malicious content');
    
    const response = await request(app)
      .post('/dashboard/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', maliciousFile, 'malicious.exe');
    
    expect([400, 401, 403]).toContain(response.status);
  });
});