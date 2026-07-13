const testAPIFlow = async () => {
  const API_URL = 'http://localhost:5000/api';
  
  console.log('--- Starting API Flow Test ---');

  // 1. Create Client User
  const clientRes = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Client Test', email: `client_${Date.now()}@test.com`, password: 'pw', role: 'client' })
  });
  const clientData = await clientRes.json();
  const clientToken = clientData.token;

  // 2. Create Freelancer User
  const freelancerRes = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Freelancer Test', email: `free_${Date.now()}@test.com`, password: 'pw', role: 'freelancer' })
  });
  const freelancerData = await freelancerRes.json();
  const freelancerToken = freelancerData.token;

  // 3. Freelancer Creates a Service
  const serviceRes = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${freelancerToken}` },
    body: JSON.stringify({
      title: 'Web Dev', description: 'I will build a site', category: 'Programming', price: 100, deliveryTime: '3 days'
    })
  });
  console.log('Service Creation Status:', serviceRes.status);
  
  // 4. Client Creates a Job
  const jobRes = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` },
    body: JSON.stringify({
      title: 'Need a logo', description: 'Design a cool logo', category: 'Design', budgetMin: 50, budgetMax: 150, deadline: new Date()
    })
  });
  const jobData = await jobRes.json();
  console.log('Job Creation Status:', jobRes.status);
  const jobId = jobData._id;

  // 5. Freelancer Bids on the Job
  const bid1Res = await fetch(`${API_URL}/jobs/${jobId}/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${freelancerToken}` },
    body: JSON.stringify({ quoteAmount: 100, deliveryTime: '2 days', coverMessage: 'I can do this' })
  });
  const bid1Data = await bid1Res.json();
  console.log('Bid Creation Status:', bid1Res.status);
  const bidId = bid1Data._id;

  // 6. Another Freelancer Bids on the Job
  const freelancer2Res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Freelancer 2', email: `free2_${Date.now()}@test.com`, password: 'pw', role: 'freelancer' })
  });
  const freelancer2Token = (await freelancer2Res.json()).token;

  const bid2Res = await fetch(`${API_URL}/jobs/${jobId}/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${freelancer2Token}` },
    body: JSON.stringify({ quoteAmount: 80, deliveryTime: '1 day', coverMessage: 'I can do it faster' })
  });
  const bid2Data = await bid2Res.json();
  const bid2Id = bid2Data._id;

  // 7. Client Accepts Bid 1
  const acceptRes = await fetch(`${API_URL}/bids/${bidId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` },
    body: JSON.stringify({ status: 'accepted' })
  });
  console.log('Bid Accept Status:', acceptRes.status);

  // 8. Verify Job Status is "in-progress"
  const jobVerifyRes = await fetch(`${API_URL}/jobs/${jobId}`);
  const jobVerifyData = await jobVerifyRes.json();
  console.log('Job Status after accept:', jobVerifyData.status);

  // 9. Verify Bid 2 Status is "rejected"
  const bidsVerifyRes = await fetch(`${API_URL}/jobs/${jobId}/bids`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  const bidsVerifyData = await bidsVerifyRes.json();
  
  const bid2Verified = bidsVerifyData.find(b => b._id === bid2Id);
  console.log('Bid 2 Status after Bid 1 accepted:', bid2Verified.status);

  console.log('\n--- API Flow Test Complete ---');
};

testAPIFlow();
