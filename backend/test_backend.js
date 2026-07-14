/**
 * test_backend.js — StuGig Backend Controller Unit Tests
 *
 * Runs entirely in-process with mocked Mongoose models and bcrypt.
 * No real DB connection is needed. Run with: node test_backend.js
 */

'use strict';
const assert = require('assert');

// ── Environment ───────────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test_jwt_secret_for_stugig_2026';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://localhost:27017/stugig_test';

// ── Mock Mongoose ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
mongoose.connect = async () => {};
mongoose.connection = { host: 'mock-localhost' };

// ── Seed data ─────────────────────────────────────────────────────────────────
const mockUsers = [
  {
    _id: 'uid_client_1',
    name: 'Alice Client',
    email: 'alice@uni.edu',
    password: 'hashed_Password1',
    role: 'client',
    status: 'active',
    skills: [],
    rating: 4.8,
    tagline: 'Entrepreneur',
    bio: '',
    phone: '',
    location: '',
    profilePhotoUrl: '',
    languages: [],
    yearsOfExperience: 0,
    reviewCount: 0,
    createdAt: new Date(),
    save: async function () { return this; }
  },
  {
    _id: 'uid_freelancer_2',
    name: 'Bob Freelancer',
    email: 'bob@uni.edu',
    password: 'hashed_Password2',
    role: 'freelancer',
    status: 'active',
    skills: ['React', 'Node.js', 'MongoDB'],
    rating: 4.9,
    tagline: 'Full-stack dev',
    bio: 'CS student',
    phone: '',
    location: '',
    profilePhotoUrl: '',
    languages: ['English'],
    yearsOfExperience: 2,
    reviewCount: 5,
    createdAt: new Date(),
    save: async function () { return this; }
  }
];

const mockJobs = [
  {
    _id: 'jid_1',
    clientId: 'uid_client_1',
    title: 'Build a React Dashboard',
    description: 'Need a polished React UI with Tailwind CSS.',
    budgetMin: 100,
    budgetMax: 200,
    deadline: new Date('2026-12-01'),
    category: 'Design',
    skillsRequired: ['React', 'Tailwind'],
    status: 'open',
    acceptedBidId: null,
    createdAt: new Date(),
    save: async function () { return this; }
  }
];

const mockBids = [
  {
    _id: 'bid_1',
    jobId: 'jid_1',
    freelancerId: 'uid_freelancer_2',
    quoteAmount: 150,
    deliveryTime: '5 days',
    coverMessage: 'I can build this efficiently.',
    status: 'pending',
    acceptedAt: null,
    save: async function () { return this; }
  }
];

// Helper: make a Mongoose-like query object that supports .populate() chaining
// and resolves to `doc` at the end.
const populatable = (doc) => ({
  populate: function () { return this; },
  then: (resolve, reject) => Promise.resolve(doc).then(resolve, reject),
  // Also allow direct await: makes the mock thenable
  [Symbol.toStringTag]: 'Promise',
});

// ── Mock Models ───────────────────────────────────────────────────────────────
const User = require('./models/User');
User.findOne = (query) => {
  const user = mockUsers.find(u => u.email === query.email) || null;
  // Support both direct await (signup: findOne without .select)
  // and chained .select() (login: findOne(...).select('+password'))
  const result = {
    select: () => Promise.resolve(user),
    then: (resolve, reject) => Promise.resolve(user).then(resolve, reject),
  };
  return result;
};
User.findById = (id) => {
  const user = mockUsers.find(u => u._id === id.toString()) || null;
  return populatable(user);
};
User.create = async (data) => ({
  _id: `uid_new_${Date.now()}`,
  status: 'active',
  skills: [],
  rating: 0,
  reviewCount: 0,
  createdAt: new Date(),
  tagline: '', bio: '', phone: '', location: '', profilePhotoUrl: '',
  languages: [], yearsOfExperience: 0,
  ...data
});
User.findByIdAndUpdate = async (id, update) => {
  const user = mockUsers.find(u => u._id === id.toString());
  return user ? { ...user, ...(update.$set || {}) } : null;
};

const Job = require('./models/Job');
const _jobFindById = (id) => {
  const j = mockJobs.find(j => j._id === id.toString()) || null;
  return populatable(j);
};
Job.findById = _jobFindById;
Job.find = () => ({
  populate: function () { return this; },
  sort:     function () { return this; },
  skip:     function () { return this; },
  limit:    function () { return Promise.resolve(mockJobs); }
});
Job.create = async (data) => {
  const j = { _id: `jid_new_${Date.now()}`, status: 'open', skillsRequired: [], acceptedBidId: null, createdAt: new Date(), ...data };
  // After create, findById must return a populatable version
  Job.findById = (id) => populatable(id.toString() === j._id ? j : mockJobs.find(x => x._id === id.toString()) || null);
  return j;
};
Job.countDocuments = async () => mockJobs.length;

const Bid = require('./models/Bid');
Bid.findById = (id) => {
  const b = mockBids.find(b => b._id === id.toString()) || null;
  return populatable(b);
};
Bid.findOne = async (query) => {
  return mockBids.find(b => b.jobId === query.jobId && b.freelancerId === query.freelancerId) || null;
};
Bid.find = async (query) => {
  return mockBids.filter(b => query.jobId ? b.jobId === query.jobId : b.freelancerId === query.freelancerId);
};
Bid.updateMany = async () => ({ modifiedCount: 0 });
Bid.create = async (data) => {
  const bid = { _id: `bid_new_${Date.now()}`, status: 'pending', acceptedAt: null, createdAt: new Date(), ...data };
  Bid.findById = (id) => populatable(id.toString() === bid._id ? bid : mockBids.find(x => x._id === id.toString()) || null);
  return bid;
};

const Payment = require('./models/Payment');
Payment.create = async (data) => ({
  _id: `pay_new_${Date.now()}`,
  status: 'pending',
  createdAt: new Date(),
  ...data
});
Payment.findOne = async () => null;
Payment.find = () => ({
  populate: function () { return this; },
  sort: () => Promise.resolve([])
}); // no existing pending payment

// ── Mock Notification util ────────────────────────────────────────────────────
jest_mock_notify: {
  const notify = require('./utils/notify');
  // Patch silently so tests don't fail on missing io
}

// ── Mock bcrypt ───────────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');
bcrypt.genSalt = async () => 'mock_salt';
bcrypt.hash = async (pwd) => `hashed_${pwd}`;
bcrypt.compare = async (plain, hashed) =>
  hashed === `hashed_${plain}` || hashed === plain;

// ── Mock response factory ─────────────────────────────────────────────────────
const mockRes = () => {
  const r = { _status: 200, _body: null };
  r.status = (code) => { r._status = code; return r; };
  r.json = (body) => { r._body = body; return r; };
  return r;
};

// Mock req.app.locals for controllers that use io
const mockReq = (overrides = {}) => ({
  app: { locals: { io: null } },
  ...overrides
});

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${label}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════');
  console.log(' StuGig Backend — Controller Unit Tests');
  console.log('══════════════════════════════════════════\n');

  const auth = require('./controllers/authController');
  const jobs = require('./controllers/jobController');
  const bids = require('./controllers/bidController');
  const payments = require('./controllers/paymentController');
  const ai = require('./controllers/aiController');

  // ── Auth ──────────────────────────────────────────────────────────────────
  console.log('── Auth ──────────────────────────────────');

  await test('signup: creates user, returns flat payload with token', async () => {
    const req = mockReq({ body: { name: 'Carol', email: 'carol@uni.edu', password: 'Secret1!', role: 'freelancer', skills: ['Python'] } });
    const res = mockRes();
    await auth.signup(req, res);
    assert.strictEqual(res._status, 201);
    assert.ok(res._body.token, 'token missing');
    assert.strictEqual(res._body.role, 'freelancer');
    assert.strictEqual(res._body.name, 'Carol');
    // Ensure user object is flat (no nested .user property)
    assert.strictEqual(res._body.user, undefined, 'response should be flat, not nested under .user');
  });

  await test('login: authenticates with correct password, returns flat payload', async () => {
    const req = mockReq({ body: { email: 'alice@uni.edu', password: 'Password1' } });
    const res = mockRes();
    await auth.login(req, res);
    assert.strictEqual(res._status, 200);
    assert.ok(res._body.token);
    assert.strictEqual(res._body.role, 'client');
    assert.strictEqual(res._body.user, undefined);
  });

  await test('login: rejects wrong password with 401', async () => {
    const req = mockReq({ body: { email: 'alice@uni.edu', password: 'wrongpass' } });
    const res = mockRes();
    await auth.login(req, res);
    assert.strictEqual(res._status, 401);
  });

  await test('login: blocks suspended account with 403', async () => {
    const suspended = { ...mockUsers[0], status: 'suspended' };
    const origFindOne = User.findOne;
    User.findOne = () => ({ select: () => Promise.resolve(suspended) });
    const req = mockReq({ body: { email: 'alice@uni.edu', password: 'Password1' } });
    const res = mockRes();
    await auth.login(req, res);
    User.findOne = origFindOne;
    assert.strictEqual(res._status, 403);
  });

  // ── Jobs ──────────────────────────────────────────────────────────────────
  console.log('\n── Jobs ──────────────────────────────────');

  await test('createJob: creates job with new field names', async () => {
    const req = mockReq({
      user: { id: 'uid_client_1', role: 'client' },
      body: { title: 'Logo Design', description: 'Need a modern logo.', category: 'Design', budgetMin: 50, budgetMax: 120, deadline: '2026-12-01', skillsRequired: ['Figma'] }
    });
    const res = mockRes();
    await jobs.createJob(req, res);
    assert.strictEqual(res._status, 201);
    assert.strictEqual(res._body.clientId, 'uid_client_1');
    assert.strictEqual(res._body.budgetMin, 50);
    assert.strictEqual(res._body.budgetMax, 120);
    // Restore findById to base mock after test
    Job.findById = _jobFindById;
  });

  await test('getJobs: returns paginated response', async () => {
    Job.find = (query) => ({
      populate: function () { return this; },
      sort: function () { return this; },
      skip: function () { return this; },
      limit: function () { return Promise.resolve(mockJobs); }
    });
    Job.countDocuments = async () => 1;

    const req = mockReq({ query: {} });
    const res = mockRes();
    await jobs.getJobs(req, res);
    assert.strictEqual(res._status, 200);
    assert.ok(Array.isArray(res._body.jobs), 'jobs should be an array');
    assert.strictEqual(res._body.pages, 1);
  });

  // ── Bids ──────────────────────────────────────────────────────────────────
  console.log('\n── Bids ──────────────────────────────────');

  await test('createBid: submits bid with correct field names', async () => {
    Job.findById = (id) => populatable(mockJobs.find(j => j._id === id) || null);
    Bid.findOne = async () => null; // no duplicate

    const req = mockReq({
      params: { id: 'jid_1' },
      user: { id: 'uid_freelancer_2', name: 'Bob Freelancer', role: 'freelancer' },
      body: { quoteAmount: 140, deliveryTime: '4 days', coverMessage: 'Happy to help with this project.' }
    });
    const res = mockRes();
    await bids.createBid(req, res);
    // Restore
    Job.findById = _jobFindById;

    assert.strictEqual(res._status, 201);
    assert.strictEqual(res._body.quoteAmount, 140);
    assert.strictEqual(res._body.deliveryTime, '4 days');
  });

  await test('createBid: prevents bidding on own job', async () => {
    Job.findById = async () => ({ ...mockJobs[0], clientId: 'uid_client_1' });
    const req = mockReq({
      params: { id: 'jid_1' },
      user: { id: 'uid_client_1', role: 'client' },
      body: { quoteAmount: 100, deliveryTime: '3 days', coverMessage: 'Self bid attempt.' }
    });
    const res = mockRes();
    await bids.createBid(req, res);
    assert.strictEqual(res._status, 400);
    assert.match(res._body.message, /cannot bid on your own/i);
  });

  // ── Payments ──────────────────────────────────────────────────────────────
  console.log('\n── Payments ──────────────────────────────');

  await test('createPaymentIntent: computes 15% commission (client pays quote + 15%)', async () => {
    // Job with an acceptedBidId that is an already-populated bid object
    const bidObj = { ...mockBids[0], quoteAmount: 100, freelancerId: 'uid_freelancer_2' };
    const jobObj = { ...mockJobs[0], clientId: 'uid_client_1', acceptedBidId: bidObj };
    Job.findById = (id) => populatable(jobObj);
    Payment.findOne = async () => null;

    const req = mockReq({
      user: { id: 'uid_client_1', role: 'client' },
      body: { jobId: 'jid_1' }
    });
    const res = mockRes();
    await payments.createPaymentIntent(req, res);
    Job.findById = _jobFindById;

    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._body.amount, 100);
    assert.strictEqual(res._body.commissionAmount, 15);
    assert.strictEqual(res._body.totalCharged, 115);
    assert.ok(res._body.paymentId, 'paymentId missing');
  });

  await test('createPaymentIntent: blocks unauthorized client with 403', async () => {
    const jobObj = { ...mockJobs[0], clientId: 'uid_client_1', acceptedBidId: mockBids[0] };
    Job.findById = (id) => populatable(jobObj);
    const req = mockReq({
      user: { id: 'uid_other_client', role: 'client' },
      body: { jobId: 'jid_1' }
    });
    const res = mockRes();
    await payments.createPaymentIntent(req, res);
    Job.findById = _jobFindById;
    assert.strictEqual(res._status, 403);
  });

  await test('getPaymentHistory: returns array (client view)', async () => {
    Payment.find = () => ({
      populate: function () { return this; },
      sort: () => Promise.resolve([])
    });
    const req = mockReq({ user: { id: 'uid_client_1', role: 'client' } });
    const res = mockRes();
    await payments.getPaymentHistory(req, res);
    assert.strictEqual(res._status, 200);
    assert.ok(Array.isArray(res._body));
  });

  // ── AI Matchmaker ─────────────────────────────────────────────────────────
  console.log('\n── AI ────────────────────────────────────');

  await test('matchmaker (legacy): returns mock score 60-100 when no API key set', async () => {
    User.findById = async (id) => mockUsers.find(u => u._id === id) || null;
    Job.findById = async (id) => mockJobs.find(j => j._id === id) || null;
    const req = mockReq({ body: { freelancerId: 'uid_freelancer_2', jobId: 'jid_1' } });
    const res = mockRes();
    await ai.matchmaker(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._body.success, true);
    const score = res._body.data.compatibilityScore;
    assert.ok(score >= 60 && score <= 100, `Score ${score} out of range 60-100`);
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════\n');
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
