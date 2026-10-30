/**
 * OmniTools - Lógica de Calculadora de Edad (Español)
 * Calendario gregoriano, años bisiestos y cálculo temporal exacto.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dobInput = document.getElementById('dobInput');
  const targetDateInput = document.getElementById('targetDateInput');
  const calcBtn = document.getElementById('calcAgeBtn');
  const resetBtn = document.getElementById('resetAgeBtn');
  const resultsBox = document.getElementById('ageResultsBox');
  const errorBox = document.getElementById('ageErrorBox');
  const copyBtn = document.getElementById('copyAgeBtn');

  const today = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (targetDateInput) {
    targetDateInput.value = formatYMD(today);
    targetDateInput.max = '2099-12-31';
  }
  if (dobInput) {
    dobInput.max = formatYMD(today);
  }

  function calculateAge() {
    if (!dobInput.value) {
      showError('Por favor, introduce tu fecha de nacimiento.');
      return;
    }

    const birthDate = parseLocalDate(dobInput.value);
    const targetDate = targetDateInput.value ? parseLocalDate(targetDateInput.value) : new Date();

    if (birthDate > targetDate) {
      showError('La fecha de nacimiento no puede ser posterior a la fecha de cálculo.');
      return;
    }

    hideError();

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthYear = months < 0 ? targetDate.getFullYear() - 1 : targetDate.getFullYear();
      const prevMonth = months < 0 ? 11 : targetDate.getMonth() - 1;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTimeMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTimeMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    const nextBdayInfo = getNextBirthdayInfo(birthDate, targetDate);
    const zodiac = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
    const birthstone = getBirthstone(birthDate.getMonth() + 1);

    const tenThousandDays = new Date(birthDate.getTime() + (10000 * 24 * 60 * 60 * 1000));
    const milestoneDateStr = tenThousandDays.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

    document.getElementById('primaryAgeText').textContent = `${years} Años, ${months} Meses, ${days} Días`;
    document.getElementById('primaryAgeSub').textContent = `Total de ${totalDays.toLocaleString('es-ES')} días vividos`;

    document.getElementById('statTotalMonths').textContent = totalMonths.toLocaleString('es-ES');
    document.getElementById('statTotalWeeks').textContent = totalWeeks.toLocaleString('es-ES');
    document.getElementById('statTotalDays').textContent = totalDays.toLocaleString('es-ES');
    document.getElementById('statTotalHours').textContent = totalHours.toLocaleString('es-ES');
    document.getElementById('statTotalMinutes').textContent = totalMinutes.toLocaleString('es-ES');

    document.getElementById('nextBdayDays').textContent = nextBdayInfo.text;
    document.getElementById('nextBdayDayOfWeek').textContent = nextBdayInfo.dayOfWeek;

    document.getElementById('zodiacSign').textContent = zodiac;
    document.getElementById('birthStone').textContent = birthstone;
    document.getElementById('milestone10k').textContent = milestoneDateStr;

    resultsBox.classList.add('active');
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    copyBtn.setAttribute('data-summary', `Mi edad: ${years} Años, ${months} Meses y ${days} Días (${totalDays.toLocaleString('es-ES')} días en total). Próximo cumpleaños en un ${nextBdayInfo.dayOfWeek}. Calculado en OmniTools.`);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculateAge);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      dobInput.value = '';
      if (targetDateInput) targetDateInput.value = formatYMD(new Date());
      hideError();
      resultsBox.classList.remove('active');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = copyBtn.getAttribute('data-summary');
      if (summary) {
        copyToClipboard(summary, '¡Cálculo de edad copiado al portapapeles!');
      }
    });
  }

  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function getNextBirthdayInfo(birthDate, targetDate) {
    const currentYear = targetDate.getFullYear();
    let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

    if (nextBday < targetDate) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const diffDays = Math.ceil((nextBday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = dayNames[nextBday.getDay()];

    if (diffDays === 0) {
      return { text: '🎉 ¡Hoy es el cumpleaños!', dayOfWeek: 'Hoy' };
    } else if (diffDays === 1) {
      return { text: 'Falta 1 día', dayOfWeek };
    } else {
      return { text: `Faltan ${diffDays} días`, dayOfWeek };
    }
  }

  function getZodiacSign(month, day) {
    const signs = [
      { name: 'Capricornio ♑', endMonth: 1, endDay: 19 },
      { name: 'Acuario ♒', endMonth: 2, endDay: 18 },
      { name: 'Piscis ♓', endMonth: 3, endDay: 20 },
      { name: 'Aries ♈', endMonth: 4, endDay: 19 },
      { name: 'Tauro ♉', endMonth: 5, endDay: 20 },
      { name: 'Géminis ♊', endMonth: 6, endDay: 20 },
      { name: 'Cáncer ♋', endMonth: 7, endDay: 22 },
      { name: 'Leo ♌', endMonth: 8, endDay: 22 },
      { name: 'Virgo ♍', endMonth: 9, endDay: 22 },
      { name: 'Libra ♎', endMonth: 10, endDay: 22 },
      { name: 'Escorpio ♏', endMonth: 11, endDay: 21 },
      { name: 'Sagitario ♐', endMonth: 12, endDay: 21 },
      { name: 'Capricornio ♑', endMonth: 12, endDay: 31 }
    ];

    for (const sign of signs) {
      if (month < sign.endMonth || (month === sign.endMonth && day <= sign.endDay)) {
        return sign.name;
      }
    }
    return 'Capricornio ♑';
  }

  function getBirthstone(month) {
    const stones = [
      'Granate', 'Amatista', 'Aguamarina', 'Diamante',
      'Esmeralda', 'Perla y Alejandrita', 'Rubí', 'Peridoto',
      'Zafiro', 'Ópalo y Turmalina', 'Topacio y Citrino', 'Turquesa y Tanzanita'
    ];
    return stones[month - 1] || 'Desconocida';
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

