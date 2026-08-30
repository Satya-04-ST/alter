const fs = require('fs');
const path = require('path');

async function runPhase2Verification() {
  console.log('🧪 Starting ALTER Phase 2: RAG Pipeline & Multi-Persona Engine Verification...\n');

  const BASE_URL = 'http://localhost:5000/api';

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
  console.log('1️⃣ Checking Backend API Health...');
  const health = await apiCall('/health');
  console.log('Status:', health.status, health.data.platform);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Auth: Register & Login Test User
  console.log('\n2️⃣ Authenticating Phase 2 Test User...');
  const testEmail = `researcher_${Date.now()}@quantum.edu`;
  const regRes = await apiCall('/auth/register', 'POST', {
    email: testEmail,
    password: 'password123!',
    name: 'Elena Rostova',
    targetRole: 'Robotics & Distributed Systems Architect',
    degreeName: 'M.S. in Autonomous Robotics',
    currentSemester: 3,
    gpa: 3.95,
  });
  const token = regRes.data.token;
  console.log('User registered & token acquired:', regRes.data.user.name);

  // 3. Upload Syllabus Document for Grounded RAG Verification
  console.log('\n3️⃣ Ingesting Sample Academic Curriculum Document for Grounding...');
  const sampleContent = `
Course Code: ROB701 - Distributed Autonomous Robotics & Swarm Intelligence
Module 1: Decentralized Consensus and Multi-Agent Coordination.
Leader election, Paxos and Raft protocols adapted for unreliable wireless ad-hoc robotics swarms.
Module 2: Real-time Distributed State Estimation and Sensor Fusion.
Extended Kalman Filters (EKF), particle filters, and distributed SLAM over ROS2 and DDS middleware.
Module 3: Motion Planning & Collision Avoidance in Multi-Robot Systems.
RRT* algorithms, Velocity Obstacles (VO), and Model Predictive Control (MPC) with energy constraints.
Module 4: Fault Tolerance and Safety Verification in Autonomous Systems.
Byzantine fault tolerance in physical actuators, watchdogs, safety invariants, and Formal Methods verification.
`;

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const bodyBuffer = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="fileType"\r\n\r\nSYLLABUS\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="ROB701_Autonomous_Robotics.txt"\r\nContent-Type: text/plain\r\n\r\n`
    ),
    Buffer.from(sampleContent, 'utf-8'),
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
  console.log('Document uploaded:', uploadJson.document.id);

  // Wait 1.5s for ingestion and vectorization
  await new Promise((r) => setTimeout(r, 1500));

  // 4. Test Semantic RAG Grounded Query
  console.log('\n4️⃣ Testing Grounded Semantic RAG Query (POST /api/chat/rag-query)...');
  const ragRes = await apiCall('/chat/rag-query', 'POST', {
    query: 'How do swarm robotics nodes achieve decentralized consensus?',
    topK: 3,
  }, token);

  console.log('Retrieved chunks count:', ragRes.data.count);
  if (ragRes.data.chunks.length > 0) {
    console.log('Top Match Similarity:', (ragRes.data.chunks[0].similarity * 100).toFixed(1) + '%');
    console.log('Top Match Subject:', ragRes.data.chunks[0].subjectTag);
  }
  if (ragRes.status !== 200 || ragRes.data.chunks.length === 0) throw new Error('RAG search failed');

  // 5. Test SSE Streaming across all 5 Personas
  const personas = ['ADVISOR', 'LIBRARIAN', 'TUTOR', 'EDITOR', 'ROOMMATE'];
  const testQueries = {
    ADVISOR: 'How does ROB701 prepare me for a Robotics Architect career?',
    LIBRARIAN: 'What modules in my syllabus cover Paxos and Raft protocols?',
    TUTOR: 'Explain how sensor fusion works in multi-robot systems step-by-step',
    EDITOR: 'Review my resume summary: Built swarm robotics consensus algorithms',
    ROOMMATE: 'Starting a 25-minute Pomodoro block on Module 3 motion planning!',
  };

  console.log('\n5️⃣ Testing LangGraph SSE Response Streaming for all 5 Personas...');

  for (const persona of personas) {
    process.stdout.write(`   ⚡ Testing [${persona.charAt(0)}] ${persona}... `);

    const streamRes = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: testQueries[persona],
        persona,
      }),
    });

    if (!streamRes.ok) throw new Error(`Stream failed for persona ${persona}`);

    const text = await streamRes.text();
    const hasTokens = text.includes('"type":"token"');
    const hasDone = text.includes('"type":"done"');

    if (!hasTokens || !hasDone) {
      throw new Error(`Invalid SSE stream structure for ${persona}`);
    }

    console.log('✅ Stream verified (SSE tokens received)');
  }

  // 6. Test Chat History Persistence & Retrieval
  console.log('\n6️⃣ Testing Chat History Persistence (GET /api/chat/threads/:persona)...');
  const threadRes = await apiCall('/chat/threads/TUTOR', 'GET', null, token);
  console.log('Tutor Thread Message Count:', threadRes.data.messages.length);
  if (threadRes.status !== 200 || threadRes.data.messages.length < 2) {
    throw new Error('Chat history was not persisted');
  }

  // 7. Test Clear History
  console.log('\n7️⃣ Testing Clear History (DELETE /api/chat/threads/:persona)...');
  const clearRes = await apiCall('/chat/threads/TUTOR', 'DELETE', null, token);
  console.log('Clear Response:', clearRes.data.message);
  const verifyClear = await apiCall('/chat/threads/TUTOR', 'GET', null, token);
  if (verifyClear.data.messages.length !== 0) throw new Error('Clear history failed');

  console.log('\n🎉 ALL PHASE 2 RAG & MULTI-PERSONA TESTS PASSED SUCCESSFULLY! ✅\n');
}

runPhase2Verification().catch((err) => {
  console.error('\n❌ Phase 2 Verification Failed:', err);
  process.exit(1);
});
