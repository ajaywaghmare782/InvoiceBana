// Invoice Generator Logic
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry'
];

document.addEventListener('DOMContentLoaded', function() {
  // Populate state dropdowns
  const stateSelects = document.querySelectorAll('[id$="State"]');
  stateSelects.forEach(select => {
    indianStates.forEach(state => {
      const option = document.createElement('option');
      option.value = state;
      option.textContent = state;
      select.appendChild(option);
    });
  });

  // Invoice number auto-generation
  const invoiceNumberInput = document.getElementById('invoiceNumber');
  if (invoiceNumberInput && !invoiceNumberInput.value) {
    invoiceNumberInput.value = 'INV-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  }

  // Invoice date default to today
  const invoiceDateInput = document.getElementById('invoiceDate');
  if (invoiceDateInput && !invoiceDateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    invoiceDateInput.value = today;
  }

  // Add line item button
  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', addLineItem);
  }

  // Form inputs listener for live preview
  const formInputs = document.querySelectorAll('.invoice-form input, .invoice-form select, .invoice-form textarea');
  formInputs.forEach(input => {
    input.addEventListener('change', updateInvoicePreview);
    input.addEventListener('keyup', updateInvoicePreview);
  });

  // Download PDF button
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
      const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
      generatePDF(invoiceNumber, invoiceDate);
    });
  }

  // Preview button
  const previewBtn = document.getElementById('previewInvoiceBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', function() {
      const preview = document.querySelector('.invoice-preview');
      if (preview) {
        preview.classList.add('show');
        setTimeout(() => {
          preview.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    });
  }

  // Reset form button
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to reset all fields?')) {
        document.querySelector('.invoice-form').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
        document.getElementById('invoiceNumber').value = 'INV-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        updateInvoicePreview();
        
        const preview = document.querySelector('.invoice-preview');
        if (preview) {
          preview.classList.remove('show');
        }
      }
    });
  }

  // Initial preview update
  updateInvoicePreview();
});

function addLineItem() {
  const tableBody = document.querySelector('.line-items-table tbody');
  if (!tableBody) return;

  const rowCount = tableBody.children.length + 1;
  const newRow = document.createElement('tr');
  newRow.className = 'line-item-row';
  newRow.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" data-field="description" placeholder="Item description"></td>
    <td><input type="text" data-field="hsn" placeholder="HSN/SAC"></td>
    <td><input type="number" data-field="qty" placeholder="Qty" min="1" value="1"></td>
    <td><input type="text" data-field="unit" placeholder="Unit" value="pc"></td>
    <td><input type="number" data-field="rate" placeholder="Rate" min="0" step="0.01"></td>
    <td>
      <select data-field="gst">
        <option value="0">0%</option>
        <option value="5">5%</option>
        <option value="12">12%</option>
        <option value="18">18%</option>
        <option value="28">28%</option>
      </select>
    </td>
    <td class="line-amount">₹ 0</td>
    <td><button type="button" class="btn-remove-item btn-small" onclick="removeLineItem(this)">Remove</button></td>
  `;

  tableBody.appendChild(newRow);

  // Add event listeners to new inputs
  const inputs = newRow.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', updateInvoicePreview);
    input.addEventListener('keyup', updateInvoicePreview);
  });
}

function removeLineItem(btn) {
  btn.closest('tr').remove();
  updateLineItemNumbers();
  updateInvoicePreview();
}

function updateLineItemNumbers() {
  const rows = document.querySelectorAll('.line-items-table tbody tr');
  rows.forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

function updateInvoicePreview() {
  // Update seller details
  const businessName = document.getElementById('businessName')?.value || '[Business Name]';
  const gstin = document.getElementById('gstin')?.value || '[GSTIN]';
  const address = document.getElementById('businessAddress')?.value || '[Address]';
  const state = document.getElementById('businessState')?.value || '[State]';
  const phone = document.getElementById('phone')?.value || '[Phone]';
  const email = document.getElementById('email')?.value || '[Email]';

  document.getElementById('previewBusinessName').textContent = businessName;
  document.getElementById('previewGstin').textContent = gstin;
  document.getElementById('previewAddress').textContent = address;
  document.getElementById('previewState').textContent = state;
  document.getElementById('previewPhone').textContent = phone;
  document.getElementById('previewEmail').textContent = email;

  // Update buyer details
  const buyerName = document.getElementById('buyerName')?.value || '[Buyer Name]';
  const buyerGstin = document.getElementById('buyerGstin')?.value || '[GSTIN]';
  const buyerAddress = document.getElementById('buyerAddress')?.value || '[Address]';
  const buyerState = document.getElementById('buyerState')?.value || '[State]';

  document.getElementById('previewBuyerName').textContent = buyerName;
  document.getElementById('previewBuyerGstin').textContent = buyerGstin;
  document.getElementById('previewBuyerAddress').textContent = buyerAddress;
  document.getElementById('previewBuyerState').textContent = buyerState;

  // Update invoice details
  const invoiceNumber = document.getElementById('invoiceNumber')?.value || 'INV-001';
  const invoiceDate = document.getElementById('invoiceDate')?.value || new Date().toISOString().split('T')[0];
  const dueDate = document.getElementById('dueDate')?.value || '';
  const invoiceType = document.getElementById('invoiceType')?.value || 'Tax Invoice';

  document.getElementById('previewInvoiceNumber').textContent = invoiceNumber;
  document.getElementById('previewInvoiceDate').textContent = invoiceDate;
  document.getElementById('previewDueDate').textContent = dueDate || 'N/A';
  document.getElementById('previewInvoiceType').textContent = invoiceType;

  // Update line items preview
  updateLineItemsPreview();

  // Calculate and update totals
  calculateTotals();
}

function updateLineItemsPreview() {
  const previewTable = document.querySelector('.invoice-items-table tbody');
  if (!previewTable) return;

  previewTable.innerHTML = '';

  const lineItems = document.querySelectorAll('.line-item-row');
  lineItems.forEach(row => {
    const description = row.querySelector('[data-field="description"]')?.value || '';
    const hsn = row.querySelector('[data-field="hsn"]')?.value || '';
    const qty = parseFloat(row.querySelector('[data-field="qty"]')?.value || 0);
    const unit = row.querySelector('[data-field="unit"]')?.value || '';
    const rate = parseFloat(row.querySelector('[data-field="rate"]')?.value || 0);
    const gst = parseFloat(row.querySelector('[data-field="gst"]')?.value || 0);

    const amount = qty * rate;

    const previewRow = document.createElement('tr');
    previewRow.innerHTML = `
      <td>${description}</td>
      <td>${hsn}</td>
      <td>${qty.toFixed(2)}</td>
      <td>${unit}</td>
      <td>₹ ${rate.toFixed(2)}</td>
      <td>${gst.toFixed(0)}%</td>
      <td>₹ ${amount.toFixed(2)}</td>
    `;

    previewTable.appendChild(previewRow);

    // Update amount in form
    row.querySelector('.line-amount').textContent = '₹ ' + amount.toFixed(2);
  });
}

function calculateTotals() {
  let subtotal = 0;
  const businessState = document.getElementById('businessState')?.value;
  const buyerState = document.getElementById('buyerState')?.value;
  const isSameState = businessState === buyerState && businessState;

  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const lineItems = document.querySelectorAll('.line-item-row');
  lineItems.forEach(row => {
    const qty = parseFloat(row.querySelector('[data-field="qty"]')?.value || 0);
    const rate = parseFloat(row.querySelector('[data-field="rate"]')?.value || 0);
    const gst = parseFloat(row.querySelector('[data-field="gst"]')?.value || 0);

    const amount = qty * rate;
    subtotal += amount;

    if (isSameState) {
      const cgst = amount * gst / 100 / 2;
      const sgst = amount * gst / 100 / 2;
      totalCgst += cgst;
      totalSgst += sgst;
    } else {
      const igst = amount * gst / 100;
      totalIgst += igst;
    }
  });

  // Update summary
  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  
  if (isSameState) {
    document.querySelector('[data-field="cgst-sgst"]').style.display = 'flex';
    document.querySelector('[data-field="igst"]').style.display = 'none';
    document.getElementById('cgstAmount').textContent = totalCgst.toFixed(2);
    document.getElementById('sgstAmount').textContent = totalSgst.toFixed(2);
    document.getElementById('igstAmount').textContent = '0.00';
  } else {
    document.querySelector('[data-field="cgst-sgst"]').style.display = 'none';
    document.querySelector('[data-field="igst"]').style.display = 'flex';
    document.getElementById('cgstAmount').textContent = '0.00';
    document.getElementById('sgstAmount').textContent = '0.00';
    document.getElementById('igstAmount').textContent = totalIgst.toFixed(2);
  }

  const totalGst = totalCgst + totalSgst + totalIgst;
  const grandTotal = subtotal + totalGst;

  document.getElementById('totalGstAmount').textContent = totalGst.toFixed(2);
  document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);

  // Amount in words
  const amountInWordsElement = document.getElementById('amountInWords');
  if (amountInWordsElement) {
    amountInWordsElement.textContent = 'Rupees ' + numberToWords(Math.floor(grandTotal));
  }

  // Update summary in preview
  document.getElementById('previewSubtotal').textContent = subtotal.toFixed(2);
  document.getElementById('previewCgst').textContent = totalCgst.toFixed(2);
  document.getElementById('previewSgst').textContent = totalSgst.toFixed(2);
  document.getElementById('previewIgst').textContent = totalIgst.toFixed(2);
  document.getElementById('previewTotalGst').textContent = totalGst.toFixed(2);
  document.getElementById('previewGrandTotal').textContent = grandTotal.toFixed(2);
}
