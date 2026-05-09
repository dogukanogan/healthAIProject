'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
const MeetingRequest = require('./models/MeetingRequest');

async function seed() {
  // Zaten seed çalışmışsa atla
  const existingUser = await User.findOne({ where: { email: 'dogukan@university.edu' } });
  if (existingUser) {
    console.log('⚠️ Seed already ran, skipping.');
    return;
  }

  const hash = await bcrypt.hash('password123', 12);

  const [dogukan, ayse, admin, mehmet, fatma] = await User.bulkCreate([
    { name: 'Dogukan Ogan',       email: 'dogukan@university.edu', password_hash: hash, role: 'engineer',    verified: true,  suspended: false },
    { name: 'Dr. Ayse Kaya',      email: 'ayse@hospital.edu',      password_hash: hash, role: 'healthcare',  verified: true,  suspended: false },
    { name: 'Admin User',         email: 'admin@healthai.edu',     password_hash: hash, role: 'admin',       verified: true,  suspended: false },
    { name: 'Mehmet Demir',       email: 'mehmet@university.edu',  password_hash: hash, role: 'engineer',    verified: false, suspended: true  },
    { name: 'Dr. Fatma Yilmaz',   email: 'fatma@clinic.edu',       password_hash: hash, role: 'healthcare',  verified: true,  suspended: false },
  ], { returning: true });

  const [p1, p2, p3, p4, p5] = await Post.bulkCreate([
    {
      user_id: dogukan.id, authorName: 'Dogukan Ogan', role: 'engineer',
      title: 'AI-Powered ECG Analysis Tool',
      domain: 'Cardiology Imaging',
      description: 'Developing a deep learning model for real-time ECG anomaly detection. Looking for a cardiologist to validate clinical scenarios.',
      expertiseRequired: 'Cardiology / Clinical Validation',
      city: 'Istanbul', country: 'Turkey',
      projectStage: 'prototype', commitmentLevel: 'Part-time (10h/week)',
      collaborationType: 'Research Partner',
      confidentiality: 'Public pitch — details in meeting',
      status: 'active', expiryDate: '2026-06-01',
    },
    {
      user_id: ayse.id, authorName: 'Dr. Ayse Kaya', role: 'healthcare',
      title: 'Digital Triage System for Emergency Departments',
      domain: 'Emergency Medicine',
      description: 'I have a workflow concept for AI-assisted patient triage. Need a software engineer to build the system.',
      expertiseRequired: 'Full-Stack Development / NLP',
      city: 'Ankara', country: 'Turkey',
      projectStage: 'concept_validation', commitmentLevel: 'Full-time',
      collaborationType: 'Co-Founder',
      confidentiality: 'Details discussed in meeting only',
      status: 'active', expiryDate: '2026-05-15',
    },
    {
      user_id: dogukan.id, authorName: 'Dogukan Ogan', role: 'engineer',
      title: 'Wearable Fall Detection for Elderly Patients',
      domain: 'Geriatrics / IoT',
      description: 'Sensor-based fall detection prototype. Requires clinical expertise to refine alert thresholds.',
      expertiseRequired: 'Geriatrics / Physical Therapy',
      city: 'Istanbul', country: 'Turkey',
      projectStage: 'pilot_testing', commitmentLevel: 'Advisor (2h/week)',
      collaborationType: 'Advisor',
      confidentiality: 'Public pitch — details in meeting',
      status: 'meeting_scheduled', expiryDate: '2026-07-01',
    },
    {
      user_id: fatma.id, authorName: 'Dr. Fatma Yilmaz', role: 'healthcare',
      title: 'Mental Health Chatbot for University Students',
      domain: 'Psychiatry / NLP',
      description: 'Concept for an NLP-based mental health support bot. Seeking an ML engineer.',
      expertiseRequired: 'NLP / Machine Learning',
      city: 'Izmir', country: 'Turkey',
      projectStage: 'idea', commitmentLevel: 'Part-time (5h/week)',
      collaborationType: 'Research Partner',
      confidentiality: 'Details discussed in meeting only',
      status: 'draft', expiryDate: '2026-08-01',
    },
    {
      user_id: ayse.id, authorName: 'Dr. Ayse Kaya', role: 'healthcare',
      title: 'Radiological Image Labeling Platform',
      domain: 'Radiology',
      description: 'Need a platform to crowdsource radiological image labeling for training datasets.',
      expertiseRequired: 'Web Development / Computer Vision',
      city: 'Ankara', country: 'Turkey',
      projectStage: 'pre_deployment', commitmentLevel: 'Full-time',
      collaborationType: 'Co-Founder',
      confidentiality: 'Public pitch — details in meeting',
      status: 'active', expiryDate: '2026-05-30',
    },
  ], { returning: true });

  await MeetingRequest.create({
    post_id: p3.id, postTitle: p3.title,
    requester_id: ayse.id,  requesterName: 'Dr. Ayse Kaya',
    owner_id:     dogukan.id, ownerName: 'Dogukan Ogan',
    message: 'I have extensive experience with fall biomechanics. Would love to collaborate.',
    ndaAccepted: true,
    proposedSlots: ['2026-04-15 14:00', '2026-04-16 10:00'],
    confirmedSlot: '2026-04-15 14:00',
    status: 'accepted',
  });

  console.log('✅ Seed complete. Users: 5 | Posts: 5 | Meetings: 1');
}

// Doğrudan çalıştırılırsa (node src/seed.js)
if (require.main === module) {
  (async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await seed();
    await sequelize.close();
    process.exit(0);
  })().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
}

module.exports = seed;
