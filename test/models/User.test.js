require('dotenv').config();
require('../../lib/utils/connect')();
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const User = require('../../lib/models/User');
const { tokenize } = require('../../lib/utils/token');

describe('user model', () => {
  beforeEach(done => {
    mongoose.connection.dropDatabase(done);
  });

  afterAll((done) => {
    mongoose.connection.close(done);
  });
  
  it('validates a good model', () => {
    const user = new User({ email: 'test@test.com' });
    expect(user.toJSON()).toEqual({ 
      email: 'test@test.com',
      _id: expect.any(Types.ObjectId) 
    });
  });

  it('has a require email', () => {
    const user = new User({});
    const errors = user.validateSync().errors;
    expect(errors.email.message).toEqual('Email required');
  });

  it('stores a _tempPassword', () => {
    const user = new User({ email: 'test@test.com', password: 'password123' });
    expect(user._tempPassword).toEqual('password123');
  });

  it('can save password hash', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password123'
    })
      .then(user => {
        expect(user.passwordHash).toEqual(expect.any(String));
        expect(user.password).toBeUndefined();
      });
  });

  it('can compare passwords', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password123'
    })
      .then(user => {
        return user.compare('password123');
      })
      .then(result => {
        expect(result).toBeTruthy();
      });
  });

  it('can find a user by token', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password123'
    })
      .then(user => {
        return tokenize(user);
      })
      .then(token => {
        return User.findByToken(token);
      })
      .then(userFromToken => {
        expect(userFromToken).toEqual({ 
          email: 'test@test.com', 
          _id: expect.any(String),
        });
      });
  });

  it('can create an auth token', () => {
    return User.create({
      email: 'test@test.com',
      password: 'password123'
    })
      .then(user => user.authToken())
      .then(token => {
        expect(token).toEqual(expect.any(String));
        
      });
  });
});
