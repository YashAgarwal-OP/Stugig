const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Job = require('../models/Job');
  const User = require('../models/User');
  const Message = require('../models/Message');

  const allJobs = await Job.find({}).lean();
  console.log('All jobs:');
  allJobs.forEach(j => console.log(' -', j._id, '|', j.title, '|', j.status, '| client:', j.clientId));

  const allUsers = await User.find({}, 'name email role').lean();
  console.log('\nAll users:');
  allUsers.forEach(u => console.log(' -', u._id, '|', u.name, '|', u.email, '|', u.role));

  const allMsgs = await Message.find({}).lean();
  console.log('\nAll messages:', allMsgs.length);

  mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });
