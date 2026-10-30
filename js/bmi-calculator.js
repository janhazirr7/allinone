/**
 * OmniTools - High-Precision BMI Calculator Engine
 * Supports Metric & Imperial Units, WHO Classifications, and Ideal Weight Range
 */

document.addEventListener('DOMContentLoaded', () => {
  // Unit Toggle
  const metricTab = document.getElementById('metricTabBtn');
  const imperialTab = document.getElementById('imperialTabBtn');
  const metricGroup = document.getElementById('metricInputGroup');
  const imperialGroup = document.getElementById('imperialInputGroup');
  let currentUnit = 'metric';

  if (metricTab && imperialTab) {
    metricTab.addEventListener('click', () => {
      metricTab.classList.add('active');
      imperialTab.classList.remove('active');
      metricGroup.classList.add('active');
      imperialGroup.classList.remove('active');
      currentUnit = 'metric';
    });

    imperialTab.addEventListener('click', () => {
      imperialTab.classList.add('active');
      metricTab.classList.remove('active');
      imperialGroup.classList.add('active');
      metricGroup.classList.remove('active');
      currentUnit = 'imperial';
    });
  }

  // DOM Elements
  const calcBtn = document.getElementById('calcBmiBtn');
  const resetBtn = document.getElementById('resetBmiBtn');
  const copyBtn = document.getElementById('copyBmiBtn');
  const resultsBox = document.getElementById('bmiResultsBox');
  const errorBox = document.getElementById('bmiErrorBox');

  // Calculation Handler
  function calculateBMI() {
    let heightMeters = 0;
    let weightKg = 0;
    let displayHeightStr = '';
    let displayWeightStr = '';

    if (currentUnit === 'metric') {
      const heightCm = parseFloat(document.getElementById('heightCm').value);
      const weight = parseFloat(document.getElementById('weightKg').value);

      if (!heightCm || heightCm <= 0 || !weight || weight <= 0) {
        showError('Please enter valid positive values for height and weight.');
        return;
      }

      if (heightCm < 50 || heightCm > 260) {
        showError('Please enter a realistic height between 50 cm and 260 cm.');
        return;
      }
      if (weight < 10 || weight > 500) {
        showError('Please enter a realistic weight between 10 kg and 500 kg.');
        return;
      }

      heightMeters = heightCm / 100;
      weightKg = weight;
      displayHeightStr = `${heightCm} cm`;
      displayWeightStr = `${weight} kg`;
    } else {
      const feet = parseFloat(document.getElementById('heightFt').value) || 0;
      const inches = parseFloat(document.getElementById('heightIn').value) || 0;
      const weightLbs = parseFloat(document.getElementById('weightLbs').value);

      const totalInches = (feet * 12) + inches;

      if (totalInches <= 0 || !weightLbs || weightLbs <= 0) {
        showError('Please enter valid positive values for height and weight.');
        return;
      }

      if (totalInches < 20 || totalInches > 105) {
        showError('Please enter a realistic height between 1 ft 8 in and 8 ft 9 in.');
        return;
      }
      if (weightLbs < 22 || weightLbs > 1100) {
        showError('Please enter a realistic weight between 22 lbs and 1100 lbs.');
        return;
      }

      heightMeters = totalInches * 0.0254;
      weightKg = weightLbs * 0.45359237;
      displayHeightStr = `${feet} ft ${inches} in`;
      displayWeightStr = `${weightLbs} lbs`;
    }

    hideError();

    // Core BMI Formula: weight(kg) / height(m)^2
    const bmi = weightKg / (heightMeters * heightMeters);
    const bmiRounded = Math.round(bmi * 10) / 10;

    // WHO Classification
    let category = '';
    let badgeClass = '';
    let categoryDesc = '';

    if (bmi < 16.0) {
      category = 'Severe Thinness';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Significant risk of nutritional deficiency; clinical evaluation advised.';
    } else if (bmi >= 16.0 && bmi < 17.0) {
      category = 'Moderate Thinness';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Below recommended body weight; consult a healthcare professional.';
    } else if (bmi >= 17.0 && bmi < 18.5) {
      category = 'Mild Thinness (Underweight)';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Slightly below healthy weight range.';
    } else if (bmi >= 18.5 && bmi < 25.0) {
      category = 'Normal Weight';
      badgeClass = 'bmi-badge-normal';
      categoryDesc = 'Healthy body mass index associated with lowest statistical health risks.';
    } else if (bmi >= 25.0 && bmi < 30.0) {
      category = 'Overweight (Pre-obese)';
      badgeClass = 'bmi-badge-overweight';
      categoryDesc = 'Moderate excess body mass; lifestyle and dietary adjustments recommended.';
    } else if (bmi >= 30.0 && bmi < 35.0) {
      category = 'Obesity Class I';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'Elevated risk of cardiovascular and metabolic conditions.';
    } else if (bmi >= 35.0 && bmi < 40.0) {
      category = 'Obesity Class II';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'High health risk; medical guidance strongly advised.';
    } else {
      category = 'Obesity Class III';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'Very high clinical risk category.';
    }

    // Ideal Weight Range (BMI 18.5 to 24.9)
    const minHealthyKg = 18.5 * (heightMeters * heightMeters);
    const maxHealthyKg = 24.9 * (heightMeters * heightMeters);
    const minHealthyLbs = minHealthyKg * 2.20462;
    const maxHealthyLbs = maxHealthyKg * 2.20462;

    const idealWeightStr = currentUnit === 'metric'
      ? `${minHealthyKg.toFixed(1)} kg - ${maxHealthyKg.toFixed(1)} kg`
      : `${minHealthyLbs.toFixed(1)} lbs - ${maxHealthyLbs.toFixed(1)} lbs`;

    // Weight delta to normal range
    let targetDeltaStr = '';
    if (bmi < 18.5) {
      const toGainKg = minHealthyKg - weightKg;
      const toGainLbs = toGainKg * 2.20462;
      targetDeltaStr = currentUnit === 'metric'
        ? `Gain ${toGainKg.toFixed(1)} kg to reach healthy minimum`
        : `Gain ${toGainLbs.toFixed(1)} lbs to reach healthy minimum`;
    } else if (bmi >= 25.0) {
      const toLoseKg = weightKg - maxHealthyKg;
      const toLoseLbs = toLoseKg * 2.20462;
      targetDeltaStr = currentUnit === 'metric'
        ? `Lose ${toLoseKg.toFixed(1)} kg to reach healthy maximum`
        : `Lose ${toLoseLbs.toFixed(1)} lbs to reach healthy maximum`;
    } else {
      targetDeltaStr = 'You are comfortably within the healthy weight range';
    }

    // BMI Prime = BMI / 25
    const bmiPrime = (bmi / 25.0).toFixed(2);

    // Ponderal Index = weight(kg) / height(m)^3
    const ponderalIndex = (weightKg / Math.pow(heightMeters, 3)).toFixed(1);

    // Gauge needle positioning (Range 15 to 40)
    let pointerPercent = ((bmi - 15) / (40 - 15)) * 100;
    pointerPercent = Math.max(3, Math.min(pointerPercent, 97));

    // Update DOM
    document.getElementById('bmiHeroValue').textContent = bmiRounded.toFixed(1);
    const categoryBadge = document.getElementById('bmiCategoryBadge');
    categoryBadge.textContent = category;
    categoryBadge.className = `bmi-badge ${badgeClass}`;
    document.getElementById('bmiCategoryNote').textContent = categoryDesc;

    const pointer = document.getElementById('bmiGaugePointer');
    if (pointer) pointer.style.left = `${pointerPercent}%`;

    document.getElementById('idealWeightRange').textContent = idealWeightStr;
    document.getElementById('weightTargetNote').textContent = targetDeltaStr;
    document.getElementById('bmiPrimeValue').textContent = `${bmiPrime} (${bmiPrime <= 1.0 ? 'Optimal' : 'Above Target'})`;
    document.getElementById('ponderalIndexValue').textContent = `${ponderalIndex} kg/m³`;

    resultsBox.classList.add('active');
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Summary for Clipboard Copy
    copyBtn.setAttribute('data-summary', `My BMI is ${bmiRounded.toFixed(1)} (${category}) based on height ${displayHeightStr} and weight ${displayWeightStr}. Ideal range: ${idealWeightStr}. Calculated with OmniTools.`);
  }

  // Event Listeners
  if (calcBtn) calcBtn.addEventListener('click', calculateBMI);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('heightCm').value = '';
      document.getElementById('weightKg').value = '';
      document.getElementById('heightFt').value = '';
      document.getElementById('heightIn').value = '';
      document.getElementById('weightLbs').value = '';
      hideError();
      resultsBox.classList.remove('active');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = copyBtn.getAttribute('data-summary');
      if (summary) {
        copyToClipboard(summary, 'BMI results copied to clipboard!');
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

