const fs = require('fs');
const path = require('path');
const http = require('http');

async function runPhase1Verification() {
  console.log('🧪 Starting ALTER Phase 1 Automated End-to-End Verification...');

  const BASE_URL = 'http://localhost:5000/api';

  // Helper fetch function using built-in node fetch
  async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = {};
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    return { status: res.status, data: json };
  }

  // 1. Health Check
  console.log('\n1️⃣ Checking Server Health...');
  const health = await apiCall('/health');
  console.log('Status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. User Registration
  console.log('\n2️⃣ Testing User Registration...');
  const testEmail = `student_${Date.now()}@alter.edu`;
  const regPayload = {
    email: testEmail,
    password: 'securePassword123!',
    name: 'Alex Vance',
    targetRole: 'AI Systems Architect',
    degreeName: 'B.Tech in Computer Science & AI',
    currentSemester: 4,
    gpa: 3.9,
  };

  const regRes = await apiCall('/auth/register', 'POST', regPayload);
  console.log('Register Response:', regRes.status, regRes.data.message);
  if (regRes.status !== 201 || !regRes.data.token) throw new Error('Registration failed');
  const token = regRes.data.token;

  // 3. User Login
  console.log('\n3️⃣ Testing User Login...');
  const loginRes = await apiCall('/auth/login', 'POST', {
    email: testEmail,
    password: 'securePassword123!',
  });
  console.log('Login Response:', loginRes.status, loginRes.data.message);
  if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Login failed');

  // 4. Fetch Profile
  console.log('\n4️⃣ Testing Fetch Profile...');
  const profileRes = await apiCall('/user/profile', 'GET', null, token);
  console.log('Profile User:', profileRes.data.user.name, '| Degree:', profileRes.data.user.degreeName);
  if (profileRes.status !== 200) throw new Error('Profile fetch failed');

  // 5. Test Sample Syllabus Document Upload
  console.log('\n5️⃣ Testing Document Ingestion Pipeline...');
  const sampleSyllabusPath = path.join(__dirname, 'sample_syllabus.txt');
  const sampleSyllabusContent = `
Course Code: CS402 - Distributed Systems & Cloud Computing
Module 1: Principles of Distributed Architectures, RPCs, and Fault Tolerance.
Overview of consensus algorithms including Raft and Paxos, distributed transaction commit protocols (2PC/3PC).
Module 2: Scalable Storage and Key-Value Systems.
Consistent hashing, Dynamo architecture, replication models, vector clocks, and eventual consistency.
Module 3: Large-scale Stream Processing and Microservices.
Kafka message queues, event sourcing, CQRS, Docker containerization, Kubernetes orchestration, and gRPC communication.
Module 4: Security, Access Control & Resilient System Design.
OAuth2, Zero Trust networking, MTLS, distributed tracing with OpenTelemetry, rate limiting, and circuit breakers.
`;
  fs.writeFileSync(sampleSyllabusPath, sampleSyllabusContent, 'utf-8');

  // Create multipart boundary upload
  const fileData = fs.readFileSync(sampleSyllabusPath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const bodyBuffer = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="fileType"\r\n\r\nSYLLABUS\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="CS402_Distributed_Systems.txt"\r\nContent-Type: text/plain\r\n\r\n`
    ),
    fileData,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyBuffer,
  });

  const uploadJson = await uploadRes.json();
  console.log('Upload Response:', uploadRes.status, uploadJson);
  if (uploadRes.status !== 202) throw new Error('Upload failed');
  const docId = uploadJson.document.id;

  // Wait 1.5 seconds for background chunking & embedding generation
  console.log('⏳ Waiting for background ingestion & chunking to complete...');
  await new Promise((r) => setTimeout(r, 1500));

  // 6. List Documents
  console.log('\n6️⃣ Testing GET /api/documents...');
  const docsList = await apiCall('/documents', 'GET', null, token);
  console.log('Documents List:', docsList.data.documents.length, 'documents found');
  const uploadedDoc = docsList.data.documents.find((d) => d.id === docId);
  console.log('Uploaded Doc Status:', uploadedDoc?.status, '| Chunk Count:', uploadedDoc?.chunkCount);
  if (!uploadedDoc || uploadedDoc.chunkCount === 0) throw new Error('Chunks were not generated');

  // 7. Get Document Details & Chunks
  console.log('\n7️⃣ Testing GET /api/documents/:id...');
  const docDetails = await apiCall(`/documents/${docId}`, 'GET', null, token);
  console.log('Doc Details Chunks:', docDetails.data.document.chunks.length);
  console.log('Sample Chunk Preview:', docDetails.data.document.chunks[0]?.content.slice(0, 80) + '...');

  console.log('\n🎉 ALL PHASE 1 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! ✅\n');
}

runPhase1Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
