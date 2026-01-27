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

  // Authentication Bypass Tests
  test('should not allow admin routes without admin token', async () => {
    const response = await request(app)
      .get('/api/admin')
      .set('Authorization', 'Bearer user-token'); // Non-admin token
    
    expect(response.status).toBe(403);
  });

  // File Upload Security Tests
  test('should reject malicious file uploads', async () => {
    const maliciousFile = Buffer.from('malicious content');
    
    const response = await request(app)
      .post('/api/files/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', maliciousFile, 'malicious.exe');
    
    expect(response.status).toBe(400); // Should reject executable files
  });
});