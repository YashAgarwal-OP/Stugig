const testAuthFlow = async () => {
  const API_URL = 'http://localhost:5000/api/auth';
  
  console.log('--- Starting Auth Flow Test ---');

  // 1. Signup
  console.log('\n1. Testing POST /signup (Client Role)...');
  const signupRes = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Client',
      email: `client${Date.now()}@test.com`,
      password: 'password123',
      role: 'client'
    })
  });
  
  const signupData = await signupRes.json();
  console.log('Signup Status:', signupRes.status);
  console.log('Signup Response:', signupData);
  
  if (!signupData.token) {
    console.error('Failed to get token on signup. Exiting.');
    return;
  }

  const token = signupData.token;
  const email = signupData.email;

  // 2. Login
  console.log('\n2. Testing POST /login...');
  const loginRes = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'password123'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginData);

  // 3. Protected Route (GET /me)
  console.log('\n3. Testing GET /me (Protected)...');
  const meRes = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  
  const meData = await meRes.json();
  console.log('GetMe Status:', meRes.status);
  console.log('GetMe Response:', meData);

  // 4. Role-Guard Protected Route (GET /client-only)
  console.log('\n4. Testing GET /client-only (Role-Protected)...');
  const roleRes = await fetch(`${API_URL}/client-only`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  
  const roleData = await roleRes.json();
  console.log('RoleGuard Status:', roleRes.status);
  console.log('RoleGuard Response:', roleData);
  
  console.log('\n--- Auth Flow Test Complete ---');
};

testAuthFlow();
