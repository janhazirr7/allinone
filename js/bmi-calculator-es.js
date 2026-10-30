/**
 * OmniTools - Motor de Calculadora de IMC (Español)
 * Unidades métricas e imperiales, rangos oficiales de la OMS y peso ideal.
 */

document.addEventListener('DOMContentLoaded', () => {
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

  const calcBtn = document.getElementById('calcBmiBtn');
  const resetBtn = document.getElementById('resetBmiBtn');
  const copyBtn = document.getElementById('copyBmiBtn');
  const resultsBox = document.getElementById('bmiResultsBox');
  const errorBox = document.getElementById('bmiErrorBox');

  function calculateBMI() {
    let heightMeters = 0;
    let weightKg = 0;
    let displayHeightStr = '';
    let displayWeightStr = '';

    if (currentUnit === 'metric') {
      const heightCm = parseFloat(document.getElementById('heightCm').value);
      const weight = parseFloat(document.getElementById('weightKg').value);

      if (!heightCm || heightCm <= 0 || !weight || weight <= 0) {
        showError('Por favor, introduce valores positivos válidos para altura y peso.');
        return;
      }

      if (heightCm < 50 || heightCm > 260) {
        showError('Introduce una altura realista entre 50 cm y 260 cm.');
        return;
      }
      if (weight < 10 || weight > 500) {
        showError('Introduce un peso realista entre 10 kg y 500 kg.');
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
        showError('Por favor, introduce valores positivos válidos para altura y peso.');
        return;
      }

      if (totalInches < 20 || totalInches > 105) {
        showError('Introduce una altura realista entre 1 ft 8 in y 8 ft 9 in.');
        return;
      }
      if (weightLbs < 22 || weightLbs > 1100) {
        showError('Introduce un peso realista entre 22 lbs y 1100 lbs.');
        return;
      }

      heightMeters = totalInches * 0.0254;
      weightKg = weightLbs * 0.45359237;
      displayHeightStr = `${feet} ft ${inches} in`;
      displayWeightStr = `${weightLbs} lbs`;
    }

    hideError();

    const bmi = weightKg / (heightMeters * heightMeters);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let category = '';
    let badgeClass = '';
    let categoryDesc = '';

    if (bmi < 16.0) {
      category = 'Bajo Peso Severo';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Riesgo elevado de déficit nutricional; se aconseja consulta médica.';
    } else if (bmi >= 16.0 && bmi < 17.0) {
      category = 'Bajo Peso Moderado';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Por debajo del peso recomendado para tu estatura.';
    } else if (bmi >= 17.0 && bmi < 18.5) {
      category = 'Bajo Peso Leve';
      badgeClass = 'bmi-badge-underweight';
      categoryDesc = 'Ligeramente por debajo del rango saludable.';
    } else if (bmi >= 18.5 && bmi < 25.0) {
      category = 'Peso Normal y Saludable';
      badgeClass = 'bmi-badge-normal';
      categoryDesc = 'Índice de masa corporal asociado a menor riesgo estadístico para la salud.';
    } else if (bmi >= 25.0 && bmi < 30.0) {
      category = 'Sobrepeso (Preobesidad)';
      badgeClass = 'bmi-badge-overweight';
      categoryDesc = 'Exceso moderado de masa corporal; se recomienda actividad física y dieta equilibrada.';
    } else if (bmi >= 30.0 && bmi < 35.0) {
      category = 'Obesidad Clase I';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'Riesgo moderado a alto de afecciones cardiovasculares y metabólicas.';
    } else if (bmi >= 35.0 && bmi < 40.0) {
      category = 'Obesidad Clase II';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'Riesgo clínico severo; se recomienda valoración médica profesional.';
    } else {
      category = 'Obesidad Clase III (Mórbida)';
      badgeClass = 'bmi-badge-obese';
      categoryDesc = 'Categoría de riesgo clínico muy elevado.';
    }

    const minHealthyKg = 18.5 * (heightMeters * heightMeters);
    const maxHealthyKg = 24.9 * (heightMeters * heightMeters);
    const minHealthyLbs = minHealthyKg * 2.20462;
    const maxHealthyLbs = maxHealthyKg * 2.20462;

    const idealWeightStr = currentUnit === 'metric'
      ? `${minHealthyKg.toFixed(1)} kg - ${maxHealthyKg.toFixed(1)} kg`
      : `${minHealthyLbs.toFixed(1)} lbs - ${maxHealthyLbs.toFixed(1)} lbs`;

    let targetDeltaStr = '';
    if (bmi < 18.5) {
      const toGainKg = minHealthyKg - weightKg;
      const toGainLbs = toGainKg * 2.20462;
      targetDeltaStr = currentUnit === 'metric'
        ? `Subir ${toGainKg.toFixed(1)} kg para alcanzar el mínimo saludable`
        : `Subir ${toGainLbs.toFixed(1)} lbs para alcanzar el mínimo saludable`;
    } else if (bmi >= 25.0) {
      const toLoseKg = weightKg - maxHealthyKg;
      const toLoseLbs = toLoseKg * 2.20462;
      targetDeltaStr = currentUnit === 'metric'
        ? `Bajar ${toLoseKg.toFixed(1)} kg para situarte en el máximo saludable`
        : `Bajar ${toLoseLbs.toFixed(1)} lbs para situarte en el máximo saludable`;
    } else {
      targetDeltaStr = '¡Enhorabuena! Te encuentras dentro del intervalo de peso saludable';
    }

    const bmiPrime = (bmi / 25.0).toFixed(2);
    const ponderalIndex = (weightKg / Math.pow(heightMeters, 3)).toFixed(1);

    let pointerPercent = ((bmi - 15) / (40 - 15)) * 100;
    pointerPercent = Math.max(3, Math.min(pointerPercent, 97));

    document.getElementById('bmiHeroValue').textContent = bmiRounded.toFixed(1);
    const categoryBadge = document.getElementById('bmiCategoryBadge');
    categoryBadge.textContent = category;
    categoryBadge.className = `bmi-badge ${badgeClass}`;
    document.getElementById('bmiCategoryNote').textContent = categoryDesc;

    const pointer = document.getElementById('bmiGaugePointer');
    if (pointer) pointer.style.left = `${pointerPercent}%`;

    document.getElementById('idealWeightRange').textContent = idealWeightStr;
    document.getElementById('weightTargetNote').textContent = targetDeltaStr;
    document.getElementById('bmiPrimeValue').textContent = `${bmiPrime} (${bmiPrime <= 1.0 ? 'Óptimo' : 'Superior al objetivo'})`;
    document.getElementById('ponderalIndexValue').textContent = `${ponderalIndex} kg/m³`;

    resultsBox.classList.add('active');
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    copyBtn.setAttribute('data-summary', `Mi IMC es ${bmiRounded.toFixed(1)} (${category}) con una estatura de ${displayHeightStr} y peso de ${displayWeightStr}. Rango ideal: ${idealWeightStr}. Calculado con OmniTools.`);
  }

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
        copyToClipboard(summary, '¡Resultado de IMC copiado al portapapeles!');
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

