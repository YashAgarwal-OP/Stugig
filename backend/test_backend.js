const assert = require('assert');

// 1. Setup environment variables for testing
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://localhost:27017/stugig_test';

// 2. Mock Mongoose connection & connection methods
const mongoose = require('mongoose');
mongoose.connect = async () => console.log('[Mock] MongoDB connected');
mongoose.connection = { host: 'mock-localhost' };

// 3. Mock Models to prevent database errors and stub database operations
const User = require('./models/User');
const Job = require('./models/Job');
const Bid = require('./models/Bid');
const Payment = require('./models/Payment');

// Mock User Database
const mockUsers = [
  {
    _id: 'user_client_id_1',
    name: 'Client Alice',
    email: 'alice@student.edu',
    password: 'hashed_password_123', // bcrypt compare mock will check this
    role: 'client',
    rating: 4.8
  },
  {
    _id: 'user_freelancer_id_2',
    name: 'Freelancer Bob',
    email: 'bob@student.edu',
    password: 'hashed_password_456',
    role: 'freelancer',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB'],
    rating: 4.9
  }
];

// Mock Jobs Database
const mockJobs = [
  {
    _id: 'job_id_1',
    client: 'user_client_id_1',
    title: 'Build Express REST API',
    description: 'We need an API backend with Mongoose schemas and controllers.',
    budget: 150,
    deadline: new Date(),
    category: 'Backend Development',
    status: 'open',
    save: async function() { return this; }
  }
];

// Mock Bids Database
const mockBids = [
  {
    _id: 'bid_id_1',
    job: 'job_id_1',
    freelancer: 'user_freelancer_id_2',
    quote: 120,
    eta: '3 days',
    message: 'I have built multiple Express apps and can start immediately.',
    status: 'pending'
  }
];

// Stub User operations
User.findOne = (query) => {
  const user = mockUsers.find(u => u.email === query.email) || null;
  const queryObj = {
    select: function() { return this; },
    then: function(resolve, reject) {
      resolve(user);
    }
  };
  return queryObj;
};
User.findById = async (id) => mockUsers.find(u => u._id === id.toString()) || null;
User.create = async (data) => ({ _id: `user_new_${Date.now()}`, ...data });

// Stub Job operations
Job.create = async (data) => ({ _id: `job_new_${Date.now()}`, ...data });
Job.find = () => ({
  populate: () => ({
    sort: () => mockJobs.filter(j => j.status === 'open')
  })
});
Job.findById = async (id) => mockJobs.find(j => j._id === id.toString()) || null;

// Stub Bid operations
Bid.create = async (data) => ({ _id: `bid_new_${Date.now()}`, ...data });
Bid.findById = async (id) => mockBids.find(b => b._id === id.toString()) || null;

// Stub Payment operations
Payment.create = async (data) => ({ _id: `pay_new_${Date.now()}`, ...data });

// Mock Bcrypt to bypass actual hashing/salting in tests
const bcrypt = require('bcryptjs');
bcrypt.genSalt = async () => 'mock_salt';
bcrypt.hash = async (pwd) => `hashed_${pwd}`;
bcrypt.compare = async (pwd, hashed) => hashed === `hashed_${pwd}` || hashed === pwd;

// 4. Create Mock Express Response builder
const makeMockResponse = () => {
  const res = {
    statusCode: 200,
    jsonPayload: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(payload) {
      this.jsonPayload = payload;
      return this;
    }
  };
  return res;
};

// 5. Test Suite
async function runTests() {
  console.log('--- STARTING STUGIG BACKEND CONTROLLER TESTS ---');
  let testCount = 0;
  let passCount = 0;

  const test = async (name, fn) => {
    testCount++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(error);
    }
  };

  const authController = require('./controllers/authController');
  const jobController = require('./controllers/jobController');
  const bidController = require('./controllers/bidController');
  const paymentController = require('./controllers/paymentController');
  const aiController = require('./controllers/aiController');

  // --- Auth Signup Test ---
  await test('User Signup - Creates account and signs token', async () => {
    const req = {
      body: {
        name: 'Charlie Smith',
        email: 'charlie@student.edu',
        password: 'securePassword123',
        role: 'freelancer',
        skills: ['Python', 'SQL']
      }
    };
    const res = makeMockResponse();
    await authController.signup(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.ok(res.jsonPayload.token);
    assert.strictEqual(res.jsonPayload.user.name, 'Charlie Smith');
    assert.strictEqual(res.jsonPayload.user.role, 'freelancer');
  });

  // --- Auth Login Test ---
  await test('User Login - Authenticates successfully with valid credentials', async () => {
    const req = {
      body: {
        email: 'alice@student.edu',
        password: 'hashed_password_123' // Matches our mock compare stub
      }
    };
    const res = makeMockResponse();
    await authController.login(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.ok(res.jsonPayload.token);
    assert.strictEqual(res.jsonPayload.user.role, 'client');
  });

  // --- Job Creation Test ---
  await test('Job Creation - Adds new job for Client', async () => {
    const req = {
      user: { id: 'user_client_id_1' },
      body: {
        title: 'Need React Dashboard',
        description: 'Create a modern React UI using Outfit font.',
        budget: 200,
        deadline: '2026-08-01T12:00:00.000Z',
        category: 'Frontend Development'
      }
    };
    const res = makeMockResponse();
    await jobController.createJob(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.strictEqual(res.jsonPayload.data.title, 'Need React Dashboard');
    assert.strictEqual(res.jsonPayload.data.client, 'user_client_id_1');
  });

  // --- Job Retrieval Test ---
  await test('Job Retrieval - Fetches list of open jobs', async () => {
    const req = {};
    const res = makeMockResponse();
    await jobController.getJobs(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.ok(res.jsonPayload.data.length > 0);
  });

  // --- Bidding Test ---
  await test('Bidding - Submits bid for Freelancer on valid job', async () => {
    const req = {
      params: { id: 'job_id_1' },
      user: { id: 'user_freelancer_id_2' },
      body: {
        quote: 130,
        eta: '4 days',
        message: 'I can style it using HSL custom tailwind configurations.'
      }
    };
    const res = makeMockResponse();
    await bidController.createBid(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.strictEqual(res.jsonPayload.data.quote, 130);
    assert.strictEqual(res.jsonPayload.data.freelancer, 'user_freelancer_id_2');
  });

  // --- Payment Commission calculation Test ---
  await test('Stripe Payment Checkout - Computes 15% platform commission correctly', async () => {
    const req = {
      user: { id: 'user_client_id_1' }, // Matches job.client ownership
      body: {
        jobId: 'job_id_1',
        bidId: 'bid_id_1'
      }
    };
    const res = makeMockResponse();
    await paymentController.checkout(req, res);

    // Bid quote is 120.
    // 15% platform fee = 120 * 0.15 = 18.00
    // 85% freelancer payout = 120 * 0.85 = 102.00
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.ok(res.jsonPayload.stripeSessionId);
    assert.strictEqual(res.jsonPayload.paymentDetails.grossAmount, 120);
    assert.strictEqual(res.jsonPayload.paymentDetails.commissionAmount, 18.00);
    assert.strictEqual(res.jsonPayload.paymentDetails.netAmount, 102.00);
    assert.strictEqual(res.jsonPayload.paymentDetails.status, 'pending');
  });

  // --- Payment Authorization ownership check Test ---
  await test('Stripe Payment Checkout - Prevents unauthorized client from paying', async () => {
    const req = {
      user: { id: 'unauthorized_client_id' },
      body: {
        jobId: 'job_id_1',
        bidId: 'bid_id_1'
      }
    };
    const res = makeMockResponse();
    await paymentController.checkout(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.jsonPayload.success, false);
    assert.ok(res.jsonPayload.error.includes('Only the client who posted'));
  });

  // --- AI Matchmaker Fallback Test ---
  await test('AI Matchmaker - Computes compatibility match score fallback without API key', async () => {
    const req = {
      body: {
        freelancerId: 'user_freelancer_id_2',
        jobId: 'job_id_1'
      }
    };
    const res = makeMockResponse();
    await aiController.matchmaker(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonPayload.success, true);
    assert.ok(res.jsonPayload.data.compatibilityScore >= 60 && res.jsonPayload.data.compatibilityScore <= 100);
    assert.ok(res.jsonPayload.data.reason.includes('[Mock]'));
  });

  console.log(`\n--- TEST RUN SUMMARY: Passed ${passCount}/${testCount} tests ---`);
  if (passCount !== testCount) {
    process.exit(1);
  }
}

runTests().catch(console.error);
