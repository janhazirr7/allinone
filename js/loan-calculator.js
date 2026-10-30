/**
 * OmniTools - High-Precision Loan EMI & Amortization Engine
 * Computes standard reducing balance EMI, total interest, and year-by-year amortization.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loanAmountInput = document.getElementById('loanAmount');
  const interestRateInput = document.getElementById('interestRate');
  const loanTenureInput = document.getElementById('loanTenure');
  const tenureUnitSelect = document.getElementById('tenureUnit');
  const calcBtn = document.getElementById('calcLoanBtn');
  const resetBtn = document.getElementById('resetLoanBtn');
  const copyBtn = document.getElementById('copyLoanBtn');
  const resultsBox = document.getElementById('loanResultsBox');
  const errorBox = document.getElementById('loanErrorBox');

  function calculateLoan() {
    const P = parseFloat(loanAmountInput.value);
    const R = parseFloat(interestRateInput.value);
    const tenureVal = parseFloat(loanTenureInput.value);
    const unit = tenureUnitSelect.value;

    if (!P || P <= 0 || isNaN(R) || R < 0 || !tenureVal || tenureVal <= 0) {
      showError('Please enter valid positive values for loan amount, interest rate, and duration.');
      return;
    }

    if (P > 100000000) {
      showError('Loan amount cannot exceed 100,000,000.');
      return;
    }
    if (R > 50) {
      showError('Annual interest rate cannot exceed 50%.');
      return;
    }

    const n = (unit === 'years') ? Math.round(tenureVal * 12) : Math.round(tenureVal);
    if (n < 1 || n > 600) {
      showError('Loan tenure must be between 1 month and 50 years (600 months).');
      return;
    }

    hideError();

    let emi = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (R === 0) {
      emi = P / n;
      totalPayment = P;
      totalInterest = 0;
    } else {
      const r = R / (12 * 100);
      const factor = Math.pow(1 + r, n);
      emi = (P * r * factor) / (factor - 1);
      totalPayment = emi * n;
      totalInterest = totalPayment - P;
    }

    const principalPercent = ((P / totalPayment) * 100).toFixed(1);
    const interestPercent = ((totalInterest / totalPayment) * 100).toFixed(1);

    // Payoff Date (from current month + n months)
    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + n, 1);
    const payoffStr = payoffDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Format Currency Helper
    const formatCurr = (val) => '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Update DOM Highlight Cards
    document.getElementById('monthlyEmiValue').textContent = formatCurr(emi);
    document.getElementById('totalInterestValue').textContent = formatCurr(totalInterest);
    document.getElementById('totalPaymentValue').textContent = formatCurr(totalPayment);
    document.getElementById('payoffDateValue').textContent = payoffStr;

    // Visual Proportion Bar
    const barPrincipal = document.getElementById('barPrincipal');
    const barInterest = document.getElementById('barInterest');
    if (barPrincipal && barInterest) {
      barPrincipal.style.width = `${principalPercent}%`;
      barInterest.style.width = `${interestPercent}%`;
    }
    document.getElementById('legendPrincipalPct').textContent = `${principalPercent}%`;
    document.getElementById('legendInterestPct').textContent = `${interestPercent}%`;

    // Generate Annual Amortization Table
    generateAmortizationSchedule(P, R, n, emi);

    resultsBox.classList.add('active');
    resultsBox.style.display = 'block';
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    copyBtn.setAttribute('data-summary', `Loan Summary: Principal ${formatCurr(P)} at ${R}% for ${n} months. Monthly EMI: ${formatCurr(emi)}, Total Interest: ${formatCurr(totalInterest)}, Total Payment: ${formatCurr(totalPayment)}. Calculated with OmniTools.`);
  }

  function generateAmortizationSchedule(principal, annualRate, totalMonths, emi) {
    const tableBody = document.getElementById('amortizationTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const r = (annualRate > 0) ? annualRate / (12 * 100) : 0;
    let balance = principal;
    let currentMonth = 0;
    let yearNum = 1;

    while (currentMonth < totalMonths && balance > 0) {
      const yearStartBalance = balance;
      let yearPrincipal = 0;
      let yearInterest = 0;

      const monthsInThisYear = Math.min(12, totalMonths - currentMonth);

      for (let m = 0; m < monthsInThisYear; m++) {
        const monthInterest = balance * r;
        let monthPrincipal = emi - monthInterest;

        if (monthPrincipal > balance || (currentMonth + m === totalMonths - 1)) {
          monthPrincipal = balance;
        }

        yearInterest += monthInterest;
        yearPrincipal += monthPrincipal;
        balance -= monthPrincipal;
      }

      currentMonth += monthsInThisYear;
      const yearEndBalance = Math.max(0, balance);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Year ${yearNum}</strong></td>
        <td>$${yearStartBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
        <td>$${yearPrincipal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
        <td>$${yearInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
        <td>$${yearEndBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
      `;
      tableBody.appendChild(tr);
      yearNum++;
    }
  }

  if (calcBtn) calcBtn.addEventListener('click', calculateLoan);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      loanAmountInput.value = '';
      interestRateInput.value = '';
      loanTenureInput.value = '';
      hideError();
      if (resultsBox) {
        resultsBox.classList.remove('active');
        resultsBox.style.display = 'none';
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = copyBtn.getAttribute('data-summary');
      if (summary) {
        copyToClipboard(summary, 'Loan calculation copied to clipboard!');
      }
    });
  }

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
  }

  function hideError() {
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }
  }
});
