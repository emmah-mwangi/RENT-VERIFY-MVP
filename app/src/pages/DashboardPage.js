import { apiClient } from '../services/api.js';
import router from '../main.js';

export class DashboardPage {
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
            <div class="stat-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="stat-content">
              <h3>Total Received</h3>
              <p class="stat-value">Ksh 0</p>
            </div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>Verified</h3>
              <p class="stat-value">0</p>
            </div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3>Suspicious</h3>
              <p class="stat-value">0</p>
            </div>
          </div>
          
          <div class="stat-card danger">
            <div class="stat-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <h3>Not Found</h3>
              <p class="stat-value">0</p>
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
                <textarea id="smsMessage" placeholder="Paste M-PESA or bank SMS message here..." rows="4"></textarea>
              </div>
              <button class="btn btn-primary" id="previewSmsBtn">
                <i class="fas fa-search"></i>
                Preview Payment Details
              </button>
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
                  <input type="text" id="houseNumber" placeholder="e.g., A12, Unit 5, House 23">
                </div>
                
                <div class="input-group">
                  <label for="amount">Amount (KES)</label>
                  <input type="number" id="amount" placeholder="e.g., 15000">
                </div>
                
                <div class="input-group">
                  <label for="paymentDate">Payment Date</label>
                  <input type="date" id="paymentDate">
                </div>
                
                <div class="input-group">
                  <label for="receiptRef">Receipt Reference (Optional)</label>
                  <input type="text" id="receiptRef" placeholder="e.g., RCT-001">
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
    `;

    return container;
  }

  async afterRender() {
    // Sign out button
    document.getElementById('signoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      router.navigate('/login');
    });

    // SMS Preview
    document.getElementById('previewSmsBtn').addEventListener('click', async () => {
      const smsMessage = document.getElementById('smsMessage').value.trim();
      if (!smsMessage) {
        alert('Please paste an SMS message');
        return;
      }

      try {
        const data = await apiClient.parseReceipt(smsMessage);
        const parsed = data.data;
        alert(`Amount: ${parsed.amount}, Reference: ${parsed.reference || 'N/A'}, Date: ${parsed.date || 'N/A'}`);
      } catch (err) {
        alert('Could not parse SMS: ' + err.message);
      }
    });

    // Add Receipt
    document.getElementById('addReceiptBtn').addEventListener('click', async () => {
      const houseNumber = document.getElementById('houseNumber').value.trim();
      const amount = document.getElementById('amount').value;
      const paymentDate = document.getElementById('paymentDate').value;
      const receiptRef = document.getElementById('receiptRef').value.trim();
      const receiptImage = document.getElementById('receiptImage').files[0];

      if (!houseNumber || !amount || !paymentDate) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('houseNumber', houseNumber);
        formData.append('amount', amount);
        formData.append('paymentDate', paymentDate);
        formData.append('receiptReference', receiptRef);
        if (receiptImage) {
          formData.append('receiptImage', receiptImage);
        }

        const data = await apiClient.uploadReceipt(formData);
        alert('Receipt added successfully!');
        
        // Clear form
        document.getElementById('houseNumber').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('paymentDate').value = '';
        document.getElementById('receiptRef').value = '';
        document.getElementById('receiptImage').value = '';

        // Reload receipts
        await this.loadReceipts();
      } catch (err) {
        alert('Failed to add receipt: ' + err.message);
      }
    });

    // Load receipts on load
    await this.loadReceipts();
  }

  async loadReceipts() {
    try {
      const data = await apiClient.getReceipts();
      const tbody = document.getElementById('receiptsTableBody');
      const receipts = data.data || data.receipts || [];
      
      if (receipts.length === 0) {
        tbody.innerHTML = `
          <tr class="empty-state">
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray);">
              <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
              No receipts added yet.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = receipts.map(receipt => `
        <tr>
          <td>${receipt.houseNumber || receipt.house_number}</td>
          <td>KES ${Number(receipt.amount).toLocaleString()}</td>
          <td>${receipt.paymentDate || receipt.payment_date}</td>
          <td>${receipt.receiptRef || receipt.receipt_reference || '-'}</td>
          <td><span class="badge badge-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary">View</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load receipts:', err);
    }
  }
}
