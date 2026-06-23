// GST Calculator Logic
document.addEventListener('DOMContentLoaded', function() {
  const amountInput = document.getElementById('calcAmount');
  const gstRateSelect = document.getElementById('gstRate');
  const toggleButtons = document.querySelectorAll('.calc-toggle button');
  const stateTypeButtons = document.querySelectorAll('.state-type-toggle button');

  if (amountInput) {
    amountInput.addEventListener('input', calculateGst);
  }

  if (gstRateSelect) {
    gstRateSelect.addEventListener('change', calculateGst);
  }

  // Toggle exclusive/inclusive
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      toggleButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      calculateGst();
    });
  });

  // Toggle intra/inter state
  stateTypeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      stateTypeButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      calculateGst();
    });
  });
});

function calculateGst() {
  const amount = parseFloat(document.getElementById('calcAmount')?.value || 0);
  const gstRate = parseFloat(document.getElementById('gstRate')?.value || 0);
  const isExclusive = document.querySelector('.calc-toggle button.active')?.textContent === 'Exclusive' || 
                      document.querySelector('.calc-toggle button.active')?.dataset.type === 'exclusive';
  const isSameState = document.querySelector('.state-type-toggle button.active')?.dataset.type === 'intra' ||
                      document.querySelector('.state-type-toggle button.active')?.textContent.includes('Intra');

  if (amount <= 0 || gstRate < 0) {
    document.getElementById('calcResults').style.display = 'none';
    return;
  }

  let baseAmount, totalGst, grandTotal, cgst = 0, sgst = 0, igst = 0;

  if (isExclusive) {
    // GST is added to the amount
    baseAmount = amount;
    totalGst = (amount * gstRate) / 100;
    grandTotal = amount + totalGst;

    if (isSameState) {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }
  } else {
    // GST is extracted from the amount
    grandAmount = amount;
    // Formula: Base = Total / (1 + (GST%/100))
    baseAmount = amount / (1 + gstRate / 100);
    totalGst = amount - baseAmount;

    if (isSameState) {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }

    grandTotal = amount;
  }

  // Display results
  const resultsDiv = document.getElementById('calcResults');
  if (resultsDiv) {
    resultsDiv.style.display = 'block';
    document.getElementById('resultBaseAmount').textContent = baseAmount.toFixed(2);
    document.getElementById('resultTotalGst').textContent = totalGst.toFixed(2);
    document.getElementById('resultGrandTotal').textContent = grandTotal.toFixed(2);

    if (isSameState) {
      document.getElementById('resultCgst').textContent = cgst.toFixed(2);
      document.getElementById('resultSgst').textContent = sgst.toFixed(2);
      document.getElementById('resultCgstSgstContainer').style.display = 'block';
      document.getElementById('resultIgstContainer').style.display = 'none';
    } else {
      document.getElementById('resultIgst').textContent = igst.toFixed(2);
      document.getElementById('resultCgstSgstContainer').style.display = 'none';
      document.getElementById('resultIgstContainer').style.display = 'block';
    }
  }
}

// Copy result to clipboard
function copyResult(elementId) {
  const text = document.getElementById(elementId)?.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied: ₹ ' + text);
    });
  }
}
