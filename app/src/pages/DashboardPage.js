import { apiClient } from '../services/api.js';
import router from '../main.js';

export class DashboardPage {
  constructor() {
    this.parsedSmsId = null; // Store last parsed SMS ID for verification
  }

  async render() {
    const container = document.createElement('div');
    container.id = 'dashboard-page';
    container.innerHTML = `
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="brand">
            <h1><i class="fas fa-shield-alt"></i> Rent Verifier</h1>
          </div>
          <div class="user-actions">
            <button class="btn-signout" id="signoutBtn">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <!-- Main Dashboard -->
      <main class="dashboard">

        <!-- Stats Cards -->
        <section class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
            <div class="stat-content">
              <h3>Total Received</h3>
              <p class="stat-value" id="statTotal">Ksh 0</p>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <h3>Verified</h3>
              <p class="stat-value" id="statVerified">0</p>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-content">
              <h3>Suspicious</h3>
              <p class="stat-value" id="statSuspicious">0</p>
            </div>
          </div>
          <div class="stat-card danger">
            <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
            <div class="stat-content">
              <h3>Not Found</h3>
              <p class="stat-value" id="statNotFound">0</p>
            </div>
          </div>
        </section>

        <!-- Action Panels -->
        <section class="action-panels">

          <!-- SMS Payment Panel -->
          <div class="panel">
            <div class="panel-header">
              <h2><i class="fas fa-sms"></i> Add Payment SMS</h2>
            </div>
            <div class="panel-content">
              <div class="input-group">
                <label for="smsMessage">Paste SMS Message</label>
                <textarea id="smsMessage" placeholder="Paste M-PESA or bank SMS message here...&#10;&#10;Example: Dear LINET KES 5,000.00 has been credited to your account Ref:54228448 on 27-MAR-2026 10:30:00 AM" rows="4"></textarea>
              </div>
              <button class="btn btn-primary" id="previewSmsBtn">
                <i class="fas fa-search"></i>
                Preview &amp; Save SMS
              </button>

              <!-- SMS Preview Result Box (hidden until parsed) -->
              <div id="smsPreviewBox" style="display:none; margin-top:1rem; padding:1rem; background:var(--light, #f8f9fa); border-radius:8px; border-left: 4px solid #28a745;">
                <strong style="color:#28a745;">✅ SMS Parsed Successfully</strong>
                <div style="margin-top:0.5rem; font-size:0.9rem;">
                  <p>💰 <strong>Amount:</strong> <span id="previewAmount">-</span></p>
                  <p>📅 <strong>Date:</strong> <span id="previewDate">-</span></p>
                  <p>🔖 <strong>Reference:</strong> <span id="previewRef">-</span></p>
                </div>
                <p style="margin-top:0.5rem; font-size:0.8rem; color:#666;">SMS saved. Click <strong>Verify All</strong> below to match it against receipts.</p>
              </div>
            </div>
          </div>

          <!-- Manual Receipt Panel -->
          <div class="panel">
            <div class="panel-header">
              <h2><i class="fas fa-receipt"></i> Add Caretaker Receipt</h2>
            </div>
            <div class="panel-content">
              <div class="form-grid">
                <div class="input-group">
                  <label for="houseNumber">House/Unit Number</label>
                  <input type="text" id="houseNumber" placeholder="e.g., A12, Unit 5, M12">
                </div>
                <div class="input-group">
                  <label for="amount">Amount (KES)</label>
                  <input type="number" id="amount" placeholder="e.g., 5000">
                </div>
                <div class="input-group">
                  <label for="paymentDate">Payment Date</label>
                  <input type="date" id="paymentDate">
                </div>
                <div class="input-group">
                  <label for="receiptRef">Receipt Reference (Optional)</label>
                  <input type="text" id="receiptRef" placeholder="e.g., 54228448">
                </div>
              </div>
              <div class="input-group">
                <label for="receiptImage">Upload Receipt Picture</label>
                <input type="file" id="receiptImage" accept="image/*">
                <small>Supported formats: JPG, PNG, GIF (Max 5MB)</small>
              </div>
              <button class="btn btn-success" id="addReceiptBtn">
                <i class="fas fa-plus"></i>
                Add Receipt
              </button>
            </div>
          </div>
        </section>

        <!-- Verification Table -->
        <section class="verification-section">
          <div class="panel">
            <div class="panel-header">
              <h2><i class="fas fa-list-check"></i> Receipt Verification</h2>
              <button class="btn btn-outline" id="verifyAllBtn">
                <i class="fas fa-check-double"></i>
                Verify All
              </button>
            </div>

            <!-- Verify All Status Message -->
            <div id="verifyStatusMsg" style="display:none; padding:0.75rem 1rem; margin:0 1rem 1rem; border-radius:6px; font-size:0.9rem;"></div>

            <div class="table-container">
              <table class="verification-table">
                <thead>
                  <tr>
                    <th>House</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Receipt Ref</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="receiptsTableBody">
                  <tr class="empty-state">
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray);">
                      <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                      No receipts added yet. Add your first receipt above.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      <!-- View Receipt Modal -->
      <div id="receiptModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; align-items:center; justify-content:center;">
        <div style="background:#fff; border-radius:12px; padding:2rem; max-width:500px; width:90%; position:relative;">
          <button id="closeModal" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
          <h3 style="margin-bottom:1rem;"><i class="fas fa-receipt"></i> Receipt Details</h3>
          <div id="modalContent"></div>
        </div>
      </div>
    `;

    return container;
  }

  async afterRender() {
    // Sign out
    document.getElementById('signoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      router.navigate('/login');
    });

    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('receiptModal').style.display = 'none';
    });

    // ===== SMS: Parse & Save =====
    document.getElementById('previewSmsBtn').addEventListener('click', async () => {
      const smsMessage = document.getElementById('smsMessage').value.trim();
      if (!smsMessage) {
        alert('Please paste an SMS message first');
        return;
      }

      const btn = document.getElementById('previewSmsBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing...';

      try {
        const data = await apiClient.parseReceipt(smsMessage);
        const parsed = data.data;

        // Save the SMS ID so we can use it for verification
        this.parsedSmsId = parsed.id;

        // Show preview box
        document.getElementById('previewAmount').textContent = `KES ${Number(parsed.amount).toLocaleString()}`;
        document.getElementById('previewDate').textContent = parsed.date || 'Not found in SMS';
        document.getElementById('previewRef').textContent = parsed.reference || 'Not found in SMS';
        document.getElementById('smsPreviewBox').style.display = 'block';

      } catch (err) {
        alert('Could not parse SMS: ' + err.message + '\n\nMake sure the SMS contains KES amount and is a valid M-PESA message.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search"></i> Preview & Save SMS';
      }
    });

    // ===== Add Receipt =====
    document.getElementById('addReceiptBtn').addEventListener('click', async () => {
      const houseNumber = document.getElementById('houseNumber').value.trim();
      const amount = document.getElementById('amount').value;
      const paymentDate = document.getElementById('paymentDate').value;
      const receiptRef = document.getElementById('receiptRef').value.trim();
      const receiptImage = document.getElementById('receiptImage').files[0];

      if (!houseNumber || !amount || !paymentDate) {
        alert('Please fill in House Number, Amount, and Payment Date');
        return;
      }

      const btn = document.getElementById('addReceiptBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      try {
        const formData = new FormData();
        formData.append('houseNumber', houseNumber);
        formData.append('amount', amount);

        // Convert date from YYYY-MM-DD (HTML input) to DD-MMM-YYYY (matches SMS format)
        const dateObj = new Date(paymentDate);
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const formattedDate = `${String(dateObj.getDate()).padStart(2,'0')}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;
        formData.append('paymentDate', formattedDate);

        formData.append('receiptReference', receiptRef);
        if (receiptImage) formData.append('receiptImage', receiptImage);

        await apiClient.uploadReceipt(formData);

        // Clear form
        document.getElementById('houseNumber').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('paymentDate').value = '';
        document.getElementById('receiptRef').value = '';
        document.getElementById('receiptImage').value = '';

        await this.loadReceipts();

        // Show success inline
        btn.innerHTML = '<i class="fas fa-check"></i> Receipt Added!';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-plus"></i> Add Receipt';
          btn.disabled = false;
        }, 2000);

      } catch (err) {
        alert('Failed to add receipt: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Add Receipt';
      }
    });

    // ===== VERIFY ALL =====
    document.getElementById('verifyAllBtn').addEventListener('click', async () => {
      if (!this.parsedSmsId) {
        this.showVerifyStatus('warning', '⚠️ No SMS parsed yet. Paste an M-PESA SMS above and click "Preview & Save SMS" first.');
        return;
      }

      const btn = document.getElementById('verifyAllBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

      try {
        // Get all pending receipts
        const data = await apiClient.getReceipts();
        const receipts = data.data || [];
        const pending = receipts.filter(r => r.status === 'pending');

        if (pending.length === 0) {
          this.showVerifyStatus('info', 'ℹ️ No pending receipts to verify.');
          return;
        }

        let verified = 0, suspicious = 0, failed = 0;

        // Verify each pending receipt against the saved SMS
        for (const receipt of pending) {
          try {
            const result = await apiClient.verifyReceipt(receipt.id, this.parsedSmsId);
            const status = result.data?.status;
            if (status === 'verified') verified++;
            else if (status === 'suspicious') suspicious++;
            else failed++;
          } catch (e) {
            failed++;
          }
        }

        // Reload table with updated statuses
        await this.loadReceipts();

        this.showVerifyStatus('success',
          `✅ Verification complete! ${verified} verified, ${suspicious} suspicious, ${failed} failed.`
        );

      } catch (err) {
        this.showVerifyStatus('danger', '❌ Verification failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-double"></i> Verify All';
      }
    });

    // Load receipts on page load
    await this.loadReceipts();
  }

  showVerifyStatus(type, message) {
    const el = document.getElementById('verifyStatusMsg');
    const colors = {
      success: { bg: '#d4edda', border: '#28a745', color: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
      danger:  { bg: '#f8d7da', border: '#dc3545', color: '#721c24' },
      info:    { bg: '#d1ecf1', border: '#17a2b8', color: '#0c5460' },
    };
    const c = colors[type] || colors.info;
    el.style.cssText = `display:block; padding:0.75rem 1rem; margin:0 1rem 1rem; border-radius:6px; font-size:0.9rem; background:${c.bg}; border-left:4px solid ${c.border}; color:${c.color};`;
    el.textContent = message;
    setTimeout(() => { el.style.display = 'none'; }, 6000);
  }

  async loadReceipts() {
    try {
      const data = await apiClient.getReceipts();
      const tbody = document.getElementById('receiptsTableBody');
      const receipts = data.data || [];

      // Update stats
      const total = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const verified = receipts.filter(r => r.status === 'verified').length;
      const suspicious = receipts.filter(r => r.status === 'suspicious').length;
      const notFound = receipts.filter(r => r.status === 'failed').length;

      document.getElementById('statTotal').textContent = `Ksh ${total.toLocaleString()}`;
      document.getElementById('statVerified').textContent = verified;
      document.getElementById('statSuspicious').textContent = suspicious;
      document.getElementById('statNotFound').textContent = notFound;

      if (receipts.length === 0) {
        tbody.innerHTML = `
          <tr class="empty-state">
            <td colspan="6" style="text-align:center; padding:2rem; color:var(--gray);">
              <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:1rem; display:block;"></i>
              No receipts added yet. Add your first receipt above.
            </td>
          </tr>`;
        return;
      }

      tbody.innerHTML = receipts.map(receipt => {
        const status = receipt.status || 'pending';
        const statusColors = {
          verified:  { bg: '#d4edda', color: '#155724' },
          suspicious:{ bg: '#fff3cd', color: '#856404' },
          failed:    { bg: '#f8d7da', color: '#721c24' },
          pending:   { bg: '#e2e3e5', color: '#383d41' },
        };
        const sc = statusColors[status] || statusColors.pending;
        const badge = `<span style="padding:0.25rem 0.6rem; border-radius:12px; font-size:0.8rem; font-weight:600; background:${sc.bg}; color:${sc.color};">${status.toUpperCase()}</span>`;

        return `
          <tr>
            <td>${receipt.houseNumber || receipt.house_number || '-'}</td>
            <td>KES ${Number(receipt.amount).toLocaleString()}</td>
            <td>${receipt.paymentDate || receipt.payment_date || '-'}</td>
            <td>${receipt.receiptRef || receipt.receipt_reference || '-'}</td>
            <td>${badge}</td>
            <td>
              <button class="btn btn-sm btn-secondary view-btn"
                data-id="${receipt.id}"
                data-house="${receipt.houseNumber || receipt.house_number}"
                data-amount="${receipt.amount}"
                data-date="${receipt.paymentDate || receipt.payment_date}"
                data-ref="${receipt.receiptRef || receipt.receipt_reference || '-'}"
                data-status="${status}">
                View
              </button>
            </td>
          </tr>`;
      }).join('');

      // Attach View button handlers
      tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('modalContent').innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:0.95rem;">
              <tr><td style="padding:0.5rem; color:#666;">🏠 House</td><td style="padding:0.5rem; font-weight:600;">${btn.dataset.house}</td></tr>
              <tr style="background:#f8f9fa;"><td style="padding:0.5rem; color:#666;">💰 Amount</td><td style="padding:0.5rem; font-weight:600;">KES ${Number(btn.dataset.amount).toLocaleString()}</td></tr>
              <tr><td style="padding:0.5rem; color:#666;">📅 Date</td><td style="padding:0.5rem;">${btn.dataset.date}</td></tr>
              <tr style="background:#f8f9fa;"><td style="padding:0.5rem; color:#666;">🔖 Reference</td><td style="padding:0.5rem;">${btn.dataset.ref}</td></tr>
              <tr><td style="padding:0.5rem; color:#666;">📊 Status</td><td style="padding:0.5rem;">${btn.dataset.status.toUpperCase()}</td></tr>
            </table>
          `;
          document.getElementById('receiptModal').style.display = 'flex';
        });
      });

    } catch (err) {
      console.error('Failed to load receipts:', err);
    }
  }
}