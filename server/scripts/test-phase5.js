const fs = require('fs');

async function runPhase5Verification() {
  console.log('🧪 Starting ALTER Phase 5: Visualizers, Aggregators & External Integrations Verification...\n');

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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/calendar')) {
      const text = await res.text();
      return { status: res.status, text };
    }

    const json = await res.json();
    return { status: res.status, data: json };
  }

  // 1. Health Check
  console.log('1️⃣ Checking API Health...');
  const health = await apiCall('/health');
  if (health.status !== 200) throw new Error('Health check failed');
  console.log('Status: 200 OK');

  // 2. Auth: Register Test User
  console.log('\n2️⃣ Registering Phase 5 Test User...');
  const testEmail = `integrator_${Date.now()}@stanford.edu`;
  const regRes = await apiCall('/auth/register', 'POST', {
    email: testEmail,
    password: 'password123!',
    name: 'Devon Takahashi',
    targetRole: 'Full-Stack AI & Distributed Systems Architect',
    degreeName: 'B.S. in Symbolic Systems',
    currentSemester: 6,
    gpa: 3.92,
  });
  const token = regRes.data.token;
  console.log('User registered & token acquired:', regRes.data.user.name);

  // 3. Ingest Sample Class Block for iCalendar Export
  console.log('\n3️⃣ Ingesting Sample Timetable Block...');
  const timetableText = `
Course Code: CS402 - Distributed Systems
Mon 09:00 - 10:30 CS402: Raft Consensus Protocols
`;
  await apiCall('/planner/timetable-upload', 'POST', { timetableText }, token);

  // 4. Test iCalendar (.ics) Export
  console.log('\n4️⃣ Testing RFC 5545 iCalendar (.ics) Feed Export (GET /api/planner/export/ics)...');
  const icsRes = await apiCall('/planner/export/ics', 'GET', null, token);
  console.log('ICS Status:', icsRes.status);
  const icsText = icsRes.text || '';
  const hasVCalendar = icsText.includes('BEGIN:VCALENDAR') && icsText.includes('END:VCALENDAR');
  const hasVEvent = icsText.includes('BEGIN:VEVENT') && icsText.includes('CS402');

  console.log('Valid RFC 5545 VCALENDAR structure:', hasVCalendar);
  console.log('Contains Ingested VEVENT:', hasVEvent);

  if (icsRes.status !== 200 || !hasVCalendar || !hasVEvent) {
    throw new Error('iCalendar export verification failed');
  }

  // 5. Test Study Session Logging (Pomodoro)
  console.log('\n5️⃣ Testing Study Session Logging (POST /api/study/sessions)...');
  const session1 = await apiCall('/study/sessions', 'POST', {
    durationMin: 25,
    category: 'POMODORO',
    subject: 'Distributed Consensus Invariants',
  }, token);

  const session2 = await apiCall('/study/sessions', 'POST', {
    durationMin: 25,
    category: 'POMODORO',
    subject: 'Swarm Robotics Kinematics',
  }, token);

  console.log('Logged Session 1:', session1.data.session.id);
  console.log('Logged Session 2:', session2.data.session.id);
  if (session1.status !== 201 || session2.status !== 201) throw new Error('Study session logging failed');

  // 6. Test Study Stats & Streak Analytics
  console.log('\n6️⃣ Testing Study Streak & Analytics (GET /api/study/stats)...');
  const statsRes = await apiCall('/study/stats', 'GET', null, token);
  console.log('Total Focus Minutes:', statsRes.data.stats.totalMinutes);
  console.log('Total Focus Hours:', statsRes.data.stats.totalHours);
  console.log('Total Sessions:', statsRes.data.stats.totalSessions);
  console.log('Active Streak Days:', statsRes.data.stats.streakDays);

  if (statsRes.status !== 200 || statsRes.data.stats.totalMinutes < 50) {
    throw new Error('Study stats calculation failed');
  }

  // 7. Test Hackathons Aggregator Feed
  console.log('\n7️⃣ Testing Hackathons & Grants Aggregator (GET /api/aggregators/hackathons)...');
  const hackRes = await apiCall('/aggregators/hackathons', 'GET', null, token);
  console.log('Aggregated Hackathons Count:', hackRes.data.count);
  console.log('Top Hackathon:', hackRes.data.hackathons[0].title, `(${hackRes.data.hackathons[0].prizePool})`);
  if (hackRes.status !== 200 || hackRes.data.count === 0) {
    throw new Error('Hackathon aggregator failed');
  }

  // 8. Test ArXiv Research Papers Aggregator Feed
  console.log('\n8️⃣ Testing ArXiv Research Papers Aggregator (GET /api/aggregators/arxiv?q=Distributed+Consensus)...');
  const arxivRes = await apiCall('/aggregators/arxiv?q=Distributed+Consensus', 'GET', null, token);
  console.log('Retrieved ArXiv Papers Count:', arxivRes.data.count);
  console.log('Top Paper:', arxivRes.data.papers[0].title);
  console.log('Authors:', arxivRes.data.papers[0].authors.join(', '));
  if (arxivRes.status !== 200 || arxivRes.data.count === 0) {
    throw new Error('ArXiv aggregator failed');
  }

  console.log('\n🎉 ALL PHASE 5 VISUALIZERS, AGGREGATORS & INTEGRATION TESTS PASSED SUCCESSFULLY! ✅\n');
}

runPhase5Verification().catch((err) => {
  console.error('\n❌ Phase 5 Verification Failed:', err);
  process.exit(1);
});
