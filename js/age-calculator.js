/**
 * OmniTools - High-Precision Age Calculator Logic
 * Handles Gregorian leap years, variable month lengths, and exact elapsed time.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dobInput = document.getElementById('dobInput');
  const targetDateInput = document.getElementById('targetDateInput');
  const calcBtn = document.getElementById('calcAgeBtn');
  const resetBtn = document.getElementById('resetAgeBtn');
  const resultsBox = document.getElementById('ageResultsBox');
  const errorBox = document.getElementById('ageErrorBox');
  const copyBtn = document.getElementById('copyAgeBtn');

  // Set default "Age as of" date to today (local time YYYY-MM-DD)
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

  // Calculate Handler
  function calculateAge() {
    if (!dobInput.value) {
      showError('Please enter your date of birth.');
      return;
    }

    const birthDate = parseLocalDate(dobInput.value);
    const targetDate = targetDateInput.value ? parseLocalDate(targetDateInput.value) : new Date();

    if (birthDate > targetDate) {
      showError('Date of birth cannot be later than the "Age as of" date.');
      return;
    }

    hideError();

    // 1. Calculate Exact Years, Months, Days
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      // Borrow days from previous month of targetDate
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

    // 2. Total duration metrics
    const diffTimeMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTimeMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // 3. Next Birthday calculation
    const nextBdayInfo = getNextBirthdayInfo(birthDate, targetDate);

    // 4. Zodiac & Birthstone
    const zodiac = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
    const birthstone = getBirthstone(birthDate.getMonth() + 1);

    // 5. 10,000 Days Milestone
    const tenThousandDays = new Date(birthDate.getTime() + (10000 * 24 * 60 * 60 * 1000));
    const milestoneDateStr = tenThousandDays.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    // Update DOM
    document.getElementById('primaryAgeText').textContent = `${years} Years, ${months} Months, ${days} Days`;
    document.getElementById('primaryAgeSub').textContent = `Total of ${totalDays.toLocaleString()} days lived`;

    document.getElementById('statTotalMonths').textContent = totalMonths.toLocaleString();
    document.getElementById('statTotalWeeks').textContent = totalWeeks.toLocaleString();
    document.getElementById('statTotalDays').textContent = totalDays.toLocaleString();
    document.getElementById('statTotalHours').textContent = totalHours.toLocaleString();
    document.getElementById('statTotalMinutes').textContent = totalMinutes.toLocaleString();

    document.getElementById('nextBdayDays').textContent = nextBdayInfo.text;
    document.getElementById('nextBdayDayOfWeek').textContent = nextBdayInfo.dayOfWeek;

    document.getElementById('zodiacSign').textContent = zodiac;
    document.getElementById('birthStone').textContent = birthstone;
    document.getElementById('milestone10k').textContent = milestoneDateStr;

    resultsBox.classList.add('active');
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Store summary for copy button
    copyBtn.setAttribute('data-summary', `My Age: ${years} Years, ${months} Months, ${days} Days (${totalDays.toLocaleString()} total days lived). Next birthday is on a ${nextBdayInfo.dayOfWeek}. Calculated with OmniTools.`);
  }

  // Event Listeners
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
        copyToClipboard(summary, 'Age calculation copied to clipboard!');
      }
    });
  }

  // Helpers
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

    // If birthday already passed this year, take next year
    if (nextBday < targetDate) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const diffDays = Math.ceil((nextBday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[nextBday.getDay()];

    if (diffDays === 0) {
      return { text: '🎉 Today is the birthday!', dayOfWeek: 'Today' };
    } else if (diffDays === 1) {
      return { text: '1 day remaining', dayOfWeek };
    } else {
      return { text: `${diffDays} days remaining`, dayOfWeek };
    }
  }

  function getZodiacSign(month, day) {
    const signs = [
      { name: 'Capricorn ♑', endMonth: 1, endDay: 19 },
      { name: 'Aquarius ♒', endMonth: 2, endDay: 18 },
      { name: 'Pisces ♓', endMonth: 3, endDay: 20 },
      { name: 'Aries ♈', endMonth: 4, endDay: 19 },
      { name: 'Taurus ♉', endMonth: 5, endDay: 20 },
      { name: 'Gemini ♊', endMonth: 6, endDay: 20 },
      { name: 'Cancer ♋', endMonth: 7, endDay: 22 },
      { name: 'Leo ♌', endMonth: 8, endDay: 22 },
      { name: 'Virgo ♍', endMonth: 9, endDay: 22 },
      { name: 'Libra ♎', endMonth: 10, endDay: 22 },
      { name: 'Scorpio ♏', endMonth: 11, endDay: 21 },
      { name: 'Sagittarius ♐', endMonth: 12, endDay: 21 },
      { name: 'Capricorn ♑', endMonth: 12, endDay: 31 }
    ];

    for (const sign of signs) {
      if (month < sign.endMonth || (month === sign.endMonth && day <= sign.endDay)) {
        return sign.name;
      }
    }
    return 'Capricorn ♑';
  }

  function getBirthstone(month) {
    const stones = [
      'Garnet', 'Amethyst', 'Aquamarine', 'Diamond',
      'Emerald', 'Alexandrite & Pearl', 'Ruby', 'Peridot',
      'Sapphire', 'Opal & Tourmaline', 'Topaz & Citrine', 'Tanzanite & Turquoise'
    ];
    return stones[month - 1] || 'Unknown';
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

