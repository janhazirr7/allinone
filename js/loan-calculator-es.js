/**
 * OmniTools - Motor de Calculadora de Préstamos (Español)
 * Sistema de amortización francés, cuota mensual constante e intereses totales.
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
      showError('Por favor, introduce valores positivos válidos para importe, tipo de interés y duración.');
      return;
    }
    if (P > 100000000) {
      showError('El importe del préstamo no puede superar los 100.000.000.');
      return;
    }
    if (R > 50) {
      showError('El tipo de interés anual no puede superar el 50%.');
      return;
    }

    const n = (unit === 'years') ? Math.round(tenureVal * 12) : Math.round(tenureVal);
    if (n < 1 || n > 600) {
      showError('El plazo debe situarse entre 1 mes y 50 años (600 meses).');
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

    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + n, 1);
    const payoffStr = payoffDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    function formatCurr(val) {
      return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    document.getElementById('monthlyEmiValue').textContent = formatCurr(emi);
    document.getElementById('totalInterestValue').textContent = formatCurr(totalInterest);
    document.getElementById('totalPaymentValue').textContent = formatCurr(totalPayment);
    document.getElementById('payoffDateValue').textContent = payoffStr;

    const barPrincipal = document.getElementById('barPrincipal');
    const barInterest = document.getElementById('barInterest');
    if (barPrincipal && barInterest) {
      barPrincipal.style.width = principalPercent + '%';
      barInterest.style.width = interestPercent + '%';
    }
    document.getElementById('legendPrincipalPct').textContent = principalPercent + '%';
    document.getElementById('legendInterestPct').textContent = interestPercent + '%';

    generateSchedule(P, R, n, emi);

    if (resultsBox) {
      resultsBox.classList.add('active');
      resultsBox.style.display = 'block';
      resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (copyBtn) {
      copyBtn.setAttribute('data-summary', 'Resumen de Préstamo: Capital ' + formatCurr(P) + ' al ' + R + '% durante ' + n + ' meses. Cuota mensual: ' + formatCurr(emi) + ', Intereses totales: ' + formatCurr(totalInterest) + ', Total a devolver: ' + formatCurr(totalPayment) + '. Calculado en OmniTools.');
    }
  }

  function generateSchedule(principal, annualRate, totalMonths, emi) {
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
        <td><strong>Año ${yearNum}</strong></td>
        <td>${Math.round(yearStartBalance).toLocaleString('es-ES')} €</td>
        <td>${Math.round(yearPrincipal).toLocaleString('es-ES')} €</td>
        <td>${Math.round(yearInterest).toLocaleString('es-ES')} €</td>
        <td>${Math.round(yearEndBalance).toLocaleString('es-ES')} €</td>
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
