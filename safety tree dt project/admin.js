// admin.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://sklgbhgblgklyjutvami.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGdiaGdibGdrbHlqdXR2YW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NjI5NDgsImV4cCI6MjA2MjQzODk0OH0.rhCuiYnd05KpEcZvFC6kEDYD2_tZNpO8Q2MV2ixjMDY'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const reportsList = document.getElementById('reportsList');
const refreshBtn = document.getElementById('refreshBtn');
const filterSelect = document.getElementById('riskFilter');
const riskDashboard = document.getElementById('riskDashboard');
const ethephonTracker = document.getElementById('ethephonTracker');
const showRiskDashboard = document.getElementById('showRiskDashboard');
const showEthephonTracker = document.getElementById('showEthephonTracker');
const ethephonList = document.getElementById('ethephonList');

const ALL_TREES = [
  'CT001','CT002','CT003','CT004','CT005','CT006','CT007','CT008','CT009','CT010','CT011','CT012','CT013','CT014','CT015',
  'CT016','CT017','CT018','CT019','CT020','CT021','CT022','CT023','CT024','CT025','CT026','CT027',
  'CT028','CT029','CT030','CT031','CT032','CT033','CT034','CT035','CT036','CT037',
  'CT038','CT039','CT040','CT041','CT042','CT043','CT044','CT045','CT046','CT047','CT048','CT049','CT050','CT051','CT052',
  'CT053','CT054','CT055','CT056','CT057','CT058','CT059','CT060','CT061','CT062'
];

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

async function loadReports() {
  reportsList.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading reports...</p></div>`;
  let filter = filterSelect.value;
  let query = supabase.from('tree_reports').select('*').order('timestamp', { ascending: false });

  if (filter === 'risky') query = query.eq('isRisky', true);
  if (filter === 'safe') query = query.eq('isRisky', false);

  const { data, error } = await query;
  if (error) return (reportsList.innerHTML = `<p>Error loading data.</p>`);
  if (data.length === 0) return (reportsList.innerHTML = `<p>No reports found.</p>`);

  reportsList.innerHTML = '';
  data.forEach(report => {
    const div = document.createElement('div');
    div.className = `report-card ${report.isRisky ? 'risky' : 'safe'}`;
    div.innerHTML = `
      <div class="report-header">
        <h3>${report.treeId}</h3>
        <span>${report.isRisky ? '⚠️ Risky' : '✅ Safe'}</span>
      </div>
      <div class="report-details">
        <p><strong>Status:</strong> ${report.status}</p>
        <p><strong>Confidence:</strong> ${Math.round(report.riskLevel * 100)}%</p>
        <p><strong>Time:</strong> ${formatDate(report.timestamp)}</p>
        <p><strong>Action:</strong> ${report.action_taken ? `✅ Taken on ${formatDate(report.action_date)}` : `<button class="action-btn" data-id="${report.id}">Mark Action Taken</button>`}</p>
      </div>
      ${report.imageUrl ? `<div class="report-image"><img src="${report.imageUrl}" /></div>` : ''}
    `;
    reportsList.appendChild(div);
  });

  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const today = new Date().toISOString();
      await supabase.from('tree_reports').update({ action_taken: true, action_date: today }).eq('id', id);
      loadReports();
    });
  });
}

async function loadEthephonList() {
  const { data: treatedData, error } = await supabase.from('ethephon_treated').select('*');
  if (error) return (ethephonList.innerHTML = '<p>Error loading trees</p>');

  const treatedMap = new Map();
  treatedData.forEach(t => treatedMap.set(t.tree_id, t));

  ethephonList.innerHTML = '';
  ALL_TREES.forEach(treeId => {
    const entry = treatedMap.get(treeId);
    const isTreated = entry?.isTreated;
    const treatedOn = entry?.treated_on;
    const nextDue = treatedOn ? formatDate(new Date(new Date(treatedOn).setMonth(new Date(treatedOn).getMonth() + 6))) : '';

    const card = document.createElement('div');
    card.className = 'report-card safe';
    card.innerHTML = `
      <div class="report-header">
        <h3>${treeId}</h3>
        <span>
          ${isTreated ? `✔️ Treated` : `<button class="treat-btn" data-id="${treeId}">Mark Treated</button>`}
        </span>
      </div>
      <div class="report-details">
        <p><strong>Status:</strong> ${isTreated ? 'Treated' : 'Pending'}</p>
        ${isTreated ? `<p><strong>Treated On:</strong> ${formatDate(treatedOn)}</p><p><strong>Next Due:</strong> ${nextDue}</p><button class="untreat-btn" data-id="${treeId}">Undo</button>` : ''}
      </div>
    `;
    ethephonList.appendChild(card);
  });

  document.querySelectorAll('.treat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const treeId = btn.getAttribute('data-id');
      const today = new Date().toISOString();
      const existing = treatedMap.get(treeId);
      if (existing) {
        await supabase.from('ethephon_treated').update({ isTreated: true, treated_on: today }).eq('id', existing.id);
      } else {
        await supabase.from('ethephon_treated').insert({ tree_id: treeId, isTreated: true, treated_on: today });
      }
      loadEthephonList();
    });
  });

  document.querySelectorAll('.untreat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const treeId = btn.getAttribute('data-id');
      const existing = treatedMap.get(treeId);
      if (existing) {
        await supabase.from('ethephon_treated').update({ isTreated: false, treated_on: null }).eq('id', existing.id);
        loadEthephonList();
      }
    });
  });
}

showRiskDashboard.addEventListener('click', () => {
  riskDashboard.style.display = 'block';
  ethephonTracker.style.display = 'none';
  showRiskDashboard.classList.add('active');
  showEthephonTracker.classList.remove('active');
});

showEthephonTracker.addEventListener('click', () => {
  riskDashboard.style.display = 'none';
  ethephonTracker.style.display = 'block';
  loadEthephonList();
  showEthephonTracker.classList.add('active');
  showRiskDashboard.classList.remove('active');
});

refreshBtn.addEventListener('click', loadReports);
filterSelect.addEventListener('change', loadReports);
loadReports();
