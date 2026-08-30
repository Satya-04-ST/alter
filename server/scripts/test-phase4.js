const fs = require('fs');

async function runPhase4Verification() {
  console.log('🧪 Starting ALTER Phase 4: Synthesis, Quizzing & Research Hub Verification...\n');

  const BASE_URL = 'http://localhost:5000/api';

  async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = {};
    if (body) {
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
  console.log('1️⃣ Checking API Health...');
  const health = await apiCall('/health');
  if (health.status !== 200) throw new Error('Health check failed');
  console.log('Status: 200 OK');

  // 2. Auth: Register Test Scholar
  console.log('\n2️⃣ Registering Phase 4 Test Scholar...');
  const testEmail = `scholar_${Date.now()}@oxford.edu`;
  const regRes = await apiCall('/auth/register', 'POST', {
    email: testEmail,
    password: 'password123!',
    name: 'Dr. Arthur Pendelton',
    targetRole: 'Senior AI Research Scientist',
    degreeName: 'Ph.D. in Autonomous Distributed Systems',
    currentSemester: 8,
    gpa: 4.0,
  });
  const token = regRes.data.token;
  console.log('Scholar authenticated:', regRes.data.user.name);

  // 3. Ingest Research Document for Grounding
  console.log('\n3️⃣ Ingesting Foundational Literature for Synthesis & Quizzing Grounding...');
  const sampleContent = `
Document: BFT Consensus in Large Scale Swarm Robotics
Abstract:
We present a novel Byzantine Fault Tolerant protocol specifically designed for multi-agent swarm robotics operating under lossy wireless channels.
Section 1: Quorum Formulations and Safety Guarantees.
In a swarm with N agents, Byzantine fault tolerance requires at least 3F + 1 nodes to tolerate F Byzantine faulty agents. The quorum size Q is bounded by 2F + 1.
Section 2: Latency Analysis and State Machine Replication.
Under nominal network conditions, consensus completes in 2 round-trip times (RTT) with linear message complexity O(N).
`;

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const bodyBuffer = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="fileType"\r\n\r\nPAPER\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="BFT_Swarm_Robotics.txt"\r\nContent-Type: text/plain\r\n\r\n`
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
  console.log('Research paper uploaded:', uploadJson.document.id);

  // Wait 1.5s for vectorization
  await new Promise((r) => setTimeout(r, 1500));

  // 4. Test Dynamic Quiz Generation
  console.log('\n4️⃣ Testing Dynamic Quiz Generation (POST /api/quiz/generate)...');
  const quizRes = await apiCall('/quiz/generate', 'POST', {
    topic: 'Byzantine Fault Tolerance & Quorums',
    questionCount: 4,
  }, token);

  console.log('Generated Quiz Title:', quizRes.data.quiz.title);
  console.log('Question Count:', quizRes.data.quiz.questions.length);
  if (quizRes.status !== 201 || quizRes.data.quiz.questions.length < 2) {
    throw new Error('Quiz generation failed');
  }

  const quizId = quizRes.data.quiz.id;

  // 5. Test Quiz Retrieval
  console.log('\n5️⃣ Fetching Quiz Details (GET /api/quiz/:id)...');
  const getQuizRes = await apiCall(`/quiz/${quizId}`, 'GET', null, token);
  console.log('Retrieved Quiz ID:', getQuizRes.data.quiz.id);
  if (getQuizRes.status !== 200) throw new Error('Failed to retrieve quiz');

  // 6. Submit Quiz Attempt & Evaluate
  console.log('\n6️⃣ Submitting Quiz Attempt (POST /api/quiz/:id/attempt)...');
  const submissionAnswers = quizRes.data.quiz.questions.map((q, idx) => ({
    questionId: q.id,
    selectedAnswer: q.correctAnswerIndex, // submit correct answers to verify 100% evaluation
  }));

  const attemptRes = await apiCall(`/quiz/${quizId}/attempt`, 'POST', {
    answers: submissionAnswers,
  }, token);

  console.log('Attempt Score:', attemptRes.data.attempt.score, '/', attemptRes.data.attempt.total);
  console.log('Accuracy:', attemptRes.data.attempt.accuracy + '%');
  console.log('Tutor Feedback:', attemptRes.data.attempt.tutorFeedback);
  if (attemptRes.status !== 200 || attemptRes.data.attempt.accuracy !== 100) {
    throw new Error('Quiz attempt grading failed');
  }

  // 7. Test Multi-Source Study Guide Synthesis
  console.log('\n7️⃣ Synthesizing Multi-Source Study Guide (POST /api/research/synthesize)...');
  const synthRes = await apiCall('/research/synthesize', 'POST', {
    topic: 'Byzantine Fault Tolerance in Swarm Robotics',
  }, token);

  console.log('Study Guide Title:', synthRes.data.guide.title);
  console.log('Markdown Content Length:', synthRes.data.guide.markdownContent.length, 'characters');
  console.log('Grounded Sources Count:', synthRes.data.guide.citations.length);
  if (synthRes.status !== 200 || !synthRes.data.guide.markdownContent.includes('Executive Summary')) {
    throw new Error('Multi-source study guide synthesis failed');
  }

  // 8. Test Research Paper Analysis & Knowledge Graph
  console.log('\n8️⃣ Generating Research Knowledge Graph (GET /api/research/graph)...');
  const graphRes = await apiCall('/research/graph?topic=Byzantine+Fault+Tolerant+Swarms', 'GET', null, token);
  console.log('Graph Topic:', graphRes.data.graph.topic);
  console.log('Knowledge Graph Nodes:', graphRes.data.graph.nodes.length);
  console.log('Knowledge Graph Edges:', graphRes.data.graph.edges.length);
  console.log('Paper ArXiv ID:', graphRes.data.paperSummary.arxivId);

  if (graphRes.status !== 200 || graphRes.data.graph.nodes.length === 0) {
    throw new Error('Research graph generation failed');
  }

  console.log('\n🎉 ALL PHASE 4 SYNTHESIS, QUIZZING & RESEARCH HUB TESTS PASSED SUCCESSFULLY! ✅\n');
}

runPhase4Verification().catch((err) => {
  console.error('\n❌ Phase 4 Verification Failed:', err);
  process.exit(1);
});
