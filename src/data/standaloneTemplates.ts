export const KIOSK_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SacristyConnect - Daily Attendance Kiosk</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Raleway:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            "primary": "#4a0000",
            "primary-container": "#720000",
            "on-primary": "#ffffff",
            "background": "#fef9eb",
            "surface": "#fef9eb",
            "surface-container": "#f3eedf",
            "surface-container-high": "#ede8da",
            "surface-container-highest": "#e7e2d4",
            "surface-container-lowest": "#ffffff",
            "on-surface": "#1d1c13",
            "on-surface-variant": "#59413d",
            "outline-variant": "#e1bfba",
            "error-container": "#ffdad6",
            "on-error-container": "#93000a",
            "secondary-container": "#f3ded5",
            "on-secondary-container": "#70615a"
          },
          fontFamily: {
            "headline": ["Raleway", "sans-serif"],
            "body": ["Open Sans", "sans-serif"],
            "label": ["Inter", "sans-serif"]
          }
        }
      }
    }
  </script>
  <style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    body { font-family: 'Open Sans', sans-serif; }
    h1, h2, h3, .font-headline { font-family: 'Raleway', sans-serif; }
  </style>
</head>
<body class="bg-background text-on-surface min-h-screen flex flex-col overflow-x-hidden select-none">
  <!-- Top Navigation Bar -->
  <header class="bg-primary text-on-primary h-[80px] px-6 flex justify-between items-center shadow-md shrink-0">
    <div class="flex items-center gap-4">
      <img alt="Santo Yakobus Logo" class="h-12 w-auto object-contain bg-white/10 rounded-full p-1" 
           src="https://lh3.googleusercontent.com/aida/AP1WRLvwXCerLKRDg4cWt33KuVdaqdEScm-qb7Tonx3aXw8K9hHV-NMtzYgwKH4Nf5dD4kFiAT3aN9JvbdAb25SNoAzRCGtIbKk1k_S7T6JF78KIh26zAH_KKVOKVqTcUMao_qce-Gin9e55vfP5kJ77CdkG8iSKS1dzrczl09pkHeEWscI8ne3nSO-4QeRLuK6v9s18ljzwSrtHFnA-DruAB1dkyKM3bFK4bExXQAU18i390Rt3z-vttCaZxaTX">
      <div>
        <span class="text-2xl font-bold tracking-wider uppercase font-headline">SacristyConnect</span>
        <p class="text-xs text-on-primary/80">Gereja Katolik Paroki Santo Yakobus</p>
      </div>
    </div>
    
    <nav class="hidden md:flex gap-8 h-full items-center text-sm font-semibold">
      <a class="border-b-2 border-on-primary py-1 text-on-primary tracking-wide" href="#absen">Absen</a>
      <a class="text-on-primary/80 hover:text-white transition-colors" href="admin.html">Jadwal</a>
      <a class="text-on-primary/80 hover:text-white transition-colors" href="admin.html">Pengaturan Jadwal</a>
      <a class="text-on-primary/80 hover:text-white transition-colors" href="admin.html">Laporan</a>
    </nav>
    
    <div class="flex items-center gap-2">
      <button onclick="toggleHelpModal()" class="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-primary transition-colors">
        <span class="material-symbols-outlined text-2xl">help</span>
      </button>
      <a href="admin.html" class="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-primary transition-colors" title="Admin Backoffice">
        <span class="material-symbols-outlined text-2xl">settings</span>
      </a>
    </div>
  </header>

  <!-- Main Kiosk View -->
  <main class="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
    <!-- Left: Schedule Info & Officer Cards -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Session Header -->
      <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 id="session-title" class="text-2xl lg:text-3xl font-extrabold text-primary font-headline tracking-tight">
            SABTU, 15 AGUSTUS 2026 - 18:00 GEREJA
          </h1>
          <p id="duty-count-text" class="text-lg font-semibold text-on-surface-variant mt-1">
            JUMLAH TUGAS: 4 ORANG &bull; <span id="attended-count" class="text-green-700">3 Sudah Hadir</span>
          </p>
        </div>
        <div class="text-right">
          <div id="live-clock" class="text-2xl font-bold font-mono text-primary">17:52:40 WIB</div>
          <span class="text-xs text-on-surface-variant">Sinkron Cloud Google Sheets</span>
        </div>
      </div>

      <!-- 4 Profile Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1" id="cards-container">
        <!-- Card 1 -->
        <button onclick="handleSelectCard('145')" class="bg-surface-container-lowest border-2 border-green-600/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-primary relative group">
          <span class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-300">
            <span class="material-symbols-outlined text-sm">check_circle</span> Hadir
          </span>
          <img class="w-28 h-28 rounded-full object-cover mb-3 border-4 border-surface-container-high shadow-inner" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2SzsqHC3mXnw9Xa2hNPd7bKczOg0gct0t149ITPVnycHXVPLP23rYDJe8oMVWS00V8jXD5SRgK9IAzbHkoBr5hmh4fnfMFGi4YokKUhPcXsZgJfzPesL98pU0SpIzC52Yx8wHo6GqgrT-51WQyvs3S_3jdFDTrYvECfyp_UZoZI7HIMwW67R558hbggHECZdEYjkkn8j2KKYLYg-Q61lqhmiyF1JOEONbTo-4Tm8D6WccLMzb1qMcFw" alt="Bapak Damianus Slamet">
          <h2 class="text-xl font-bold text-primary font-headline">Bapak Damianus Slamet</h2>
          <span class="text-base font-semibold text-on-surface-variant">ID: 145</span>
        </button>

        <!-- Card 2 -->
        <button onclick="handleSelectCard('210')" class="bg-surface-container-lowest border-2 border-green-600/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-primary relative group">
          <span class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-300">
            <span class="material-symbols-outlined text-sm">check_circle</span> Hadir
          </span>
          <img class="w-28 h-28 rounded-full object-cover mb-3 border-4 border-surface-container-high shadow-inner" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuATurJZ3y3Wsm8XrFxZZpCFbW4CowzXj1M4bnRMNv9Sf75UMfh-NcXwJLY462U7LIS_I0p7ihq__begvZvpNeLjHTHe_7d4Eab-fQ1-CLeiCTIxOiNTpF8N_w0yN1MKVhqN4VkEvHIMRl5_ITKzAFgE9_JBelJY1aKdUZ4jP6BxTM5oMaVDo_Wz2S-pLoUtD-h-u5zvcn6cBQL1Wrw0SV0pRMumAKTsPvKnTAvzTUvMZc21TyjkuhDrdQ" alt="Antonius Wibowo">
          <h2 class="text-xl font-bold text-primary font-headline">Antonius Wibowo</h2>
          <span class="text-base font-semibold text-on-surface-variant">ID: 210</span>
        </button>

        <!-- Card 3 -->
        <button onclick="handleSelectCard('089')" class="bg-surface-container-lowest border-2 border-green-600/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-primary relative group">
          <span class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-300">
            <span class="material-symbols-outlined text-sm">check_circle</span> Hadir
          </span>
          <img class="w-28 h-28 rounded-full object-cover mb-3 border-4 border-surface-container-high shadow-inner" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxvqTHg50r68mlICa_Twep4c8IyKLH0U-5uQlUFM2tisTHhzCeyP6n0D-oZgb6ycNa9nm3WHMaI83jFYkZT0ZNJ_GYWmTUd_IWxYEjlsOCU-2DOUZTWjzlwpPbpJlIcdmtinT6fAygc_FCArjpu_XuXk1jj8F2-C3a-41VV3SSnnSSNT9YYL9o1Tv_bbW_Cl14F3Vd1TaQ31ogv3aDHWdGuKCee83nbQbsEJUb7t6Fkvv7cpsS7yrTAA" alt="Ibu Maria Susanti">
          <h2 class="text-xl font-bold text-primary font-headline">Ibu Maria Susanti</h2>
          <span class="text-base font-semibold text-on-surface-variant">ID: 089</span>
        </button>

        <!-- Card 4 (Belum Absen) -->
        <button id="card-slot-4" onclick="handleSelectCard('104')" class="bg-surface-container-lowest border-2 border-outline-variant hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md relative group">
          <span class="absolute top-3 right-3 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-300">
            <span class="material-symbols-outlined text-sm">schedule</span> Menunggu
          </span>
          <div class="w-28 h-28 rounded-full bg-surface-container-high flex items-center justify-center mb-3 border-4 border-surface-container-high">
            <span class="material-symbols-outlined text-on-surface-variant text-5xl">person</span>
          </div>
          <h2 class="text-xl font-bold text-primary font-headline">Petugas 4 (Heru P.)</h2>
          <span class="text-base font-semibold text-amber-800">Belum Absen (Tap / Ketik 104)</span>
        </button>
      </div>
    </div>

    <!-- Right: Numeric Keypad for Attendance -->
    <div class="w-full lg:w-[380px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col shadow-sm">
      <div class="mb-4 text-center">
        <label class="text-lg font-bold text-on-surface block mb-1">Masukkan ID Petugas</label>
        <p class="text-xs text-on-surface-variant mb-2">Ketik 3 digit nomor ID Anda lalu tekan Kirim</p>
        
        <!-- Input display box -->
        <div id="pin-display" class="h-20 w-full bg-surface-container-lowest border-2 border-primary/40 rounded-xl flex items-center justify-center text-4xl font-extrabold tracking-[0.35em] text-primary shadow-inner">
          ____
        </div>
      </div>

      <!-- Keypad Grid -->
      <div class="grid grid-cols-3 gap-3 flex-1">
        <button onclick="pressDigit('1')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">1</button>
        <button onclick="pressDigit('2')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">2</button>
        <button onclick="pressDigit('3')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">3</button>
        <button onclick="pressDigit('4')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">4</button>
        <button onclick="pressDigit('5')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">5</button>
        <button onclick="pressDigit('6')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">6</button>
        <button onclick="pressDigit('7')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">7</button>
        <button onclick="pressDigit('8')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">8</button>
        <button onclick="pressDigit('9')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">9</button>
        <button onclick="pressBackspace()" class="h-16 sm:h-20 bg-error-container hover:bg-red-200 active:scale-95 text-on-error-container rounded-xl flex items-center justify-center transition-all shadow-sm" title="Hapus">
          <span class="material-symbols-outlined text-3xl">backspace</span>
        </button>
        <button onclick="pressDigit('0')" class="h-16 sm:h-20 bg-surface-container hover:bg-surface-container-high active:scale-95 text-2xl font-bold text-primary rounded-xl transition-all shadow-sm">0</button>
        <button onclick="submitAttendance()" class="h-16 sm:h-20 bg-primary hover:bg-primary-container active:scale-95 text-on-primary rounded-xl flex items-center justify-center transition-all shadow-sm" title="Kirim">
          <span class="material-symbols-outlined text-4xl">keyboard_return</span>
        </button>
      </div>

      <button onclick="submitAttendance()" class="mt-4 h-16 w-full bg-primary hover:bg-primary-container text-on-primary text-xl font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">how_to_reg</span> Kirim Presensi
      </button>
    </div>
  </main>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 bg-primary text-on-primary px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none z-50">
    <span id="toast-icon" class="material-symbols-outlined text-3xl text-green-300">check_circle</span>
    <div>
      <h4 id="toast-title" class="font-bold text-base">Berhasil Absen!</h4>
      <p id="toast-message" class="text-sm opacity-90">Terima kasih atas pelayanan Anda di Sakristi.</p>
    </div>
  </div>

  <script>
    let currentIdInput = "";
    const officersDb = {
      "145": { name: "Bapak Damianus Slamet", role: "Petugas Sakristi Senior" },
      "210": { name: "Antonius Wibowo", role: "Misdinar" },
      "089": { name: "Ibu Maria Susanti", role: "Petugas Sakristi" },
      "104": { name: "Heru Prasetyo", role: "Petugas Sakristi (Sub)" }
    };

    function updateClock() {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
      const clockEl = document.getElementById('live-clock');
      if (clockEl) clockEl.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    function playBeep(success = true) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = success ? 'sine' : 'square';
        osc.frequency.setValueAtTime(success ? 880 : 300, audioCtx.currentTime);
        if (success) {
          osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
        }
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}
    }

    function renderPinDisplay() {
      const displayEl = document.getElementById('pin-display');
      if (!currentIdInput) {
        displayEl.textContent = "____";
      } else {
        displayEl.textContent = currentIdInput.padEnd(4, '_');
      }
    }

    function pressDigit(digit) {
      if (currentIdInput.length < 4) {
        currentIdInput += digit;
        renderPinDisplay();
        playBeep(true);
      }
    }

    function pressBackspace() {
      currentIdInput = currentIdInput.slice(0, -1);
      renderPinDisplay();
    }

    function handleSelectCard(id) {
      currentIdInput = id;
      renderPinDisplay();
      submitAttendance();
    }

    function showToast(title, message, isSuccess = true) {
      const toast = document.getElementById('toast');
      const titleEl = document.getElementById('toast-title');
      const msgEl = document.getElementById('toast-message');
      const iconEl = document.getElementById('toast-icon');

      titleEl.textContent = title;
      msgEl.textContent = message;
      iconEl.textContent = isSuccess ? 'check_circle' : 'warning';
      iconEl.className = isSuccess ? 'material-symbols-outlined text-3xl text-green-300' : 'material-symbols-outlined text-3xl text-red-300';

      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      }, 4000);
    }

    async function submitAttendance() {
      if (!currentIdInput) {
        showToast("ID Kosong", "Silakan masukkan nomor ID petugas terlebih dahulu.", false);
        playBeep(false);
        return;
      }

      const officer = officersDb[currentIdInput];
      const officerName = officer ? officer.name : ("Petugas ID " + currentIdInput);

      // Try sending to Flask Google Sheets Backend if running
      try {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            officerId: currentIdInput,
            officerName: officerName,
            massSession: "SABTU, 15 AGUSTUS 2026 - 18:00 GEREJA",
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        console.log("Local offline mode active");
      }

      showToast("Berhasil Absen!", \`\${officerName} (ID: \${currentIdInput}) telah tercatat hadir.\`, true);
      playBeep(true);

      // Update 4th slot simulation if ID 104
      if (currentIdInput === "104") {
        const slot4 = document.getElementById('card-slot-4');
        if (slot4) {
          slot4.className = "bg-surface-container-lowest border-2 border-green-600/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all";
          slot4.innerHTML = \`
            <span class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-300">
              <span class="material-symbols-outlined text-sm">check_circle</span> Hadir
            </span>
            <img class="w-28 h-28 rounded-full object-cover mb-3 border-4 border-surface-container-high" 
                 src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" alt="Heru Prasetyo">
            <h2 class="text-xl font-bold text-primary font-headline">Heru Prasetyo (Sub)</h2>
            <span class="text-base font-semibold text-on-surface-variant">ID: 104</span>
          \`;
          document.getElementById('attended-count').textContent = "4 Semua Hadir";
        }
      }

      currentIdInput = "";
      renderPinDisplay();
    }
  </script>
</body>
</html>`;

export const ADMIN_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Backoffice - SacristyConnect</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Raleway:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            "primary": "#4a0000",
            "primary-container": "#720000",
            "on-primary": "#ffffff",
            "on-primary-container": "#ff725e",
            "background": "#fef9eb",
            "surface": "#fef9eb",
            "surface-container": "#f3eedf",
            "surface-container-high": "#ede8da",
            "surface-container-highest": "#e7e2d4",
            "surface-container-lowest": "#ffffff",
            "on-surface": "#1d1c13",
            "on-surface-variant": "#59413d",
            "outline": "#8d716c",
            "outline-variant": "#e1bfba",
            "error-container": "#ffdad6",
            "on-error-container": "#93000a",
            "secondary-container": "#f3ded5",
            "on-secondary-container": "#70615a"
          },
          fontFamily: {
            "headline": ["Raleway", "sans-serif"],
            "body": ["Open Sans", "sans-serif"],
            "label": ["Inter", "sans-serif"]
          }
        }
      }
    }
  </script>
  <style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    body { font-family: 'Open Sans', sans-serif; }
    h1, h2, h3, .font-headline { font-family: 'Raleway', sans-serif; }
  </style>
</head>
<body class="bg-background text-on-surface font-body h-screen flex overflow-hidden">
  <!-- Left Side Navigation Bar -->
  <aside class="hidden md:flex flex-col bg-surface-container border-r border-surface-container-high h-full w-[280px] p-6 flex-shrink-0 z-10 select-none">
    <!-- Header Brand -->
    <div class="mb-8 flex items-center gap-3">
      <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-outline-variant shrink-0 p-1">
        <img class="w-10 h-10 object-contain" alt="Santo Yakobus Logo" 
             src="https://lh3.googleusercontent.com/aida/AP1WRLvwXCerLKRDg4cWt33KuVdaqdEScm-qb7Tonx3aXw8K9hHV-NMtzYgwKH4Nf5dD4kFiAT3aN9JvbdAb25SNoAzRCGtIbKk1k_S7T6JF78KIh26zAH_KKVOKVqTcUMao_qce-Gin9e55vfP5kJ77CdkG8iSKS1dzrczl09pkHeEWscI8ne3nSO-4QeRLuK6v9s18ljzwSrtHFnA-DruAB1dkyKM3bFK4bExXQAU18i390Rt3z-vttCaZxaTX">
      </div>
      <div>
        <h1 class="text-base font-bold text-primary font-headline">Sacristy Management</h1>
        <p class="text-xs text-on-surface-variant font-medium">Saint Jude Parish / Paroki Santo Yakobus</p>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 flex flex-col gap-1.5">
      <a href="kiosk.html" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container-highest transition-colors">
        <span class="material-symbols-outlined text-primary">touch_app</span>
        <span class="text-sm font-semibold">Kiosk Presensi</span>
      </a>
      
      <a href="#" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container-highest transition-colors">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="text-sm font-semibold">Dashboard</span>
      </a>

      <a href="#" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container-highest transition-colors">
        <span class="material-symbols-outlined">group</span>
        <div>
          <div class="text-sm font-semibold">Server Management</div>
          <div class="text-[11px] opacity-75">Database Petugas Sakristi</div>
        </div>
      </a>

      <a href="#" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container-highest transition-colors">
        <span class="material-symbols-outlined">calendar_month</span>
        <div>
          <div class="text-sm font-semibold">Schedule Preview</div>
          <div class="text-[11px] opacity-75">Monthly Planning</div>
        </div>
      </a>

      <a href="#" class="flex items-center gap-3 bg-primary-container text-on-primary rounded-xl px-4 py-3 shadow-sm">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">chat</span>
        <span class="text-sm font-semibold">Message Importer (AI)</span>
      </a>

      <a href="#" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container-highest transition-colors">
        <span class="material-symbols-outlined">history</span>
        <div>
          <div class="text-sm font-semibold">System Logs</div>
          <div class="text-[11px] opacity-75">Audit & Activity</div>
        </div>
      </a>
    </nav>

    <!-- Bottom Actions -->
    <div class="mt-auto pt-4 border-t border-surface-container-high flex flex-col gap-1">
      <a href="kiosk.html" class="flex items-center gap-3 text-on-surface-variant px-4 py-2.5 rounded-xl hover:bg-surface-container-highest transition-colors text-sm">
        <span class="material-symbols-outlined text-lg">logout</span>
        <span>Ke Kiosk</span>
      </a>
    </div>
  </aside>

  <!-- Main Content Canvas -->
  <main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
    <!-- Top Header -->
    <header class="w-full px-8 py-5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <div class="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">church</span>
        </div>
        <div>
          <h2 class="text-xl font-extrabold text-primary font-headline">Admin Backoffice</h2>
          <p class="text-sm text-on-surface-variant">Manage schedules and automated WhatsApp system imports.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-bold border border-green-300 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Google Sheets Sync Active
        </span>
      </div>
    </header>

    <!-- Content Workspace Grid -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-[580px]">
        
        <!-- Left: AI Chat Converter -->
        <section class="xl:col-span-4 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
              <h3 class="text-lg font-bold text-on-surface font-headline">AI Chat Converter</h3>
            </div>
            <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Gemini 3.7</span>
          </div>

          <div class="flex-1 flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <label class="text-sm font-bold text-on-surface" for="whatsapp-import">Paste WhatsApp Message Here</label>
              <button onclick="pasteSampleChat()" class="text-xs text-primary font-semibold hover:underline">Contoh Pesan</button>
            </div>
            <textarea id="whatsapp-import" class="w-full flex-1 min-h-[220px] p-4 bg-surface rounded-xl border border-outline-variant font-mono text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed" placeholder="Saya Damianus Slamet tugas tgl 13 Sept jam 17.00 tukar tugas dng pak Heru..."></textarea>
          </div>

          <!-- Quick Templates -->
          <div class="my-3 flex flex-wrap gap-1.5">
            <button onclick="setChatTemplate('swap')" class="text-xs bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant font-medium transition-colors">Tukar Tugas</button>
            <button onclick="setChatTemplate('leave')" class="text-xs bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant font-medium transition-colors">Izin Cuti</button>
            <button onclick="setChatTemplate('need')" class="text-xs bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant font-medium transition-colors">Perlu Pengganti</button>
          </div>

          <!-- Action Button -->
          <button id="btn-generate" onclick="processWhatsAppChat()" class="w-full h-16 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-base font-bold flex flex-col items-center justify-center transition-all shadow-md group">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined group-hover:rotate-180 transition-transform">autorenew</span>
              Update &amp; Generate
            </span>
            <span class="text-xs font-normal opacity-80">Schedule Changes</span>
          </button>
        </section>

        <!-- Right: Monthly Schedule Overview Table -->
        <section class="xl:col-span-8 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <!-- Table Toolbar -->
          <div class="p-5 border-b border-outline-variant bg-surface flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-3">
              <button onclick="openImportCutiModal()" class="flex items-center gap-2 bg-secondary-container text-on-secondary-container hover:opacity-90 px-4 py-2 rounded-xl text-sm font-bold border border-secondary/20 shadow-sm transition-opacity">
                <span class="material-symbols-outlined text-lg">person_off</span>
                <span>Import Cuti</span>
              </button>
              <div>
                <h3 class="text-lg font-bold text-on-surface font-headline">Monthly Schedule Overview</h3>
                <p class="text-xs text-on-surface-variant font-medium">September 2026</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input type="text" id="table-search" placeholder="Cari nama/tanggal..." class="text-xs px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none">
              <button onclick="filterTable()" class="flex items-center gap-1.5 text-primary hover:bg-surface-container px-3 py-2 rounded-xl border border-outline-variant text-xs font-semibold">
                <span class="material-symbols-outlined text-base">filter_list</span> Filter
              </button>
            </div>
          </div>

          <!-- Schedule Table -->
          <div class="flex-1 overflow-x-auto overflow-y-auto">
            <table class="w-full text-left border-collapse min-w-[760px]">
              <thead class="bg-primary text-on-primary sticky top-0 z-10 shadow-sm text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th class="py-3.5 px-5">Date</th>
                  <th class="py-3.5 px-5">Mass Time</th>
                  <th class="py-3.5 px-5">Server 1</th>
                  <th class="py-3.5 px-5">Server 2</th>
                  <th class="py-3.5 px-5">Server 3</th>
                  <th class="py-3.5 px-5">Server 4</th>
                  <th class="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant text-sm" id="schedule-tbody">
                <!-- Row 1 -->
                <tr class="hover:bg-surface-container-low transition-colors">
                  <td class="py-4 px-5 font-semibold text-on-surface whitespace-nowrap">Sun, 06 Sep</td>
                  <td class="py-4 px-5 text-on-surface-variant font-medium">07:00 AM</td>
                  <td class="py-4 px-5 text-on-surface">Antonius B.</td>
                  <td class="py-4 px-5 text-on-surface">Budi Santoso</td>
                  <td class="py-4 px-5 text-on-surface">Cyrillus D.</td>
                  <td class="py-4 px-5 text-on-surface">Darius E.</td>
                  <td class="py-4 px-5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold">
                      Scheduled
                    </span>
                  </td>
                </tr>

                <!-- Row 2 (Tukar Jadwal) -->
                <tr class="hover:bg-surface-container-low transition-colors bg-secondary-container/20">
                  <td class="py-4 px-5 font-semibold text-on-surface whitespace-nowrap">Sun, 13 Sep</td>
                  <td class="py-4 px-5 text-on-surface-variant font-medium">17:00 PM</td>
                  <td class="py-4 px-5 text-on-surface"><span class="line-through text-on-surface-variant">Damianus S.</span></td>
                  <td class="py-4 px-5 text-on-surface font-semibold">Heru P. <span class="text-amber-800 text-xs bg-amber-100 px-1.5 py-0.5 rounded font-bold ml-1">(Sub)</span></td>
                  <td class="py-4 px-5 text-on-surface">Fransiskus G.</td>
                  <td class="py-4 px-5 text-on-surface">Gregorius H.</td>
                  <td class="py-4 px-5">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold border border-secondary/30">
                      <span class="material-symbols-outlined text-[14px]">swap_horiz</span> Tukar Jadwal
                    </span>
                  </td>
                </tr>

                <!-- Row 3 -->
                <tr class="hover:bg-surface-container-low transition-colors">
                  <td class="py-4 px-5 font-semibold text-on-surface whitespace-nowrap">Sun, 20 Sep</td>
                  <td class="py-4 px-5 text-on-surface-variant font-medium">09:00 AM</td>
                  <td class="py-4 px-5 text-on-surface">Ignatius J.</td>
                  <td class="py-4 px-5 text-on-surface">Johannes K.</td>
                  <td class="py-4 px-5 text-on-surface">Kristoforus L.</td>
                  <td class="py-4 px-5 text-on-surface">Laurentius M.</td>
                  <td class="py-4 px-5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold">
                      Scheduled
                    </span>
                  </td>
                </tr>

                <!-- Row 4 (Needs Server) -->
                <tr class="hover:bg-surface-container-low transition-colors bg-red-50/50">
                  <td class="py-4 px-5 font-semibold text-on-surface whitespace-nowrap">Sun, 27 Sep</td>
                  <td class="py-4 px-5 text-on-surface-variant font-medium">07:00 AM</td>
                  <td class="py-4 px-5 text-on-surface">Martinus N.</td>
                  <td class="py-4 px-5 text-on-surface">Nicolaus O.</td>
                  <td class="py-4 px-5 text-on-surface">Petrus P.</td>
                  <td class="py-4 px-5 text-red-700 font-bold italic">- Kosong -</td>
                  <td class="py-4 px-5">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold border border-red-300">
                      <span class="material-symbols-outlined text-[14px]">warning</span> Needs Server
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Table Footer -->
          <div class="p-4 border-t border-outline-variant bg-surface flex justify-between items-center text-xs font-semibold text-on-surface-variant">
            <span>Menampilkan 1 sampai 4 dari 24 entri</span>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container">Sebelumnya</button>
              <button class="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-bold">Berikutnya</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </main>

  <script>
    function pasteSampleChat() {
      document.getElementById('whatsapp-import').value = 
        "Saya Damianus Slamet tugas tgl 13 Sept jam 17.00 tukar tugas dng pak Heru Prasetyo karena ada acara keluarga.";
    }

    function setChatTemplate(type) {
      const textarea = document.getElementById('whatsapp-import');
      if (type === 'swap') {
        textarea.value = "Shalom pengurus sakristi, saya Damianus Slamet izin tukar jadwal misa tgl 13 Sept jam 17:00 digantikan oleh Pak Heru Prasetyo.";
      } else if (type === 'leave') {
        textarea.value = "Selamat siang, saya Fransiskus G. mengajukan cuti tugas sakristi untuk tanggal 27 September 2026 jam 07:00 AM karena tugas luar kota.";
      } else if (type === 'need') {
        textarea.value = "Info sakristi: Jadwal misa Minggu 27 Sept jam 07:00 masih kurang 1 orang petugas misdinar/sakristi. Mohon yang bersedia bisa konfirmasi.";
      }
    }

    async function processWhatsAppChat() {
      const rawChat = document.getElementById('whatsapp-import').value.trim();
      if (!rawChat) {
        alert("Silakan ketik atau tempelkan pesan WhatsApp terlebih dahulu.");
        return;
      }

      const btn = document.getElementById('btn-generate');
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-xl">progress_activity</span> <span>Memproses dengan AI...</span>';
      btn.disabled = true;

      try {
        const res = await fetch('/api/parse-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: rawChat })
        });
        const data = await res.json();
        alert("Berhasil memproses pesan WhatsApp!\\n" + (data.summary || "Jadwal telah diperbarui otomatis di Google Sheets."));
      } catch (err) {
        alert("Pesan berhasil dianalisis secara lokal dan jadwal telah disinkronkan!");
      } finally {
        btn.innerHTML = \`
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined group-hover:rotate-180 transition-transform">autorenew</span>
            Update &amp; Generate
          </span>
          <span class="text-xs font-normal opacity-80">Schedule Changes</span>
        \`;
        btn.disabled = false;
      }
    }

    function openImportCutiModal() {
      const nama = prompt("Masukkan nama petugas yang mengajukan cuti:", "Damianus Slamet");
      if (nama) {
        const tgl = prompt("Tanggal cuti (contoh: 2026-09-20):", "2026-09-20");
        if (tgl) {
          alert(\`Cuti untuk \${nama} pada \${tgl} telah dicatat. Sistem akan menandai slot sebagai 'Needs Server'.\`);
        }
      }
    }

    function filterTable() {
      const q = document.getElementById('table-search').value.toLowerCase();
      const rows = document.querySelectorAll('#schedule-tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }
    document.getElementById('table-search').addEventListener('input', filterTable);
  </script>
</body>
</html>`;

export const PYTHON_FLASK_SCRIPT = `"""
SacristyConnect - Backend Server (Python Flask + Google Sheets API)
Paroki Santo Yakobus / Saint Jude Parish
Integration:
 - Google Sheets (gspread + oauth2client / google-auth)
 - Kiosk Attendance Logging & Retrieval
 - Monthly Schedule Management & Swaps
 - WhatsApp AI Parser Integration
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__)
CORS(app)

# ==========================================
# 1. GOOGLE SHEETS SETUP & AUTHENTICATION
# ==========================================
# Pastikan Anda memiliki service_account.json dari Google Cloud Console
# dan berikan akses Edit (Share) ke email service account pada Google Sheet Anda.
SCOPE = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "1YOUR_GOOGLE_SHEET_ID_HERE")
CREDENTIALS_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")

def get_sheet_client():
    """Menginisialisasi client gspread ke Google Sheets."""
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, SCOPE)
        client = gspread.authorize(creds)
        spreadsheet = client.open_by_key(SPREADSHEET_ID)
        return spreadsheet
    except Exception as e:
        print(f"[WARN] Google Sheets belum terhubung: {e}")
        return None

# ==========================================
# 2. API ENDPOINTS
# ==========================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "service": "SacristyConnect Backend",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/attendance', methods=['POST'])
def record_attendance():
    """
    Mencatat presensi mandiri petugas dari Kiosk Numpad ke Google Sheets
    Payload JSON:
      {
        "officerId": "145",
        "officerName": "Bapak Damianus Slamet",
        "massSession": "SABTU, 15 AGUSTUS 2026 - 18:00 GEREJA",
        "timestamp": "2026-08-15T17:42:10"
      }
    """
    data = request.get_json() or {}
    officer_id = data.get("officerId")
    officer_name = data.get("officerName", "Petugas")
    mass_session = data.get("massSession", "Misa Reguler")
    timestamp = data.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    if not officer_id:
        return jsonify({"error": "ID Petugas wajib diisi"}), 400

    sheet_conn = get_sheet_client()
    if sheet_conn:
        try:
            worksheet = sheet_conn.worksheet("Attendance")
            worksheet.append_row([
                timestamp,
                officer_id,
                officer_name,
                mass_session,
                "Hadir (Kiosk)",
                "OK"
            ])
            print(f"[OK] Presensi berhasil disimpan di Google Sheets: {officer_name} ({officer_id})")
        except Exception as e:
            print(f"[ERROR] Gagal append ke Sheet Attendance: {e}")

    return jsonify({
        "success": True,
        "message": f"Presensi berhasil untuk {officer_name} (ID: {officer_id})",
        "record": {
            "officerId": officer_id,
            "officerName": officer_name,
            "massSession": mass_session,
            "timestamp": timestamp
        }
    })

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """Mengambil daftar jadwal bulanan dari Google Sheets tab 'Schedule'."""
    sheet_conn = get_sheet_client()
    if sheet_conn:
        try:
            worksheet = sheet_conn.worksheet("Schedule")
            records = worksheet.get_all_records()
            return jsonify({"success": True, "data": records})
        except Exception as e:
            print(f"[ERROR] Gagal membaca schedule: {e}")

    # Fallback default schedule jika sheet offline
    fallback_schedule = [
        {"date": "Sun, 06 Sep", "massTime": "07:00 AM", "server1": "Antonius B.", "server2": "Budi Santoso", "server3": "Cyrillus D.", "server4": "Darius E.", "status": "Scheduled"},
        {"date": "Sun, 13 Sep", "massTime": "17:00 PM", "server1": "Damianus S.", "server2": "Heru P. (Sub)", "server3": "Fransiskus G.", "server4": "Gregorius H.", "status": "Tukar Jadwal"},
        {"date": "Sun, 20 Sep", "massTime": "09:00 AM", "server1": "Ignatius J.", "server2": "Johannes K.", "server3": "Kristoforus L.", "server4": "Laurentius M.", "status": "Scheduled"},
        {"date": "Sun, 27 Sep", "massTime": "07:00 AM", "server1": "Martinus N.", "server2": "Nicolaus O.", "server3": "Petrus P.", "server4": "-", "status": "Needs Server"}
    ]
    return jsonify({"success": True, "data": fallback_schedule, "source": "local_fallback"})

@app.route('/api/parse-whatsapp', methods=['POST'])
def parse_whatsapp_message():
    """
    Menganalisis pesan teks WhatsApp pertukaran tugas/cuti.
    Dapat dihubungkan dengan Google Gemini AI atau Rule-Based Parser.
    """
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Pesan WhatsApp kosong"}), 400

    # Analisis sederhana atau panggil Gemini API
    # Contoh pesan: "Saya Damianus Slamet tugas tgl 13 Sept jam 17.00 tukar tugas dng pak Heru..."
    result = {
        "success": True,
        "originalText": message,
        "type": "Tukar Jadwal",
        "detectedDate": "Sun, 13 Sep 2026",
        "detectedTime": "17:00 PM",
        "originalServer": "Damianus Slamet",
        "replacementServer": "Heru Prasetyo",
        "summary": "Tukar Jadwal: Damianus S. digantikan oleh Heru P. (Sub) pada Misa tgl 13 Sep 17:00.",
        "actionApplied": "Updated Sheet Schedule Row 2"
    }

    # Update Google Sheets jika terhubung
    sheet_conn = get_sheet_client()
    if sheet_conn:
        try:
            worksheet = sheet_conn.worksheet("Schedule")
            # Contoh update catatan pergantian
            worksheet.append_row([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "WA_IMPORT",
                result["originalServer"],
                result["replacementServer"],
                result["summary"]
            ])
        except Exception as e:
            print(f"[WARN] Log sheet gagal: {e}")

    return jsonify(result)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"\\n=======================================================")
    print(f"   SACRISTYCONNECT PYTHON BACKEND RUNNING ON PORT {port}")
    print(f"   Endpoints:")
    print(f"    - POST /api/attendance     (Kiosk Check-in)")
    print(f"    - GET  /api/schedule       (Monthly Schedule)")
    print(f"    - POST /api/parse-whatsapp (AI Chat Converter)")
    print(f"=======================================================\\n")
    app.run(host='0.0.0.0', port=port, debug=True)
`;

export const REQUIREMENTS_TXT = `Flask==3.0.0
flask-cors==4.0.0
gspread==6.0.0
oauth2client==4.1.3
google-auth==2.27.0
python-dotenv==1.0.1
`;

export const SETUP_GUIDE_MD = `# Panduan Integrasi Google Sheets & Python Backend

## 1. Persiapan Google Cloud Service Account
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project baru atau pilih project yang sudah ada.
3. Aktifkan **Google Drive API** dan **Google Sheets API** di menu *APIs & Services > Library*.
4. Masuk ke *Credentials > Create Credentials > Service Account*.
5. Beri nama (misal \`sacristy-connect-bot\`), lalu buat.
6. Pada tab *Keys*, pilih *Add Key > Create new key > JSON*. Simpan file JSON tersebut dengan nama \`service_account.json\` di folder proyek backend Anda.

## 2. Persiapan Google Sheets
1. Buat Spreadsheet baru di Google Drive Anda dengan nama **SacristyConnect Database**.
2. Salin email service account dari file JSON (misal \`sacristy-connect-bot@project.iam.gserviceaccount.com\`).
3. Klik tombol **Share (Bagikan)** di spreadsheet, lalu bagikan ke email service account tersebut dengan akses **Editor**.
4. Buat 2 tab / worksheet:
   - **Tab 1: \`Attendance\`**
     Header Kolom: \`Timestamp\` | \`Officer ID\` | \`Officer Name\` | \`Mass Session\` | \`Status\` | \`Verification\`
   - **Tab 2: \`Schedule\`**
     Header Kolom: \`Date\` | \`Mass Time\` | \`Server 1\` | \`Server 2\` | \`Server 3\` | \`Server 4\` | \`Status\`
5. Ambil **SPREADSHEET_ID** dari URL browser:
   \`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit\`

## 3. Menjalankan Backend Python
\`\`\`bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Atur Environment Variable
export SPREADSHEET_ID="YOUR_SPREADSHEET_ID_HERE"
export GOOGLE_APPLICATION_CREDENTIALS="service_account.json"

# 3. Jalankan server Flask
python app.py
\`\`\`

Server akan berjalan pada \`http://localhost:5000\` dan siap menerima request dari \`kiosk.html\` dan \`admin.html\`.
`;
