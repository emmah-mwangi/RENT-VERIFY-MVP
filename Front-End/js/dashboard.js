// ===== RENT VERIFIER DASHBOARD - VERIFICATION & RECONCILIATION =====

const API_BASE = "http://localhost:5000/api";
let authToken = null;
let currentLandlordMessageId = null;

document.addEventListener('DOMContentLoaded', function() {
    authToken = localStorage.getItem("token");
    
    if (!authToken) {
        window.location.href = "index.html";
        return;
    }

    setupEventListeners();
    loadVerificationHistory();
    updateStats();
});

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Sign out functionality
    const signOutBtn = document.querySelector('.btn-signout');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }

    // SMS parsing button
    const previewBtn = document.querySelector('.panel-content .btn-primary');
    if (previewBtn) {
        previewBtn.addEventListener('click', handleSMSSubmit);
    }

    // Receipt submission button
    const addReceiptBtn = document.querySelector('.btn-success');
    if (addReceiptBtn) {
        addReceiptBtn.addEventListener('click', handleReceiptSubmit);
    }

    // Verify All button
    const verifyAllBtn = document.querySelector('.btn-outline');
    if (verifyAllBtn) {
        verifyAllBtn.addEventListener('click', handleVerifyAll);
    }

    // Table actions
    document.addEventListener('click', handleTableActions);
}

// ===== SMS PARSING =====
async function handleSMSSubmit(e) {
    e.preventDefault();
    const smsMessage = document.getElementById("smsMessage").value.trim();

    if (!smsMessage) {
        alert("Please paste an SMS message");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/receipts/parse-sms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ messageText: smsMessage })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Error parsing SMS");
            return;
        }

        currentLandlordMessageId = result.data.id;
        
        alert(`✓ SMS Parsed Successfully!\n\nAmount: KES ${result.data.amount}\nDate: ${result.data.date}\nReference: ${result.data.reference}\n\nNow add a caretaker receipt below to verify.`);
        document.getElementById("smsMessage").value = "";

    } catch (error) {
        console.error("Error:", error);
        alert("Error parsing SMS: " + error.message);
    }
}

// ===== RECEIPT SUBMISSION WITH IMAGE =====
async function handleReceiptSubmit(e) {
    e.preventDefault();

    const houseNumber = document.getElementById("houseNumber").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const paymentDate = document.getElementById("paymentDate").value;
    const receiptRef = document.getElementById("receiptRef").value.trim();
    const receiptImage = document.getElementById("receiptImage").files[0];

    if (!houseNumber || !amount || !paymentDate) {
        alert("Please fill in all required fields (House Number, Amount, Payment Date)");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("houseNumber", houseNumber);
        formData.append("amount", amount);
        formData.append("paymentDate", formatDateForAPI(paymentDate));
        formData.append("receiptReference", receiptRef || "");
        if (receiptImage) {
            formData.append("receiptImage", receiptImage);
        }

        const response = await fetch(`${API_BASE}/receipts/add-receipt`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Error adding receipt");
            return;
        }

        const receiptId = result.data.id;
        alert("✓ Receipt added successfully!");

        // Automatically verify if we have a landlord message
        if (currentLandlordMessageId) {
            const shouldVerify = confirm("Do you want to verify this receipt against the landlord message now?");
            if (shouldVerify) {
                await verifyReceipt(receiptId, currentLandlordMessageId);
            }
        }

        // Clear form
        clearReceiptForm();
        loadVerificationHistory();

    } catch (error) {
        console.error("Error:", error);
        alert("Error adding receipt: " + error.message);
    }
}

// ===== VERIFY RECEIPT AGAINST MESSAGE =====
async function verifyReceipt(receiptId, landlordMessageId) {
    try {
        const response = await fetch(`${API_BASE}/receipts/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ receiptId, landlordMessageId })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Error verifying receipt");
            return;
        }

        displayVerificationResult(result.data);
        loadVerificationHistory();
        updateStats();

    } catch (error) {
        console.error("Error:", error);
        alert("Error verifying receipt: " + error.message);
    }
}

// ===== DISPLAY VERIFICATION RESULT MODAL =====
function displayVerificationResult(verification) {
    const statusColor = {
        "verified": "#10b981",
        "suspicious": "#f59e0b",
        "failed": "#ef4444",
        "pending": "#6b7280"
    };

    const statusEmoji = {
        "verified": "✓",
        "suspicious": "⚠",
        "failed": "✗",
        "pending": "⏳"
    };

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <span class="close" style="cursor: pointer; font-size: 1.5rem; padding: 10px;">&times;</span>
            
            <h2 style="margin-top: 0;">Verification Result</h2>
            
            <div style="background: ${statusColor[verification.status]}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0;">${statusEmoji[verification.status]} ${verification.status.toUpperCase()}</h3>
                <p style="margin: 10px 0 0 0; font-size: 1.2em; font-weight: bold;">Match Score: ${verification.score}%</p>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Verification Details:</h4>
                <p style="white-space: pre-wrap; margin: 0;">${verification.notes}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 2px solid #3b82f6;">
                    <strong style="display: block; margin-bottom: 10px; color: #1e40af;">Caretaker Receipt:</strong>
                    <p style="margin: 5px 0;"><small>House:</small> ${verification.receipt.houseNumber}</p>
                    <p style="margin: 5px 0;"><small>Amount:</small> KES ${verification.receipt.amount}</p>
                    <p style="margin: 5px 0;"><small>Date:</small> ${verification.receipt.date}</p>
                </div>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 2px solid #10b981;">
                    <strong style="display: block; margin-bottom: 10px; color: #166534;">Landlord Message:</strong>
                    <p style="margin: 5px 0;"><small>Amount:</small> KES ${verification.landlordMessage.amount}</p>
                    <p style="margin: 5px 0;"><small>Date:</small> ${verification.landlordMessage.date}</p>
                    <p style="margin: 5px 0;"><small>Ref:</small> ${verification.landlordMessage.reference || 'N/A'}</p>
                </div>
            </div>

            <button class="btn primary-btn" onclick="this.closest('.modal').remove()" style="width: 100%; cursor: pointer;">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector(".close").onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// ===== LOAD VERIFICATION HISTORY =====
async function loadVerificationHistory() {
    try {
        const response = await fetch(`${API_BASE}/receipts/verification-history`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Error loading history:", result.message);
            return;
        }

        const tbody = document.querySelector(".verification-table tbody");
        
        if (result.data.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No receipts verified yet. Add a receipt above to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(item => `
            <tr class="${item.verification_status}">
                <td>${item.house_number}</td>
                <td>KES ${parseFloat(item.caretaker_amount).toLocaleString()}</td>
                <td>${item.caretaker_date}</td>
                <td>${item.receipt_reference || "-"}</td>
                <td>
                    <span class="status-badge ${item.verification_status}">
                        ${getStatusEmoji(item.verification_status)} ${item.verification_status}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="viewVerificationDetail(${item.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error:", error);
    }
}

// ===== TABLE ACTIONS =====
function handleTableActions(e) {
    if (e.target.closest('.btn-icon')) {
        const btn = e.target.closest('.btn-icon');
        if (btn.title === "View Details") {
            // Already handled by onclick
            return;
        }
    }
}

function handleVerifyAll() {
    if (confirm("Verify all pending receipts?")) {
        alert("Batch verification process started...");
        // Implement batch verification logic
    }
}

function handleSignOut() {
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
}

// ===== UPDATE STATISTICS =====
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE}/receipts/verification-history`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        
        if (response.ok && result.data) {
            const data = result.data;
            const verified = data.filter(x => x.verification_status === "verified").length;
            const suspicious = data.filter(x => x.verification_status === "suspicious").length;
            const failed = data.filter(x => x.verification_status === "failed").length;
            const totalAmount = data.reduce((sum, x) => sum + (parseFloat(x.caretaker_amount) || 0), 0);

            document.querySelectorAll(".stat-value")[0].textContent = `Ksh ${totalAmount.toLocaleString()}`;
            document.querySelectorAll(".stat-value")[1].textContent = verified;
            document.querySelectorAll(".stat-value")[2].textContent = suspicious;
            document.querySelectorAll(".stat-value")[3].textContent = failed;
        }
    } catch (error) {
        console.error("Error updating stats:", error);
    }
}

// ===== HELPER FUNCTIONS =====
function getStatusEmoji(status) {
    const emojis = {
        "verified": "✓",
        "suspicious": "⚠",
        "failed": "✗",
        "pending": "⏳"
    };
    return emojis[status] || "•";
}

function formatDateForAPI(dateString) {
    // Convert YYYY-MM-DD to DD-MMM-YYYY
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function clearReceiptForm() {
    document.getElementById("houseNumber").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("paymentDate").value = "";
    document.getElementById("receiptRef").value = "";
    document.getElementById("receiptImage").value = "";
}

function viewVerificationDetail(verificationId) {
    alert("Viewing verification details for ID: " + verificationId);
    // Implement detailed view functionality
}

// Update stats periodically
setInterval(updateStats, 30000);