const fs = require('fs');

async function runPhase3Verification() {
  console.log('🧪 Starting ALTER Phase 3: Dynamic Planner & Academic Triaging Verification...\n');

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

  // 2. Auth: Register Test User
  console.log('\n2️⃣ Registering Phase 3 Test Student...');
  const testEmail = `planner_student_${Date.now()}@polytechnic.edu`;
  const regRes = await apiCall('/auth/register', 'POST', {
    email: testEmail,
    password: 'password123!',
    name: 'Marcus Vance',
    targetRole: 'Distributed Cloud Systems Architect',
    degreeName: 'B.S. in Computer Systems',
    currentSemester: 5,
    gpa: 3.88,
  });
  const token = regRes.data.token;
  console.log('Student registered & authenticated:', regRes.data.user.name);

  // 3. Timetable Ingestion Test
  console.log('\n3️⃣ Ingesting Weekly Class Timetable (POST /api/planner/timetable-upload)...');
  const timetableText = `
Course Code: CS402 - Distributed Systems
Mon 09:00 - 10:30 CS402: Distributed Architectures
Wed 09:00 - 10:30 CS402: Consensus Protocols

Course Code: ROB701 - Autonomous Robotics
Tue 10:00 - 11:30 ROB701: Sensor Fusion & SLAM
Fri 11:00 - 12:30 ROB701: Multi-Agent Swarm Seminar

Course Code: AI301 - Deep Learning Systems
Thu 14:00 - 15:30 AI301: Neural Network Acceleration Lab
`;

  const ttRes = await apiCall('/planner/timetable-upload', 'POST', { timetableText }, token);
  console.log('Timetable Ingestion Result:', ttRes.data.message);
  if (ttRes.status !== 200 || !ttRes.data.success) throw new Error('Timetable ingestion failed');

  // 4. Fetch Ingested Schedule Events
  console.log('\n4️⃣ Fetching Schedule Events (GET /api/planner/events)...');
  const eventsRes = await apiCall('/planner/events', 'GET', null, token);
  console.log('Total Schedule Blocks Ingested:', eventsRes.data.events.length);
  if (eventsRes.data.events.length < 3) throw new Error('Schedule blocks not persisted');

  // 5. Create Academic Tasks with Mixed Priorities
  console.log('\n5️⃣ Creating Academic Tasks with Mixed Priorities (POST /api/tasks)...');
  const task1 = await apiCall('/tasks', 'POST', {
    title: 'Distributed Systems Raft Consensus Implementation',
    priority: 'CRITICAL',
    courseId: 'CS402',
  }, token);

  const task2 = await apiCall('/tasks', 'POST', {
    title: 'Autonomous Robotics EKF Sensor Fusion Report',
    priority: 'HIGH',
    courseId: 'ROB701',
  }, token);

  const task3 = await apiCall('/tasks', 'POST', {
    title: 'Optional Supplementary Video Lecture on Neural ODEs',
    priority: 'LOW',
    courseId: 'AI301',
  }, token);

  const task4 = await apiCall('/tasks', 'POST', {
    title: 'Unassessed Markdown Documentation Formatting',
    priority: 'LOW',
    courseId: 'CS402',
  }, token);

  console.log('Tasks created: Raft (CRITICAL), EKF (HIGH), Optional Lecture (LOW), Doc Formatting (LOW)');

  // 6. Conflict-Free Auto-Scheduling Engine Test
  console.log('\n6️⃣ Running Conflict-Free Auto-Scheduling Engine (POST /api/planner/auto-schedule)...');
  const autoRes = await apiCall('/planner/auto-schedule', 'POST', {}, token);
  console.log('Auto-Scheduling Result:', autoRes.data.message);
  console.log('Allocated Study Blocks Count:', autoRes.data.allocatedCount);
  if (autoRes.status !== 200 || autoRes.data.allocatedCount === 0) {
    throw new Error('Auto-schedule generation failed');
  }

  // 7. Academic Cut-List Triage Engine Test
  console.log('\n7️⃣ Executing Academic Cut-List Triage (PATCH /api/tasks/cut-list)...');
  const triageRes = await apiCall('/tasks/cut-list', 'PATCH', { isExamWindowNear: true }, token);
  console.log('Triage Message:', triageRes.data.message);
  console.log('Retained Core Tasks:', triageRes.data.result.retainedCount);
  console.log('Triaged Cut Tasks:', triageRes.data.result.cutCount);

  if (triageRes.data.result.cutCount === 0) {
    throw new Error('Cut-list triage should have cut LOW priority tasks during crunch');
  }

  // 8. Verify Task Status & Filtering
  console.log('\n8️⃣ Verifying Task Status Filtering (GET /api/tasks?status=CUT)...');
  const cutTasksRes = await apiCall('/tasks?status=CUT', 'GET', null, token);
  console.log('Cut Tasks Count:', cutTasksRes.data.tasks.length);
  if (cutTasksRes.data.tasks.length === 0) throw new Error('Cut task filtering failed');

  // 9. Restore a Cut Task
  console.log('\n9️⃣ Restoring a Cut Task (PATCH /api/tasks/:id)...');
  const targetCutTaskId = cutTasksRes.data.tasks[0].id;
  const restoreRes = await apiCall(`/tasks/${targetCutTaskId}`, 'PATCH', {
    status: 'TODO',
    isCut: false,
  }, token);
  console.log('Restored Task Status:', restoreRes.data.task.status, 'isCut:', restoreRes.data.task.isCut);
  if (restoreRes.data.task.isCut !== false) throw new Error('Task restore failed');

  // 10. Delete a Task
  console.log('\n🔟 Deleting a Task (DELETE /api/tasks/:id)...');
  const delRes = await apiCall(`/tasks/${targetCutTaskId}`, 'DELETE', null, token);
  console.log('Delete Task Response:', delRes.data.message);

  console.log('\n🎉 ALL PHASE 3 PLANNER & CUT-LIST TRIAGE TESTS PASSED SUCCESSFULLY! ✅\n');
}

runPhase3Verification().catch((err) => {
  console.error('\n❌ Phase 3 Verification Failed:', err);
  process.exit(1);
});
