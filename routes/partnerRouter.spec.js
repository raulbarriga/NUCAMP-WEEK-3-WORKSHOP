const supertest = require('supertest');
const router = require('./partnerRouter.js');

describe('partner router', () => {
    describe('GET request to /', () => {
        it('responds with 200 OK', () => {
            supertest(router)
                .get('/')
                .expect(200);
        });
        it('is JSON content', () => {
            supertest(router)
                .get('/')
                .expect('Content-Type', /json/i)
        })
        it('should return a specific object from id', () => {
            supertest(router)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /json/i);
        });
        it('should return status 404 if id does not exist', () => {
            supertest(router)
                .get('/40')
                .expect(404)
                .expect('Content-Type', /json/i);
        });
    });
    describe('POST request to /', () => {
        it('should respond with 200 ok', () => {
            const data = {
                "name": "mylynh",
                "image": "mylynh.png",
                "featured": true,
                "description": "Nucamp Instructor"
            }

            supertest(router)
                .post('/')
                .send(data)
                .expect(200)
                .expect('Content-Type', /json/i);
        });
        it('should respond with 400 not created', () => {
            const data = {
                "image": "mylynh.png",
                "featured": true,
                "description": "Nucamp Instructor"
            }
            
            supertest(router)
                .post('/')
                .send(data)
                .expect(400)
                .expect('Content-Type', /json/i);
        });
    });
    describe('PUT request to /:id', () => {
        it('should respond with 200 with updated changes', () => {
            const data = {
                "name": "My",
            }
            supertest(router)
                .put('/1')
                .send(data)
                .expect(200)
                .expect('Content-Type', /json/i);
        });
        it('should respond with 404 not found with non-existent id', () => {
            supertest(router)
                .put('/60')
                .expect(404)
                .expect('Content-Type', /json/i);
        });
    });
    describe('DELETE request to /:id', () => {
        it('should respond with 200 on success', () => {
            supertest(router)
                .delete('/1')
                .expect(200)
        });
        it('should respond with 404 not found with non-existent id', () => {
            supertest(router)
                .delete('/70')
                .expect(404)
        });
    });
});