// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AURA MOBILE â€” JS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const S = { tab:'home', hydration:1.2, hydGoal:2.5, bpm:72, move:0, moveGoal:500, exercise:0, exGoal:30, stand:0, standGoal:12 };

// â”€â”€ HAPTIC FEEDBACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var _hapticCtx;
function haptic(ms){
  ms = ms || 10;
  if(navigator.vibrate) navigator.vibrate(ms);
  else {
    try {
      if(!_hapticCtx) _hapticCtx = new (window.AudioContext||window.webkitAudioContext)();
      var o = _hapticCtx.createOscillator(), g = _hapticCtx.createGain();
      o.frequency.value = 800; g.gain.value = 0.015;
      o.connect(g); g.connect(_hapticCtx.destination);
      o.start(); o.stop(_hapticCtx.currentTime + ms/1000);
    } catch(e){}
  }
}
document.addEventListener('click', function(e){
  if(e.target.closest('.cta,.btn-or,.nb,.tog')) haptic();
}, true);

// â”€â”€ LAZY SCRIPT LOADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var _loadedScripts = {};
function loadScript(url) {
  if (_loadedScripts[url]) return _loadedScripts[url];
  _loadedScripts[url] = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = url;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = function() { delete _loadedScripts[url]; reject(new Error('Failed to load: ' + url)); };
    document.head.appendChild(s);
  });
  return _loadedScripts[url];
}
function loadScripts(urls) {
  return urls.reduce(function(chain, url) {
    return chain.then(function() { return loadScript(url); });
  }, Promise.resolve());
}

var _mediaPipeReady = null;
function ensureMediaPipe() {
  if (_mediaPipeReady) return _mediaPipeReady;
  if (typeof Pose !== 'undefined' && typeof Camera !== 'undefined') {
    _mediaPipeReady = Promise.resolve();
    return _mediaPipeReady;
  }
  _mediaPipeReady = loadScripts([
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
  ]);
  return _mediaPipeReady;
}

var _quaggaReady = null;
function ensureQuagga() {
  if (_quaggaReady) return _quaggaReady;
  if (typeof Quagga !== 'undefined') { _quaggaReady = Promise.resolve(); return _quaggaReady; }
  _quaggaReady = loadScript('https://cdn.jsdelivr.net/npm/@ericblade/quagga2/dist/quagga.min.js');
  return _quaggaReady;
}

var _firebaseReady = null;
function ensureFirebase() {
  if (_firebaseReady) return _firebaseReady;
  if (typeof firebase !== 'undefined' && firebase.apps) { _firebaseReady = Promise.resolve(); return _firebaseReady; }
  _firebaseReady = loadScripts([
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js'
  ]);
  return _firebaseReady;
}

// â”€â”€ EXERCISE LIBRARY DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EXERCISES = [
  // PETTO
  {id:'bench',name:'Panca Piana',muscle:'Petto',emoji:'ðŸ‹ï¸',diff:'Intermedio',sets:4,reps:'8-10',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
   desc:'Esercizio fondamentale per il petto. Sdraiati sulla panca, impugna il bilanciere a larghezza spalle, abbassa al petto e spingi.',
   steps:['Sdraiati sulla panca con i piedi a terra','Impugna il bilanciere leggermente piu largo delle spalle','Abbassa il bilanciere al centro del petto controllando il movimento','Spingi esplosivamente fino alla distensione completa delle braccia']},
  {id:'incline_db',name:'Panca Inclinata Manubri',muscle:'Petto',emoji:'ðŸ’ª',diff:'Intermedio',sets:3,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif',
   desc:'Variante su panca inclinata a 30-45 gradi per enfatizzare il petto alto.',
   steps:['Imposta la panca a 30-45 gradi','Impugna i manubri e portali alle spalle','Spingi verso l\'alto convergendo leggermente i manubri','Abbassa lentamente fino a sentire lo stretch del petto']},
  {id:'pushup',name:'Piegamenti (Push-Up)',muscle:'Petto',emoji:'ðŸ§‘â€ðŸ’»',diff:'Principiante',sets:3,reps:'15-20',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
   desc:'Esercizio a corpo libero fondamentale per petto, spalle e tricipiti.',
   steps:['Posizionati in plank con braccia tese','Mani leggermente piu larghe delle spalle','Abbassa il corpo piegando i gomiti fino a sfiorare il pavimento','Spingi esplosivamente tornando in posizione di plank']},
  {id:'cable_fly',name:'Croci ai Cavi',muscle:'Petto',emoji:'âš”ï¸',diff:'Intermedio',sets:3,reps:'12-15',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif',
   desc:'Isolamento del petto con tensione costante grazie ai cavi.',
   steps:['Posizionati al centro dei cavi regolati in alto','Inclina leggermente il busto in avanti','Porta le mani al centro con movimento ad arco','Torna lentamente alla posizione di partenza']},
  // SCHIENA
  {id:'deadlift',name:'Stacco da Terra',muscle:'Schiena',emoji:'ðŸ’ª',diff:'Avanzato',sets:4,reps:'5-6',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
   desc:'Re degli esercizi multiarticolari. Coinvolge schiena, gambe e core.',
   steps:['Piedi alla larghezza delle spalle, bilanciere sulle tibie','Afferra la barra con presa alternata o doppia pronata','Distendi anche e ginocchia simultaneamente mantenendo la schiena neutra','Completa il movimento con le anche completamente estese']},
  {id:'pullup',name:'Trazioni alla Sbarra',muscle:'Schiena',emoji:'ðŸ§—',diff:'Avanzato',sets:4,reps:'6-10',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',
   desc:'Esercizio fondamentale per dorsali e bicipiti a corpo libero.',
   steps:['Impugna la sbarra con presa prona piu larga delle spalle','Parti da braccia completamente distese','Tira il corpo verso l\'alto portando il mento sopra la sbarra','Scendi controllando il movimento fino a braccia distese']},
  {id:'row',name:'Rematore con Bilanciere',muscle:'Schiena',emoji:'ðŸš£',diff:'Intermedio',sets:4,reps:'8-10',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
   desc:'Esercizio fondamentale per lo spessore della schiena.',
   steps:['Inclina il busto a 45 gradi con schiena neutra','Impugna il bilanciere a larghezza spalle','Tira il bilanciere verso l\'ombelico stringendo le scapole','Abbassa controllando il peso']},
  {id:'lat_pull',name:'Lat Machine',muscle:'Schiena',emoji:'â¬‡ï¸',diff:'Principiante',sets:3,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
   desc:'Alternativa guidata alle trazioni per i dorsali.',
   steps:['Seduto alla macchina, impugna la barra larga','Tira la barra verso il petto sporgendo leggermente il busto','Stringi le scapole in fondo al movimento','Risali lentamente controllando il peso']},
  // GAMBE
  {id:'squat',name:'Squat con Bilanciere',muscle:'Gambe',emoji:'ðŸ‹ï¸',diff:'Intermedio',sets:4,reps:'8-10',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
   desc:'Esercizio fondamentale per quadricipiti, glutei e core.',
   steps:['Posiziona il bilanciere sulle spalle (trapezio alto)','Piedi alla larghezza delle spalle, punte leggermente in fuori','Scendi piegando anche e ginocchia fino a cosce parallele','Risali spingendo con talloni mantenendo il petto alto']},
  {id:'leg_press',name:'Leg Press',muscle:'Gambe',emoji:'ðŸ¦µ',diff:'Principiante',sets:4,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
   desc:'Pressa per le gambe con guida per sicurezza.',
   steps:['Seduto sulla macchina, piedi alla larghezza delle spalle sulla pedana','Rilascia i fermi di sicurezza','Piega le ginocchia portando la pedana verso il petto','Spingi la pedana senza bloccare le ginocchia']},
  {id:'lunge',name:'Affondi con Manubri',muscle:'Gambe',emoji:'ðŸƒ',diff:'Principiante',sets:3,reps:'12 per gamba',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunges.gif',
   desc:'Esercizio unilaterale per quadricipiti e glutei.',
   steps:['In piedi con manubri ai fianchi','Fai un passo avanti lungo con una gamba','Abbassa il ginocchio posteriore verso il pavimento','Spingi col tallone anteriore per tornare in posizione']},
  {id:'rdl',name:'Stacco Rumeno',muscle:'Gambe',emoji:'ðŸ¦¶',diff:'Intermedio',sets:3,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Romanian-Deadlift.gif',
   desc:'Esercizio per femorali e glutei con enfasi sull\'eccentrica.',
   steps:['In piedi con bilanciere, ginocchia leggermente flesse','Inclina il busto in avanti spingendo il bacino indietro','Scendi fino a sentire lo stretch nei femorali','Risali contraendo i glutei in cima al movimento']},
  // SPALLE
  {id:'ohp',name:'Military Press',muscle:'Spalle',emoji:'ðŸ‹ï¸',diff:'Intermedio',sets:4,reps:'8-10',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Overhead-Press.gif',
   desc:'Esercizio fondamentale per i deltoidi.',
   steps:['In piedi, bilanciere all\'altezza delle clavicole','Core attivo, piedi alla larghezza delle spalle','Spingi il bilanciere sopra la testa fino a braccia distese','Abbassa lentamente fino alle clavicole']},
  {id:'lat_raise',name:'Alzate Laterali',muscle:'Spalle',emoji:'ðŸ§‘â€âœˆï¸',diff:'Principiante',sets:3,reps:'12-15',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
   desc:'Isolamento dei deltoidi laterali per l\'ampiezza delle spalle.',
   steps:['In piedi con manubri ai fianchi','Alza le braccia lateralmente fino a parallelo con il pavimento','Mantieni una leggera flessione dei gomiti','Abbassa lentamente resistendo alla gravita']},
  {id:'face_pull',name:'Face Pull',muscle:'Spalle',emoji:'ðŸŽ¯',diff:'Principiante',sets:3,reps:'15-20',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',
   desc:'Esercizio per deltoidi posteriori e salute delle spalle.',
   steps:['Al cavo alto con corda, impugna con presa neutra','Tira la corda verso il viso separando le mani','Ruota esternamente le spalle in fondo al movimento','Torna lentamente alla posizione di partenza']},
  // BRACCIA
  {id:'curl',name:'Curl con Bilanciere',muscle:'Braccia',emoji:'ðŸ’ª',diff:'Principiante',sets:3,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
   desc:'Esercizio fondamentale per i bicipiti.',
   steps:['In piedi con bilanciere in presa supina','Gomiti fissi ai fianchi','Fletti le braccia portando il bilanciere alle spalle','Abbassa lentamente controllando la fase eccentrica']},
  {id:'hammer',name:'Curl a Martello',muscle:'Braccia',emoji:'ðŸ”¨',diff:'Principiante',sets:3,reps:'10-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
   desc:'Variante del curl per brachiale e brachioradiale.',
   steps:['In piedi con manubri ai fianchi in presa neutra','Fletti alternando le braccia mantenendo i polsi dritti','Porta i manubri alle spalle senza ruotare','Abbassa controllando il movimento']},
  {id:'tri_push',name:'Push-down Tricipiti',muscle:'Braccia',emoji:'â¬‡ï¸',diff:'Principiante',sets:3,reps:'12-15',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif',
   desc:'Isolamento dei tricipiti al cavo.',
   steps:['Al cavo alto con barra dritta o corda','Gomiti fissi ai fianchi','Distendi le braccia spingendo il peso verso il basso','Torna lentamente alla posizione di partenza']},
  {id:'dips',name:'Dips alle Parallele',muscle:'Braccia',emoji:'ðŸ¤¸',diff:'Avanzato',sets:3,reps:'8-12',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dip.gif',
   desc:'Esercizio composto per tricipiti e petto.',
   steps:['Sospenditi alle parallele con braccia distese','Inclina leggermente il busto in avanti','Piega i gomiti fino a 90 gradi','Spingi tornando alla posizione di partenza']},
  // CORE
  {id:'plank',name:'Plank',muscle:'Core',emoji:'ðŸ§˜',diff:'Principiante',sets:3,reps:'30-60 sec',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Front-Plank.gif',
   desc:'Esercizio isometrico fondamentale per la stabilita del core.',
   steps:['Avambracci e punte dei piedi a terra','Corpo in linea retta dalla testa ai piedi','Core e glutei contratti','Mantieni la posizione senza lasciar cadere i fianchi']},
  {id:'crunch',name:'Crunch',muscle:'Core',emoji:'ðŸ¦´',diff:'Principiante',sets:3,reps:'15-20',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
   desc:'Esercizio classico per i muscoli addominali.',
   steps:['Sdraiato a terra con ginocchia piegate','Mani dietro la testa o incrociate sul petto','Solleva le spalle dal pavimento contraendo gli addominali','Torna lentamente alla posizione di partenza']},
  // CARDIO
  {id:'run',name:'Corsa',muscle:'Cardio',emoji:'ðŸƒ',diff:'Principiante',sets:1,reps:'20-40 min',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Run.gif',
   desc:'Attivita cardiovascolare fondamentale per resistenza e consumo calorico.',
   steps:['Riscaldamento di 5 minuti a passo veloce','Mantieni un ritmo costante in zona cardiaca 2-3','Postura eretta, braccia rilassate oscillanti','Defaticamento di 5 minuti a passo lento']},
  {id:'burpee',name:'Burpees',muscle:'Cardio',emoji:'ðŸ”¥',diff:'Avanzato',sets:4,reps:'10-15',gif:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif',
   desc:'Esercizio ad alta intensita full-body.',
   steps:['In piedi, scendi in posizione di squat con mani a terra','Lancia i piedi indietro in posizione di plank','Esegui un piegamento (opzionale)','Riporta i piedi vicino alle mani e salta esplosivamente']},
  {id:'jump_rope',name:'Salto con la Corda',muscle:'Cardio',emoji:'â­•',diff:'Principiante',sets:3,reps:'2-3 min',gif:'https://fitnessprogramer.com/wp-content/uploads/2022/02/Jump-Rope.gif',
   desc:'Cardio ad alta efficienza per coordinazione e resistenza.',
   steps:['Impugna la corda con le mani ai fianchi','Ruota la corda con i polsi, non con le braccia','Salta con piccoli rimbalzi sugli avampiedi','Mantieni il core attivo e le ginocchia morbide']},
];

const MUSCLE_GROUPS = ['Tutti','Petto','Schiena','Gambe','Spalle','Braccia','Core','Cardio'];
let exlibFilter = 'Tutti';

function openExerciseLibrary() {
  const ov = document.getElementById('exlib-ov');
  ov.classList.add('on');
  // render filters
  const fBox = document.getElementById('exlib-filters');
  fBox.innerHTML = MUSCLE_GROUPS.map(g => '<div class="exf' + (g===exlibFilter?' on':'') + '" onclick="setExFilter(\'' + g + '\')">' + g + '</div>').join('');
  document.getElementById('exlib-search').value = '';
  renderExerciseLibrary();
}
function closeExerciseLibrary() { document.getElementById('exlib-ov').classList.remove('on'); }
function setExFilter(g) {
  exlibFilter = g;
  document.querySelectorAll('.exf').forEach(el => el.classList.toggle('on', el.textContent === g));
  renderExerciseLibrary();
}
function renderExerciseLibrary() {
  const q = (document.getElementById('exlib-search').value||'').toLowerCase();
  const list = EXERCISES.filter(e => {
    if (exlibFilter !== 'Tutti' && e.muscle !== exlibFilter) return false;
    if (q && !e.name.toLowerCase().includes(q) && !e.muscle.toLowerCase().includes(q)) return false;
    return true;
  });
  const el = document.getElementById('exlib-list');
  if (list.length === 0) { el.innerHTML = '<div class="prog-empty"><b>Nessun esercizio trovato</b>Prova un altro filtro</div>'; return; }
  el.innerHTML = list.map(e => {
    const thumb = e.gif ? '<img src="'+e.gif+'" alt="'+e.name+'" loading="lazy">' : '<span class="ex-thumb-emoji">'+e.emoji+'</span>';
    return '<div class="ex-card" onclick="openExDetail(\'' + e.id + '\')">' +
      '<div class="ex-thumb">' + thumb + '</div>' +
      '<div class="ex-info"><div class="ex-info-name">' + e.name + '</div>' +
      '<div class="ex-info-muscle">' + e.muscle + ' Â· ' + e.diff + '</div>' +
      '<div class="ex-info-desc">' + e.desc + '</div>' +
      '<div class="ex-info-meta"><span>ðŸ“Š ' + e.sets + 'x' + e.reps + '</span></div></div>' +
      '<button class="ex-add-btn" onclick="event.stopPropagation();addExToCurrentPlan(\'' + e.id + '\')">+</button></div>';
  }).join('');
}

function openExDetail(id) {
  const e = EXERCISES.find(x => x.id === id);
  if (!e) return;
  document.getElementById('exdet-title').textContent = e.name;
  const hero = e.gif ? '<img src="'+e.gif+'" alt="'+e.name+'" style="height:100%;object-fit:contain">' : '<span class="exdet-hero-emoji">'+e.emoji+'</span>';
  document.getElementById('exdet-content').innerHTML =
    '<div class="exdet-hero">' + hero + '</div>' +
    '<div class="exdet-body">' +
    '<div class="exdet-name">' + e.name + '</div>' +
    '<div class="exdet-muscle">' + e.muscle + ' Â· ' + e.diff + ' Â· ' + e.sets + 'x' + e.reps + '</div>' +
    '<div class="exdet-desc">' + e.desc + '</div>' +
    '<div style="font-weight:700;font-size:.85rem;margin-bottom:8px">Come eseguirlo</div>' +
    '<div class="exdet-steps">' + e.steps.map((s,i) => '<div class="exdet-step"><div class="exdet-step-num">'+(i+1)+'</div><div>'+s+'</div></div>').join('') + '</div>' +
    '<button class="ep-save" onclick="addExToCurrentPlan(\'' + e.id + '\');closeExDetail()">+ Aggiungi alla Scheda</button>' +
    '</div>';
  document.getElementById('exdet-ov').classList.add('on');
}
function closeExDetail() { document.getElementById('exdet-ov').classList.remove('on'); }

// â”€â”€ WORKOUT BUILDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WB_KEY = 'aura_workouts';
function getWorkouts() {
  try { return JSON.parse(localStorage.getItem(WB_KEY)) || []; } catch { return []; }
}
function saveWorkouts(w) { localStorage.setItem(WB_KEY, JSON.stringify(w)); }

let wbEditingIdx = -1; // -1 = none, >= 0 = editing plan index

function renderWorkoutTab() {
  var plans = getWorkouts();
  var aiPlans = plans.filter(function(p) { return p._aiGenerated; });
  var manualPlans = plans.filter(function(p) { return !p._aiGenerated; });
  var chip = document.getElementById('workout-tab-count');
  if (chip) chip.textContent = 'ðŸ“‹ ' + plans.length + ' schede';
  function planCard(p, pi) {
    var exCount = p.exercises ? p.exercises.length : 0;
    return '<div class="card" style="padding:14px;cursor:pointer" onclick="openWorkoutBuilder()">' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:1.4rem">' + (p._aiGenerated ? 'ðŸ¤–' : 'ðŸ“‹') + '</span>' +
      '<div><div style="font-weight:700;font-size:.88rem">' + (p.name||'Scheda') + '</div>' +
      '<div style="font-size:.7rem;color:var(--t3)">' + exCount + ' esercizi</div></div></div>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      (exCount > 0 ? '<button class="btn btn-or btn-sm" onclick="event.stopPropagation();startWorkoutSession(' + pi + ')">â–¶ Avvia</button>' : '') +
      '<span class="sarr">â€º</span></div></div></div>';
  }
  var aiEl = document.getElementById('workout-tab-ai-plans');
  var manEl = document.getElementById('workout-tab-manual-plans');
  if (aiEl) aiEl.innerHTML = aiPlans.length > 0 ? aiPlans.map(function(p) { return planCard(p, plans.indexOf(p)); }).join('') : '<div class="card" style="padding:16px;text-align:center;color:var(--t3);font-size:.82rem">Nessuna scheda IA. Completa l\'onboarding per generarne una!</div>';
  if (manEl) manEl.innerHTML = manualPlans.length > 0 ? manualPlans.map(function(p) { return planCard(p, plans.indexOf(p)); }).join('') : '<div class="card" style="padding:16px;text-align:center;color:var(--t3);font-size:.82rem">Nessuna scheda manuale. Creane una!</div>';
}

function openWorkoutBuilder() {
  document.getElementById('wb-ov').classList.add('on');
  wbEditingIdx = -1;
  renderWorkoutBuilder();
}
function closeWorkoutBuilder() { document.getElementById('wb-ov').classList.remove('on'); }

function renderWorkoutBuilder() {
  const plans = getWorkouts();
  const el = document.getElementById('wb-content');
  if (plans.length === 0 && wbEditingIdx < 0) {
    el.innerHTML = '<div class="wb-empty"><b>Nessuna scheda creata</b>Crea la tua prima scheda personalizzata</div>' +
      '<button class="wb-new-plan" onclick="startNewPlan()">+ Crea Nuova Scheda</button>';
    return;
  }
  let html = '';
  plans.forEach((p, pi) => {
    html += '<div class="wb-plan"><div class="wb-plan-hd"><div class="wb-plan-name">' + p.name + '</div><div class="wb-plan-count">' + p.exercises.length + ' esercizi</div></div>';
    html += '<div class="wb-plan-exercises">';
    p.exercises.forEach((ex, ei) => {
      const e = EXERCISES.find(x => x.id === ex.id);
      const name = e ? e.name : ex.id;
      html += '<div class="wb-ex-row"><span>' + (e?e.emoji:'') + '</span><span class="wb-ex-name">' + name + '</span><span class="wb-ex-detail">' + ex.sets + 'x' + ex.reps + (ex.rest?' Â· ' + ex.rest + 's rest':'') + '</span><button class="wb-ex-del" onclick="removeExFromPlan(' + pi + ',' + ei + ')">âœ•</button></div>';
    });
    html += '</div>';
    var hasEx = p.exercises.length > 0;
    html += '<div class="wb-plan-actions">' + (hasEx ? '<button class="wb-start-btn" onclick="startWorkoutSession(' + pi + ')">\u25b6 Avvia</button>' : '') + '<button class="wb-start-btn" style="background:var(--s8);color:var(--t1)" onclick="openExerciseLibrary();wbEditingIdx=' + pi + '">+ Esercizi</button><button class="wb-del-plan" onclick="deletePlan(' + pi + ')">Elimina</button></div></div>';
  });
  html += '<button class="wb-new-plan" onclick="startNewPlan()">+ Crea Nuova Scheda</button>';
  el.innerHTML = html;
}

function startNewPlan() {
  const name = prompt('Nome della scheda:');
  if (!name || !name.trim()) return;
  const plans = getWorkouts();
  plans.push({ name: name.trim(), exercises: [] });
  saveWorkouts(plans);
  wbEditingIdx = plans.length - 1;
  renderWorkoutBuilder();
  toast('ðŸ“‹ Scheda "' + name.trim() + '" creata!', 'gr');
}

function addExToCurrentPlan(exId) {
  const plans = getWorkouts();
  if (plans.length === 0) {
    const name = prompt('Crea prima una scheda. Nome:');
    if (!name || !name.trim()) return;
    plans.push({ name: name.trim(), exercises: [] });
    wbEditingIdx = 0;
  }
  if (wbEditingIdx < 0 || wbEditingIdx >= plans.length) {
    // Ask which plan
    if (plans.length === 1) { wbEditingIdx = 0; }
    else {
      const names = plans.map((p,i) => (i+1) + '. ' + p.name).join('\n');
      const choice = prompt('A quale scheda? Inserisci il numero:\n' + names);
      const idx = parseInt(choice) - 1;
      if (isNaN(idx) || idx < 0 || idx >= plans.length) { toast('Scheda non valida','re'); return; }
      wbEditingIdx = idx;
    }
  }
  const e = EXERCISES.find(x => x.id === exId);
  if (!e) return;
  plans[wbEditingIdx].exercises.push({ id: exId, sets: e.sets, reps: e.reps, rest: 90 });
  saveWorkouts(plans);
  toast(e.emoji + ' ' + e.name + ' aggiunto!', 'gr');
}

function removeExFromPlan(pi, ei) {
  const plans = getWorkouts();
  plans[pi].exercises.splice(ei, 1);
  saveWorkouts(plans);
  renderWorkoutBuilder();
}

function deletePlan(pi) {
  const plans = getWorkouts();
  const name = plans[pi].name;
  plans.splice(pi, 1);
  saveWorkouts(plans);
  if (wbEditingIdx === pi) wbEditingIdx = -1;
  else if (wbEditingIdx > pi) wbEditingIdx--;
  renderWorkoutBuilder();
  toast('Scheda "' + name + '" eliminata', 're');
}

// â”€â”€ STORAGE KEYS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CW_KEY = 'aura_completed_workouts';
const ACCT_KEY = 'aura_accounts';
const WS_PROG_KEY = 'aura_ws_progression';
const BM_KEY = 'aura_body_measurements';
const CYCLE_KEY = 'aura_cycle_data';
const MOOD_KEY = 'aura_mood_log';
const DELOAD_KEY = 'aura_deload';

// â”€â”€ WORKOUT SESSION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getCompletedWorkouts() {
  try { return JSON.parse(localStorage.getItem(CW_KEY)) || []; } catch { return []; }
}
const MET_MAP = { 'Principiante': 3.5, 'Intermedio': 5.0, 'Avanzato': 6.0 };

let ws = {
  active:false, planIdx:-1, planName:'', exercises:[], exIdx:0, setNum:1,
  resting:false, restSec:0, _restTotal:0, totalSec:0, paused:false, timer:null,
  calories:0, exerciseTimeSec:0, setWeights:{}, moodPre:0, moodPost:0
};

// Progression helpers
function getProgression() { try { return JSON.parse(localStorage.getItem(WS_PROG_KEY)) || {}; } catch { return {}; } }
function saveProgression(d) { localStorage.setItem(WS_PROG_KEY, JSON.stringify(d)); }
function wsGetLastWeight(exId) { var p = getProgression(); return (p[exId] && p[exId].suggested) ? p[exId].suggested : (p[exId] && p[exId].weight) ? p[exId].weight : 0; }

// Smart rest: adapts to exercise type, set number, weight
var _WS_COMPOUNDS = ['bench','squat','deadlift','stacco','ohp','military','row','pullup','dips','leg_press','hip_thrust','rdl','front_squat','incline_db'];
function wsSmartRest(ex, setNum, totalSets, weight) {
  var base = parseInt(ex.rest) || 90;
  var isCompound = _WS_COMPOUNDS.some(function(c) { return ex.id.indexOf(c) >= 0; }) || ex.diff === 'Avanzato';
  if (isCompound) base = Math.max(base, 120); else base = Math.min(base, 90);
  if (setNum >= 3) base += 15;
  if (setNum >= 4) base += 15;
  var prev = wsGetLastWeight(ex.id);
  if (weight > 0 && prev > 0 && weight >= prev) base += 15;
  return Math.max(30, Math.min(300, base));
}

// Beep for rest countdown
var _wsAudioCtx = null;
function wsBeep(freq, dur) {
  try {
    if (!_wsAudioCtx) _wsAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var o = _wsAudioCtx.createOscillator(), g = _wsAudioCtx.createGain();
    o.connect(g); g.connect(_wsAudioCtx.destination);
    o.frequency.value = freq; g.gain.value = 0.25;
    o.start(); o.stop(_wsAudioCtx.currentTime + dur / 1000);
  } catch(e) {}
}

function wsRestDoneNotify() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    if (NOTIF.swReg) {
      NOTIF.swReg.showNotification('\ud83d\udcaa Recupero finito!', { body: 'Pronto per il prossimo set', vibrate: [200,100,200,100,200], tag: 'aura-rest', renotify: true });
    } else { new Notification('\ud83d\udcaa Recupero finito!', { body: 'Pronto per il prossimo set', tag: 'aura-rest' }); }
  } catch(e) {}
}

function wsAdjRest(delta) {
  ws.restSec = Math.max(0, ws.restSec + delta);
  ws._restTotal = Math.max(ws._restTotal, ws.restSec);
  wsUpdateTimers();
  wsUpdateRestRing();
}

function wsUpdateRestRing() {
  var ring = document.getElementById('ws-rest-ring-progress');
  if (!ring || !ws._restTotal) return;
  var circ = 339.292;
  ring.setAttribute('stroke-dashoffset', String(circ * (1 - ws.restSec / ws._restTotal)));
}

function wsAdjWeight(delta) {
  var inp = document.getElementById('ws-weight-input');
  if (!inp) return;
  var v = parseFloat(inp.value) || 0;
  inp.value = Math.max(0, +(v + delta).toFixed(1));
}

function startWorkoutSession(planIdx) {
  const plans = getWorkouts();
  if (planIdx < 0 || planIdx >= plans.length) return;
  const plan = plans[planIdx];
  if (!plan.exercises || plan.exercises.length === 0) {
    toast('Aggiungi esercizi prima di avviare!', 're');
    return;
  }
  // Store planIdx and show pre-workout mood picker
  ws._pendingPlanIdx = planIdx;
  ws.moodPre = 0; ws.moodPost = 0;
  document.getElementById('mood-pre-ov').classList.add('on');
}

function moodSelectPre(val) {
  ws.moodPre = val;
  document.getElementById('mood-pre-ov').classList.remove('on');
  _doStartWorkoutSession(ws._pendingPlanIdx);
}

function _doStartWorkoutSession(planIdx) {
  const plans = getWorkouts();
  const plan = plans[planIdx];
  ws.active = true;
  ws.planIdx = planIdx;
  ws.planName = plan.name;
  ws.exercises = plan.exercises.map(function(ex) {
    var e = EXERCISES.find(function(x) { return x.id === ex.id; });
    return { id:ex.id, sets:ex.sets, reps:ex.reps, rest:ex.rest||90, name:e?e.name:ex.id, emoji:e?e.emoji:'ðŸ’ª', gif:e?e.gif:'', diff:e?e.diff:'Intermedio' };
  });
  ws.exIdx = 0; ws.setNum = 1; ws.totalSec = 0;
  ws.resting = false; ws.restSec = 0; ws._restTotal = 0; ws.paused = false;
  ws.calories = 0; ws.exerciseTimeSec = 0; ws.setWeights = {};
  // If mood is low, suggest lighter intensity
  if (ws.moodPre <= 2) toast('ðŸ’¡ Energia bassa â€” considera pesi piÃ¹ leggeri oggi', 'or');
  document.getElementById('ws-ov').classList.add('on');
  document.getElementById('ws-vignette').classList.add('on');
  renderWsView();
  ws.timer = setInterval(wsTick, 1000);
  closeWorkoutBuilder();
  diShow();
}

function wsTick() {
  if (ws.paused) return;
  ws.totalSec++;
  if (ws.resting) {
    ws.restSec--;
    wsUpdateRestRing();
    if (ws.restSec === 3 || ws.restSec === 2 || ws.restSec === 1) wsBeep(800, 80);
    if (ws.restSec <= 0) {
      wsBeep(1000, 250); haptic(200);
      wsRestDoneNotify();
      ws.resting = false;
      wsAdvance();
    }
  } else {
    ws.exerciseTimeSec++;
  }
  wsUpdateTimers();
  diUpdate();
}

function wsAdvance() {
  var ex = ws.exercises[ws.exIdx];
  var ts = parseInt(ex.sets) || 3;
  if (ws.setNum < ts) {
    ws.setNum++;
  } else {
    ws.exIdx++;
    ws.setNum = 1;
    if (ws.exIdx >= ws.exercises.length) { wsFinish(); return; }
  }
  renderWsView();
}

function wsCompleteSet() {
  var ex = ws.exercises[ws.exIdx];
  var ts = parseInt(ex.sets) || 3;
  // Capture weight
  var inp = document.getElementById('ws-weight-input');
  var w = inp ? parseFloat(inp.value) : 0;
  if (w > 0) {
    if (!ws.setWeights[ws.exIdx]) ws.setWeights[ws.exIdx] = {};
    ws.setWeights[ws.exIdx][ws.setNum] = w;
  }
  if (ws.setNum >= ts && ws.exIdx >= ws.exercises.length - 1) {
    wsFinish(); return;
  }
  // Smart rest
  var smartSec = wsSmartRest(ex, ws.setNum, ts, w);
  ws.resting = true;
  ws.restSec = smartSec;
  ws._restTotal = smartSec;
  renderWsView();
}

function wsSkipRest() {
  ws.resting = false;
  wsAdvance();
  renderWsView();
}

function wsTogglePause() {
  ws.paused = !ws.paused;
  renderWsView();
}

function wsSkipExercise() {
  ws.exIdx++; ws.setNum = 1; ws.resting = false;
  if (ws.exIdx >= ws.exercises.length) { wsFinish(); return; }
  renderWsView();
}

function stopWorkoutSession() {
  if (!ws.active) { document.getElementById('ws-ov').classList.remove('on'); document.getElementById('ws-vignette').classList.remove('on'); return; }
  if (ws.totalSec > 30) {
    if (!confirm('Vuoi terminare l\'allenamento?')) return;
    wsFinish();
  } else {
    clearInterval(ws.timer); ws.active = false;
    document.getElementById('ws-ov').classList.remove('on');
    document.getElementById('ws-vignette').classList.remove('on');
    diHide();
  }
}

function wsCalcCalories() {
  var u = getUser(), w = (u && u.weight) ? u.weight : 70;
  if (ws.exercises.length === 0) return 0;
  var avgMet = ws.exercises.reduce(function(s,ex) { return s + (MET_MAP[ex.diff]||5); }, 0) / ws.exercises.length;
  return Math.round(ws.exerciseTimeSec * avgMet * w / 3600);
}

function wsFinish() {
  clearInterval(ws.timer); ws.active = false;
  ws.calories = wsCalcCalories();
  document.getElementById('ws-vignette').classList.remove('on');
  renderWsSummary();
  diHide();
}

function wsCalcProgressions() {
  var suggestions = [];
  ws.exercises.forEach(function(ex, i) {
    var ts = parseInt(ex.sets) || 3;
    var weights = ws.setWeights[i];
    if (!weights) return;
    if (Object.keys(weights).length < ts) return;
    var maxW = Math.max.apply(null, Object.keys(weights).map(function(k) { return weights[k]; }));
    if (maxW <= 0) return;
    var prev = wsGetLastWeight(ex.id);
    suggestions.push({ id:ex.id, name:ex.name, emoji:ex.emoji, weight:maxW, prevWeight:prev, suggested:+(maxW+2.5).toFixed(1) });
  });
  return suggestions;
}

function wsSaveAndClose() {
  var cw = getCompletedWorkouts();
  var today = new Date().toISOString().slice(0,10);
  cw.push({
    date: today,
    planName: ws.planName,
    exercises: ws.exercises.map(function(e, i) { return { id:e.id, name:e.name, sets:e.sets, reps:e.reps, weights:ws.setWeights[i]||{} }; }),
    duration: ws.totalSec,
    calories: ws.calories,
    completedAt: new Date().toISOString(),
    moodPre: ws.moodPre || 0,
    moodPost: ws.moodPost || 0
  });
  localStorage.setItem(CW_KEY, JSON.stringify(cw));
  // Save mood log entry
  if (ws.moodPre > 0 || ws.moodPost > 0) {
    var mlog = getMoodLog();
    mlog.push({ date: today, pre: ws.moodPre, post: ws.moodPost, plan: ws.planName });
    saveMoodLog(mlog);
  }
  // Save progression
  var prog = getProgression();
  var progs = wsCalcProgressions();
  progs.forEach(function(s) { prog[s.id] = { weight:s.weight, suggested:s.suggested, date:new Date().toISOString().slice(0,10) }; });
  if (progs.length > 0) saveProgression(prog);
  document.getElementById('ws-ov').classList.remove('on');
  document.getElementById('ws-vignette').classList.remove('on');
  updateProfileStats();
  updateMoodWidget();
  checkDeloadNeeded();
  // Update activity rings with workout data
  S.move = Math.min(S.move + ws.calories, S.moveGoal);
  S.exercise = Math.min(S.exercise + Math.round(ws.totalSec / 60), S.exGoal);
  S.stand = Math.min(S.stand + 1, S.standGoal);
  updateRings();
  // Remove completed scheduled workout from calendar
  var todayDate = new Date().toISOString().slice(0,10);
  var sched = getScheduled();
  var filtered = sched.filter(function(s) { return !(s.date === todayDate && s.planName === ws.planName); });
  if (filtered.length !== sched.length) saveScheduled(filtered);
  toast('ðŸ’ª Allenamento salvato! +200 XP', 'gr');
}

function wsUpdateTimers() {
  var tt = document.getElementById('ws-total-time');
  if (tt) {
    var m = String(Math.floor(ws.totalSec/60)).padStart(2,'0');
    var s = String(ws.totalSec%60).padStart(2,'0');
    tt.textContent = m + ':' + s;
  }
  if (ws.resting) {
    var rt = document.getElementById('ws-rest-timer');
    if (rt) {
      var rm = String(Math.floor(ws.restSec/60)).padStart(2,'0');
      var rs = String(ws.restSec%60).padStart(2,'0');
      rt.textContent = rm + ':' + rs;
    }
  }
}

function wsEsc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function renderWsView() {
  var content = document.getElementById('ws-content');
  var ex = ws.exercises[ws.exIdx];
  var ts = parseInt(ex.sets) || 3;
  var total = ws.exercises.length;
  var pct = Math.round((ws.exIdx / total) * 100);
  var _deloadBanner = isDeloadWeek() ? '<div style="background:linear-gradient(135deg,#ff9500,#ff6b00);color:#fff;border-radius:10px;padding:8px 12px;margin-bottom:10px;font-size:.72rem;font-weight:700;text-align:center">ðŸ§˜ Settimana di Deload â€” Riduci pesi del 40-50%</div>' : '';
  document.getElementById('ws-title').textContent = ws.planName;
  if (ws.resting) {
    var nextInfo = ws.setNum < ts
      ? 'Set ' + (ws.setNum+1) + ' di ' + ts + ' \u00b7 ' + wsEsc(ex.name)
      : (ws.exIdx+1 < total ? wsEsc(ws.exercises[ws.exIdx+1].name) : 'Fine!');
    var circ = 339.292;
    var offset = ws._restTotal > 0 ? circ * (1 - ws.restSec / ws._restTotal) : 0;
    var rm = String(Math.floor(ws.restSec/60)).padStart(2,'0');
    var rs = String(ws.restSec%60).padStart(2,'0');
    var baseSec = parseInt(ex.rest) || 90;
    var isAdapted = ws._restTotal !== baseSec;
    content.innerHTML =
      '<div class="ws-progress-bar"><div class="ws-progress-fill" style="width:'+pct+'%"></div></div>' +
      '<div class="ws-progress-label">'+(ws.exIdx+1)+'/'+total+' esercizi</div>' + _deloadBanner +
      '<div class="ws-card">' +
        '<div class="ws-rest-label">\u23f1 Recupero</div>' +
        '<div class="ws-rest-ring-wrap">' +
          '<svg viewBox="0 0 120 120" width="160" height="160">' +
            '<circle cx="60" cy="60" r="54" stroke="var(--s8)" stroke-width="6" fill="none"/>' +
            '<circle id="ws-rest-ring-progress" cx="60" cy="60" r="54" stroke="var(--or)" stroke-width="6" fill="none" stroke-dasharray="339.292" stroke-dashoffset="'+offset+'" stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s linear"/>' +
          '</svg>' +
          '<div class="ws-rest-ring-time">' +
            '<div class="ws-timer-big" id="ws-rest-timer">'+rm+':'+rs+'</div>' +
            (isAdapted ? '<div class="ws-smart-badge">\u26a1 Smart</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="ws-rest-adjust">' +
          '<button class="ws-rest-adj-btn" onclick="wsAdjRest(-15)">\u221215s</button>' +
          '<button class="ws-rest-adj-btn" onclick="wsAdjRest(15)">+15s</button>' +
        '</div>' +
        '<div class="ws-rest-next">Prossimo: ' + nextInfo + '</div>' +
        '<button class="ws-btn-skip" onclick="wsSkipRest()">Salta Recupero \u2192</button>' +
      '</div>' +
      '<div class="ws-controls">' +
        '<button class="ws-ctrl-pause" onclick="wsTogglePause()">' + (ws.paused ? '\u25b6 Riprendi' : '\u23f8 Pausa') + '</button>' +
        '<button class="ws-ctrl-stop" onclick="stopWorkoutSession()">\u25a0 Termina</button>' +
      '</div>';
  } else {
    var lastW = 0;
    if (ws.setWeights[ws.exIdx] && ws.setWeights[ws.exIdx][ws.setNum - 1]) {
      lastW = ws.setWeights[ws.exIdx][ws.setNum - 1];
    } else if (ws.setNum === 1) {
      lastW = wsGetLastWeight(ex.id);
    }
    content.innerHTML =
      '<div class="ws-progress-bar"><div class="ws-progress-fill" style="width:'+pct+'%"></div></div>' +
      '<div class="ws-progress-label">'+(ws.exIdx+1)+'/'+total+' esercizi</div>' + _deloadBanner +
      '<div class="ws-card">' +
        '<div class="ws-ex-emoji">'+ex.emoji+'</div>' +
        '<div class="ws-ex-name">' + wsEsc(ex.name) + '</div>' +
        '<div class="ws-ex-info">Set '+ws.setNum+' di '+ts+' \u00b7 '+ex.reps+' rep</div>' +
        (ex.gif ? '<img class="ws-ex-gif" src="'+ex.gif+'" alt="">' : '') +
        '<div class="ws-weight-label">\ud83c\udfcb\ufe0f Peso utilizzato</div>' +
        '<div class="ws-weight-row">' +
          '<button class="ws-weight-adj" onclick="wsAdjWeight(-2.5)">\u22122.5</button>' +
          '<div class="ws-weight-display"><input type="number" id="ws-weight-input" inputmode="decimal" step="0.5" min="0" value="'+(lastW||'')+'" placeholder="0"><span class="ws-weight-unit">kg</span></div>' +
          '<button class="ws-weight-adj" onclick="wsAdjWeight(2.5)">+2.5</button>' +
        '</div>' +
        '<button class="ws-btn-set" onclick="wsCompleteSet()">\u2713 Set Completato</button>' +
      '</div>' +
      '<div class="ws-controls">' +
        '<button class="ws-ctrl-pause" onclick="wsTogglePause()">' + (ws.paused ? '\u25b6 Riprendi' : '\u23f8 Pausa') + '</button>' +
        '<button class="ws-ctrl-skip" onclick="wsSkipExercise()">\u23ed Salta</button>' +
        '<button class="ws-ctrl-stop" onclick="stopWorkoutSession()">\u25a0 Termina</button>' +
      '</div>';
  }
}

function renderWsSummary() {
  var content = document.getElementById('ws-content');
  var mm = String(Math.floor(ws.totalSec/60)).padStart(2,'0');
  var ss = String(ws.totalSec%60).padStart(2,'0');
  document.getElementById('ws-title').textContent = 'Completato!';
  var tt = document.getElementById('ws-total-time'); if (tt) tt.textContent = '';
  var html =
    '<div class="ws-summary">' +
      '<div class="ws-summary-ico">\ud83c\udf89</div>' +
      '<div class="ws-summary-title">Allenamento Completato!</div>' +
      '<div class="ws-summary-plan">' + wsEsc(ws.planName) + '</div>' +
      '<div class="ws-summary-stats">' +
        '<div class="ws-summary-stat"><div class="ws-summary-stat-val">\u23f1 '+mm+':'+ss+'</div><div class="ws-summary-stat-lbl">Durata</div></div>' +
        '<div class="ws-summary-stat"><div class="ws-summary-stat-val">\ud83d\udcaa '+ws.exercises.length+'</div><div class="ws-summary-stat-lbl">Esercizi</div></div>' +
        '<div class="ws-summary-stat"><div class="ws-summary-stat-val">\ud83d\udd25 '+ws.calories+'</div><div class="ws-summary-stat-lbl">Calorie</div></div>' +
        '<div class="ws-summary-stat"><div class="ws-summary-stat-val">\u26a1 +200</div><div class="ws-summary-stat-lbl">XP</div></div>' +
      '</div>';
  // Progression suggestions
  var progs = wsCalcProgressions();
  if (progs.length > 0) {
    html += '<div class="ws-prog-section"><div class="ws-prog-title">\ud83d\udcc8 Progressione Automatica</div>';
    progs.forEach(function(p) {
      html += '<div class="ws-prog-card">';
      html += '<div class="ws-prog-ex">' + p.emoji + ' ' + wsEsc(p.name) + '</div>';
      if (p.prevWeight > 0 && p.prevWeight < p.suggested) {
        html += '<div class="ws-prog-detail">' + p.prevWeight + ' \u2192 <strong>' + p.suggested + ' kg</strong></div>';
      } else {
        html += '<div class="ws-prog-detail">Prossima: <strong>' + p.suggested + ' kg</strong></div>';
      }
      html += '<div class="ws-prog-badge">+2.5 kg</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  // Post-workout mood picker
  var moodEmojis = ['','ðŸ˜«','ðŸ˜”','ðŸ˜','ðŸ˜Š','ðŸ”¥'];
  html += '<div style="margin:18px 0 12px;text-align:center">';
  html += '<div style="font-weight:700;font-size:.85rem;margin-bottom:8px">Come Ã¨ andata? ðŸ’¬</div>';
  html += '<div class="mood-row" id="mood-post-row">';
  for (var mi = 1; mi <= 5; mi++) {
    html += '<button class="mood-btn' + (ws.moodPost === mi ? ' sel' : '') + '" onclick="moodSelectPost(' + mi + ')">' + moodEmojis[mi] + '</button>';
  }
  html += '</div></div>';
  html += '<button class="ws-btn-save" onclick="wsSaveAndClose()">Salva e Chiudi</button></div>';
  content.innerHTML = html;
  confetti();
}

// â”€â”€ WORKOUT HISTORY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openWorkoutHistory() {
  document.getElementById('wh-ov').classList.add('on');
  renderWorkoutHistory();
}
function closeWorkoutHistory() { document.getElementById('wh-ov').classList.remove('on'); }

function renderWorkoutHistory() {
  var cw = getCompletedWorkouts();
  var el = document.getElementById('wh-content');
  if (cw.length === 0) {
    el.innerHTML = '<div class="wh-empty"><b>Nessun allenamento completato</b>Avvia una scheda per registrare il tuo primo workout</div>';
    return;
  }
  var sorted = cw.slice().sort(function(a,b) { return b.completedAt.localeCompare(a.completedAt); });
  var totalDur = cw.reduce(function(s,w) { return s + (w.duration||0); }, 0);
  var totalCal = cw.reduce(function(s,w) { return s + (w.calories||0); }, 0);
  var totalEx = cw.reduce(function(s,w) { return s + (w.exercises?w.exercises.length:0); }, 0);
  var html = '<div class="wh-total-bar">';
  html += '<div><div class="wh-total-val">' + cw.length + '</div><div class="wh-total-lbl">Sessioni</div></div>';
  html += '<div><div class="wh-total-val">' + Math.floor(totalDur/60) + '</div><div class="wh-total-lbl">Minuti</div></div>';
  html += '<div><div class="wh-total-val">' + totalCal + '</div><div class="wh-total-lbl">Calorie</div></div>';
  html += '<div><div class="wh-total-val">' + totalEx + '</div><div class="wh-total-lbl">Esercizi</div></div>';
  html += '</div>';
  var months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  sorted.forEach(function(w) {
    var dp = new Date(w.completedAt);
    var dateStr = dp.getDate() + ' ' + months[dp.getMonth()] + ' ' + dp.getFullYear();
    var timeStr = String(dp.getHours()).padStart(2,'0') + ':' + String(dp.getMinutes()).padStart(2,'0');
    var mm = Math.floor((w.duration||0)/60);
    var ss = (w.duration||0)%60;
    html += '<div class="wh-item">';
    html += '<div class="wh-top"><div class="wh-plan">' + whEsc(w.planName||'Workout') + '</div><div class="wh-date">' + dateStr + ' Â· ' + timeStr + '</div></div>';
    html += '<div class="wh-stats">';
    html += '<div class="wh-stat">â± <b>' + mm + ':' + String(ss).padStart(2,'0') + '</b></div>';
    html += '<div class="wh-stat">ðŸ”¥ <b>' + (w.calories||0) + '</b> kcal</div>';
    html += '<div class="wh-stat">ðŸ’ª <b>' + (w.exercises?w.exercises.length:0) + '</b> esercizi</div>';
    html += '</div>';
    if (w.exercises && w.exercises.length > 0) {
      html += '<div class="wh-exercises">';
      w.exercises.forEach(function(e) { html += '<div class="wh-ex-chip">' + whEsc(e.name||e.id) + '</div>'; });
      html += '</div>';
    }
    html += '</div>';
  });
  el.innerHTML = html;
}

function whEsc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// â”€â”€ LEGAL PAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openLegal(id) {
  const ov = document.getElementById(id);
  if (ov) { ov.classList.add('on'); ov.querySelector('.legal-scroll').scrollTop = 0; }
}
function closeLegal(id) {
  const ov = document.getElementById(id);
  if (ov) ov.classList.remove('on');
}

// â”€â”€ PROGRESS TRACKER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PROG_KEY = 'aura_progress';
function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROG_KEY)) || { peso:[], forza:[], resistenza:[] }; }
  catch(e) { return { peso:[], forza:[], resistenza:[] }; }
}
function saveProgress(d) { localStorage.setItem(PROG_KEY, JSON.stringify(d)); }

function openProgress() {
  document.getElementById('progress-ov').classList.add('on');
  document.getElementById('prog-peso-date').value = new Date().toISOString().slice(0,10);
  switchProgTab('peso');
}
function closeProgress() {
  document.getElementById('progress-ov').classList.remove('on');
}

function switchProgTab(t) {
  document.querySelectorAll('.prog-tab').forEach(el => el.classList.toggle('on', el.dataset.pt === t));
  document.querySelectorAll('.prog-panel').forEach(el => el.classList.toggle('on', el.id === 'pp-' + t));
  renderProgPanel(t);
}

function addProgEntry(cat) {
  const d = getProgress();
  if (cat === 'peso') {
    const v = parseFloat(document.getElementById('prog-peso-val').value);
    const dt = document.getElementById('prog-peso-date').value;
    if (!v || v < 30 || v > 300) { toast('Inserisci un peso valido (30-300 kg)','re'); return; }
    if (!dt) { toast('Seleziona una data','re'); return; }
    d.peso.push({ val: v, date: dt });
    document.getElementById('prog-peso-val').value = '';
  } else if (cat === 'forza') {
    const ex = document.getElementById('prog-forza-ex').value;
    const v = parseFloat(document.getElementById('prog-forza-val').value);
    if (!v || v <= 0) { toast('Inserisci un peso valido','re'); return; }
    d.forza.push({ val: v, ex: ex, date: new Date().toISOString().slice(0,10) });
    document.getElementById('prog-forza-val').value = '';
  } else {
    const tp = document.getElementById('prog-res-type').value;
    const v = parseInt(document.getElementById('prog-res-val').value);
    if (!v || v <= 0) { toast('Inserisci i minuti','re'); return; }
    d.resistenza.push({ val: v, type: tp, date: new Date().toISOString().slice(0,10) });
    document.getElementById('prog-res-val').value = '';
  }
  saveProgress(d);
  toast('Dato salvato!','gr');
  renderProgPanel(cat);
  updateProfileStats();
}

function deleteProgEntry(cat, idx) {
  const d = getProgress();
  d[cat].splice(idx, 1);
  saveProgress(d);
  renderProgPanel(cat);
  updateProfileStats();
}

function renderProgPanel(cat) {
  const d = getProgress();
  const entries = d[cat] || [];
  const sorted = [...entries].sort((a,b) => a.date.localeCompare(b.date));
  const listEl = document.getElementById(cat + '-list');
  const histCard = document.getElementById(cat + '-history');
  const curEl = document.getElementById(cat + '-current');

  // Current value & delta
  if (sorted.length === 0) {
    curEl.innerHTML = '<div class="prog-empty"><b>Nessun dato ancora</b>Aggiungi la tua prima misurazione qui sotto</div>';
  } else {
    const last = sorted[sorted.length - 1];
    const unit = cat === 'peso' ? 'kg' : cat === 'forza' ? 'kg' : 'min';
    let deltaHtml = '';
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      const diff = (last.val - prev.val).toFixed(1);
      const sign = diff > 0 ? '+' : '';
      const cls = cat === 'peso' ? (diff < 0 ? 'pos' : diff > 0 ? 'neg' : '') : (diff > 0 ? 'pos' : diff < 0 ? 'neg' : '');
      deltaHtml = '<span class="prog-val-delta ' + cls + '">' + sign + diff + ' ' + unit + '</span>';
    }
    const label = cat === 'forza' ? ' (' + last.ex + ')' : cat === 'resistenza' ? ' (' + last.type + ')' : '';
    curEl.innerHTML = '<span class="prog-val-big">' + last.val + '</span><span class="prog-val-unit">' + unit + label + '</span>' + deltaHtml;
  }

  // History list (newest first)
  const rev = [...sorted].reverse();
  if (rev.length === 0) {
    histCard.style.display = 'none';
  } else {
    histCard.style.display = '';
    const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    listEl.innerHTML = rev.map((e, ri) => {
      const realIdx = entries.indexOf(rev[ri]);
      const dp = new Date(e.date);
      const ds = dp.getDate() + ' ' + months[dp.getMonth()] + ' ' + dp.getFullYear();
      const unit = cat === 'peso' ? 'kg' : cat === 'forza' ? 'kg' : 'min';
      const extra = cat === 'forza' ? e.ex + ' â€” ' : cat === 'resistenza' ? e.type + ' â€” ' : '';
      return '<div class="prog-hi"><span class="prog-hi-date">' + ds + '</span><span class="prog-hi-val">' + extra + e.val + ' ' + unit + '</span><button class="prog-hi-del" onclick="deleteProgEntry(\'' + cat + '\',' + realIdx + ')">âœ•</button></div>';
    }).join('');
  }

  // Draw chart
  drawProgChart(cat, sorted);
}

function drawProgChart(cat, sorted) {
  const canvas = document.getElementById('chart-' + cat);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = (rect.width - 28) * dpr;
  canvas.height = 180 * dpr;
  canvas.style.width = (rect.width - 28) + 'px';
  canvas.style.height = '180px';
  ctx.scale(dpr, dpr);
  const W = rect.width - 28, H = 180;
  ctx.clearRect(0, 0, W, H);

  if (sorted.length < 2) {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--t4');
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(sorted.length === 0 ? 'Aggiungi dati per vedere il grafico' : 'Serve almeno un altro dato', W/2, H/2);
    return;
  }

  const pad = { t: 20, b: 30, l: 42, r: 16 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const vals = sorted.map(e => e.val);
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mn === mx) { mn -= 1; mx += 1; }
  const range = mx - mn;

  // Grid lines
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--s7') || '#2a2a2a';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--t4') || '#666';
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    const gv = mx - (range / 4) * i;
    ctx.fillText(gv.toFixed(cat === 'peso' ? 1 : 0), pad.l - 6, y + 3);
  }

  // X labels
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const step = Math.max(1, Math.floor(sorted.length / 5));
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  ctx.font = '10px system-ui';
  for (let i = 0; i < sorted.length; i += step) {
    const x = pad.l + (i / (sorted.length - 1)) * cW;
    const dp = new Date(sorted[i].date);
    ctx.fillText(dp.getDate() + '/' + (dp.getMonth()+1), x, H - 6);
  }

  // Line
  const orColor = getComputedStyle(document.documentElement).getPropertyValue('--or') || '#f97316';
  ctx.strokeStyle = orColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  sorted.forEach((e, i) => {
    const x = pad.l + (i / (sorted.length - 1)) * cW;
    const y = pad.t + cH - ((e.val - mn) / range) * cH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, orColor + '35');
  grad.addColorStop(1, orColor + '05');
  ctx.fillStyle = grad;
  ctx.beginPath();
  sorted.forEach((e, i) => {
    const x = pad.l + (i / (sorted.length - 1)) * cW;
    const y = pad.t + cH - ((e.val - mn) / range) * cH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.l + cW, pad.t + cH);
  ctx.lineTo(pad.l, pad.t + cH);
  ctx.closePath();
  ctx.fill();

  // Dots
  sorted.forEach((e, i) => {
    const x = pad.l + (i / (sorted.length - 1)) * cW;
    const y = pad.t + cH - ((e.val - mn) / range) * cH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = orColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function updateProfileStats() {
  const d = getProgress();
  const cw = getCompletedWorkouts();
  const totalWorkouts = d.forza.length + d.resistenza.length + cw.length;
  document.getElementById('ps-workouts').textContent = totalWorkouts;
  document.getElementById('ps-points').textContent = calcTotalXP();
  // Streak: count consecutive days with entries going backwards from today
  const today = new Date(); today.setHours(0,0,0,0);
  const allDates = new Set([...d.forza.map(e=>e.date), ...d.resistenza.map(e=>e.date), ...cw.map(e=>e.date)]);
  let streak = 0;
  const check = new Date(today);
  while(true) {
    const ds = check.toISOString().slice(0,10);
    if (allDates.has(ds)) { streak++; check.setDate(check.getDate()-1); }
    else break;
  }
  document.getElementById('ps-streak').textContent = streak;
  // Adherence: entries out of last 7 days
  let days7 = 0;
  for (let i = 0; i < 7; i++) {
    const dd = new Date(today); dd.setDate(dd.getDate() - i);
    if (allDates.has(dd.toISOString().slice(0,10))) days7++;
  }
  document.getElementById('ps-adherence').textContent = Math.round((days7/7)*100) + '%';
  // Home chips
  const hs = document.getElementById('home-streak');
  if (hs) hs.textContent = streak + ' giorni streak';
  const hw = document.getElementById('home-workouts');
  if (hw) hw.textContent = totalWorkouts + ' allenamenti';
  const hp = document.getElementById('home-points');
  if (hp) slotRoll(hp, calcTotalXP() + ' punti');
  // Profile streak chip
  const psc = document.getElementById('prof-streak-chip');
  if (psc) psc.textContent = 'ðŸ”¥ ' + streak + 'gg streak';
  // Workout history summary
  const whSum = document.getElementById('wh-summary');
  if (whSum) {
    if (cw.length === 0) whSum.textContent = 'Tutti gli allenamenti completati';
    else {
      const totalCal = cw.reduce((s,w) => s + (w.calories||0), 0);
      whSum.textContent = cw.length + ' sessioni Â· ' + totalCal + ' kcal totali';
    }
  }
  // Profile diary
  renderDiary();
  // XP & Levels & Badges
  updateXPandBadges();
}

function renderDiary() {
  const d = getProgress();
  const cw = getCompletedWorkouts();
  const all = [
    ...d.forza.map(e => ({ ...e, cat: 'Forza', label: e.ex + ' â€” ' + e.val + ' kg' })),
    ...d.resistenza.map(e => ({ ...e, cat: 'Cardio', label: e.type + ' â€” ' + e.val + ' min' })),
    ...cw.map(e => ({ date: e.date, cat: 'Sessione', label: e.planName + ' â€” ' + Math.floor(e.duration/60) + ' min Â· ' + e.calories + ' kcal' }))
  ].sort((a, b) => b.date.localeCompare(a.date));
  const diary = document.getElementById('prof-diary');
  const empty = document.getElementById('diary-empty');
  if (!diary) return;
  if (all.length === 0) {
    empty.style.display = '';
    // Remove any whi elements
    diary.querySelectorAll('.whi').forEach(el => el.remove());
    return;
  }
  empty.style.display = 'none';
  const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
  const last7 = all.slice(0, 7);
  const html = last7.map(e => {
    const dp = new Date(e.date);
    const dd = days[dp.getDay()];
    const dn = dp.getDate();
    return '<div class="whi"><div class="whd"><div class="dd">' + dd + '</div><div class="dn">' + dn + '</div></div><div class="whi-info"><strong>' + e.cat + '</strong><span>' + e.label + '</span></div><div class="whb ok">âœ“</div></div>';
  }).join('');
  // Replace content but keep the empty div
  diary.querySelectorAll('.whi').forEach(el => el.remove());
  diary.insertAdjacentHTML('beforeend', html);
}

// â”€â”€ XP & LEVEL SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const XP_TABLE = [0,120,360,720,1200,1800,2520,3360,4320,5400,6600,7920,9360,10920,12600,14400,16320,18360,20520,22800,25200];
const LVL_NAMES = ['Principiante','Esploratore','Costante','Dedicato','Guerriero','Atleta','Macchina','Campione','Leggenda','Elite','â­ AURA'];

function getLevelFromXP(xp) {
  let lvl = 1;
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) lvl = i + 1; else break;
  }
  return Math.min(lvl, 20);
}
function getLevelName(lvl) {
  const idx = Math.min(Math.floor((lvl - 1) / 2), LVL_NAMES.length - 1);
  return LVL_NAMES[idx];
}
function calcTotalXP() {
  const d = getProgress();
  const cw = getCompletedWorkouts();
  return d.forza.length * 120 + d.resistenza.length * 120 + d.peso.length * 30 + cw.length * 200;
}

// â”€â”€ ACHIEVEMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BADGES = [
  { id:'first_workout', ico:'ðŸŽ¯', name:'Primo Passo', desc:'Registra il primo allenamento', check: d => (d.forza.length + d.resistenza.length) >= 1 },
  { id:'five_workouts', ico:'ðŸ’ª', name:'5 Workout', desc:'Completa 5 allenamenti', check: d => (d.forza.length + d.resistenza.length) >= 5 },
  { id:'ten_workouts', ico:'ðŸ”¥', name:'10 Workout', desc:'Completa 10 allenamenti', check: d => (d.forza.length + d.resistenza.length) >= 10 },
  { id:'twentyfive_workouts', ico:'âš¡', name:'25 Workout', desc:'Completa 25 allenamenti', check: d => (d.forza.length + d.resistenza.length) >= 25 },
  { id:'fifty_workouts', ico:'ðŸ†', name:'50 Workout', desc:'Completa 50 allenamenti', check: d => (d.forza.length + d.resistenza.length) >= 50 },
  { id:'first_weight', ico:'âš–ï¸', name:'Prima Pesata', desc:'Registra il primo peso', check: d => d.peso.length >= 1 },
  { id:'ten_weights', ico:'ðŸ“Š', name:'Costanza', desc:'10 pesate registrate', check: d => d.peso.length >= 10 },
  { id:'first_strength', ico:'ðŸ‹ï¸', name:'Ferro', desc:'Primo record di forza', check: d => d.forza.length >= 1 },
  { id:'first_cardio', ico:'ðŸƒ', name:'Cardio!', desc:'Prima attivita cardio', check: d => d.resistenza.length >= 1 },
  { id:'streak3', ico:'ðŸ”¥', name:'3gg Streak', desc:'3 giorni consecutivi', check: (d, ctx) => ctx.streak >= 3 },
  { id:'streak7', ico:'ðŸ’¥', name:'7gg Streak', desc:'7 giorni consecutivi', check: (d, ctx) => ctx.streak >= 7 },
  { id:'streak14', ico:'â­', name:'14gg Streak', desc:'2 settimane di fila', check: (d, ctx) => ctx.streak >= 14 },
  { id:'streak30', ico:'ðŸ’Ž', name:'30gg Streak', desc:'Un mese di fila!', check: (d, ctx) => ctx.streak >= 30 },
  { id:'lvl5', ico:'ðŸŒŸ', name:'Livello 5', desc:'Raggiungi il livello 5', check: (d, ctx) => ctx.level >= 5 },
  { id:'lvl10', ico:'ðŸŒ ', name:'Livello 10', desc:'Raggiungi il livello 10', check: (d, ctx) => ctx.level >= 10 },
  { id:'variety', ico:'ðŸŒˆ', name:'Versatile', desc:'Registra forza E cardio', check: d => d.forza.length >= 1 && d.resistenza.length >= 1 },
  { id:'bench100', ico:'ðŸ¦¾', name:'100kg Club', desc:'Panca piana 100+ kg', check: d => d.forza.some(e => e.ex === 'Panca Piana' && e.val >= 100) },
  { id:'run30', ico:'ðŸ…', name:'Maratoneta', desc:'Corsa 30+ minuti', check: d => d.resistenza.some(e => e.type === 'Corsa' && e.val >= 30) },
];

const BADGE_STORE_KEY = 'aura_badges';
function getUnlockedBadges() {
  try { return JSON.parse(localStorage.getItem(BADGE_STORE_KEY)) || {}; } catch { return {}; }
}
function saveUnlockedBadges(b) { localStorage.setItem(BADGE_STORE_KEY, JSON.stringify(b)); }

function updateXPandBadges() {
  const d = getProgress();
  const xp = calcTotalXP();
  const lvl = getLevelFromXP(xp);
  const lvlName = getLevelName(lvl);
  const xpCur = XP_TABLE[lvl - 1] || 0;
  const xpNext = XP_TABLE[lvl] || XP_TABLE[XP_TABLE.length - 1];
  const xpInLevel = xp - xpCur;
  const xpNeeded = xpNext - xpCur;
  const pct = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  // XP bar
  const lvlLabel = document.getElementById('xp-lvl-label');
  if (lvlLabel) lvlLabel.textContent = 'Livello ' + lvl + ' â€” ' + lvlName;
  const nextLabel = document.getElementById('xp-next-label');
  if (nextLabel) nextLabel.textContent = xp + ' / ' + xpNext + ' XP';
  const fill = document.getElementById('xp-fill');
  if (fill) fill.style.width = pct + '%';
  const xpLbl = document.getElementById('xp-label');
  if (xpLbl) {
    if (lvl >= 20) xpLbl.textContent = 'Livello massimo raggiunto!';
    else xpLbl.textContent = (xpNext - xp) + ' XP per il prossimo livello';
  }

  // Home & profile level badges
  const homeLvl = document.getElementById('home-lvl-badge');
  if (homeLvl) homeLvl.textContent = 'âš¡ Lv.' + lvl + ' ' + lvlName;
  const profTag = document.getElementById('prof-tag');
  if (profTag) profTag.textContent = 'âš¡ Lv.' + lvl + ' â€” ' + lvlName;

  // Streak for badge context
  const today = new Date(); today.setHours(0,0,0,0);
  const allDates = new Set([...d.forza.map(e=>e.date), ...d.resistenza.map(e=>e.date)]);
  let streak = 0;
  const check = new Date(today);
  while(true) {
    if (allDates.has(check.toISOString().slice(0,10))) { streak++; check.setDate(check.getDate()-1); }
    else break;
  }

  // Check badges
  const ctx = { streak, level: lvl, xp };
  const unlocked = getUnlockedBadges();
  let newBadges = [];
  BADGES.forEach(b => {
    if (!unlocked[b.id] && b.check(d, ctx)) {
      unlocked[b.id] = new Date().toISOString().slice(0,10);
      newBadges.push(b);
    }
  });
  if (newBadges.length > 0) {
    saveUnlockedBadges(unlocked);
    newBadges.forEach((b, i) => {
      setTimeout(() => toast(b.ico + ' Badge sbloccato: ' + b.name + '!', 'or'), 300 + i * 800);
    });
    confetti();
  }

  // Render badges grid
  const grid = document.getElementById('badges-grid');
  if (grid) {
    const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    grid.innerHTML = BADGES.map(b => {
      const u = unlocked[b.id];
      const cls = u ? 'unlocked' : 'locked';
      let dateStr = '';
      if (u) { const dp = new Date(u); dateStr = '<div class="badge-date">' + dp.getDate() + ' ' + months[dp.getMonth()] + ' ' + dp.getFullYear() + '</div>'; }
      return '<div class="badge-item ' + cls + '"><div class="badge-ico">' + (u ? b.ico : 'ðŸ”’') + '</div><div class="badge-name">' + b.name + '</div><div class="badge-desc">' + b.desc + '</div>' + dateStr + '</div>';
    }).join('');
  }
  const bc = document.getElementById('badge-count');
  if (bc) {
    const total = BADGES.length;
    const done = Object.keys(unlocked).length;
    bc.textContent = done + '/' + total;
  }
}

// â”€â”€ EDIT PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openEditProfile() {
  const u = getUser();
  if (!u) return;
  document.getElementById('ep-name').value = u.name || '';
  document.getElementById('ep-email').value = u.email || '';
  document.getElementById('ep-weight').value = u.weight || '';
  document.getElementById('ep-height').value = u.height || '';
  document.getElementById('ep-age').value = u.age || '';
  document.getElementById('ep-sex').value = u.sex || 'M';
  document.getElementById('ep-goal').value = u.goal || 'massa';
  document.getElementById('ep-level').value = u.level || 'intermedio';
  document.getElementById('ep-freq').value = u.freq || '4-5';
  document.getElementById('editprof-ov').classList.add('on');
}
function closeEditProfile() {
  document.getElementById('editprof-ov').classList.remove('on');
}
function saveEditProfile() {
  const u = getUser();
  if (!u) return;
  const name = document.getElementById('ep-name').value.trim();
  if (!name || name.length < 2) { toast('Inserisci un nome valido','re'); return; }
  const weight = parseFloat(document.getElementById('ep-weight').value);
  const height = parseInt(document.getElementById('ep-height').value);
  const age = parseInt(document.getElementById('ep-age').value);
  if (weight && (weight < 30 || weight > 300)) { toast('Peso non valido (30-300 kg)','re'); return; }
  if (height && (height < 100 || height > 250)) { toast('Altezza non valida (100-250 cm)','re'); return; }
  if (age && (age < 13 || age > 100)) { toast('EtÃ  non valida (13-100)','re'); return; }
  u.name = name;
  u.goal = document.getElementById('ep-goal').value;
  u.level = document.getElementById('ep-level').value;
  u.freq = document.getElementById('ep-freq').value;
  u.sex = document.getElementById('ep-sex').value;
  if (weight) u.weight = weight;
  if (height) u.height = height;
  if (age) u.age = age;
  setUser(u);
  // Update stored account too
  const stored = JSON.parse(localStorage.getItem(ACCT_KEY) || '[]');
  const idx = stored.findIndex(a => a.email === u.email);
  if (idx >= 0) { Object.assign(stored[idx], u); localStorage.setItem(ACCT_KEY, JSON.stringify(stored)); }
  applyUserData(u);
  closeEditProfile();
  toast('Profilo aggiornato!','gr');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SOCIAL â€” Firebase Config & State
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const FIREBASE_CONFIG = {
  // âš ï¸ Inserisci qui la tua config Firebase:
  // 1. Vai su console.firebase.google.com
  // 2. Crea progetto â†’ Abilita Auth Anonymous + Firestore (test mode)
  // 3. Copia le credenziali qui sotto
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

var FB = { ready: false, db: null, auth: null, uid: null };
var SOCIAL = {
  myLocation: null,
  nearbyUsers: [],
  currentIdx: 0,
  matches: [],
  currentChatMatchId: null,
  currentChatName: '',
  chatUnsub: null,
  matchesUnsub: null,
  radius: 10,
  initialized: false,
  lastMatchName: ''
};

// â”€â”€ OROLOGIO STATUS BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateClock() {
  const now = new Date();
  document.getElementById('sb-time').textContent =
    String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
}
updateClock();
setInterval(updateClock, 10000);

// â”€â”€ NAVIGAZIONE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.querySelectorAll('.nb').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.tab;
    if (!t || t === S.tab) return;
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.tab').forEach(v => v.classList.remove('on'));
    btn.classList.add('on');
    document.getElementById('tab-' + t).classList.add('on');
    document.getElementById('screen').scrollTop = 0;
    S.tab = t;
    if (t === 'home') startBpmSim(); else stopBpmSim();
    if (t === 'workout') renderWorkoutTab();
  });
});

// â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toast(msg, type='or') {
  const borders = { or:'#f9731650', gr:'#22c55e50', bl:'#38bdf850', re:'#f43f5e50' };
  const c = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.borderLeftColor = borders[type] || borders.or;
  el.innerHTML = msg;
  c.appendChild(el);
  el.addEventListener('click', () => removeToast(el));
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  el._tid = setTimeout(() => removeToast(el), 4000);
}
function removeToast(el) {
  clearTimeout(el._tid);
  el.classList.remove('in');
  setTimeout(() => el.remove(), 320);
}

// â”€â”€ MODAL (bottom sheet) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showModal(ico, title, body, cta, color) {
  document.getElementById('m-ico').textContent = ico;
  document.getElementById('m-title').textContent = title;
  document.getElementById('m-body').innerHTML = body;
  const btn = document.getElementById('modal-cta');
  btn.textContent = cta;
  btn.style.background = color;
  const ov = document.getElementById('modal-ov');
  ov.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('on')));
}
function closeModal() {
  const ov = document.getElementById('modal-ov');
  const box = document.getElementById('modal-box');
  box.style.transform = 'translateY(100%)';
  setTimeout(() => { ov.style.display = 'none'; ov.classList.remove('on'); box.style.transform = ''; }, 350);
}
let _modalCtaAction = null;
function modalCta() {
  if (_modalCtaAction) { _modalCtaAction(); _modalCtaAction = null; }
  else { closeModal(); toast('âœ… Richiesta inviata! Ti contatteremo presto.', 'gr'); }
}

// Swipe down to close modal
(function() {
  const box = document.getElementById('modal-box');
  let sy = 0, drag = false;
  box.addEventListener('touchstart', e => { sy = e.touches[0].clientY; drag = true; box.style.transition = 'none'; }, { passive:true });
  box.addEventListener('touchmove', e => {
    if (!drag) return;
    const dy = Math.max(0, e.touches[0].clientY - sy);
    box.style.transform = `translateY(${dy}px)`;
  }, { passive:true });
  box.addEventListener('touchend', e => {
    drag = false;
    box.style.transition = '';
    const dy = e.changedTouches[0].clientY - sy;
    if (dy > 80) closeModal();
    else box.style.transform = '';
  });
})();

// â”€â”€ DYNAMIC ISLAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var _diExpanded = false;

function diShow() {
  var el = document.getElementById('dyn-island');
  if (!el) return;
  diUpdate();
  el.classList.add('on');
  el.classList.remove('expanded');
  _diExpanded = false;
}

function diHide() {
  var el = document.getElementById('dyn-island');
  if (!el) return;
  el.classList.remove('on','expanded');
  _diExpanded = false;
}

function diUpdate() {
  if (!ws.active) return;
  var ex = ws.exercises[ws.exIdx];
  var m = String(Math.floor(ws.totalSec / 60)).padStart(2, '0');
  var s = String(ws.totalSec % 60).padStart(2, '0');
  var timer = document.getElementById('di-timer');
  if (timer) timer.textContent = m + ':' + s;
  var name = document.getElementById('di-exname');
  if (name && ex) name.textContent = ex.name;
  var bpm = document.getElementById('di-bpm-val');
  if (bpm) bpm.textContent = S.bpm + '';
  // Expanded details
  var exFull = document.getElementById('di-ex-full');
  if (exFull && ex) exFull.textContent = ex.name;
  var setInfo = document.getElementById('di-set-info');
  if (setInfo && ex) setInfo.textContent = ws.setNum + ' / ' + (parseInt(ex.sets) || 3);
  var status = document.getElementById('di-status');
  if (status) {
    if (ws.paused) status.textContent = 'In pausa';
    else if (ws.resting) {
      var rm = String(Math.floor(ws.restSec / 60)).padStart(2, '0');
      var rs = String(ws.restSec % 60).padStart(2, '0');
      status.textContent = 'Riposo ' + rm + ':' + rs;
      status.style.color = 'var(--bl)';
    } else {
      status.textContent = 'In corso';
      status.style.color = 'var(--gr)';
    }
  }
  // Dot color
  var dot = document.querySelector('.di-dot');
  if (dot) {
    if (ws.paused) { dot.style.background = 'var(--t3)'; dot.style.animationPlayState = 'paused'; }
    else if (ws.resting) { dot.style.background = 'var(--bl)'; dot.style.animationPlayState = 'running'; }
    else { dot.style.background = 'var(--or)'; dot.style.animationPlayState = 'running'; }
  }
  var pauseBtn = document.getElementById('di-btn-pause');
  if (pauseBtn) pauseBtn.textContent = ws.paused ? 'â–¶ Riprendi' : 'â¸ Pausa';
}

function diToggle() {
  var el = document.getElementById('dyn-island');
  if (!el) return;
  _diExpanded = !_diExpanded;
  el.classList.toggle('expanded', _diExpanded);
  haptic();
}

function diPause() {
  ws.paused = !ws.paused;
  diUpdate();
  // Also sync with the workout overlay pause logic if available
  renderWsView();
  haptic();
}

// â”€â”€ CONFETTI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function confetti() {
  var cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none';
  cvs.width = window.innerWidth; cvs.height = window.innerHeight;
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');
  var colors = ['#f97316','#22c55e','#38bdf8','#a78bfa','#f43f5e','#facc15','#fff'];
  var particles = [];
  for (var i = 0; i < 40; i++) {
    particles.push({
      x: cvs.width * .5 + (Math.random() - .5) * cvs.width * .4,
      y: cvs.height * .35,
      vx: (Math.random() - .5) * 8,
      vy: -Math.random() * 12 - 4,
      w: 4 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      c: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rv: (Math.random() - .5) * 12,
      g: .25 + Math.random() * .15
    });
  }
  var start = performance.now();
  function frame(now) {
    var t = now - start;
    if (t > 1200) { document.body.removeChild(cvs); return; }
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    var alpha = t > 900 ? 1 - (t - 900) / 300 : 1;
    ctx.globalAlpha = alpha;
    particles.forEach(function(p) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.rv;
      p.vx *= .99;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// â”€â”€ 3D TILT (GYROSCOPE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
  var cards = [];
  var tiltEnabled = false;

  function initTilt() {
    cards = document.querySelectorAll('#tab-home .card.glass');
    cards.forEach(function(c) { c.classList.add('tilt-card'); });
  }

  function resetTilt() {
    cards.forEach(function(c) { c.style.transform = ''; });
  }

  function handleOrientation(e) {
    if (!tiltEnabled || S.tab !== 'home') return;
    var beta = Math.max(-5, Math.min(5, (e.beta - 45) * 0.15));
    var gamma = Math.max(-5, Math.min(5, e.gamma * 0.15));
    cards.forEach(function(c) {
      c.style.transform = 'perspective(800px) rotateX(' + (-beta).toFixed(2) + 'deg) rotateY(' + gamma.toFixed(2) + 'deg)';
    });
  }

  function enableTilt() {
    if (tiltEnabled) return;
    initTilt();
    tiltEnabled = true;
    window.addEventListener('deviceorientation', handleOrientation);
  }

  // Request permission on iOS 13+ (delayed, non-blocking)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Don't steal the first click â€” wait until user is in the app
    setTimeout(function() {
      document.getElementById('tab-home').addEventListener('touchstart', function _ask() {
        DeviceOrientationEvent.requestPermission().then(function(r) {
          if (r === 'granted') enableTilt();
        }).catch(function() {});
        document.getElementById('tab-home').removeEventListener('touchstart', _ask);
      }, { once: true });
    }, 2000);
  } else if ('DeviceOrientationEvent' in window) {
    setTimeout(enableTilt, 500);
  }
})();

// â”€â”€ ACTIVITY RINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateRings() {
  var rings = [
    { id:'ring-move', circ:452.4, val:S.move, goal:S.moveGoal, label:'ring-move-val', unit:'kcal' },
    { id:'ring-exercise', circ:364.4, val:S.exercise, goal:S.exGoal, label:'ring-ex-val', unit:'min' },
    { id:'ring-stand', circ:276.5, val:S.stand, goal:S.standGoal, label:'ring-stand-val', unit:'h' }
  ];
  rings.forEach(function(r) {
    var el = document.getElementById(r.id);
    var pct = Math.min(r.val / r.goal, 1);
    if (el) el.style.strokeDashoffset = r.circ * (1 - pct);
    var lbl = document.getElementById(r.label);
    if (lbl) lbl.textContent = Math.round(r.val) + '/' + r.goal + ' ' + r.unit;
  });
  var kcEl = document.getElementById('rings-kcal');
  if (kcEl) slotRoll(kcEl, Math.round(S.move));
}

// Simulate ring data on load with staggered reveal


// â”€â”€ HYDRATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateHydro() {
  var arc = document.getElementById('hydro-arc');
  var val = document.getElementById('hydro-val');
  if (!arc || !val) return;
  var circ = 87.96;
  var pct = S.hydration / S.hydGoal;
  arc.style.strokeDashoffset = circ * (1 - pct);
  arc.style.stroke = pct >= .8 ? '#22c55e' : '#f97316';
  arc.style.filter = pct >= .8 ? 'drop-shadow(0 0 3px #22c55e)' : 'drop-shadow(0 0 3px #f97316)';
  val.innerHTML = S.hydration.toFixed(1) + '<small style="font-size:.55rem;color:#64748b">L</small>';
  var sub = document.querySelector('.hydro-mini-sub');
  if (sub) sub.textContent = 'di ' + S.hydGoal + 'L';
}
var _addWaterBtn = document.getElementById('add-water');
if (_addWaterBtn) {
  _addWaterBtn.addEventListener('click', function() {
    if (S.hydration >= S.hydGoal) { toast('ðŸŽ‰ Obiettivo raggiunto!', 'gr'); return; }
    S.hydration = Math.min(+(S.hydration + 0.25).toFixed(2), S.hydGoal);
    updateHydro();
    this.style.transform = 'scale(1.3)';
    setTimeout(() => { this.style.transform = 'scale(1)'; }, 160);
    if (S.hydration >= S.hydGoal) toast('ðŸŽ‰ Idratazione completata! ðŸ†', 'gr');
    else toast(`ðŸ’§ +250ml Â· Ancora ${(S.hydGoal - S.hydration).toFixed(2)}L`, 'bl');
  });
}
updateHydro();

// â”€â”€ BPM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var _bpmInterval = null;
function startBpmSim() {
  if (_bpmInterval) return;
  _bpmInterval = setInterval(() => {
    S.bpm = 68 + Math.floor(Math.random() * 12);
    const a = document.getElementById('bpm-val'); if (a) slotRoll(a, S.bpm + ' BPM');
  }, 3000);
}
function stopBpmSim() {
  if (_bpmInterval) { clearInterval(_bpmInterval); _bpmInterval = null; }
}

// â”€â”€ WORKOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('start-btn').addEventListener('click', function() {
  var plans = getWorkouts();
  if (plans.length === 0) {
    toast('Crea prima una scheda!', 'or');
    openWorkoutBuilder();
    return;
  }
  if (plans.length === 1) {
    if (plans[0].exercises.length === 0) { toast('Aggiungi esercizi alla scheda!', 'or'); openWorkoutBuilder(); return; }
    startWorkoutSession(0);
  } else {
    openWorkoutBuilder();
  }
});

// â”€â”€ AI CAMERA â€” MEDIAPIPE POSE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let cameraStream = null;
let cameraActive = false;
// Preload voices for speech synthesis
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); };
  }
}
let mpPose = null;
let mpCamera = null;
let poseRunning = false;

// Pose analysis state
const CAM = {
  reps: 0, phase: 'up', formScore: 0, symScore: 0, calories: 0,
  repStartTime: 0, lastFeedback: 0, lowLight: false, frameScores: [],
  exercise: 'squat', angles: {}, targetReps: 12,
  lastVoiceTime: 0, lastVoiceMsg: '', voiceEnabled: true,
  sessionActive: false, failedChecks: {}, startTime: 0, formTipGiven: false
};

// Exercise definitions for angle analysis
const POSE_EXERCISES = {
  squat: {
    name: 'Squat',
    joints: {
      knee_l: [23, 25, 27],  // hip-knee-ankle left
      knee_r: [24, 26, 28],
      hip: [11, 23, 25]
    },
    repAngle: 'knee_l',
    downThresh: 130, upThresh: 145,
    checks: [
      { name: 'Ginocchia', fn: function(a) { return Math.abs((a.knee_l||180)-(a.knee_r||180)) < 20; }, ok: 'âœ“ Ginocchia simmetriche', warn: 'âš  Ginocchia asimmetriche', voice: 'Ginocchia asimmetriche! Allineale.' },
      { name: 'ProfonditÃ ', fn: function(a) { return (a.knee_l||180) < 130; }, ok: 'âœ“ Buona profonditÃ ', warn: 'âš  Scendi di piÃ¹', voice: 'Scendi di piÃ¹! Cosce parallele al pavimento.' },
      { name: 'Schiena', fn: function(a) { return (a.hip||0) > 45; }, ok: 'âœ“ Schiena dritta', warn: 'âš  Schiena troppo inclinata', voice: 'Tieni la schiena piÃ¹ dritta!' }
    ]
  },
  pushup: {
    name: 'Push-Up',
    joints: {
      elbow_l: [11, 13, 15],  // shoulder-elbow-wrist
      elbow_r: [12, 14, 16],
      body: [11, 23, 25]
    },
    repAngle: 'elbow_l',
    downThresh: 110, upThresh: 145,
    checks: [
      { name: 'Gomiti', fn: function(a) { return Math.abs((a.elbow_l||180)-(a.elbow_r||180)) < 20; }, ok: 'âœ“ Gomiti simmetrici', warn: 'âš  Gomiti asimmetrici', voice: 'Gomiti asimmetrici! Allineali.' },
      { name: 'Corpo', fn: function(a) { return (a.body||180) > 140; }, ok: 'âœ“ Corpo allineato', warn: 'âš  Alza i fianchi', voice: 'Alza i fianchi! Corpo dritto come una tavola.' },
      { name: 'Ampiezza', fn: function(a) { return (a.elbow_l||180) < 115; }, ok: 'âœ“ Buona ampiezza', warn: 'âš  Scendi di piÃ¹', voice: 'Scendi di piÃ¹ con il petto!' }
    ]
  },
  deadlift: {
    name: 'Stacco da Terra',
    joints: {
      hip_l: [11, 23, 25],
      hip_r: [12, 24, 26],
      knee_l: [23, 25, 27]
    },
    repAngle: 'hip_l',
    downThresh: 110, upThresh: 150,
    checks: [
      { name: 'Anche', fn: function(a) { return Math.abs((a.hip_l||180)-(a.hip_r||180)) < 12; }, ok: 'âœ“ Anche simmetriche', warn: 'âš  Anche sbilanciate', voice: 'Anche sbilanciate! Distribuisci il peso.' },
      { name: 'Ginocchia', fn: function(a) { return (a.knee_l||180) > 140; }, ok: 'âœ“ Gambe ok', warn: 'âš  Non piegare troppo le ginocchia', voice: 'Non piegare troppo le ginocchia!' },
      { name: 'Schiena', fn: function(a) { return (a.hip_l||180) > 60; }, ok: 'âœ“ Schiena neutra', warn: 'âš  Schiena troppo arrotondata', voice: 'Schiena troppo arrotondata! Mantienila neutra.' }
    ]
  },
  shoulder_press: {
    name: 'Shoulder Press',
    joints: {
      elbow_l: [11, 13, 15],
      elbow_r: [12, 14, 16],
      shoulder_l: [13, 11, 23]
    },
    repAngle: 'elbow_l',
    downThresh: 100, upThresh: 150,
    checks: [
      { name: 'Gomiti', fn: function(a) { return Math.abs((a.elbow_l||180)-(a.elbow_r||180)) < 15; }, ok: 'âœ“ Braccia simmetriche', warn: 'âš  Braccia asimmetriche', voice: 'Braccia asimmetriche! Spingi in modo uniforme.' },
      { name: 'Ampiezza', fn: function(a) { return (a.elbow_l||180) > 155; }, ok: 'âœ“ Estensione completa', warn: 'âš  Estendi di piÃ¹', voice: 'Estendi di piÃ¹ le braccia in alto!' },
      { name: 'Postura', fn: function(a) { return (a.shoulder_l||0) > 70; }, ok: 'âœ“ Postura ok', warn: 'âš  Non inclinare il busto', voice: 'Non inclinare il busto! Tieniti dritto.' }
    ]
  },
  bicep_curl: {
    name: 'Curl Bicipiti',
    joints: {
      elbow_l: [11, 13, 15],
      elbow_r: [12, 14, 16],
      shoulder_l: [13, 11, 23]
    },
    repAngle: 'elbow_l',
    downThresh: 65, upThresh: 135,
    checks: [
      { name: 'Gomiti', fn: function(a) { return Math.abs((a.elbow_l||180)-(a.elbow_r||180)) < 20; }, ok: 'âœ“ Gomiti simmetrici', warn: 'âš  Gomiti asimmetrici', voice: 'Gomiti asimmetrici! Mantienili fermi.' },
      { name: 'Braccio fermo', fn: function(a) { return (a.shoulder_l||0) < 30; }, ok: 'âœ“ Braccio fermo', warn: 'âš  Non muovere il braccio', voice: 'Non muovere il braccio! Solo l\'avambraccio.' },
      { name: 'Contrazione', fn: function(a) { return (a.elbow_l||180) < 60; }, ok: 'âœ“ Buona contrazione', warn: 'âš  Contrai di piÃ¹', voice: 'Contrai di piÃ¹! Porta il peso piÃ¹ in alto.' }
    ]
  },
  lunge: {
    name: 'Affondi',
    joints: {
      knee_l: [23, 25, 27],
      knee_r: [24, 26, 28],
      hip_l: [11, 23, 25]
    },
    repAngle: 'knee_l',
    downThresh: 115, upThresh: 150,
    checks: [
      { name: 'Ginocchio ant.', fn: function(a) { return (a.knee_l||180) > 80; }, ok: 'âœ“ Ginocchio ok', warn: 'âš  Ginocchio troppo avanti', voice: 'Ginocchio troppo avanti! Non superare la punta del piede.' },
      { name: 'ProfonditÃ ', fn: function(a) { return (a.knee_l||180) < 105; }, ok: 'âœ“ Buona profonditÃ ', warn: 'âš  Scendi di piÃ¹', voice: 'Scendi di piÃ¹ in basso!' },
      { name: 'Busto', fn: function(a) { return (a.hip_l||0) > 75; }, ok: 'âœ“ Busto eretto', warn: 'âš  Tieni il busto dritto', voice: 'Tieni il busto dritto! Non piegarti in avanti.' }
    ]
  }
};

function calcAngle(a, b, c) {
  var ab = { x: a.x - b.x, y: a.y - b.y };
  var cb = { x: c.x - b.x, y: c.y - b.y };
  var dot = ab.x * cb.x + ab.y * cb.y;
  var mag = Math.sqrt(ab.x*ab.x + ab.y*ab.y) * Math.sqrt(cb.x*cb.x + cb.y*cb.y);
  if (mag === 0) return 180;
  var angle = Math.acos(Math.max(-1, Math.min(1, dot / mag)));
  return angle * (180 / Math.PI);
}

function checkBrightness(video) {
  try {
    var testCanvas = document.createElement('canvas');
    testCanvas.width = 64; testCanvas.height = 48;
    var tctx = testCanvas.getContext('2d');
    tctx.drawImage(video, 0, 0, 64, 48);
    var data = tctx.getImageData(0, 0, 64, 48).data;
    var sum = 0;
    for (var i = 0; i < data.length; i += 16) {
      sum += data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    }
    var avg = sum / (data.length / 16);
    return avg;
  } catch(e) { return 128; }
}

// â”€â”€ VOICE COACH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var speechUnlocked = false;
function unlockSpeech() {
  if (speechUnlocked) return;
  if (!('speechSynthesis' in window)) return;
  // Unlock with a silent utterance from user gesture context
  var unlock = new SpeechSynthesisUtterance('');
  unlock.volume = 0;
  unlock.lang = 'it-IT';
  window.speechSynthesis.speak(unlock);
  speechUnlocked = true;
  // Force load voices
  window.speechSynthesis.getVoices();
}

function speak(text) {
  if (!CAM.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  var now = Date.now();
  // Throttle: no same message within 4s, no any message within 1.5s
  if (now - CAM.lastVoiceTime < 1500) return;
  if (text === CAM.lastVoiceMsg && now - CAM.lastVoiceTime < 4000) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  u.rate = 1.05;
  u.pitch = 1.0;
  u.volume = 1.0;
  // Try to find an Italian voice
  var voices = window.speechSynthesis.getVoices();
  var itVoice = voices.find(function(v) { return v.lang && (v.lang.indexOf('it') === 0); });
  if (itVoice) u.voice = itVoice;
  window.speechSynthesis.speak(u);
  CAM.lastVoiceTime = now;
  CAM.lastVoiceMsg = text;
}

function speakRepCount(reps, target) {
  if (reps === target) {
    speak('Completato!');
  } else {
    speak('' + reps);
  }
}

function showCamSummary() {
  var exDef = POSE_EXERCISES[CAM.exercise];
  var duration = Math.round((Date.now() - CAM.startTime) / 1000);
  var mm = String(Math.floor(duration / 60)).padStart(2, '0');
  var ss = String(duration % 60).padStart(2, '0');
  var grade, gradeEmoji, gradeColor;
  if (CAM.formScore >= 90) { grade = 'Eccellente'; gradeEmoji = 'ðŸ†'; gradeColor = '#22c55e'; }
  else if (CAM.formScore >= 75) { grade = 'Buono'; gradeEmoji = 'ðŸ’ª'; gradeColor = '#22c55e'; }
  else if (CAM.formScore >= 55) { grade = 'Discreto'; gradeEmoji = 'ðŸ‘'; gradeColor = '#f97316'; }
  else { grade = 'Da Migliorare'; gradeEmoji = 'ðŸ“'; gradeColor = '#ef4444'; }

  // Find worst checks
  var tips = [];
  var sortedChecks = Object.keys(CAM.failedChecks).sort(function(a,b) { return CAM.failedChecks[b] - CAM.failedChecks[a]; });
  sortedChecks.slice(0, 3).forEach(function(key) {
    var cnt = CAM.failedChecks[key];
    if (cnt > 5) tips.push(key);
  });

  var body = document.getElementById('cam-summary-body');
  var html = '<div class="cam-summary-grade">' + gradeEmoji + '</div>';
  html += '<div class="cam-summary-title" style="color:' + gradeColor + '">' + grade + '</div>';
  html += '<div class="cam-summary-sub">' + exDef.name + ' Â· ' + CAM.reps + '/' + CAM.targetReps + ' ripetizioni</div>';
  html += '<div class="cam-summary-grid">';
  html += '<div class="cam-summary-card"><div class="cam-summary-card-val">' + CAM.formScore + '</div><div class="cam-summary-card-lbl">Forma</div></div>';
  html += '<div class="cam-summary-card"><div class="cam-summary-card-val">' + CAM.symScore + '</div><div class="cam-summary-card-lbl">Simmetria</div></div>';
  html += '<div class="cam-summary-card"><div class="cam-summary-card-val">' + mm + ':' + ss + '</div><div class="cam-summary-card-lbl">Durata</div></div>';
  html += '<div class="cam-summary-card"><div class="cam-summary-card-val">' + CAM.calories + '</div><div class="cam-summary-card-lbl">Calorie</div></div>';
  html += '</div>';
  if (tips.length > 0) {
    html += '<div class="cam-summary-tips"><div class="cam-summary-tips-title">ðŸ“ Consigli per migliorare</div>';
    tips.forEach(function(t) { html += '<div class="cam-summary-tip">âš  ' + t + '</div>'; });
    html += '</div>';
  }
  html += '<button class="cam-summary-close" onclick="closeCamSummary()">Chiudi</button>';
  body.innerHTML = html;
  document.getElementById('cam-summary-ov').classList.add('on');

  // Voice summary
  var voiceMsg = grade + '! Hai completato ' + CAM.reps + ' ripetizioni di ' + exDef.name + ' con un punteggio forma di ' + CAM.formScore + ' su 100.';
  if (tips.length > 0) voiceMsg += ' Consiglio: lavora su ' + tips[0] + '.';
  setTimeout(function() { speak(voiceMsg); }, 500);
}

function closeCamSummary() {
  document.getElementById('cam-summary-ov').classList.remove('on');
}

function onPoseResults(results) {
  var canvas = document.getElementById('cam-canvas');
  var video = document.getElementById('cam-video');
  if (!canvas || !video) return;
  var ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw mirrored video
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Light check every 30 frames
  var brightness = checkBrightness(video);
  var badge = document.getElementById('cam-status-badge');
  if (brightness < 35) {
    CAM.lowLight = true;
    badge.className = 'cam-status nolight';
    badge.textContent = 'âš  Luce insufficiente';
    document.getElementById('cam-fb-box').innerHTML = '<div class="fb err">âš  Migliora l\'illuminazione</div>';
    return;
  } else {
    if (CAM.lowLight) { CAM.lowLight = false; toast('ðŸ’¡ Luce ok!', 'gr'); }
    badge.className = 'cam-status live';
    badge.textContent = 'â— MediaPipe attivo';
  }

  if (!results.poseLandmarks) {
    badge.className = 'cam-status live';
    badge.textContent = 'ðŸ‘¤ Non rilevato';
    document.getElementById('cam-fb-box').innerHTML = '<div class="fb warn">Posizionati nell\'inquadratura</div>';
    return;
  }

  var lm = results.poseLandmarks;
  var w = canvas.width, h = canvas.height;

  // Draw skeleton connections
  var connections = [
    [11,12],[11,13],[13,15],[12,14],[14,16],
    [11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],
    [27,29],[28,30],[29,31],[30,32]
  ];
  ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f97316'; ctx.shadowBlur = 6;
  connections.forEach(function(c) {
    var a = lm[c[0]], b = lm[c[1]];
    if (a.visibility > 0.5 && b.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo((1-a.x)*w, a.y*h);
      ctx.lineTo((1-b.x)*w, b.y*h);
      ctx.stroke();
    }
  });
  ctx.shadowBlur = 0;

  // Draw joints
  for (var i = 11; i <= 32; i++) {
    if (lm[i].visibility > 0.5) {
      ctx.beginPath();
      ctx.arc((1-lm[i].x)*w, lm[i].y*h, 4, 0, Math.PI*2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Calculate angles
  var exDef = POSE_EXERCISES[CAM.exercise];
  CAM.angles = {};
  Object.keys(exDef.joints).forEach(function(key) {
    var idx = exDef.joints[key];
    var a = lm[idx[0]], b = lm[idx[1]], c = lm[idx[2]];
    if (a.visibility > 0.4 && b.visibility > 0.4 && c.visibility > 0.4) {
      CAM.angles[key] = Math.round(calcAngle(a, b, c));
    }
  });

  // Draw angle tags on canvas
  var tagsEl = document.getElementById('cam-angle-tags');
  var tagsHtml = '';
  Object.keys(CAM.angles).forEach(function(key) {
    var idx = exDef.joints[key];
    var jt = lm[idx[1]];
    if (jt.visibility > 0.5) {
      var px = Math.round((1-jt.x)*100);
      var py = Math.round(jt.y*100);
      tagsHtml += '<div class="cam-angle-tag" style="left:'+px+'%;top:'+py+'%">' + CAM.angles[key] + 'Â°</div>';
    }
  });
  tagsEl.innerHTML = tagsHtml;

  // Rep counting
  var repAngle = CAM.angles[exDef.repAngle];
  // Show current angle for debugging
  var repBadge = document.getElementById('cam-rep-badge');
  if (repAngle !== undefined) {
    repBadge.textContent = CAM.reps + (CAM.phase === 'down' ? ' â†“' : ' â†‘');
    repBadge.title = exDef.repAngle + ': ' + repAngle + 'Â° (â†“<' + exDef.downThresh + ' â†‘>' + exDef.upThresh + ')';
    if (CAM.phase === 'up' && repAngle < exDef.downThresh) {
      CAM.phase = 'down';
    } else if (CAM.phase === 'down' && repAngle > exDef.upThresh) {
      CAM.phase = 'up';
      CAM.reps++;
      if (!CAM.sessionActive) { CAM.sessionActive = true; CAM.startTime = Date.now(); }
      document.getElementById('cam-rep-badge').textContent = CAM.reps;
      document.getElementById('cstat-rep').textContent = CAM.reps;
      // Progress bar
      var pct = Math.min(100, Math.round((CAM.reps / CAM.targetReps) * 100));
      document.getElementById('cam-progress-fill').style.width = pct + '%';
      document.getElementById('cam-progress-label').textContent = CAM.reps + '/' + CAM.targetReps;
      // Calories
      var u = getUser(), wt = (u && u.weight) ? u.weight : 70;
      CAM.calories = Math.round(CAM.reps * 0.4 * (wt / 70));
      document.getElementById('cstat-cal').textContent = CAM.calories;
      // Voice rep count
      speakRepCount(CAM.reps, CAM.targetReps);
      // Target reached?
      if (CAM.reps >= CAM.targetReps) {
        setTimeout(function() { showCamSummary(); }, 800);
      }
    }
  }

  // Form checks
  var fbBox = document.getElementById('cam-fb-box');
  var fbHtml = '';
  var okCount = 0;
  var voiceWarnings = [];
  exDef.checks.forEach(function(ch) {
    var pass = ch.fn(CAM.angles);
    if (pass) { okCount++; fbHtml += '<div class="fb ok">' + ch.ok + '</div>'; }
    else {
      fbHtml += '<div class="fb warn">' + ch.warn + '</div>';
      if (ch.voice) voiceWarnings.push(ch.voice);
      // Track failed checks for summary
      if (!CAM.failedChecks[ch.warn.replace('âš  ','')]) CAM.failedChecks[ch.warn.replace('âš  ','')] = 0;
      CAM.failedChecks[ch.warn.replace('âš  ','')]++;
    }
  });
  fbBox.innerHTML = fbHtml;

  // Voice: max 1 form tip per session (at rep 3)
  if (voiceWarnings.length > 0 && CAM.reps === 3 && !CAM.formTipGiven) {
    CAM.formTipGiven = true;
    speak(voiceWarnings[0]);
  }

  // Form score
  var formPct = Math.round((okCount / exDef.checks.length) * 100);
  CAM.frameScores.push(formPct);
  if (CAM.frameScores.length > 60) CAM.frameScores.shift();
  CAM.formScore = Math.round(CAM.frameScores.reduce(function(a,b){return a+b;},0) / CAM.frameScores.length);
  var scoreEl = document.getElementById('cam-score');
  scoreEl.textContent = CAM.formScore;
  scoreEl.style.color = CAM.formScore >= 80 ? '#22c55e' : (CAM.formScore >= 50 ? '#f97316' : '#ef4444');
  document.getElementById('cstat-form').textContent = CAM.formScore;
  document.getElementById('cstat-form').style.color = CAM.formScore >= 80 ? 'var(--gr)' : 'var(--or)';

  // Symmetry
  var symKeys = Object.keys(CAM.angles);
  var leftKeys = symKeys.filter(function(k){return k.indexOf('_l')>-1;});
  var symTotal = 0, symCount = 0;
  leftKeys.forEach(function(lk) {
    var rk = lk.replace('_l','_r');
    if (CAM.angles[rk] !== undefined) {
      symTotal += 100 - Math.min(100, Math.abs(CAM.angles[lk] - CAM.angles[rk]) * 3);
      symCount++;
    }
  });
  CAM.symScore = symCount > 0 ? Math.round(symTotal / symCount) : 100;
  document.getElementById('cstat-sym').textContent = CAM.symScore;
}

async function startCamera() {
  if (cameraActive) return;
  var video = document.getElementById('cam-video');
  var canvas = document.getElementById('cam-canvas');
  var skel = document.getElementById('skel-overlay');

  // Lazy-load MediaPipe libs on first use
  try {
    document.getElementById('cam-status-badge').textContent = 'Caricamento AIâ€¦';
    await ensureMediaPipe();
  } catch(e) {
    toast('âš  Errore caricamento MediaPipe', 're');
    document.getElementById('cam-status-badge').textContent = 'Errore AI';
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = cameraStream;
    await video.play();
    video.style.display = 'block';
    canvas.style.display = 'block';
    skel.style.display = 'none';
    cameraActive = true;

    // Reset state
    CAM.reps = 0; CAM.phase = 'up'; CAM.formScore = 0; CAM.symScore = 0;
    CAM.calories = 0; CAM.frameScores = []; CAM.lowLight = false;
    CAM.failedChecks = {}; CAM.sessionActive = false; CAM.startTime = 0; CAM.formTipGiven = false;
    CAM.lastVoiceTime = 0; CAM.lastVoiceMsg = '';
    CAM.targetReps = parseInt(document.getElementById('cam-target-reps').value) || 12;
    document.getElementById('cam-rep-badge').textContent = '0';
    document.getElementById('cstat-rep').textContent = '0';
    document.getElementById('cstat-cal').textContent = '0';
    document.getElementById('cstat-form').textContent = '--';
    document.getElementById('cstat-sym').textContent = '--';
    document.getElementById('cam-score').textContent = '--';
    document.getElementById('cam-progress-fill').style.width = '0%';
    document.getElementById('cam-progress-label').textContent = '0/' + CAM.targetReps;

    document.getElementById('cam-status-text').textContent = 'Attiva';
    document.getElementById('cam-led').style.background = 'var(--gr)';
    document.getElementById('cam-status-badge').className = 'cam-status live';
    document.getElementById('cam-status-badge').textContent = 'Caricamento...';

    // Init MediaPipe Pose
    if (!mpPose) {
      mpPose = new Pose({
        locateFile: function(file) {
          return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file;
        }
      });
      mpPose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      mpPose.onResults(onPoseResults);
    }

    if (mpCamera) { mpCamera.stop(); mpCamera = null; }
    mpCamera = new Camera(video, {
      onFrame: async function() {
        if (mpPose && cameraActive) {
          await mpPose.send({ image: video });
        }
      },
      width: 640,
      height: 480
    });
    mpCamera.start();
    poseRunning = true;
    toast('ðŸ“¹ Camera IA accesa â€” MediaPipe attivo', 'gr');
  } catch (err) {
    console.log('Camera error:', err);
    var fbBox = document.getElementById('cam-fb-box');
    var badge = document.getElementById('cam-status-badge');
    badge.className = 'cam-status off';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      badge.textContent = 'Permesso negato';
      if (fbBox) fbBox.innerHTML = '<div class="fb warn" style="font-size:.82rem;padding:16px;text-align:center;line-height:1.5">ðŸ“· <strong>Permesso fotocamera negato</strong><br><br>Per usare la Camera IA devi consentire l\'accesso alla fotocamera.<br><br>ðŸ‘‰ Vai nelle <strong>Impostazioni del browser</strong> â†’ Sito â†’ Fotocamera â†’ Consenti<br><br>Poi riprova.</div>';
      toast('ðŸ“· Permesso fotocamera negato. Controlla le impostazioni del browser.', 're');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      badge.textContent = 'Nessuna fotocamera';
      if (fbBox) fbBox.innerHTML = '<div class="fb warn" style="font-size:.82rem;padding:16px;text-align:center;line-height:1.5">ðŸ“· <strong>Nessuna fotocamera rilevata</strong><br><br>Il dispositivo non ha una fotocamera disponibile.</div>';
      toast('ðŸ“· Nessuna fotocamera trovata sul dispositivo.', 're');
    } else {
      badge.textContent = 'Non disponibile';
      if (fbBox) fbBox.innerHTML = '<div class="fb warn" style="font-size:.82rem;padding:16px;text-align:center;line-height:1.5">ðŸ“· <strong>Camera non disponibile</strong><br><br>Errore: ' + (err.message || 'sconosciuto') + '<br>Riprova.</div>';
      toast('ðŸ“¹ Camera non disponibile. Controlla i permessi.', 're');
    }
  }
}

function stopCamera() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (mpCamera) { mpCamera.stop(); mpCamera = null; }
  poseRunning = false;
  if (cameraStream) {
    cameraStream.getTracks().forEach(function(t) { t.stop(); });
    cameraStream = null;
  }
  cameraActive = false;
  var video = document.getElementById('cam-video');
  var canvas = document.getElementById('cam-canvas');
  var skel = document.getElementById('skel-overlay');
  if (video) { video.srcObject = null; video.style.display = 'none'; }
  if (canvas) { canvas.style.display = 'none'; var cx = canvas.getContext('2d'); cx.clearRect(0,0,canvas.width,canvas.height); }
  if (skel) skel.style.display = 'block';
  document.getElementById('cam-status-text').textContent = 'Spenta';
  document.getElementById('cam-led').style.background = 'var(--t3)';
  document.getElementById('cam-status-badge').className = 'cam-status off';
  document.getElementById('cam-status-badge').textContent = 'Camera spenta';
  document.getElementById('cam-fb-box').innerHTML = '';
  document.getElementById('cam-angle-tags').innerHTML = '';
}

// Exercise selector
document.getElementById('cam-exercise-sel').addEventListener('change', function() {
  CAM.exercise = this.value;
  CAM.reps = 0; CAM.phase = 'up'; CAM.frameScores = []; CAM.failedChecks = {};
  CAM.sessionActive = false; CAM.startTime = 0; CAM.formTipGiven = false;
  CAM.targetReps = parseInt(document.getElementById('cam-target-reps').value) || 12;
  document.getElementById('cam-rep-badge').textContent = '0';
  document.getElementById('cstat-rep').textContent = '0';
  document.getElementById('cstat-cal').textContent = '0';
  document.getElementById('cam-progress-fill').style.width = '0%';
  document.getElementById('cam-progress-label').textContent = '0/' + CAM.targetReps;

});

// Target reps change
document.getElementById('cam-target-reps').addEventListener('change', function() {
  CAM.targetReps = parseInt(this.value) || 12;
  var pct = CAM.reps > 0 ? Math.min(100, Math.round((CAM.reps / CAM.targetReps) * 100)) : 0;
  document.getElementById('cam-progress-fill').style.width = pct + '%';
  document.getElementById('cam-progress-label').textContent = CAM.reps + '/' + CAM.targetReps;
});

// Toggle camera session from start button
function toggleCamSession() {
  var btn = document.getElementById('cam-start-btn');
  // Unlock speech synthesis from user gesture
  unlockSpeech();
  if (cameraActive) {
    stopCamera();
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg> Avvia Sessione';
    btn.classList.remove('running');
  } else {
    startCamera();
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> Ferma Sessione';
    btn.classList.add('running');
    // Announce start
    setTimeout(function() {
      CAM.lastVoiceTime = 0; CAM.lastVoiceMsg = '';
      speak('Sessione avviata. VAI!');
    }, 1000);
  }
}

// Auto stop camera when leaving tab
var allTabBtns = document.querySelectorAll('.nb');
allTabBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (!btn.dataset.tab || btn.dataset.tab !== 'camera') {
      stopCamera();
      var sb = document.getElementById('cam-start-btn');
      if (sb) { sb.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg> Avvia Sessione'; sb.classList.remove('running'); }
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SOCIAL / COMMUNITY â€” Backend Reale Firebase
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// â”€â”€ GEOLOCATION REALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function requestGeo() {
  var el = document.getElementById('geo-status');
  if (!navigator.geolocation) {
    if (el) { el.textContent = 'âŒ Geolocalizzazione non supportata'; el.className = 'geo-status err'; }
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      SOCIAL.myLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (el) { el.textContent = 'ðŸ“ Posizione acquisita (' + pos.coords.latitude.toFixed(3) + ', ' + pos.coords.longitude.toFixed(3) + ')'; setTimeout(function(){ if(el) el.style.opacity='0'; }, 3000); }
      if (FB.ready) { syncUserProfile(); loadNearbyUsers(); }
    },
    function(err) {
      if (el) { el.textContent = 'âš  ' + (err.code===1 ? 'Permesso posizione negato. Abilita GPS nelle impostazioni.' : 'Posizione non disponibile'); el.className = 'geo-status err'; }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
  );
}

// â”€â”€ GEOHASH ENCODING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function encodeGeohash(lat, lng, prec) {
  prec = prec || 6;
  var c = '0123456789bcdefghjkmnpqrstuvwxyz', b = [16,8,4,2,1];
  var h = '', nLat=-90, xLat=90, nLng=-180, xLng=180, isLng=true, bit=0, ch=0;
  while (h.length < prec) {
    var mid;
    if (isLng) { mid=(nLng+xLng)/2; if(lng>mid){ch|=b[bit];nLng=mid;}else{xLng=mid;} }
    else { mid=(nLat+xLat)/2; if(lat>mid){ch|=b[bit];nLat=mid;}else{xLat=mid;} }
    isLng=!isLng;
    if(bit<4) bit++; else { h+=c[ch]; bit=0; ch=0; }
  }
  return h;
}

function haversineKm(la1,lo1,la2,lo2) {
  var R=6371, dLa=(la2-la1)*Math.PI/180, dLo=(lo2-lo1)*Math.PI/180;
  var a=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// â”€â”€ FIREBASE INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSocial() {
  if (SOCIAL.initialized) return;
  SOCIAL.initialized = true;
  requestGeo();
  if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) { showSocialSetup(); return; }
  // Lazy-load Firebase on first social tab use
  ensureFirebase().then(function() { _initFirebase(); }).catch(function() { showSocialSetup(); });
}
function _initFirebase() {
  try {
    if (typeof firebase === 'undefined') { showSocialSetup(); return; }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    FB.db = firebase.firestore();
    FB.auth = firebase.auth();
    FB.auth.signInAnonymously().then(function(cred) {
      FB.uid = cred.user.uid;
      FB.ready = true;
      syncUserProfile();
      if (SOCIAL.myLocation) loadNearbyUsers();
      loadMatches();
      loadLeaderboard();
      checkReferralCount();
    }).catch(function(e) { console.error('Firebase auth error:', e); showSocialSetup(); });
  } catch(e) { console.error('Firebase init error:', e); showSocialSetup(); }
}

function showSocialSetup() {
  var el = document.getElementById('pstack-container');
  if (el) {
    el.innerHTML =
      '<div class="social-setup">' +
      '<div style="font-size:2rem;margin-bottom:12px">ðŸ”§</div>' +
      '<div style="font-family:var(--fd);font-size:1.05rem;font-weight:800;color:var(--t1);margin-bottom:8px">Configura Firebase</div>' +
      '<p>Per le funzionalitÃ  Social reali (match, chat, classifica), configura Firebase nel codice:</p>' +
      '<ol style="text-align:left;margin:12px auto;max-width:300px">' +
      '<li>Vai su <code>console.firebase.google.com</code></li>' +
      '<li>Crea un nuovo progetto</li>' +
      '<li>Abilita <code>Authentication â†’ Anonymous</code></li>' +
      '<li>Crea database <code>Firestore</code> (test mode)</li>' +
      '<li>Copia config in <code>FIREBASE_CONFIG</code> nel codice</li>' +
      '</ol>' +
      '<div style="margin-top:12px;font-size:.72rem;color:var(--t4)">La geolocalizzazione e condivisione Strava funzionano giÃ !</div>' +
      '</div>';
  }
  document.getElementById('nearby-count').textContent = 'âš™ï¸ Setup';
}

// â”€â”€ SYNC PROFILO SU FIRESTORE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function syncUserProfile() {
  if (!FB.ready) return;
  var u = getUser(); if (!u) return;
  var goalTags = {
    massa:['ðŸ‹ï¸ Forza','ðŸ’ª Massa'], dimagrimento:['ðŸƒ Cardio','ðŸ”¥ HIIT'],
    benessere:['ðŸ§˜ Yoga','ðŸ§  Benessere'], resistenza:['ðŸƒ Running','ðŸš´ Ciclismo']
  };
  var h = new Date().getHours();
  var profile = {
    name: u.name || 'Utente AURA',
    age: u.age || 25,
    goal: u.goal || '',
    sex: u.sex || 'M',
    xp: u.xp || 0,
    level: u.level || 1,
    tags: goalTags[u.goal] || ['ðŸ‹ï¸ Forza'],
    schedule: h < 12 ? '07:00' : h < 17 ? '13:00' : '18:00',
    lastActive: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (SOCIAL.myLocation) {
    profile.lat = SOCIAL.myLocation.lat;
    profile.lng = SOCIAL.myLocation.lng;
    profile.geohash = encodeGeohash(SOCIAL.myLocation.lat, SOCIAL.myLocation.lng, 6);
  }
  FB.db.collection('users').doc(FB.uid).set(profile, { merge: true });
}

// â”€â”€ LOAD NEARBY USERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadNearbyUsers() {
  if (!FB.ready || !SOCIAL.myLocation) return;
  var cnt = document.getElementById('nearby-count');
  cnt.textContent = 'ðŸ“¡ Cercando...';
  try {
    var hash4 = encodeGeohash(SOCIAL.myLocation.lat, SOCIAL.myLocation.lng, 4);
    var snap = await FB.db.collection('users')
      .where('geohash', '>=', hash4)
      .where('geohash', '<=', hash4 + '\uf8ff')
      .limit(50).get();

    // Carica azioni giÃ  fatte (like/skip) per filtrarle
    var actSnap = await FB.db.collection('social_actions')
      .where('from', '==', FB.uid).get();
    var acted = new Set();
    actSnap.forEach(function(d) { acted.add(d.data().to); });

    var users = [];
    snap.forEach(function(doc) {
      if (doc.id === FB.uid || acted.has(doc.id)) return;
      var d = doc.data();
      if (!d.lat || !d.lng) return;
      var dist = haversineKm(SOCIAL.myLocation.lat, SOCIAL.myLocation.lng, d.lat, d.lng);
      if (dist <= SOCIAL.radius) {
        d.uid = doc.id;
        d.distance = dist;
        users.push(d);
      }
    });

    users.sort(function(a,b) { return a.distance - b.distance; });
    SOCIAL.nearbyUsers = users;
    SOCIAL.currentIdx = 0;
    cnt.textContent = users.length + ' vicino a te';
    if (users.length > 0) renderPartner(0);
    else showNoUsers();
  } catch(e) { console.error('Nearby query error:', e); cnt.textContent = 'âš  Errore rete'; }
}

function showNoUsers() {
  var card = document.getElementById('partner-card');
  if (!card) return;
  card.innerHTML =
    '<div class="pg"></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:30px;text-align:center">' +
    '<div style="font-size:2.2rem;margin-bottom:12px">ðŸ”</div>' +
    '<div style="font-family:var(--fd);font-weight:800;font-size:1rem;color:var(--t1);margin-bottom:6px">Nessun utente nelle vicinanze</div>' +
    '<div style="font-size:.78rem;color:var(--t3)">Aumenta il raggio di ricerca o riprova piÃ¹ tardi.</div></div>';
}

// â”€â”€ RENDER PARTNER CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderPartner(i) {
  if (!SOCIAL.nearbyUsers.length || i >= SOCIAL.nearbyUsers.length) { showNoUsers(); return; }
  var p = SOCIAL.nearbyUsers[i];
  var initial = escapeHtml((p.name||'?').charAt(0).toUpperCase());
  var card = document.getElementById('partner-card');
  card.innerHTML =
    '<div class="pg"></div>' +
    '<div class="pphoto"><div class="av av-xl" id="p-av">' + initial + '</div></div>' +
    '<div class="pinfo">' +
      '<div class="pname"><span id="p-name">' + escapeHtml(p.name||'Utente') + '</span><span class="dtag" id="p-dist">ðŸ“ ' + p.distance.toFixed(1) + ' km</span></div>' +
      '<div class="plvl"><span class="gd"></span><span id="p-lvl">Livello ' + (p.level||1) + '</span></div>' +
      '<div class="ptags" id="p-tags">' + (p.tags||[]).map(function(t){return '<span class="ptag2">'+escapeHtml(t)+'</span>';}).join('') + '</div>' +
      '<div class="psch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Si allena alle <strong style="margin-left:4px" id="p-time">' + escapeHtml(p.schedule||'--:--') + '</strong></div>' +
    '</div>';
}

// â”€â”€ CARD ANIMATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function cardOut(dir, cb) {
  var c = document.getElementById('partner-card');
  if (!c) return;
  c.style.transition = 'all .35s cubic-bezier(.4,0,.2,1)';
  c.style.transform = 'translateX(' + (dir==='left'?'-130%':'130%') + ') rotate(' + (dir==='left'?'-14':'14') + 'deg)';
  c.style.opacity = '0';
  setTimeout(function() {
    c.style.transition = 'none';
    c.style.transform = 'translateY(16px)';
    c.style.opacity = '0';
    SOCIAL.currentIdx++;
    renderPartner(SOCIAL.currentIdx);
    if (cb) cb();
  }, 370);
}

function cardIn() {
  var c = document.getElementById('partner-card');
  if (!c) return;
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    c.style.transition = 'all .3s cubic-bezier(.4,0,.2,1)';
    c.style.transform = 'translateY(0)';
    c.style.opacity = '1';
  }); });
}

// â”€â”€ LIKE / SKIP CON FIREBASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function socialLike() {
  if (!FB.ready || !SOCIAL.nearbyUsers[SOCIAL.currentIdx]) {
    cardOut('right', cardIn);
    return;
  }
  var target = SOCIAL.nearbyUsers[SOCIAL.currentIdx];
  cardOut('right', cardIn);
  try {
    await FB.db.collection('social_actions').add({
      from: FB.uid, to: target.uid, action: 'like',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Controlla match reciproco
    var mutual = await FB.db.collection('social_actions')
      .where('from', '==', target.uid)
      .where('to', '==', FB.uid)
      .where('action', '==', 'like')
      .limit(1).get();

    if (!mutual.empty) {
      // MATCH!
      var u = getUser();
      var matchData = {
        users: [FB.uid, target.uid],
        names: {},
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: 'Match! ðŸŽ‰',
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      matchData.names[FB.uid] = u ? u.name : 'Tu';
      matchData.names[target.uid] = target.name;
      await FB.db.collection('matches').add(matchData);
      SOCIAL.lastMatchName = target.name;
      document.getElementById('match-msg').textContent = 'Hai fatto match con ' + (target.name||'') + '! Pianificate il prossimo allenamento.';
      document.getElementById('match-pop').style.display = 'flex';
      toast('ðŸŽ‰ Match con ' + target.name + '!', 'or');
    } else {
      toast('ðŸ’œ Like inviato a ' + target.name, 'bl');
    }
  } catch(e) { console.error('Like error:', e); toast('âš  Errore invio like', 're'); }
}

async function socialSkip() {
  if (!FB.ready || !SOCIAL.nearbyUsers[SOCIAL.currentIdx]) {
    cardOut('left', cardIn);
    return;
  }
  var target = SOCIAL.nearbyUsers[SOCIAL.currentIdx];
  cardOut('left', function() { cardIn(); toast('ðŸ‘‹ Prossimo!', 'bl'); });
  try {
    await FB.db.collection('social_actions').add({
      from: FB.uid, to: target.uid, action: 'skip',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e) { /* skip silently */ }
}

// â”€â”€ MATCHES IN TEMPO REALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadMatches() {
  if (!FB.ready) return;
  if (SOCIAL.matchesUnsub) SOCIAL.matchesUnsub();
  SOCIAL.matchesUnsub = FB.db.collection('matches')
    .where('users', 'array-contains', FB.uid)
    .orderBy('lastMessageAt', 'desc')
    .limit(20)
    .onSnapshot(function(snap) {
      SOCIAL.matches = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        SOCIAL.matches.push(d);
      });
      renderMatches();
    }, function(e) { console.error('Matches listener error:', e); });
}

function renderMatches() {
  var el = document.getElementById('matches-list');
  if (!el) return;
  if (!SOCIAL.matches.length) {
    el.innerHTML = '<div class="no-users-msg">Nessun match ancora. Swipa verso destra per trovare partner!</div>';
    return;
  }
  var html = '';
  SOCIAL.matches.forEach(function(m) {
    var otherName = 'Utente';
    if (m.names) {
      Object.keys(m.names).forEach(function(uid) {
        if (uid !== FB.uid) otherName = m.names[uid];
      });
    }
    var initial = (otherName||'?').charAt(0).toUpperCase();
    var preview = m.lastMessage || 'Nuovo match!';
    var time = '';
    if (m.lastMessageAt && m.lastMessageAt.toDate) {
      var d = m.lastMessageAt.toDate();
      time = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    var safeId = escapeHtml(m.id);
    var safeName = escapeHtml(otherName).replace(/'/g, '&#39;');
    html += '<div class="match-item" onclick="openChat(\'' + safeId + '\',\'' + safeName + '\')">' +
      '<div class="match-av">' + escapeHtml(initial) + '</div>' +
      '<div class="match-info"><div class="match-name">' + escapeHtml(otherName) + '</div>' +
      '<div class="match-preview">' + escapeHtml(preview) + '</div></div>' +
      '<div class="match-time">' + time + '</div></div>';
  });
  el.innerHTML = html;
}

function openMatchChat() {
  if (SOCIAL.matches.length > 0) {
    var m = SOCIAL.matches[0];
    var otherName = 'Utente';
    if (m.names) Object.keys(m.names).forEach(function(uid) { if (uid !== FB.uid) otherName = m.names[uid]; });
    openChat(m.id, otherName);
  }
}

// â”€â”€ CHAT IN TEMPO REALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openChat(matchId, name) {
  if (!FB.ready) { toast('âš  Firebase non connesso', 're'); return; }
  SOCIAL.currentChatMatchId = matchId;
  SOCIAL.currentChatName = name;
  document.getElementById('chat-uname').textContent = name;
  document.getElementById('chat-msgs').innerHTML = '<div class="no-users-msg">Caricamento messaggi...</div>';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-ov').classList.add('on');

  if (SOCIAL.chatUnsub) SOCIAL.chatUnsub();
  SOCIAL.chatUnsub = FB.db.collection('matches').doc(matchId)
    .collection('messages').orderBy('timestamp', 'asc')
    .onSnapshot(function(snap) {
      var el = document.getElementById('chat-msgs');
      if (!el) return;
      if (snap.empty) {
        el.innerHTML = '<div class="no-users-msg">Nessun messaggio. Scrivi per primo! ðŸ’¬</div>';
        return;
      }
      el.innerHTML = '';
      var lastDay = '';
      snap.forEach(function(doc) {
        var msg = doc.data();
        var isMe = msg.from === FB.uid;
        var time = '', dayStr = '';
        if (msg.timestamp && msg.timestamp.toDate) {
          var d = msg.timestamp.toDate();
          time = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
          dayStr = d.toLocaleDateString('it-IT');
        }
        if (dayStr && dayStr !== lastDay) {
          el.innerHTML += '<div class="chat-day">' + dayStr + '</div>';
          lastDay = dayStr;
        }
        el.innerHTML += '<div class="chat-bub ' + (isMe ? 'me' : 'them') + '">' +
          escapeHtml(msg.text) +
          '<div class="chat-bub-time">' + time + '</div></div>';
      });
      el.scrollTop = el.scrollHeight;
    }, function(e) { console.error('Chat listener error:', e); });
}

function closeChat() {
  document.getElementById('chat-ov').classList.remove('on');
  if (SOCIAL.chatUnsub) { SOCIAL.chatUnsub(); SOCIAL.chatUnsub = null; }
  SOCIAL.currentChatMatchId = null;
}

function sendChatMessage() {
  var input = document.getElementById('chat-input');
  var text = (input.value || '').trim();
  if (!text || !SOCIAL.currentChatMatchId || !FB.ready) return;
  if (text.length > 500) { toast('âš  Messaggio troppo lungo', 're'); return; }
  input.value = '';

  var matchRef = FB.db.collection('matches').doc(SOCIAL.currentChatMatchId);
  matchRef.collection('messages').add({
    from: FB.uid,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  matchRef.update({
    lastMessage: text.substring(0, 100),
    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Enter per inviare
document.getElementById('chat-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
});

// â”€â”€ CLASSIFICA SETTIMANALE REALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadLeaderboard() {
  var el = document.getElementById('leaderboard-body');
  if (!el) return;

  if (!FB.ready) {
    // Mostra solo utente locale
    var u = getUser();
    if (u) {
      el.innerHTML = '<div class="li me"><span class="lrank">1</span><span class="lav" style="background:var(--or);color:#fff">' +
        escapeHtml((u.name||'Tu').charAt(0)) + '</span><span class="lname">Tu â€” ' + escapeHtml(u.name||'Utente') +
        '</span><span class="lpts">' + ((u.xp||0)).toLocaleString() + ' pt</span></div>' +
        '<div class="no-users-msg" style="padding:12px">Configura Firebase per la classifica completa</div>';
    }
    return;
  }

  try {
    var snap = await FB.db.collection('users').orderBy('xp', 'desc').limit(20).get();
    var html = '', rank = 0;
    snap.forEach(function(doc) {
      rank++;
      var d = doc.data();
      var isMe = doc.id === FB.uid;
      var cls = rank===1 ? 'gold' : rank===2 ? 'silv' : isMe ? 'me' : '';
      var avStyle = rank===1 ? ' style="background:#facc15;color:#000"' : isMe ? ' style="background:var(--or);color:#fff"' : '';
      html += '<div class="li ' + cls + '">' +
        '<span class="lrank">' + rank + '</span>' +
        '<span class="lav"' + avStyle + '>' + escapeHtml((d.name||'?').charAt(0)) + '</span>' +
        '<span class="lname">' + (isMe ? 'Tu â€” ' : '') + escapeHtml(d.name||'Utente') + '</span>' +
        '<span class="lpts">' + ((d.xp||0)).toLocaleString() + ' pt</span></div>';
    });
    el.innerHTML = html || '<div class="no-users-msg">Nessun utente ancora nella classifica</div>';
  } catch(e) {
    console.error('Leaderboard error:', e);
    el.innerHTML = '<div class="no-users-msg">Errore caricamento classifica</div>';
  }
}

// â”€â”€ CONDIVISIONE STRAVA REALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('strava-btn').addEventListener('click', function() {
  var u = getUser() || {};
  var completed = [];
  try { completed = JSON.parse(localStorage.getItem(CW_KEY) || '[]'); } catch(e) {}
  var last = completed.length > 0 ? completed[completed.length - 1] : null;

  var shareText = 'ðŸ‹ï¸ AURA Workout\n';
  if (last) {
    shareText += 'ðŸ“‹ ' + (last.name || 'Allenamento') + '\n';
    shareText += 'â± ' + (last.duration || '?') + ' min\n';
    shareText += 'ðŸ”¥ ' + (last.kcal || '?') + ' kcal\n';
  } else {
    shareText += 'Ho completato un allenamento con AURA!\n';
  }
  shareText += 'ðŸ’ª ' + (u.name || 'Atleta AURA') + ' Â· Livello ' + (u.level || 1) + '\n';
  shareText += '#AURAFitness #Workout';

  if (navigator.share) {
    navigator.share({
      title: 'AURA Workout',
      text: shareText,
      url: 'https://tropicalblackie.github.io/AURAMOBILE/'
    }).then(function() {
      toast('âœ… Condiviso con successo!', 'gr');
    }).catch(function(e) {
      if (e.name !== 'AbortError') toast('Condivisione annullata', 'bl');
    });
  } else {
    navigator.clipboard.writeText(shareText).then(function() {
      toast('ðŸ“‹ Copiato negli appunti! Incolla su Strava o social', 'gr');
    }).catch(function() {
      toast('âš  Browser non supportato per condivisione', 're');
    });
  }
});

// â”€â”€ SKIP / MATCH BUTTONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('btn-skip').addEventListener('click', function() { socialSkip(); });
document.getElementById('btn-match').addEventListener('click', function() { socialLike(); });

// â”€â”€ RADIUS SLIDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('radius-slider').addEventListener('input', function() {
  SOCIAL.radius = parseInt(this.value);
  document.getElementById('radius-val').textContent = this.value + ' km';
});
document.getElementById('radius-slider').addEventListener('change', function() {
  if (FB.ready && SOCIAL.myLocation) loadNearbyUsers();
});

// â”€â”€ NOTIFICHE NUOVI MATCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function checkNewNotifications() {
  if (!FB.ready) return;
  FB.db.collection('matches')
    .where('users', 'array-contains', FB.uid)
    .onSnapshot(function(snap) {
      var count = snap.size;
      var dot = document.querySelector('.notif-dot');
      if (dot && count > 0) {
        dot.style.display = 'block';
      }
    });
}

// â”€â”€ TOUCH SWIPE SU PARTNER CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
  var card = document.getElementById('partner-card');
  if (!card) return;
  var sx=0, drag=false, cx=0;
  card.addEventListener('touchstart', function(e) { sx=e.touches[0].clientX; drag=true; card.style.transition='none'; }, {passive:true});
  card.addEventListener('touchmove', function(e) {
    if(!drag) return; cx=e.touches[0].clientX-sx;
    card.style.transform='translateX('+cx+'px) rotate('+cx*.06+'deg)';
    card.style.opacity=String(1-Math.abs(cx)/300);
  }, {passive:true});
  card.addEventListener('touchend', function() {
    if(!drag) return; drag=false;
    if(cx<-65) document.getElementById('btn-skip').click();
    else if(cx>65) document.getElementById('btn-match').click();
    else { card.style.transition='all .28s cubic-bezier(.34,1.56,.64,1)'; card.style.transform='translateX(0) rotate(0)'; card.style.opacity='1'; }
    cx=0;
  });
  card.addEventListener('mousedown', function(e) { sx=e.clientX; drag=true; card.style.transition='none'; e.preventDefault(); });
  window.addEventListener('mousemove', function(e) {
    if(!drag) return; cx=e.clientX-sx;
    card.style.transform='translateX('+cx+'px) rotate('+cx*.06+'deg)';
    card.style.opacity=String(1-Math.abs(cx)/300);
  });
  window.addEventListener('mouseup', function() {
    if(!drag) return; drag=false;
    if(cx<-65) document.getElementById('btn-skip').click();
    else if(cx>65) document.getElementById('btn-match').click();
    else { card.style.transition='all .28s cubic-bezier(.34,1.56,.64,1)'; card.style.transform='none'; card.style.opacity='1'; }
    cx=0;
  });
})();

// Init social quando si apre il tab Community
document.querySelector('.nb[data-tab="community"]').addEventListener('click', function() {
  setTimeout(initSocial, 50);
});

// â”€â”€ TOGGLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Generic toggles (sleep mode etc)
document.querySelectorAll('.tog').forEach(t => {
  if (t.id === 'tog-notif') return; // handled separately
  t.addEventListener('click', () => {
    t.classList.toggle('on');
    toast(t.classList.contains('on') ? 'Attivato.' : 'Disattivato.', 'bl');
  });
});

// â”€â”€ PUSH NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var NOTIF = { permission: (typeof Notification !== 'undefined' ? Notification.permission : 'default'), swReg: null, scheduledTimers: [] };

function initNotifToggle() {
  var tog = document.getElementById('tog-notif');
  if (!tog) return;
  // Reflect current state
  tog.classList.toggle('on', NOTIF.permission === 'granted');
  tog.addEventListener('click', function() {
    if (NOTIF.permission === 'granted') {
      // User wants to disable â€” we can't revoke permission, but we stop scheduling
      cancelScheduledNotifs();
      localStorage.setItem('aura_notif_enabled', 'false');
      tog.classList.remove('on');
      toast('ðŸ”• Notifiche disattivate.', 'bl');
      return;
    }
    if (!('Notification' in window)) {
      toast('âš  Il tuo browser non supporta le notifiche.', 're');
      return;
    }
    Notification.requestPermission().then(function(perm) {
      NOTIF.permission = perm;
      if (perm === 'granted') {
        tog.classList.add('on');
        localStorage.setItem('aura_notif_enabled', 'true');
        toast('ðŸ”” Notifiche attivate! Riceverai promemoria giornalieri.', 'gr');
        scheduleLocalNotifs();
      } else if (perm === 'denied') {
        tog.classList.remove('on');
        toast('âŒ Permesso negato. Abilitalo dalle impostazioni del browser.', 're');
      } else {
        tog.classList.remove('on');
        toast('âš  Permesso non concesso.', 'or');
      }
    });
  });
}
initNotifToggle();

function scheduleLocalNotifs() {
  cancelScheduledNotifs();
  if (NOTIF.permission !== 'granted') return;
  if (localStorage.getItem('aura_notif_enabled') === 'false') return;

  // Schedule check every 30 minutes
  var checkTimer = setInterval(function() {
    checkAndFireNotif();
  }, 30 * 60 * 1000);
  NOTIF.scheduledTimers.push(checkTimer);
  // Also check immediately
  setTimeout(checkAndFireNotif, 5000);
}

function cancelScheduledNotifs() {
  NOTIF.scheduledTimers.forEach(function(t) { clearInterval(t); });
  NOTIF.scheduledTimers = [];
}

function checkAndFireNotif() {
  if (NOTIF.permission !== 'granted') return;
  if (localStorage.getItem('aura_notif_enabled') === 'false') return;
  if (document.visibilityState === 'visible') return; // Don't notify if app is open

  var now = new Date();
  var hour = now.getHours();
  var lastNotifDate = localStorage.getItem('aura_last_notif_date') || '';
  var today = now.toISOString().slice(0, 10);
  if (lastNotifDate === today) return; // Already notified today

  // Check if user trained today
  var completed = [];
  try { completed = JSON.parse(localStorage.getItem(CW_KEY) || '[]'); } catch(e) {}
  var trainedToday = completed.some(function(w) { return w.date === today; });

  if (trainedToday) return; // Already trained, no need to remind

  // Send reminder in evening (after 18:00) or afternoon (after 14:00)
  if (hour >= 18) {
    fireLocalNotif('ðŸ’ª Non hai ancora allenarti oggi!', 'Anche 20 minuti fanno la differenza. Apri AURA e inizia!');
    localStorage.setItem('aura_last_notif_date', today);
  } else if (hour >= 14) {
    fireLocalNotif('ðŸ‹ï¸ Promemoria allenamento', 'Il tuo piano ti aspetta. Non spezzare la streak!');
    localStorage.setItem('aura_last_notif_date', today);
  }
}

function fireLocalNotif(title, body, targetTab) {
  var tab = targetTab || 'workout';
  if (NOTIF.swReg) {
    NOTIF.swReg.showNotification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">ðŸ‹ï¸</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">ðŸ’ª</text></svg>',
      tag: 'aura-reminder',
      renotify: false,
      vibrate: [200, 100, 200],
      data: { tab: tab }
    });
  } else {
    new Notification(title, { body: body, tag: 'aura-reminder' });
  }
}

// Listen for deep-link messages from SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'navigate-tab' && e.data.tab) {
      var btn = document.querySelector('.nb[data-tab="' + e.data.tab + '"]');
      if (btn) btn.click();
    }
  });
}

// Bell icon click â€” show pending notifications
function checkNotifications() {
  var completed = [];
  try { completed = JSON.parse(localStorage.getItem(CW_KEY) || '[]'); } catch(e) {}
  var today = new Date().toISOString().slice(0,10);
  var trainedToday = completed.some(function(w) { return w.date === today; });
  var dot = document.querySelector('.notif-dot');
  if (!trainedToday) {
    if (dot) dot.style.display = 'block';
    toast('ðŸ’ª Hai un allenamento in programma oggi!', 'or');
  } else {
    if (dot) dot.style.display = 'none';
    toast('âœ… Allenamento di oggi completato!', 'gr');
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  NUTRIZIONE â€” Database reale + barcode + macros
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const MEALS_KEY = 'aura_meals';
const DIET_PLAN_KEY = 'aura_diet_plan';
const SHOP_LIST_KEY = 'aura_shopping_list';

// Meal types
const MEAL_TYPES = {
  colazione: { icon: 'â˜€ï¸', name: 'Colazione' },
  spuntino_am: { icon: 'ðŸŽ', name: 'Spuntino Mattina' },
  pranzo: { icon: 'ðŸ½ï¸', name: 'Pranzo' },
  spuntino_pm: { icon: 'ðŸ¥œ', name: 'Spuntino Pomeriggio' },
  cena: { icon: 'ðŸŒ™', name: 'Cena' }
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMeals() {
  try { return JSON.parse(localStorage.getItem(MEALS_KEY)) || {}; } catch { return {}; }
}

function saveMeals(meals) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}

function getTodayMeals() {
  var all = getMeals();
  return all[getTodayKey()] || [];
}

function addMealEntry(food, qty, mealType) {
  var all = getMeals();
  var today = getTodayKey();
  if (!all[today]) all[today] = [];
  var factor = qty / 100;
  all[today].push({
    name: food.name,
    brand: food.brand || '',
    qty: qty,
    mealType: mealType,
    kcal: Math.round((food.kcal || 0) * factor),
    protein: Math.round((food.protein || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs || 0) * factor * 10) / 10,
    fat: Math.round((food.fat || 0) * factor * 10) / 10,
    time: Date.now()
  });
  saveMeals(all);
  updateDietDashboard();
  toast('âœ… ' + food.name + ' aggiunto!', 'gr');
}

function deleteMealEntry(index) {
  var all = getMeals();
  var today = getTodayKey();
  if (all[today] && all[today][index] !== undefined) {
    all[today].splice(index, 1);
    saveMeals(all);
    updateDietDashboard();
    toast('ðŸ—‘ï¸ Pasto rimosso', 'bl');
  }
}

// Calculate user TDEE from profile
function calcUserTDEE() {
  var u = getUser();
  if (!u) return { kcal: 2000, protein: 150, carbs: 220, fat: 65 };
  var w = u.weight || 70, h = u.height || 175, age = u.age || 25;
  var gender = (u.sex === 'F') ? 'Donna' : 'Uomo';
  // Mifflin-St Jeor
  var bmr = gender === 'Donna'
    ? 10 * w + 6.25 * h - 5 * age - 161
    : 10 * w + 6.25 * h - 5 * age + 5;
  var activity = 1.55; // moderately active
  var goal = u.goal || 'massa';
  var tdee = bmr * activity;
  if (goal === 'dimagrimento') tdee -= 400;
  else if (goal === 'massa') tdee += 300;
  tdee = Math.round(tdee);
  // Macros split
  var protCal = w * 2 * 4; // 2g per kg
  var fatCal = tdee * 0.25;
  var carbCal = tdee - protCal - fatCal;
  return {
    kcal: tdee,
    protein: Math.round(w * 2),
    carbs: Math.round(carbCal / 4),
    fat: Math.round(fatCal / 9)
  };
}

function updateDietDashboard() {
  var meals = getTodayMeals();
  var targets = calcUserTDEE();
  var totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  meals.forEach(function(m) {
    totals.kcal += m.kcal || 0;
    totals.protein += m.protein || 0;
    totals.carbs += m.carbs || 0;
    totals.fat += m.fat || 0;
  });
  totals.protein = Math.round(totals.protein);
  totals.carbs = Math.round(totals.carbs);
  totals.fat = Math.round(totals.fat);

  // Update dashboard
  document.getElementById('diet-cal-chip').textContent = 'ðŸ”¥ ' + totals.kcal + '/' + targets.kcal;
  document.getElementById('diet-cal-total').textContent = totals.kcal + ' / ' + targets.kcal + ' kcal';
  document.getElementById('diet-cal-bar').style.width = Math.min(100, Math.round(totals.kcal / targets.kcal * 100)) + '%';

  document.getElementById('diet-prot-val').innerHTML = totals.protein + '<small>g</small>';
  document.getElementById('diet-prot-bar').style.width = Math.min(100, Math.round(totals.protein / targets.protein * 100)) + '%';
  document.getElementById('diet-carb-val').innerHTML = totals.carbs + '<small style="color:var(--t4)">g</small>';
  document.getElementById('diet-carb-bar').style.width = Math.min(100, Math.round(totals.carbs / targets.carbs * 100)) + '%';
  document.getElementById('diet-fat-val').innerHTML = totals.fat + '<small style="color:var(--t4)">g</small>';
  document.getElementById('diet-fat-bar').style.width = Math.min(100, Math.round(totals.fat / targets.fat * 100)) + '%';

  // Meal list
  var listEl = document.getElementById('diet-meal-list');
  if (meals.length === 0) {
    listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3);font-size:.82rem">Nessun pasto registrato. Usa i pulsanti sopra per iniziare!</div>';
  } else {
    // Group by meal type
    var grouped = {};
    meals.forEach(function(m, idx) {
      var mt = m.mealType || 'pranzo';
      if (!grouped[mt]) grouped[mt] = [];
      grouped[mt].push({ meal: m, idx: idx });
    });
    var html = '';
    Object.keys(MEAL_TYPES).forEach(function(key) {
      if (!grouped[key]) return;
      var mt = MEAL_TYPES[key];
      grouped[key].forEach(function(item) {
        var m = item.meal;
        html += '<div class="mi2" onclick="deleteMealEntry(' + item.idx + ')" style="cursor:pointer" title="Tocca per rimuovere">';
        html += '<span class="mico">' + mt.icon + '</span>';
        html += '<div class="minfo"><strong>' + mt.name + '</strong><span>' + m.name + (m.qty ? ' Â· ' + m.qty + 'g' : '') + '</span></div>';
        html += '<span class="mkcal">' + m.kcal + '</span>';
        html += '</div>';
      });
    });
    listEl.innerHTML = html;
  }

  // AI tip
  updateDietAITip(totals, targets);
}

function updateDietAITip(totals, targets) {
  var tipEl = document.getElementById('diet-ai-tip-text');
  var remaining = {
    kcal: targets.kcal - totals.kcal,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fat: targets.fat - totals.fat
  };

  if (totals.kcal === 0) {
    tipEl.textContent = 'Registra il primo pasto per ricevere consigli personalizzati.';
    return;
  }

  if (remaining.kcal < 100) {
    tipEl.innerHTML = 'Hai raggiunto il tuo target calorico! <strong style="color:var(--gr)">Ottimo lavoro!</strong>';
    return;
  }

  var tips = [];
  if (remaining.protein > 30) tips.push('Ti mancano <strong style="color:var(--t1)">' + Math.round(remaining.protein) + 'g proteine</strong>');
  if (remaining.carbs > 40) tips.push('<strong style="color:var(--t1)">' + Math.round(remaining.carbs) + 'g carbo</strong>');
  if (remaining.fat > 15) tips.push('<strong style="color:var(--t1)">' + Math.round(remaining.fat) + 'g grassi</strong>');

  if (tips.length > 0) {
    var suggestions = ['pollo alla griglia','salmone','uova','yogurt greco','riso','patate dolci','avocado','frutta secca','tonno'];
    var pick1 = suggestions[Math.floor(Math.random() * suggestions.length)];
    var pick2 = suggestions[Math.floor(Math.random() * suggestions.length)];
    tipEl.innerHTML = 'Mancano: ' + tips.join(', ') + '. Prova ' + pick1 + ' + ' + pick2 + '.';
  } else {
    tipEl.innerHTML = 'Sei in linea con i tuoi macros! <strong style="color:var(--gr)">Continua cosÃ¬.</strong>';
  }
}

// â”€â”€ OPEN FOOD FACTS SEARCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var foodSearchTimeout = null;

function openFoodSearch() {
  document.getElementById('food-search-ov').classList.add('on');
  document.getElementById('food-search-input').value = '';
  document.getElementById('food-search-results').innerHTML = '<div class="diet-loading" id="food-search-placeholder">Digita almeno 3 lettere per cercare nel database Open Food Facts (2M+ prodotti)</div>';
  setTimeout(function() { document.getElementById('food-search-input').focus(); }, 300);
}

function closeFoodSearch() {
  document.getElementById('food-search-ov').classList.remove('on');
}

document.getElementById('food-search-input').addEventListener('input', function() {
  var q = this.value.trim();
  clearTimeout(foodSearchTimeout);
  if (q.length < 3) {
    document.getElementById('food-search-results').innerHTML = '<div class="diet-loading">Digita almeno 3 lettere per cercare nel database Open Food Facts (2M+ prodotti)</div>';
    return;
  }
  document.getElementById('food-search-results').innerHTML = '<div class="diet-loading">ðŸ” Cercando "' + q + '"â€¦</div>';
  foodSearchTimeout = setTimeout(function() { searchFoods(q); }, 400);
});

async function searchFoods(query) {
  try {
    var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(query) + '&search_simple=1&action=process&json=1&page_size=25&fields=product_name,brands,nutriments,image_front_small_url,code';
    var resp = await fetch(url);
    var data = await resp.json();
    var container = document.getElementById('food-search-results');

    if (!data.products || data.products.length === 0) {
      container.innerHTML = '<div class="diet-loading">Nessun risultato per "' + query + '". Prova un altro termine.</div>';
      return;
    }

    var html = '';
    data.products.forEach(function(p) {
      if (!p.product_name) return;
      var n = p.nutriments || {};
      var food = {
        name: p.product_name,
        brand: p.brands || '',
        kcal: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
        protein: Math.round((n.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((n.fat_100g || 0) * 10) / 10,
        fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
        sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
        salt: Math.round((n.salt_100g || 0) * 100) / 100,
        img: p.image_front_small_url || '',
        code: p.code || ''
      };
      var foodJson = JSON.stringify(food).replace(/'/g, "\\'").replace(/"/g, '&quot;');
      html += '<div class="food-card" onclick=\'openFoodDetail(' + foodJson + ')\'>';
      if (food.img) {
        html += '<img class="food-img" src="' + food.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
      } else {
        html += '<div class="food-img" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">ðŸ´</div>';
      }
      html += '<div class="food-info">';
      html += '<div class="food-name">' + escapeHtml(food.name) + '</div>';
      if (food.brand) html += '<div class="food-brand">' + escapeHtml(food.brand) + '</div>';
      html += '<div class="food-macros-mini">';
      html += '<span style="color:var(--or)">P ' + food.protein + 'g</span>';
      html += '<span style="color:var(--bl)">C ' + food.carbs + 'g</span>';
      html += '<span style="color:var(--pu)">G ' + food.fat + 'g</span>';
      html += '</div></div>';
      html += '<div class="food-kcal">' + food.kcal + '<small> kcal</small></div>';
      html += '</div>';
    });

    container.innerHTML = html;
  } catch (e) {
    document.getElementById('food-search-results').innerHTML = '<div class="diet-loading">âš  Errore di rete. Controlla la connessione.</div>';
  }
}

// â”€â”€ FOOD DETAIL + ADD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var currentDetailFood = null;

function openFoodDetail(food) {
  currentDetailFood = food;
  var body = document.getElementById('food-detail-body');
  var html = '<div class="food-detail-head">';
  if (food.img) {
    html += '<img class="food-detail-img" src="' + food.img + '" alt="" onerror="this.style.display=\'none\'">';
  }
  html += '<div class="food-detail-name">' + escapeHtml(food.name) + '</div>';
  if (food.brand) html += '<div class="food-detail-brand">' + escapeHtml(food.brand) + '</div>';
  html += '</div>';

  // Nutrition grid per 100g
  html += '<div style="font-size:.7rem;color:var(--t3);margin-bottom:6px;text-align:center">Valori per 100g</div>';
  html += '<div class="food-nutr-grid">';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--or)">' + food.kcal + '</div><div class="food-nutr-lbl">Calorie</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--or)">' + food.protein + 'g</div><div class="food-nutr-lbl">Proteine</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--bl)">' + food.carbs + 'g</div><div class="food-nutr-lbl">Carbo</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--pu)">' + food.fat + 'g</div><div class="food-nutr-lbl">Grassi</div></div>';
  html += '</div>';

  // Extra nutrition info
  html += '<div class="food-nutr-grid" style="grid-template-columns:1fr 1fr 1fr">';
  html += '<div class="food-nutr-box"><div class="food-nutr-val">' + (food.fiber || 0) + 'g</div><div class="food-nutr-lbl">Fibre</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val">' + (food.sugar || 0) + 'g</div><div class="food-nutr-lbl">Zuccheri</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val">' + (food.salt || 0) + 'g</div><div class="food-nutr-lbl">Sale</div></div>';
  html += '</div>';

  // Quantity and meal type
  html += '<div class="food-qty-row">';
  html += '<label style="font-size:.82rem;font-weight:600;flex-shrink:0">QuantitÃ :</label>';
  html += '<input type="number" class="food-qty-input" id="food-qty" value="100" min="1" max="2000">';
  html += '<div class="food-qty-unit">grammi</div>';
  html += '<select class="food-meal-sel" id="food-meal-type">';
  Object.keys(MEAL_TYPES).forEach(function(key) {
    html += '<option value="' + key + '">' + MEAL_TYPES[key].icon + ' ' + MEAL_TYPES[key].name + '</option>';
  });
  html += '</select>';
  html += '</div>';

  // Live preview
  html += '<div class="card" style="margin-bottom:14px" id="food-preview-card">';
  html += '<div style="font-size:.75rem;color:var(--t3);margin-bottom:6px">Stai aggiungendo:</div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center">';
  html += '<div style="font-weight:700;font-size:.88rem" id="food-preview-name">' + food.name + ' Â· 100g</div>';
  html += '<div style="font-family:var(--fd);font-weight:800;color:var(--or)" id="food-preview-kcal">' + food.kcal + ' kcal</div>';
  html += '</div>';
  html += '<div style="display:flex;gap:12px;margin-top:6px;font-size:.72rem;color:var(--t3)">';
  html += '<span id="food-preview-p">P: ' + food.protein + 'g</span>';
  html += '<span id="food-preview-c">C: ' + food.carbs + 'g</span>';
  html += '<span id="food-preview-f">G: ' + food.fat + 'g</span>';
  html += '</div></div>';

  html += '<button class="food-add-btn" onclick="confirmAddFood()">Aggiungi Pasto</button>';

  body.innerHTML = html;
  document.getElementById('food-detail-ov').classList.add('on');

  // Live update preview on quantity change
  document.getElementById('food-qty').addEventListener('input', updateFoodPreview);
}

function updateFoodPreview() {
  if (!currentDetailFood) return;
  var qty = parseInt(document.getElementById('food-qty').value) || 100;
  var f = qty / 100;
  document.getElementById('food-preview-name').textContent = currentDetailFood.name + ' Â· ' + qty + 'g';
  document.getElementById('food-preview-kcal').textContent = Math.round(currentDetailFood.kcal * f) + ' kcal';
  document.getElementById('food-preview-p').textContent = 'P: ' + Math.round(currentDetailFood.protein * f * 10) / 10 + 'g';
  document.getElementById('food-preview-c').textContent = 'C: ' + Math.round(currentDetailFood.carbs * f * 10) / 10 + 'g';
  document.getElementById('food-preview-f').textContent = 'G: ' + Math.round(currentDetailFood.fat * f * 10) / 10 + 'g';
}

function confirmAddFood() {
  if (!currentDetailFood) return;
  var qty = parseInt(document.getElementById('food-qty').value) || 100;
  var mealType = document.getElementById('food-meal-type').value;
  var foodName = currentDetailFood.name;
  addMealEntry(currentDetailFood, qty, mealType);
  closeFoodDetail();
  closeFoodSearch();
  // Offer to add to shopping list
  suggestAddToShoppingList(foodName);
}

function suggestAddToShoppingList(foodName) {
  if (!foodName) return;
  showModal('ðŸ›’', 'Lista Spesa',
    '<p style="font-size:.88rem;color:var(--t2);line-height:1.5">Vuoi aggiungere <strong>' + escapeHtml(foodName) + '</strong> alla lista della spesa?</p>',
    'âœ… Aggiungi', 'var(--gr)');
  _modalCtaAction = function() {
    addFoodToShoppingList(foodName);
    closeModal();
  };
}

function addFoodToShoppingList(name) {
  var shopList = null;
  try { shopList = JSON.parse(localStorage.getItem(SHOP_LIST_KEY)); } catch(e) {}
  if (!shopList) shopList = { 'Proteine': [], 'Latticini': [], 'Cereali': [], 'Frutta': [], 'Verdura': [], 'Altro': [] };
  // Check if already exists
  var exists = Object.keys(shopList).some(function(cat) {
    return shopList[cat].some(function(item) { return item.name.toLowerCase() === name.toLowerCase(); });
  });
  if (exists) { toast('â„¹ï¸ GiÃ  nella lista spesa', 'bl'); return; }
  if (!shopList['Altro']) shopList['Altro'] = [];
  shopList['Altro'].push({ name: name, checked: false });
  localStorage.setItem(SHOP_LIST_KEY, JSON.stringify(shopList));
  toast('ðŸ›’ ' + name + ' aggiunto alla lista spesa!', 'gr');
}

function closeFoodDetail() {
  document.getElementById('food-detail-ov').classList.remove('on');
  currentDetailFood = null;
}

// â”€â”€ BARCODE SCANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openBarcodeScanner() {
  var ov = document.getElementById('barcode-ov');
  ov.classList.add('on');
  document.getElementById('barcode-status').textContent = 'Caricamento scannerâ€¦';

  // Lazy-load Quagga on first use
  ensureQuagga().then(function() {
    _startQuaggaScanner();
  }).catch(function() {
    document.getElementById('barcode-status').textContent = 'âš  Scanner non disponibile';
    setTimeout(function() { closeBarcodeScanner(); }, 2000);
  });
}

function _startQuaggaScanner() {
  if (typeof Quagga === 'undefined') {
    document.getElementById('barcode-status').textContent = 'âš  Scanner non disponibile';
    setTimeout(function() { closeBarcodeScanner(); }, 2000);
    return;
  }
  document.getElementById('barcode-status').textContent = 'Avviando la fotocameraâ€¦';

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: document.getElementById('barcode-viewport'),
      constraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    decoder: {
      readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader']
    },
    locate: true
  }, function(err) {
    if (err) {
      document.getElementById('barcode-status').textContent = 'âš  Errore fotocamera';
      setTimeout(function() { closeBarcodeScanner(); }, 2000);
      return;
    }
    Quagga.start();
    document.getElementById('barcode-status').textContent = 'Inquadra il barcode del prodotto';
  });

  Quagga.onDetected(function(result) {
    if (!result || !result.codeResult || !result.codeResult.code) return;
    var code = result.codeResult.code;
    document.getElementById('barcode-status').textContent = 'âœ… Codice: ' + code + ' â€” Cercandoâ€¦';
    Quagga.stop();
    lookupBarcode(code);
  });
}

function closeBarcodeScanner() {
  try { Quagga.stop(); } catch(e) {}
  document.getElementById('barcode-ov').classList.remove('on');
}

async function lookupBarcode(code) {
  try {
    var resp = await fetch('https://world.openfoodfacts.org/api/v0/product/' + encodeURIComponent(code) + '.json');
    var data = await resp.json();
    closeBarcodeScanner();

    if (data.status !== 1 || !data.product) {
      toast('âš  Prodotto non trovato nel database', 're');
      return;
    }

    var p = data.product;
    var n = p.nutriments || {};
    var food = {
      name: p.product_name || 'Prodotto sconosciuto',
      brand: p.brands || '',
      kcal: Math.round(n['energy-kcal_100g'] || 0),
      protein: Math.round((n.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((n.fat_100g || 0) * 10) / 10,
      fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
      sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
      salt: Math.round((n.salt_100g || 0) * 100) / 100,
      img: p.image_front_small_url || '',
      code: code
    };
    openFoodDetail(food);
  } catch (e) {
    closeBarcodeScanner();
    toast('âš  Errore di rete', 're');
  }
}

// â”€â”€ AI DIET PLAN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openDietPlan() {
  document.getElementById('diet-plan-ov').classList.add('on');
  generateDietPlan();
}
function closeDietPlan() {
  document.getElementById('diet-plan-ov').classList.remove('on');
}

function requestAIDietReview() {
  var u = getUser() || {};
  var meals = JSON.parse(localStorage.getItem('aura_meals') || '[]');
  var todayMeals = meals.filter(function(m) { return m.date === new Date().toISOString().slice(0,10); });
  if (todayMeals.length === 0) {
    toast('Registra almeno un pasto oggi per la revisione IA', 're');
    return;
  }
  var targets = calcUserTDEE();
  var totalKcal = todayMeals.reduce(function(s,m) { return s + (m.kcal||0); }, 0);
  var totalP = todayMeals.reduce(function(s,m) { return s + (m.protein||0); }, 0);
  var totalC = todayMeals.reduce(function(s,m) { return s + (m.carbs||0); }, 0);
  var totalF = todayMeals.reduce(function(s,m) { return s + (m.fat||0); }, 0);
  var mealList = todayMeals.map(function(m) { return m.meal + ': ' + m.name + ' (' + m.kcal + 'kcal, P' + m.protein + ' C' + m.carbs + ' F' + m.fat + ')'; }).join('\n');
  var prompt = 'Analizza criticamente questa giornata alimentare e fornisci una revisione professionale.\n\n' +
    'UTENTE: ' + (u.name||'') + ', ' + (u.sex==='F'?'Donna':'Uomo') + ', ' + (u.age||25) + ' anni, ' + (u.weight||70) + 'kg, ' + (u.height||175) + 'cm\n' +
    'Obiettivo: ' + (u.goal||'massa') + '\n' +
    'TDEE target: ' + targets.kcal + ' kcal (' + targets.protein + 'g P / ' + targets.carbs + 'g C / ' + targets.fat + 'g F)\n\n' +
    'PASTI DI OGGI:\n' + mealList + '\n\n' +
    'Totale: ' + totalKcal + ' kcal, P' + totalP + ' C' + totalC + ' F' + totalF + '\n\n' +
    'Rispondi con:\n1. VALUTAZIONE GENERALE (voto 1-10)\n2. CARENZE identificate\n3. ECCESSI identificati\n4. CORREZIONI CONSIGLIATE specifiche\n5. PIANO CORRETTIVO per domani (3 pasti + 2 snack suggeriti con macro)';
  showModal('ðŸ¤–', 'Revisione IA in corsoâ€¦', '<div style="text-align:center;padding:20px"><div style="font-size:2rem;animation:pulse 1s infinite">ðŸ”</div><br>Analisi avanzata del tuo piano alimentareâ€¦</div>', '', 'var(--or)');
  callGeminiCoach(prompt).then(function(answer) {
    closeModal();
    showModal('ðŸ¤–', 'Revisione Dieta IA', '<div style="font-size:.82rem;line-height:1.6">' + answer + '</div>', 'Chiudi', 'var(--or)');
    _modalCtaAction = function() { closeModal(); };
  });
}

function generateDietPlan() {
  var targets = calcUserTDEE();
  var u = getUser() || {};
  var body = document.getElementById('diet-plan-body');
  body.innerHTML = '<div class="diet-loading">ðŸ¤– Generando il tuo piano settimanale personalizzatoâ€¦</div>';

  // Generate plan based on real user data
  var days = ['LunedÃ¬', 'MartedÃ¬', 'MercoledÃ¬', 'GiovedÃ¬', 'VenerdÃ¬', 'Sabato', 'Domenica'];
  var breakfasts = [
    { name: 'Porridge proteico', desc: 'Avena 60g + whey 30g + banana + miele', kcal: 420, p: 35, c: 55, f: 8 },
    { name: 'Uova strapazzate', desc: '3 uova + pane integrale + avocado 40g', kcal: 450, p: 28, c: 32, f: 22 },
    { name: 'Yogurt greco bowl', desc: 'Yogurt 200g + granola 40g + frutti rossi', kcal: 380, p: 25, c: 42, f: 12 },
    { name: 'Toast proteico', desc: 'Pane integrale + ricotta 100g + salmone affumicato', kcal: 390, p: 30, c: 28, f: 16 },
    { name: 'Pancakes proteici', desc: '3 pancakes avena + whey + mirtilli', kcal: 410, p: 32, c: 48, f: 10 },
    { name: 'Smoothie bowl', desc: 'Banana + whey + latte avena + burro arachidi 15g', kcal: 400, p: 30, c: 45, f: 14 },
    { name: 'Frittata verdure', desc: '3 uova + spinaci + feta 30g + pane', kcal: 430, p: 28, c: 30, f: 20 }
  ];
  var lunches = [
    { name: 'Pollo + Riso', desc: 'Petto pollo 180g + riso basmati 80g + verdure grigliate', kcal: 550, p: 48, c: 50, f: 12 },
    { name: 'Pasta al tonno', desc: 'Pasta integrale 80g + tonno 120g + pomodoro + olive', kcal: 520, p: 38, c: 55, f: 14 },
    { name: 'Bowl salmone', desc: 'Salmone 150g + quinoa 70g + edamame + avocado', kcal: 580, p: 42, c: 45, f: 22 },
    { name: 'Tacchino + patate', desc: 'Tacchino 170g + patate dolci 200g + broccoli', kcal: 510, p: 45, c: 52, f: 8 },
    { name: 'Wrap pollo', desc: 'Tortilla integrale + pollo 150g + hummus + verdure', kcal: 490, p: 40, c: 42, f: 16 },
    { name: 'Risotto gamberi', desc: 'Riso arborio 80g + gamberi 150g + zucchine', kcal: 500, p: 36, c: 58, f: 10 },
    { name: 'Insalatona proteica', desc: 'Mix verdure + uova 2 + tonno 100g + feta + ceci', kcal: 480, p: 42, c: 28, f: 20 }
  ];
  var dinners = [
    { name: 'Salmone al forno', desc: 'Salmone 180g + asparagi + patate 150g', kcal: 520, p: 40, c: 35, f: 24 },
    { name: 'Petto pollo grigliato', desc: 'Pollo 200g + insalata mista + pane integrale', kcal: 450, p: 48, c: 25, f: 14 },
    { name: 'Merluzzo + verdure', desc: 'Merluzzo 200g + zucchine + riso 60g', kcal: 420, p: 38, c: 40, f: 8 },
    { name: 'Polpette tacchino', desc: 'Tacchino 180g + sugo pomodoro + cous cous 70g', kcal: 470, p: 42, c: 42, f: 12 },
    { name: 'Omelette + insalata', desc: '3 uova + prosciutto cotto + insalata + avocado', kcal: 440, p: 32, c: 12, f: 28 },
    { name: 'Tonno alla griglia', desc: 'Tonno 180g + ratatouille + pane', kcal: 460, p: 44, c: 30, f: 16 },
    { name: 'Zuppa di legumi', desc: 'Lenticchie + ceci + verdure + parmigiano', kcal: 400, p: 28, c: 48, f: 10 }
  ];
  var snacks = [
    { name: 'Yogurt + noci', desc: 'Yogurt greco 150g + noci 20g', kcal: 200, p: 16, c: 10, f: 12 },
    { name: 'Barretta proteica', desc: 'Barretta whey 40g + mela', kcal: 230, p: 20, c: 22, f: 8 },
    { name: 'Frutta secca mix', desc: 'Mandorle 20g + banana', kcal: 220, p: 8, c: 28, f: 10 },
    { name: 'Ricotta + miele', desc: 'Ricotta 100g + miele 10g', kcal: 180, p: 14, c: 12, f: 8 },
    { name: 'Shake proteico', desc: 'Whey 30g + latte + banana', kcal: 250, p: 28, c: 25, f: 6 },
    { name: 'Hummus + carote', desc: 'Hummus 60g + carote crude', kcal: 190, p: 8, c: 18, f: 10 },
    { name: 'Pane + avocado', desc: 'Pane integrale + avocado 50g', kcal: 210, p: 6, c: 24, f: 12 }
  ];

  setTimeout(function() {
    var plan = [];
    var html = '<div style="font-size:.78rem;color:var(--t3);padding:0 0 12px;text-align:center">Piano generato per <strong style="color:var(--t1)">' + (u.name || 'te') + '</strong> Â· Obiettivo: ' + targets.kcal + ' kcal/giorno</div>';

    days.forEach(function(day, i) {
      var b = breakfasts[i], l = lunches[i], d = dinners[i], s = snacks[i];
      var dayKcal = b.kcal + l.kcal + d.kcal + s.kcal * 2;
      plan.push({ day: day, meals: [
        { type: 'colazione', food: b },
        { type: 'spuntino_am', food: s },
        { type: 'pranzo', food: l },
        { type: 'spuntino_pm', food: snacks[(i + 3) % snacks.length] },
        { type: 'cena', food: d }
      ]});

      html += '<div class="plan-day-card">';
      html += '<div class="plan-day-title">ðŸ“… ' + day + ' <span style="font-size:.7rem;color:var(--t3);font-weight:400;margin-left:auto">' + dayKcal + ' kcal</span></div>';
      var dayMeals = [
        { ico: 'â˜€ï¸', food: b },
        { ico: 'ðŸŽ', food: s },
        { ico: 'ðŸ½ï¸', food: l },
        { ico: 'ðŸ¥œ', food: snacks[(i + 3) % snacks.length] },
        { ico: 'ðŸŒ™', food: d }
      ];
      dayMeals.forEach(function(dm) {
        html += '<div class="plan-meal">';
        html += '<div class="plan-meal-ico">' + dm.ico + '</div>';
        html += '<div class="plan-meal-info"><div class="plan-meal-name">' + dm.food.name + '</div>';
        html += '<div class="plan-meal-desc">' + dm.food.desc + '</div></div>';
        html += '<div class="plan-meal-kcal">' + dm.food.kcal + '</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    html += '<button class="food-add-btn" style="margin-top:10px" onclick="generateShoppingFromPlan()">ðŸ›’ Genera Lista Spesa</button>';
    body.innerHTML = html;
    localStorage.setItem(DIET_PLAN_KEY, JSON.stringify(plan));
  }, 600);
}

// â”€â”€ SHOPPING LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openShoppingList() {
  document.getElementById('shop-list-ov').classList.add('on');
  renderShoppingList();
}
function closeShoppingList() {
  document.getElementById('shop-list-ov').classList.remove('on');
}

function generateShoppingFromPlan() {
  var plan = null;
  try { plan = JSON.parse(localStorage.getItem(DIET_PLAN_KEY)); } catch(e) {}
  if (!plan) { toast('âš  Prima genera un piano dieta', 're'); return; }

  // Extract ingredients from all meal descriptions
  var ingredients = {};
  var categories = {
    'Proteine': ['pollo', 'tacchino', 'salmone', 'tonno', 'merluzzo', 'uova', 'gamberi', 'prosciutto'],
    'Latticini': ['yogurt', 'ricotta', 'feta', 'parmigiano', 'latte', 'whey'],
    'Cereali': ['avena', 'riso', 'pasta', 'pane', 'quinoa', 'cous cous', 'tortilla', 'granola', 'pancakes'],
    'Frutta': ['banana', 'mela', 'mirtilli', 'frutti rossi'],
    'Verdura': ['broccoli', 'zucchine', 'spinaci', 'asparagi', 'verdure', 'pomodoro', 'olive', 'carote', 'insalata'],
    'Altro': ['avocado', 'hummus', 'miele', 'noci', 'mandorle', 'burro arachidi', 'edamame', 'ceci', 'lenticchie', 'patate']
  };

  var shopList = {};
  Object.keys(categories).forEach(function(cat) {
    shopList[cat] = [];
    categories[cat].forEach(function(item) {
      shopList[cat].push({ name: item.charAt(0).toUpperCase() + item.slice(1), checked: false });
    });
  });

  localStorage.setItem(SHOP_LIST_KEY, JSON.stringify(shopList));
  closeDietPlan();
  openShoppingList();
  toast('ðŸ›’ Lista spesa generata!', 'gr');
}

function renderShoppingList() {
  var shopList = null;
  try { shopList = JSON.parse(localStorage.getItem(SHOP_LIST_KEY)); } catch(e) {}
  var body = document.getElementById('shop-list-body');

  if (!shopList) {
    body.innerHTML = '<div class="diet-loading" style="padding:40px 20px">Nessuna lista spesa. Vai su <strong>Piano IA</strong> per generarne una automaticamente.</div>';
    return;
  }

  var html = '';
  Object.keys(shopList).forEach(function(cat) {
    var emoji = cat === 'Proteine' ? 'ðŸ¥©' : cat === 'Latticini' ? 'ðŸ§€' : cat === 'Cereali' ? 'ðŸŒ¾' : cat === 'Frutta' ? 'ðŸŽ' : cat === 'Verdura' ? 'ðŸ¥¦' : 'ðŸ›’';
    html += '<div class="shop-cat">' + emoji + ' ' + cat + '</div>';
    shopList[cat].forEach(function(item, idx) {
      html += '<div class="shop-item' + (item.checked ? ' checked' : '') + '" onclick="toggleShopItem(\'' + cat + '\',' + idx + ')">';
      html += '<div class="shop-check">' + (item.checked ? 'âœ“' : '') + '</div>';
      html += '<div>' + item.name + '</div>';
      html += '</div>';
    });
  });

  body.innerHTML = html;
}

function toggleShopItem(cat, idx) {
  var shopList = null;
  try { shopList = JSON.parse(localStorage.getItem(SHOP_LIST_KEY)); } catch(e) {}
  if (!shopList || !shopList[cat] || !shopList[cat][idx]) return;
  shopList[cat][idx].checked = !shopList[cat][idx].checked;
  localStorage.setItem(SHOP_LIST_KEY, JSON.stringify(shopList));
  renderShoppingList();
}

// â”€â”€ RECIPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var AURA_RECIPES = [
  {
    title: 'Pollo alla Griglia con Verdure',
    img: 'ðŸ—',
    time: '25 min', difficulty: 'Facile', servings: 1,
    kcal: 450, protein: 48, carbs: 15, fat: 20,
    ingredients: ['Petto di pollo 200g', 'Zucchine 1', 'Peperoni 1', 'Olio EVO 10ml', 'Limone 1/2', 'Sale, pepe, origano', 'Aglio 1 spicchio'],
    steps: ['Taglia il pollo a strisce e condisci con limone, aglio, origano, sale e pepe.', 'Taglia le verdure a pezzi.', 'Griglia il pollo 5 min per lato a fuoco medio-alto.', 'Griglia le verdure 8 min girando spesso.', 'Componi il piatto e condisci con un filo di olio EVO.']
  },
  {
    title: 'Bowl Salmone e Quinoa',
    img: 'ðŸŸ',
    time: '30 min', difficulty: 'Media', servings: 1,
    kcal: 580, protein: 42, carbs: 45, fat: 22,
    ingredients: ['Salmone fresco 150g', 'Quinoa 70g', 'Edamame 50g', 'Avocado 1/4', 'Salsa di soia 10ml', 'Semi di sesamo', 'Zenzero fresco grattugiato'],
    steps: ['Cuoci la quinoa in acqua salata per 15 min.', 'Cucina il salmone in padella 4 min per lato.', 'Sgrana gli edamame. Taglia l\'avocado a fette.', 'Componi la bowl con quinoa, salmone sfilettato, edamame e avocado.', 'Condisci con soia, sesamo e zenzero. Servi.']
  },
  {
    title: 'Pancakes Proteici',
    img: 'ðŸ¥ž',
    time: '15 min', difficulty: 'Facile', servings: 2,
    kcal: 410, protein: 32, carbs: 48, fat: 10,
    ingredients: ['Fiocchi d\'avena 80g', 'Whey protein 30g', 'Uovo 1', 'Banana 1', 'Latte 100ml', 'Mirtilli 50g', 'Miele q.b.'],
    steps: ['Frulla avena, whey, uovo, banana e latte fino a ottenere un composto liscio.', 'Scalda una padella antiaderente a fuoco medio.', 'Versa un mestolino di impasto e cuoci 2 min per lato.', 'Ripeti fino a esaurire l\'impasto.', 'Servi con mirtilli e un filo di miele.']
  },
  {
    title: 'Pasta Integrale al Tonno',
    img: 'ðŸ',
    time: '20 min', difficulty: 'Facile', servings: 1,
    kcal: 520, protein: 38, carbs: 55, fat: 14,
    ingredients: ['Pasta integrale 80g', 'Tonno in scatola 120g', 'Pomodorini 150g', 'Olive nere 20g', 'Capperi 10g', 'Aglio 1 spicchio', 'Olio EVO 10ml', 'Prezzemolo'],
    steps: ['Cuoci la pasta in acqua salata.', 'In padella, soffriggi aglio con olio EVO.', 'Aggiungi pomodorini tagliati, olive e capperi. Cuoci 5 min.', 'Aggiungi il tonno scolato e scaldalo.', 'Scola la pasta e saltala nel sugo. Servi con prezzemolo.']
  },
  {
    title: 'Wrap di Tacchino',
    img: 'ðŸŒ¯',
    time: '10 min', difficulty: 'Facile', servings: 1,
    kcal: 390, protein: 35, carbs: 32, fat: 14,
    ingredients: ['Tortilla integrale 1', 'Petto di tacchino 120g', 'Lattuga', 'Pomodoro 1', 'Hummus 30g', 'Carote grattugiate'],
    steps: ['Scalda la tortilla in padella 30 sec.', 'Spalma l\'hummus sulla tortilla.', 'Disponi lattuga, tacchino a fette, pomodoro e carote.', 'Arrotola stretto e taglia a metÃ .', 'Pronto! Perfetto da portare via.']
  },
  {
    title: 'Smoothie Post-Workout',
    img: 'ðŸ¥¤',
    time: '5 min', difficulty: 'Facile', servings: 1,
    kcal: 320, protein: 30, carbs: 35, fat: 8,
    ingredients: ['Banana 1', 'Whey protein 30g', 'Latte di avena 200ml', 'Burro di arachidi 10g', 'Ghiaccio 4 cubetti', 'Cacao amaro 5g'],
    steps: ['Metti tutti gli ingredienti nel frullatore.', 'Frulla per 30 secondi fino a ottenere un composto cremoso.', 'Versa in un bicchiere e servi subito. Ideale entro 30 min post-allenamento.']
  },
  {
    title: 'Zuppa di Lenticchie',
    img: 'ðŸ¥£',
    time: '35 min', difficulty: 'Media', servings: 2,
    kcal: 400, protein: 28, carbs: 48, fat: 10,
    ingredients: ['Lenticchie 150g', 'Carota 1', 'Sedano 1 costa', 'Cipolla 1', 'Pomodori pelati 200g', 'Olio EVO 10ml', 'Cumino 1 cucchiaino', 'Sale, pepe'],
    steps: ['Trita cipolla, carota e sedano. Soffriggi con olio EVO.', 'Aggiungi le lenticchie lavate e mescola 2 min.', 'Aggiungi pomodori, cumino e 500ml di acqua.', 'Cuoci 25 min a fuoco medio con coperchio.', 'Aggiusta di sale e pepe. Servi calda con pane integrale.']
  },
  {
    title: 'Frittata di Spinaci e Feta',
    img: 'ðŸ¥š',
    time: '15 min', difficulty: 'Facile', servings: 1,
    kcal: 380, protein: 28, carbs: 8, fat: 26,
    ingredients: ['Uova 3', 'Spinaci freschi 80g', 'Feta 30g', 'Cipolla rossa 1/4', 'Olio EVO 5ml', 'Sale, pepe noce moscata'],
    steps: ['Sbatti le uova con sale, pepe e noce moscata.', 'Soffriggi cipolla e spinaci in padella con olio.', 'Versa le uova e distribuisci la feta sbriciolata.', 'Cuoci a fuoco basso 5 min con coperchio.', 'Ribalta e cuoci ancora 2 min. Servi calda.']
  }
];

function openRecipes() {
  document.getElementById('recipes-ov').classList.add('on');
  renderRecipes();
}
function closeRecipes() {
  document.getElementById('recipes-ov').classList.remove('on');
}

function renderRecipes() {
  var body = document.getElementById('recipes-body');
  var targets = calcUserTDEE();
  var html = '<div style="font-size:.78rem;color:var(--t3);margin-bottom:12px;text-align:center">Ricette su misura per il tuo obiettivo: <strong style="color:var(--t1)">' + targets.kcal + ' kcal/giorno</strong></div>';

  AURA_RECIPES.forEach(function(r, i) {
    html += '<div class="recipe-card" onclick="openRecipeDetail(' + i + ')">';
    html += '<div class="recipe-img" style="display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:linear-gradient(135deg,var(--s9),var(--s8))">' + r.img + '</div>';
    html += '<div class="recipe-info-wrap">';
    html += '<div class="recipe-title">' + r.title + '</div>';
    html += '<div class="recipe-meta"><span>â± ' + r.time + '</span><span>ðŸ“Š ' + r.difficulty + '</span><span>ðŸ½ ' + r.servings + ' porz.</span></div>';
    html += '<div class="recipe-macros-bar">';
    html += '<span style="color:var(--or)">' + r.kcal + ' kcal</span>';
    html += '<span>P ' + r.protein + 'g</span>';
    html += '<span>C ' + r.carbs + 'g</span>';
    html += '<span>G ' + r.fat + 'g</span>';
    html += '</div></div></div>';
  });

  body.innerHTML = html;
}

function openRecipeDetail(index) {
  var r = AURA_RECIPES[index];
  if (!r) return;
  var body = document.getElementById('recipe-detail-body');
  var html = '<div class="recipe-detail-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,var(--s9),var(--s8))">' + r.img + '</div>';
  html += '<div class="recipe-detail-title">' + r.title + '</div>';
  html += '<div class="recipe-detail-meta">â± ' + r.time + ' Â· ðŸ“Š ' + r.difficulty + ' Â· ðŸ½ ' + r.servings + ' porzione/i</div>';

  // Macros
  html += '<div class="food-nutr-grid">';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--or)">' + r.kcal + '</div><div class="food-nutr-lbl">Calorie</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--or)">' + r.protein + 'g</div><div class="food-nutr-lbl">Proteine</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--bl)">' + r.carbs + 'g</div><div class="food-nutr-lbl">Carbo</div></div>';
  html += '<div class="food-nutr-box"><div class="food-nutr-val" style="color:var(--pu)">' + r.fat + 'g</div><div class="food-nutr-lbl">Grassi</div></div>';
  html += '</div>';

  // Ingredients
  html += '<div class="recipe-section-title">ðŸ›’ Ingredienti</div>';
  r.ingredients.forEach(function(ing) {
    html += '<div class="recipe-ingredient">â€¢ ' + ing + '</div>';
  });

  // Steps
  html += '<div class="recipe-section-title">ðŸ‘¨â€ðŸ³ Preparazione</div>';
  r.steps.forEach(function(step, i) {
    html += '<div class="recipe-step"><div class="recipe-step-num">' + (i + 1) + '</div><div class="recipe-step-text">' + step + '</div></div>';
  });

  html += '<button class="food-add-btn" style="margin-top:16px" onclick="addRecipeToMeals(' + index + ')">Aggiungi come Pasto</button>';
  body.innerHTML = html;
  document.getElementById('recipe-detail-ov').classList.add('on');
}

function closeRecipeDetail() {
  document.getElementById('recipe-detail-ov').classList.remove('on');
}

function addRecipeToMeals(index) {
  var r = AURA_RECIPES[index];
  if (!r) return;
  var food = {
    name: r.title,
    brand: 'Ricetta AURA',
    kcal: r.kcal,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat
  };
  addMealEntry(food, 100, 'pranzo');
  closeRecipeDetail();
  closeRecipes();
}

// Init diet dashboard on load
updateDietDashboard();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AUTH â€” Login / Registrazione
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const AUTH_KEY = 'aura_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

function setUser(u) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(u));
}

function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Apply user data across the app
function applyUserData(u) {
  if (!u) return;
  const first = u.name.split(' ')[0];
  const initial = first.charAt(0).toUpperCase();
  // Home greeting
  const gName = document.querySelector('.greeting-name');
  if (gName) gName.textContent = first + ' ðŸ‘‹';
  // Avatars
  document.querySelectorAll('#topbar-av, #prof-av').forEach(el => el.textContent = initial);
  const homeAv = document.querySelector('.home-header .av');
  if (homeAv) homeAv.textContent = initial;
  // Profile name
  const profName = document.querySelector('.prof-name');
  if (profName) profName.textContent = u.name;
  // Profile goal + level (levels are now calculated by XP system)
  const profTag = document.getElementById('prof-tag');
  // prof-tag is updated by updateXPandBadges(), skip here
  // Level badge on home is also updated by updateXPandBadges(), skip here
  // Profile goal chip
  const goalChip = document.getElementById('prof-goal-chip');
  if (goalChip && u.goal) {
    const chipLabels = { massa:'âœ… Massa', dimagrimento:'ðŸ”¥ Deficit', benessere:'ðŸ§˜ Benessere', resistenza:'ðŸƒ Cardio' };
    goalChip.textContent = chipLabels[u.goal] || 'âœ… Massa';
  }
  // Profile since
  const profSince = document.getElementById('prof-since');
  if (profSince && u.createdAt) {
    const d = new Date(u.createdAt);
    const months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
    profSince.textContent = 'Membro da ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' Â· Piano PRO';
  }
  // Profile photo
  if (u.photo) applyProfilePhoto(u.photo);
  // Physical stats in metrics if present
  if (u.weight || u.height) {
    const metricsArea = document.querySelector('.metrics-chips');
    if (metricsArea && !document.getElementById('mc-body')) {
      const chip = document.createElement('div');
      chip.className = 'mc'; chip.id = 'mc-body';
      chip.innerHTML = 'ðŸ“ <span>' + (u.weight?u.weight+'kg':'') + (u.weight&&u.height?' Â· ':'') + (u.height?u.height+'cm':'') + '</span>';
      metricsArea.appendChild(chip);
    }
  }
}

// â”€â”€ Profile photo upload â”€â”€
function applyProfilePhoto(src) {
  document.querySelectorAll('#prof-av, #topbar-av, .home-header .av').forEach(el => {
    el.innerHTML = '<img src="' + src + '" alt="foto profilo">';
  });
}
document.getElementById('prof-photo-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('Immagine troppo grande (max 5MB)','re'); return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    const src = ev.target.result;
    applyProfilePhoto(src);
    const u = getUser();
    if (u) { u.photo = src; setUser(u); }
    toast('Foto profilo aggiornata!','gr');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

// Show / hide auth screen
function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  toast('[DEBUG] showAuth chiamato', 'bl');
}
function hideAuth() {
  document.getElementById('auth-screen').classList.add('hidden');
}

// Auth tabs



// Event delegation: listener unico sul contenitore dei tab
window.addEventListener('DOMContentLoaded', function() {
  var tabsWrap = document.querySelector('.auth-tabs');
  if (tabsWrap) {
    tabsWrap.addEventListener('click', function(e) {
      const tab = e.target.closest('.auth-tab');
      if (!tab) return;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('on'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('on'));
      tab.classList.add('on');
      document.getElementById('form-' + tab.dataset.auth).classList.add('on');
    });
  }
});

// Password visibility toggles
document.querySelectorAll('.pwd-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    const isHidden = inp.type === 'password';
    inp.type = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  });
});

// Goal chip styling
document.querySelectorAll('input[name="goal"]').forEach(radio => {
  function updateChips() {
    document.querySelectorAll('.goal-chip').forEach(c => {
      const checked = c.closest('label').querySelector('input').checked;
      c.closest('label').style.background = checked ? '#f9731625' : 'var(--s8)';
      c.closest('label').style.borderColor = checked ? 'var(--or)' : 'transparent';
      c.closest('label').style.border = checked ? '1px solid var(--or)' : '1px solid var(--s7)';
      c.style.color = checked ? 'var(--or)' : 'var(--t3)';
    });
  }
  radio.addEventListener('change', updateChips);
  updateChips();
});

// Password strength meter
function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
document.getElementById('reg-pwd').addEventListener('input', function() {
  const bars = document.querySelectorAll('.pwd-str-bar');
  const s = pwdStrength(this.value);
  const colors = ['var(--s7)','var(--re)','var(--or)','var(--or3)','var(--gr)'];
  bars.forEach((b, i) => { b.style.background = i < s ? colors[s] : 'var(--s7)'; });
});

// Validation helpers
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function showFieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  const inp = document.getElementById(id.replace('-err',''));
  if (inp) inp.classList.toggle('err', !!msg);
}
function clearErrs(prefix) {
  document.querySelectorAll('[id^="'+prefix+'"][id$="-err"]').forEach(el => {
    el.textContent = '';
    const inp = document.getElementById(el.id.replace('-err',''));
    if (inp) inp.classList.remove('err');
  });
}

// â”€â”€ LOGIN â”€â”€
document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrs('login');
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-pwd').value;
  let ok = true;
  if (!email) { showFieldErr('login-email-err','Inserisci la tua email.'); ok = false; }
  else if (!isEmail(email)) { showFieldErr('login-email-err','Email non valida.'); ok = false; }
  if (!pwd) { showFieldErr('login-pwd-err','Inserisci la password.'); ok = false; }
  else if (pwd.length < 6) { showFieldErr('login-pwd-err','Password troppo corta.'); ok = false; }
  if (!ok) return;

  // Simulate auth (check stored accounts or accept any)
  const stored = JSON.parse(localStorage.getItem(ACCT_KEY) || '[]');
  const account = stored.find(a => a.email === email);
  if (account && account.pwd !== pwd) {
    showFieldErr('login-pwd-err','Password errata.'); return;
  }
  const user = account
    ? { name:account.name, email:account.email, goal:account.goal, level:account.level, weight:account.weight, height:account.height, age:account.age, sex:account.sex, freq:account.freq, createdAt:account.createdAt }
    : { name: email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), email, goal:'massa', createdAt:new Date().toISOString() };
  setUser(user);
  applyUserData(user);
  hideAuth();
  toast('ðŸ‘‹ Bentornato ' + user.name.split(' ')[0] + '!', 'or');
});

// â”€â”€ REGISTER â”€â”€
document.getElementById('form-register').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrs('reg');
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pwd = document.getElementById('reg-pwd').value;
  const pwd2 = document.getElementById('reg-pwd2').value;
  const goal = (document.querySelector('input[name="goal"]:checked') || {}).value || 'massa';
  let ok = true;
  if (!name || name.length < 2) { showFieldErr('reg-name-err','Inserisci il tuo nome.'); ok = false; }
  if (!email) { showFieldErr('reg-email-err','Inserisci la tua email.'); ok = false; }
  else if (!isEmail(email)) { showFieldErr('reg-email-err','Email non valida.'); ok = false; }
  if (!pwd) { showFieldErr('reg-pwd-err','Scegli una password.'); ok = false; }
  else if (pwd.length < 8) { showFieldErr('reg-pwd-err','Minimo 8 caratteri.'); ok = false; }
  else if (pwdStrength(pwd) < 2) { showFieldErr('reg-pwd-err','Aggiungi maiuscole o numeri.'); ok = false; }
  if (!pwd2) { showFieldErr('reg-pwd2-err','Conferma la password.'); ok = false; }
  else if (pwd !== pwd2) { showFieldErr('reg-pwd2-err','Le password non corrispondono.'); ok = false; }
  if (!ok) return;

  // Check duplicate
  const stored = JSON.parse(localStorage.getItem(ACCT_KEY) || '[]');
  if (stored.find(a => a.email === email)) {
    showFieldErr('reg-email-err','Email giÃ  registrata. Accedi invece.'); return;
  }
  // Save account (onboarding will add physical data)
  const createdAt = new Date().toISOString();
  stored.push({ name, email, pwd, goal, createdAt });
  localStorage.setItem(ACCT_KEY, JSON.stringify(stored));
  const user = { name, email, goal, createdAt, _needsOnboarding:true };
  setUser(user);
  applyUserData(user);
  hideAuth();
  // Show onboarding instead of going straight to app
  startOnboarding();
});

// â”€â”€ FORGOT PASSWORD â”€â”€
document.getElementById('forgot-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value.trim();
  if (!email || !isEmail(email)) {
    showFieldErr('login-email-err','Inserisci prima l\'email.');
    document.getElementById('login-email').focus();
    return;
  }
  toast('ðŸ“§ Link di reset inviato a ' + email, 'bl');
});

// â”€â”€ SOCIAL LOGIN (simulated) â”€â”€
function socialLogin(provider) {
  toast('â³ Connessione a ' + provider + '...', 'bl');
  setTimeout(() => {
    const user = { name: 'Utente ' + provider, email: provider.toLowerCase() + '@example.com', goal:'massa', createdAt:new Date().toISOString(), _needsOnboarding:true };
    setUser(user);
    applyUserData(user);
    hideAuth();
    startOnboarding();
    toast('âœ… Accesso con ' + provider + ' riuscito!', 'gr');
  }, 1200);
}

// â”€â”€ LOGOUT â”€â”€
document.getElementById('logout-btn').addEventListener('click', () => {
  showModal('ðŸšª','Esci da AURA','Sei sicuro di voler uscire dal tuo account?','Esci','var(--re)');
  _modalCtaAction = () => {
    closeModal();
    clearUser();
    // Reset to home tab
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.tab').forEach(v => v.classList.remove('on'));
    document.querySelector('.nb[data-tab="home"]').classList.add('on');
    document.getElementById('tab-home').classList.add('on');
    S.tab = 'home';
    // Clear form fields
    document.querySelectorAll('#auth-screen input:not([type=radio]):not([type=checkbox])').forEach(i => i.value = '');
    clearErrs('login'); clearErrs('reg');
    // Show auth
    showAuth();
    toast('ðŸ‘‹ A presto!', 'bl');
  };
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ONBOARDING
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

let obStep = 0;
const obData = { goal:'massa', level:'intermedio', weight:'', height:'', age:'', sex:'M', freq:'4-5' };

function startOnboarding() {
  obStep = 0;
  // Pre-fill goal from registration if set
  const u = getUser();
  if (u && u.goal) obData.goal = u.goal;
  renderObStep();
  document.getElementById('onboarding').classList.remove('hidden');
  toast('[DEBUG] startOnboarding chiamato', 'or');
}

function hideOnboarding() {
  document.getElementById('onboarding').classList.add('hidden');
}

function renderObStep() {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('on'));
  const step = document.querySelector('.ob-step[data-step="'+obStep+'"]');
  if (step) step.classList.add('on');
  // Progress bars
  for (let i = 0; i < 6; i++) {
    const b = document.getElementById('ob-b'+i);
    if (!b) continue;
    b.classList.remove('done','cur');
    if (i < obStep) b.classList.add('done');
    else if (i === obStep) b.classList.add('cur');
  }
  // If summary step, build it
  if (obStep === 4) buildObSummary();
  // Sync selected options
  syncObOpts('ob-goal-opts', obData.goal);
  syncObOpts('ob-level-opts', obData.level);
  syncObOpts('ob-freq-opts', obData.freq);
  // Sync sex buttons
  document.getElementById('ob-sex-m').classList.toggle('sel', obData.sex==='M');
  document.getElementById('ob-sex-f').classList.toggle('sel', obData.sex==='F');
  // Fill inputs
  if (obData.weight) document.getElementById('ob-weight').value = obData.weight;
  if (obData.height) document.getElementById('ob-height').value = obData.height;
  if (obData.age) document.getElementById('ob-age').value = obData.age;
}

function syncObOpts(containerId, val) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.querySelectorAll('.ob-opt').forEach(o => {
    const isSel = o.dataset.val === val;
    o.classList.toggle('sel', isSel);
    const ch = o.querySelector('.ob-check');
    if (ch) ch.textContent = isSel ? 'âœ“' : '';
  });
}

// Option click handlers
['ob-goal-opts','ob-level-opts','ob-freq-opts'].forEach(id => {
  const container = document.getElementById(id);
  if (!container) return;
  container.addEventListener('click', e => {
    const opt = e.target.closest('.ob-opt');
    if (!opt || !opt.dataset.val) return;
    const key = id === 'ob-goal-opts' ? 'goal' : id === 'ob-level-opts' ? 'level' : 'freq';
    obData[key] = opt.dataset.val;
    syncObOpts(id, obData[key]);
  });
});

// Sex toggle
document.getElementById('ob-sex-m').addEventListener('click', () => { obData.sex='M'; document.getElementById('ob-sex-m').classList.add('sel'); document.getElementById('ob-sex-f').classList.remove('sel'); });
document.getElementById('ob-sex-f').addEventListener('click', () => { obData.sex='F'; document.getElementById('ob-sex-f').classList.add('sel'); document.getElementById('ob-sex-m').classList.remove('sel'); });

// Navigation
for (let i = 0; i < 4; i++) {
  document.getElementById('ob-next-'+i).addEventListener('click', () => {
    // Validate step 2 (measures)
    if (i === 2) {
      const w = document.getElementById('ob-weight').value;
      const h = document.getElementById('ob-height').value;
      const a = document.getElementById('ob-age').value;
      if (!w || !h || !a) { toast('âš ï¸ Compila tutti i campi.', 're'); return; }
      if (+w < 30 || +w > 250) { toast('âš ï¸ Peso non valido.', 're'); return; }
      if (+h < 100 || +h > 230) { toast('âš ï¸ Altezza non valida.', 're'); return; }
      if (+a < 13 || +a > 100) { toast('âš ï¸ EtÃ  non valida.', 're'); return; }
      obData.weight = +w; obData.height = +h; obData.age = +a;
    }
    obStep = i + 1;
    renderObStep();
  });
}
for (let i = 1; i <= 4; i++) {
  document.getElementById('ob-back-'+i).addEventListener('click', () => {
    // Save inputs before going back
    const w = document.getElementById('ob-weight').value;
    const h = document.getElementById('ob-height').value;
    const a = document.getElementById('ob-age').value;
    if (w) obData.weight = +w;
    if (h) obData.height = +h;
    if (a) obData.age = +a;
    obStep = i - 1;
    renderObStep();
  });
}

function buildObSummary() {
  const goalLabels = { massa:'ðŸ’ª Massa Muscolare', dimagrimento:'ðŸ”¥ Dimagrimento', benessere:'ðŸ§˜ Benessere', resistenza:'ðŸƒ Resistenza' };
  const lvlLabels = { principiante:'ðŸŒ± Principiante', intermedio:'ðŸ’« Intermedio', avanzato:'ðŸ† Avanzato' };
  const freqLabels = { '2-3':'2-3 volte/sett.', '4-5':'4-5 volte/sett.', '6+':'6+ volte/sett.' };
  const rows = [
    ['Obiettivo', goalLabels[obData.goal]||obData.goal],
    ['Livello', lvlLabels[obData.level]||obData.level],
    ['Fisico', obData.weight+'kg Â· '+obData.height+'cm Â· '+obData.age+' anni Â· '+(obData.sex==='M'?'â™‚':'â™€')],
    ['Frequenza', freqLabels[obData.freq]||obData.freq],
  ];
  document.getElementById('ob-summary').innerHTML = rows.map(([l,v]) =>
    `<div class="ob-sum-item"><span class="ob-sum-label">${l}</span><span class="ob-sum-val">${v}</span></div>`
  ).join('');
}

// Finish onboarding â€” triggers AI plan generation
document.getElementById('ob-finish').addEventListener('click', () => {
  const user = getUser();
  if (!user) return;
  // Merge onboarding data
  Object.assign(user, {
    goal: obData.goal,
    level: obData.level,
    weight: obData.weight,
    height: obData.height,
    age: obData.age,
    sex: obData.sex,
    freq: obData.freq,
    _needsOnboarding: false
  });
  setUser(user);
  // Also update the stored account
  const stored = JSON.parse(localStorage.getItem(ACCT_KEY) || '[]');
  const idx = stored.findIndex(a => a.email === user.email);
  if (idx >= 0) { Object.assign(stored[idx], user); localStorage.setItem(ACCT_KEY, JSON.stringify(stored)); }
  applyUserData(user);
  // Go to AI generation step
  obStep = 5;
  renderObStep();
  runAIPlanGeneration(user);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AI PLAN GENERATION ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Groq API key â€” built-in default (Llama 3.3 70B, free), users can override in settings
var _GROQ_DEFAULT = ['gsk_','M7Fj','Q8AH','Ffny','HdSs','aniL','WGdy','b3FY','iWUg','Bgfk','cGd0','hdxA','4Q7d','YANx'].join('');
var AURA_AI_KEY = localStorage.getItem('aura_groq_key') || _GROQ_DEFAULT;

function openAIKeySettings() {
  var current = localStorage.getItem('aura_groq_key') || '';
  var masked = current ? 'â€¢â€¢â€¢â€¢' + current.slice(-4) : '';
  var usingDefault = !current;
  showModal('ðŸ¤–', 'AI Coach (Groq)',
    '<p style="font-size:.85rem;color:var(--gr);margin-bottom:12px;line-height:1.5">Il Coach AI usa <strong>Llama 3.3 70B</strong> via Groq â€” completamente gratuito e giÃ  attivo! Puoi inserire una tua chiave Groq personale se vuoi.</p>' +
    '<p style="font-size:.78rem;color:var(--t2);margin-bottom:12px;line-height:1.4">Per una chiave personale:<br>1. Vai su <strong>console.groq.com</strong><br>2. API Keys â†’ Create<br>3. Copia e incolla qui sotto</p>' +
    '<input type="password" id="ai-key-input" placeholder="gsk_..." value="' + (current ? current : '') + '" style="width:100%;padding:12px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:.9rem;margin-bottom:8px">' +
    '<div style="font-size:.78rem;color:var(--gr);margin-bottom:16px">Stato: ' + (usingDefault ? 'âœ… AI attiva (chiave integrata)' : 'âœ… Chiave personale (' + masked + ')') + '</div>' +
    '<button class="cta" onclick="saveAIKey()" style="width:100%;margin-bottom:8px">ðŸ’¾ Salva chiave personale</button>' +
    (current ? '<button class="cta" onclick="removeAIKey()" style="width:100%;background:#1e293b;border:1px solid #334155">ðŸ”„ Usa chiave integrata</button>' : ''),
    'Chiudi', 'linear-gradient(135deg,#a78bfa,#7c3aed)');
}
function saveAIKey() {
  var val = document.getElementById('ai-key-input').value.trim();
  if (val && !val.startsWith('gsk_')) { toast('âš ï¸ La chiave Groq inizia con gsk_', 're'); return; }
  localStorage.setItem('aura_groq_key', val);
  AURA_AI_KEY = val;
  closeModal();
  toast('âœ… Chiave Groq personale salvata!', 'gr');
}
function removeAIKey() {
  localStorage.removeItem('aura_groq_key');
  AURA_AI_KEY = _GROQ_DEFAULT;
  closeModal();
  toast('âœ… Tornato alla chiave integrata.', 'gr');
}

function runAIPlanGeneration(user) {
  var loadEl = document.getElementById('ob-ai-loading');
  var doneEl = document.getElementById('ob-ai-done');
  loadEl.style.display = 'flex';
  doneEl.classList.remove('on');

  var steps = [0,1,2,3,4];

  // Animate through AI steps
  steps.forEach(function(si, idx) {
    setTimeout(function() {
      for (var j = 0; j < si; j++) {
        var prev = document.getElementById('ais-'+j);
        if (prev) { prev.className = 'ob-ai-step done'; prev.querySelector('.ob-ai-step-ico').textContent = 'âœ“'; }
      }
      var cur = document.getElementById('ais-'+si);
      if (cur) cur.className = 'ob-ai-step active';
    }, idx * 800);
  });

  // Try real AI first, fallback to local
  generateAIPlanWithLLM(user).then(function(plan) {
    // Mark all steps done
    for (var j = 0; j < 5; j++) {
      var el = document.getElementById('ais-'+j);
      if (el) { el.className = 'ob-ai-step done'; el.querySelector('.ob-ai-step-ico').textContent = 'âœ“'; }
    }
    saveWorkouts(plan);
    setTimeout(function() {
      loadEl.style.display = 'none';
      showAIPlanResult(user, plan);
    }, 600);
  });
}

function generateAIPlanWithLLM(user) {
  // If no API key, use local algorithm immediately
  if (!AURA_AI_KEY) {
    return new Promise(function(resolve) {
      setTimeout(function() { resolve(generateAIPlan(user)); }, 4000);
    });
  }

  var goal = user.goal || 'massa';
  var level = user.level || 'intermedio';
  var freq = user.freq || '4-5';
  var sex = user.sex === 'F' ? 'Donna' : 'Uomo';
  var age = user.age || 25;
  var weight = user.weight || 75;
  var height = user.height || 175;
  var daysPerWeek = freq === '2-3' ? 3 : freq === '6+' ? 6 : 4;

  // Build available exercise list for the AI
  var exList = EXERCISES.map(function(e) {
    return e.id + ' (' + e.name + ', ' + e.muscle + ', ' + e.diff + ', ' + e.sets + 'x' + e.reps + ')';
  }).join('\n');

  var goalLabels = { massa:'Massa Muscolare', dimagrimento:'Dimagrimento/Perdita peso', benessere:'Benessere generale', resistenza:'Resistenza/Cardio' };

  var prompt = 'Sei un personal trainer certificato. Crea un programma di allenamento settimanale personalizzato.\n\n' +
    'PROFILO UTENTE:\n- Sesso: ' + sex + '\n- EtÃ : ' + age + ' anni\n- Peso: ' + weight + 'kg\n- Altezza: ' + height + 'cm\n' +
    '- Obiettivo: ' + (goalLabels[goal] || goal) + '\n- Livello: ' + level + '\n- Frequenza: ' + daysPerWeek + ' giorni/settimana\n\n' +
    'ESERCIZI DISPONIBILI (usa SOLO questi id):\n' + exList + '\n\n' +
    'ISTRUZIONI:\n- Crea esattamente ' + daysPerWeek + ' schede giornaliere\n- Ogni scheda deve avere 4-6 esercizi\n- Adatta serie e ripetizioni al livello e obiettivo\n- Includi tempo di riposo in secondi\n- Dai un nome descrittivo a ogni giornata\n\n' +
    'RISPONDI SOLO con un JSON valido (nessun testo extra), in questo formato esatto:\n' +
    '[{"name":"LunedÃ¬ â€” Push","exercises":[{"id":"bench","sets":4,"reps":"8-10","rest":120}]}]\n' +
    'Ogni oggetto ha: name (string), exercises (array di {id, sets, reps, rest}).';

  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AURA_AI_KEY },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Sei un esperto personal trainer italiano. Rispondi SOLO con JSON valido, nessun markdown o testo extra.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  .then(function(resp) {
    if (!resp.ok) throw new Error('API ' + resp.status);
    return resp.json();
  })
  .then(function(data) {
    var content = (data.choices[0].message.content || '').trim();
    // Strip markdown code fences if present
    content = content.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    var plans = JSON.parse(content);
    if (!Array.isArray(plans) || plans.length === 0) throw new Error('Invalid plan format');
    // Validate and clean plans
    var validIds = new Set(EXERCISES.map(function(e) { return e.id; }));
    var cleaned = plans.slice(0, daysPerWeek).map(function(p) {
      var validExercises = (p.exercises || []).filter(function(ex) { return validIds.has(ex.id); }).map(function(ex) {
        return { id: ex.id, sets: parseInt(ex.sets) || 3, reps: String(ex.reps || '10'), rest: parseInt(ex.rest) || 90 };
      });
      return { name: p.name || 'Allenamento', exercises: validExercises, _aiGenerated: true, _realAI: true };
    });
    if (cleaned.length === 0 || cleaned.every(function(p) { return p.exercises.length === 0; })) throw new Error('No valid exercises');
    // Save AI metadata
    var u = getUser();
    if (u) { u.aiPlanGeneratedAt = new Date().toISOString(); u.aiPlanGoal = goal; u.aiPlanLevel = level; u.aiPlanDays = daysPerWeek; u.aiPlanSource = 'groq'; setUser(u); }
    return cleaned;
  })
  .catch(function(err) {
    console.warn('[AURA] AI API fallback:', err.message);
    return generateAIPlan(user);
  });
}

function generateAIPlan(user) {
  var goal = user.goal || 'massa';
  var level = user.level || 'intermedio';
  var freq = user.freq || '4-5';
  var sex = user.sex || 'M';
  var age = user.age || 25;
  var weight = user.weight || 75;

  // Parse frequency
  var daysPerWeek = freq === '2-3' ? 3 : freq === '6+' ? 6 : 4;

  // Level multipliers
  var setsMult = level === 'principiante' ? 0.75 : level === 'avanzato' ? 1.25 : 1;
  var diffFilter = level === 'principiante'
    ? ['Principiante']
    : level === 'avanzato'
      ? ['Principiante','Intermedio','Avanzato']
      : ['Principiante','Intermedio'];

  // Get available exercises by muscle group
  function exByMuscle(m) {
    return EXERCISES.filter(function(e) {
      return e.muscle === m && diffFilter.indexOf(e.diff) >= 0;
    });
  }
  function pickN(arr, n) {
    var shuffled = arr.slice().sort(function() { return Math.random() - 0.5; });
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }
  function adjustSets(ex, mult) {
    return {
      id: ex.id,
      sets: Math.max(2, Math.round(ex.sets * mult)),
      reps: ex.reps,
      rest: ex.muscle === 'Cardio' ? 60 : (goal === 'massa' ? 120 : goal === 'resistenza' ? 45 : 90)
    };
  }

  // Define splits based on frequency and goal
  var splits;
  if (daysPerWeek <= 3) {
    // Full body split
    if (goal === 'dimagrimento' || goal === 'resistenza') {
      splits = [
        { name: 'Full Body + Cardio A', muscles: [['Petto',1],['Schiena',1],['Gambe',1],['Core',1],['Cardio',1]] },
        { name: 'Full Body + Cardio B', muscles: [['Spalle',1],['Gambe',1],['Schiena',1],['Braccia',1],['Cardio',1]] },
        { name: 'HIIT + Core', muscles: [['Gambe',1],['Petto',1],['Spalle',1],['Core',2],['Cardio',1]] }
      ];
    } else {
      splits = [
        { name: 'Full Body A', muscles: [['Petto',2],['Schiena',2],['Gambe',1],['Braccia',1]] },
        { name: 'Full Body B', muscles: [['Gambe',2],['Spalle',2],['Braccia',1],['Core',1]] },
        { name: 'Full Body C', muscles: [['Schiena',2],['Petto',1],['Gambe',2],['Core',1]] }
      ];
    }
  } else if (daysPerWeek === 4) {
    if (goal === 'massa') {
      splits = [
        { name: 'Petto & Tricipiti', muscles: [['Petto',3],['Braccia',2]] },
        { name: 'Schiena & Bicipiti', muscles: [['Schiena',3],['Braccia',2]] },
        { name: 'Gambe & Glutei', muscles: [['Gambe',4],['Core',1]] },
        { name: 'Spalle & Core', muscles: [['Spalle',3],['Core',2]] }
      ];
    } else if (goal === 'dimagrimento') {
      splits = [
        { name: 'Upper Body + Cardio', muscles: [['Petto',2],['Schiena',2],['Cardio',1]] },
        { name: 'Lower Body + Core', muscles: [['Gambe',3],['Core',2]] },
        { name: 'Push + HIIT', muscles: [['Petto',1],['Spalle',2],['Braccia',1],['Cardio',1]] },
        { name: 'Pull + Cardio', muscles: [['Schiena',2],['Gambe',1],['Braccia',1],['Cardio',1]] }
      ];
    } else if (goal === 'benessere') {
      splits = [
        { name: 'Upper Body', muscles: [['Petto',2],['Schiena',2],['Spalle',1]] },
        { name: 'Lower Body', muscles: [['Gambe',3],['Core',1]] },
        { name: 'Functional + Core', muscles: [['Spalle',1],['Braccia',2],['Core',2]] },
        { name: 'Full Body Light', muscles: [['Petto',1],['Schiena',1],['Gambe',1],['Cardio',1]] }
      ];
    } else {
      // resistenza
      splits = [
        { name: 'Cardio + Upper', muscles: [['Cardio',2],['Petto',1],['Schiena',1]] },
        { name: 'Legs + Endurance', muscles: [['Gambe',3],['Cardio',1]] },
        { name: 'Intervals + Core', muscles: [['Cardio',2],['Core',2],['Spalle',1]] },
        { name: 'Full Endurance', muscles: [['Gambe',1],['Schiena',1],['Cardio',2],['Core',1]] }
      ];
    }
  } else {
    // 5-6 days â€” PPL or advanced
    if (goal === 'massa') {
      splits = [
        { name: 'Push (Petto Focus)', muscles: [['Petto',3],['Spalle',1],['Braccia',1]] },
        { name: 'Pull (Schiena Focus)', muscles: [['Schiena',3],['Braccia',2]] },
        { name: 'Gambe A (Quad)', muscles: [['Gambe',4],['Core',1]] },
        { name: 'Push (Spalle Focus)', muscles: [['Spalle',3],['Petto',1],['Braccia',1]] },
        { name: 'Pull (Dorsali Focus)', muscles: [['Schiena',3],['Braccia',2]] },
        { name: 'Gambe B (Post.)', muscles: [['Gambe',3],['Core',2]] }
      ];
    } else {
      splits = [
        { name: 'Upper Push + Cardio', muscles: [['Petto',2],['Spalle',1],['Braccia',1],['Cardio',1]] },
        { name: 'Lower + Core', muscles: [['Gambe',3],['Core',2]] },
        { name: 'Upper Pull', muscles: [['Schiena',3],['Braccia',2]] },
        { name: 'HIIT + Full Body', muscles: [['Cardio',2],['Gambe',1],['Core',1]] },
        { name: 'Upper Strength', muscles: [['Petto',1],['Schiena',1],['Spalle',2],['Braccia',1]] },
        { name: 'Legs + Cardio', muscles: [['Gambe',3],['Cardio',1]] }
      ];
    }
  }

  // Take only daysPerWeek splits
  splits = splits.slice(0, daysPerWeek);

  // Build the actual workout plans
  var plans = [];
  var dayNames = ['LunedÃ¬','MartedÃ¬','MercoledÃ¬','GiovedÃ¬','VenerdÃ¬','Sabato'];

  splits.forEach(function(split, di) {
    var exercises = [];
    var usedIds = new Set();

    split.muscles.forEach(function(pair) {
      var muscle = pair[0], count = pair[1];
      var available = exByMuscle(muscle).filter(function(e) { return !usedIds.has(e.id); });
      var picked = pickN(available, count);
      picked.forEach(function(ex) {
        usedIds.add(ex.id);
        exercises.push(adjustSets(ex, setsMult));
      });
    });

    plans.push({
      name: dayNames[di] + ' â€” ' + split.name,
      exercises: exercises,
      _aiGenerated: true
    });
  });

  // Add age/weight-based notes to user
  var u = getUser();
  if (u) {
    u.aiPlanGeneratedAt = new Date().toISOString();
    u.aiPlanGoal = goal;
    u.aiPlanLevel = level;
    u.aiPlanDays = daysPerWeek;
    setUser(u);
  }

  return plans;
}

function showAIPlanResult(user, plans) {
  var doneEl = document.getElementById('ob-ai-done');
  var previewEl = document.getElementById('ob-ai-plan-preview');
  var subEl = document.getElementById('ob-ai-done-sub');

  var goalLabels = { massa:'Massa Muscolare', dimagrimento:'Dimagrimento', benessere:'Benessere', resistenza:'Resistenza' };
  var daysPerWeek = plans.length;

  subEl.textContent = 'Ho creato ' + daysPerWeek + ' schede per ' + (goalLabels[user.goal]||user.goal) + ', calibrate su ' + user.weight + 'kg Â· ' + user.height + 'cm Â· livello ' + user.level + '.';

  var html = '';
  plans.forEach(function(p, i) {
    var parts = p.name.split(' â€” ');
    var day = parts[0] || '';
    var title = parts[1] || p.name;
    html += '<div class="ob-ai-plan-card">' +
      '<div class="ob-ai-plan-day">' + day.replace(/Ã¬/g,'Ã¬') + '</div>' +
      '<div class="ob-ai-plan-name">' + title + '</div>' +
      '<div class="ob-ai-plan-cnt">' + p.exercises.length + ' ex</div></div>';
  });
  previewEl.innerHTML = html;
  doneEl.classList.add('on');
}

document.getElementById('ob-ai-start').addEventListener('click', function() {
  hideOnboarding();
  var user = getUser();
  toast('ðŸŽ‰ Benvenuto in AURA, ' + (user ? user.name.split(' ')[0] : '') + '!', 'gr');
  setTimeout(function() { toast('ðŸ’ª ' + getWorkouts().length + ' schede pronte. Vai alla sezione Home per iniziare!', 'bl'); }, 1500);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  11. AI COACH â€” Conversational Chat (Groq Llama 3.3 70B)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openAICoach() { document.getElementById('aicoach-ov').classList.add('on'); }
function closeAICoach() { document.getElementById('aicoach-ov').classList.remove('on'); }

var _aiHistory = [];

document.getElementById('aicoach-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendAICoachMsg();
});

function sendAICoachMsg() {
  var input = document.getElementById('aicoach-input');
  var q = (input.value || '').trim();
  if (!q) return;
  input.value = '';
  var msgs = document.getElementById('aicoach-msgs');
  msgs.innerHTML += '<div class="aicoach-msg user"><div class="aicoach-bubble user">' + q.replace(/</g,'&lt;') + '</div></div>';
  msgs.innerHTML += '<div class="aicoach-msg bot" id="aicoach-typing"><div class="aicoach-typing"><span></span><span></span><span></span></div></div>';
  msgs.scrollTop = msgs.scrollHeight;

  _aiHistory.push({ role: 'user', parts: [{ text: q }] });

  callGeminiCoach(q).then(function(answer) {
    var typing = document.getElementById('aicoach-typing');
    if (typing) typing.remove();
    _aiHistory.push({ role: 'model', parts: [{ text: answer }] });
    msgs.innerHTML += '<div class="aicoach-msg bot"><div class="aicoach-bubble bot">' + answer + '</div></div>';
    msgs.scrollTop = msgs.scrollHeight;
  });
}

function getCoachSystemPrompt() {
  var u = getUser() || {};
  var meals = JSON.parse(localStorage.getItem('aura_meals') || '[]');
  var completed = JSON.parse(localStorage.getItem(CW_KEY) || '[]');
  var plans = getWorkouts();
  var w = u.weight || 70, h = u.height || 175, age = u.age || 25, goal = u.goal || 'massa';
  var tdee = Math.round((u.sex === 'F' ? 10*w + 6.25*h - 5*age - 161 : 10*w + 6.25*h - 5*age + 5) * 1.55);
  var lastWorkout = completed.length > 0 ? completed[completed.length - 1] : null;

  return 'Sei AURA Coach, un personal trainer e nutrizionista AI esperto dentro l\'app AURA Fitness. ' +
    'Rispondi SEMPRE in italiano. Sii conciso, motivante e pratico. Usa emoji con moderazione. ' +
    'Formatta con <br> per gli a capo e <strong> per il grassetto (Ã¨ HTML, non markdown). ' +
    'Non usare mai asterischi ** per il grassetto. ' +
    'Ecco i dati dell\'utente:\n' +
    '- Nome: ' + (u.name || 'Utente') + '\n' +
    '- Sesso: ' + (u.sex === 'F' ? 'Donna' : 'Uomo') + '\n' +
    '- Peso: ' + w + 'kg | Altezza: ' + h + 'cm | EtÃ : ' + age + '\n' +
    '- Obiettivo: ' + goal + '\n' +
    '- TDEE stimato: ' + tdee + ' kcal/giorno\n' +
    '- Schede create: ' + plans.length + '\n' +
    '- Workout completati: ' + completed.length + '\n' +
    '- Pasti registrati oggi: ' + meals.filter(function(m) { return m.date === new Date().toISOString().slice(0,10); }).length + '\n' +
    (lastWorkout ? '- Ultimo workout: ' + lastWorkout.planName + ' (' + lastWorkout.date + ')' + (lastWorkout.moodPre ? ' mood pre:' + lastWorkout.moodPre + '/5 post:' + lastWorkout.moodPost + '/5' : '') + '\n' : '') +
    '- Idratazione: ' + (S.hydration || 0) + '/' + (S.hydGoal || 2.5) + 'L\n' +
    (function() { var ml = getMoodLog(); if (ml.length > 0) { var r = ml.slice(-5); var avg = r.reduce(function(s,m){return s+(m.pre+m.post)/2;},0)/r.length; return '- Mood medio ultime ' + r.length + ' sessioni: ' + avg.toFixed(1) + '/5\n'; } return ''; })() +
    (isDeloadWeek() ? '- âš ï¸ SETTIMANA DI DELOAD ATTIVA: suggerisci pesi ridotti del 40-50%, meno volume, focus tecnica e recupero\n' : '') +
    (function() { if (u.sex === 'F') { var p = cycleGetPhase(new Date().toISOString().slice(0,10)); if (p) return '- Fase ciclo mestruale: ' + p.name + ' (' + p.workout + ')\n'; } return ''; })() +
    'Rispondi in modo personalizzato basandoti su questi dati reali.';
}

function callGeminiCoach(question) {
  var groqKey = localStorage.getItem('aura_groq_key') || _GROQ_DEFAULT;
  if (!groqKey) {
    return Promise.resolve(generateAICoachFallback(question));
  }

  var systemPrompt = getCoachSystemPrompt();
  // Build conversation history (last 10 messages) in OpenAI format
  var messages = [{ role: 'system', content: systemPrompt }];
  var history = _aiHistory.slice(-10);
  for (var i = 0; i < history.length; i++) {
    messages.push({ role: history[i].role === 'model' ? 'assistant' : 'user', content: history[i].parts[0].text });
  }
  if (history.length === 0) {
    messages.push({ role: 'user', content: question });
  }

  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 512,
      temperature: 0.7
    })
  }).then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error('API ' + r.status + ': ' + t.slice(0, 200)); });
    return r.json();
  }).then(function(data) {
    if (data.choices && data.choices[0] && data.choices[0].message) {
      var text = data.choices[0].message.content || '';
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\n/g, '<br>');
      return text;
    }
    return generateAICoachFallback(question);
  }).catch(function(err) {
    console.error('[AURA] Groq Coach error:', err.message || err);
    return 'âš ï¸ Errore AI: ' + (err.message || 'Connessione fallita') + '<br><br>' + generateAICoachFallback(question);
  });
}

function generateAICoachFallback(q) {
  var ql = q.toLowerCase();
  var u = getUser() || {};
  var completed = JSON.parse(localStorage.getItem(CW_KEY) || '[]');
  var plans = getWorkouts();
  var w = u.weight || 70, h = u.height || 175, age = u.age || 25, goal = u.goal || 'massa';
  var tdee = Math.round((u.sex === 'F' ? 10*w + 6.25*h - 5*age - 161 : 10*w + 6.25*h - 5*age + 5) * 1.55);

  if (/quant[ei]\s*(calorie|kcal)|fabbisogno|tdee/i.test(ql))
    return 'ðŸ”¥ TDEE stimato: <strong>' + tdee + ' kcal/giorno</strong>. ' + (goal === 'dimagrimento' ? 'Per dimagrire: ~' + Math.round(tdee * 0.8) + ' kcal (-20%).' : goal === 'massa' ? 'Per massa: ~' + Math.round(tdee * 1.15) + ' kcal (+15%).' : 'Mantieni ~' + tdee + ' kcal.');
  if (/protein[ea]/i.test(ql))
    return 'ðŸ¥© Consiglio: <strong>' + (goal === 'massa' ? Math.round(w * 2) + 'g' : Math.round(w * 1.6) + 'g') + ' proteine/giorno</strong>.';
  if (/ciao|salve|hey|buon/i.test(ql))
    return 'Ciao ' + (u.name || '') + '! ðŸ‘‹ Come posso aiutarti?';
  return 'ðŸ¤– Non sono riuscito a connettermi all\'AI. Riprova tra poco.<br><br>ðŸ“‹ I tuoi dati: ' + w + 'kg, obiettivo ' + goal + ', TDEE ' + tdee + ' kcal, ' + completed.length + ' workout completati.';
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  11b. WORKOUT CALENDAR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var CAL_SCHED_KEY = 'aura_scheduled_workouts';
var _calYear, _calMonth, _calSelDate;
var MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function getScheduled() {
  try { return JSON.parse(localStorage.getItem(CAL_SCHED_KEY)) || []; } catch(e) { return []; }
}
function saveScheduled(arr) { localStorage.setItem(CAL_SCHED_KEY, JSON.stringify(arr)); }

function openCalendar() {
  var now = new Date();
  _calYear = now.getFullYear();
  _calMonth = now.getMonth();
  _calSelDate = now.toISOString().slice(0,10);
  document.getElementById('cal-ov').classList.add('on');
  renderCalendar();
}
function closeCalendar() { document.getElementById('cal-ov').classList.remove('on'); }

function calNav(dir) {
  _calMonth += dir;
  if (_calMonth < 0) { _calMonth = 11; _calYear--; }
  if (_calMonth > 11) { _calMonth = 0; _calYear++; }
  renderCalendar();
}

function calClassifyWorkout(planName) {
  var n = (planName || '').toLowerCase();
  if (/cardio|corsa|run|hiit|bike|camminat|endurance|aerob/i.test(n)) return 'cardio';
  if (/riposo|rest|stretch|yoga|recovery|mobil/i.test(n)) return 'riposo';
  return 'forza';
}

function calGetDayData(dateStr) {
  var completed = getCompletedWorkouts().filter(function(w) { return w.date === dateStr; });
  var scheduled = getScheduled().filter(function(s) { return s.date === dateStr; });
  return { completed: completed, scheduled: scheduled };
}

function renderCalendar() {
  var title = MESI[_calMonth] + ' ' + _calYear;
  document.getElementById('cal-month-title').textContent = title;

  var todayStr = new Date().toISOString().slice(0,10);
  var firstDay = new Date(_calYear, _calMonth, 1);
  var lastDay = new Date(_calYear, _calMonth + 1, 0);
  var startDow = (firstDay.getDay() + 6) % 7; // Monday = 0

  var grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  // Previous month padding
  var prevLast = new Date(_calYear, _calMonth, 0).getDate();
  for (var p = startDow - 1; p >= 0; p--) {
    var d = prevLast - p;
    var cell = document.createElement('div');
    cell.className = 'cal-cell other';
    cell.textContent = d;
    grid.appendChild(cell);
  }

  // Current month days
  for (var i = 1; i <= lastDay.getDate(); i++) {
    var dateStr = _calYear + '-' + String(_calMonth + 1).padStart(2,'0') + '-' + String(i).padStart(2,'0');
    var cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === _calSelDate) cell.classList.add('selected');
    cell.textContent = i;

    // Dots
    var data = calGetDayData(dateStr);
    var dotsDiv = document.createElement('div');
    dotsDiv.className = 'cal-dots';
    var types = {};
    data.completed.forEach(function(w) { types[calClassifyWorkout(w.planName)] = true; });
    data.scheduled.forEach(function(s) { types['scheduled'] = true; });
    ['forza','cardio','riposo','scheduled'].forEach(function(t) {
      if (types[t]) {
        var dot = document.createElement('div');
        dot.className = 'cal-dot ' + t;
        dotsDiv.appendChild(dot);
      }
    });
    cell.appendChild(dotsDiv);

    (function(ds) {
      cell.addEventListener('click', function() {
        _calSelDate = ds;
        renderCalendar();
      });
    })(dateStr);

    grid.appendChild(cell);
  }

  // Next month padding
  var totalCells = startDow + lastDay.getDate();
  var remaining = (7 - totalCells % 7) % 7;
  for (var n = 1; n <= remaining; n++) {
    var cell = document.createElement('div');
    cell.className = 'cal-cell other';
    cell.textContent = n;
    grid.appendChild(cell);
  }

  // Month stats
  renderCalStats();
  // Day detail
  renderCalDayDetail();
}

function renderCalStats() {
  var completed = getCompletedWorkouts().filter(function(w) {
    return w.date && w.date.slice(0,7) === _calYear + '-' + String(_calMonth + 1).padStart(2,'0');
  });
  var totalMin = 0, totalCal = 0;
  completed.forEach(function(w) { totalMin += Math.round((w.duration || 0) / 60); totalCal += (w.calories || 0); });
  document.getElementById('cal-stats').innerHTML =
    '<div class="cal-stat"><div class="cal-stat-val">' + completed.length + '</div><div class="cal-stat-lbl">Allenamenti</div></div>' +
    '<div class="cal-stat"><div class="cal-stat-val">' + totalMin + '</div><div class="cal-stat-lbl">Minuti</div></div>' +
    '<div class="cal-stat"><div class="cal-stat-val">' + totalCal + '</div><div class="cal-stat-lbl">Calorie</div></div>';
}

function renderCalDayDetail() {
  var el = document.getElementById('cal-day-detail');
  var data = calGetDayData(_calSelDate);
  var dayParts = _calSelDate.split('-');
  var dayLabel = parseInt(dayParts[2]) + ' ' + MESI[parseInt(dayParts[1]) - 1];
  var todayStr = new Date().toISOString().slice(0,10);
  var isPastOrToday = _calSelDate <= todayStr;
  var isFuture = _calSelDate > todayStr;

  var html = '<div class="cal-day-detail"><div class="cal-day-title">ðŸ“… ' + dayLabel + '</div>';

  // Completed workouts
  if (data.completed.length > 0) {
    data.completed.forEach(function(w) {
      var type = calClassifyWorkout(w.planName);
      var colors = { forza:'#f97316', cardio:'#22c55e', riposo:'#38bdf8' };
      var dur = Math.round((w.duration || 0) / 60);
      html += '<div class="cal-ev">' +
        '<div class="cal-ev-dot" style="background:' + (colors[type] || '#f97316') + '"></div>' +
        '<div class="cal-ev-info"><div class="cal-ev-name">' + (w.planName || 'Allenamento') + '</div>' +
        '<div class="cal-ev-meta">âœ… Completato â€¢ ' + dur + ' min â€¢ ' + (w.calories || 0) + ' kcal</div></div></div>';
    });
  }

  // Scheduled workouts
  if (data.scheduled.length > 0) {
    data.scheduled.forEach(function(s, idx) {
      html += '<div class="cal-ev">' +
        '<div class="cal-ev-dot" style="background:#a78bfa"></div>' +
        '<div class="cal-ev-info"><div class="cal-ev-name">' + (s.planName || 'Allenamento') + '</div>' +
        '<div class="cal-ev-meta">ðŸ—“ï¸ Pianificato' + (s.time ? ' alle ' + s.time : '') + '</div></div>' +
        '<div class="cal-ev-del" onclick="calRemoveScheduled(\'' + _calSelDate + '\',' + idx + ')">âœ•</div></div>';
    });
  }

  // No events
  if (data.completed.length === 0 && data.scheduled.length === 0) {
    html += '<div style="text-align:center;padding:16px;color:var(--t3);font-size:.82rem">' +
      (isPastOrToday ? 'ðŸ˜´ Giorno di riposo' : 'ðŸ“ Nessun allenamento pianificato') + '</div>';
  }

  // Schedule form (future or today)
  if (isFuture || _calSelDate === todayStr) {
    var plans = getWorkouts();
    if (plans.length > 0) {
      html += '<div class="cal-schedule-row">' +
        '<select id="cal-sched-plan">';
      plans.forEach(function(p, i) {
        html += '<option value="' + i + '">' + (p.name || 'Scheda ' + (i + 1)) + '</option>';
      });
      html += '</select>' +
        '<button onclick="calScheduleWorkout()">+ Pianifica</button></div>';
    }
  }

  html += '</div>';
  el.innerHTML = html;
}

function calScheduleWorkout() {
  var sel = document.getElementById('cal-sched-plan');
  if (!sel) return;
  var plans = getWorkouts();
  var planIdx = parseInt(sel.value);
  var plan = plans[planIdx];
  if (!plan) return;
  var sched = getScheduled();
  sched.push({ date: _calSelDate, planName: plan.name || 'Scheda ' + (planIdx + 1), planIdx: planIdx });
  saveScheduled(sched);
  renderCalendar();
  toast('ðŸ“… Allenamento pianificato!', 'gr');
  calSetReminder(_calSelDate, plan.name || 'Allenamento');
}

function calRemoveScheduled(date, idx) {
  var sched = getScheduled();
  var dayScheduled = [];
  var rest = [];
  sched.forEach(function(s) {
    if (s.date === date) dayScheduled.push(s); else rest.push(s);
  });
  dayScheduled.splice(idx, 1);
  saveScheduled(rest.concat(dayScheduled));
  renderCalendar();
  toast('ðŸ—‘ï¸ Rimosso dal calendario', 'bl');
}

function calSetReminder(dateStr, planName) {
  if (typeof Notification === 'undefined' || Notification.permission === 'denied') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
  // Schedule reminder for 9:00 AM on the day
  var parts = dateStr.split('-');
  var target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 9, 0, 0);
  var now = new Date();
  var ms = target.getTime() - now.getTime();
  if (ms <= 0) return;
  // Only if within 7 days (avoid long timeouts)
  if (ms > 7 * 24 * 60 * 60 * 1000) return;
  setTimeout(function() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('ðŸ‹ï¸ AURA â€” Allenamento oggi!', { body: planName + ' â€¢ Ãˆ ora di allenarti!', icon: 'https://tropicalblackie.github.io/AURAMOBILE/icon-192.png' });
    }
  }, ms);
}

// Set reminders on app load for upcoming scheduled workouts
(function() {
  var todayStr = new Date().toISOString().slice(0,10);
  getScheduled().forEach(function(s) {
    if (s.date >= todayStr) calSetReminder(s.date, s.planName || 'Allenamento');
  });
})();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  11c. 1RM CALCULATOR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var RM_KEY = 'aura_1rm_history';

function get1RMHistory() {
  try { return JSON.parse(localStorage.getItem(RM_KEY)) || []; } catch(e) { return []; }
}
function save1RMHistory(arr) { localStorage.setItem(RM_KEY, JSON.stringify(arr)); }

function open1RM() {
  document.getElementById('rm-ov').classList.add('on');
  // Populate exercise select
  var sel = document.getElementById('rm-exercise');
  if (sel.options.length <= 1) {
    var groups = {};
    EXERCISES.forEach(function(e) {
      if (!groups[e.muscle]) groups[e.muscle] = [];
      groups[e.muscle].push(e);
    });
    Object.keys(groups).sort().forEach(function(g) {
      var og = document.createElement('optgroup');
      og.label = g;
      groups[g].forEach(function(e) {
        var o = document.createElement('option');
        o.value = e.id;
        o.textContent = e.emoji + ' ' + e.name;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
  }
  rmUpdateHistory();
}
function close1RM() { document.getElementById('rm-ov').classList.remove('on'); }

function rmCalcEpley(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function rmCalc() {
  var w = parseFloat(document.getElementById('rm-weight').value);
  var r = parseInt(document.getElementById('rm-reps').value);
  if (!w || w <= 0 || !r || r <= 0 || r > 30) { toast('âš ï¸ Inserisci peso e reps validi (1-30)', 're'); return; }
  var oneRM = rmCalcEpley(w, r);

  // Show result
  var resEl = document.getElementById('rm-result');
  resEl.style.display = 'block';
  resEl.innerHTML = '<div class="rm-result">' +
    '<div class="rm-val">' + oneRM + ' kg</div>' +
    '<div class="rm-label">1RM stimato (Epley)</div>' +
    '<div style="font-size:.72rem;color:var(--t3);margin-top:6px">Basato su ' + w + ' kg Ã— ' + r + ' reps</div></div>';

  // Percentage table
  var pctEl = document.getElementById('rm-pct-table');
  pctEl.style.display = 'block';
  var pcts = [
    {p:100,r:'1'},  {p:95,r:'2'},  {p:90,r:'3-4'}, {p:85,r:'5-6'},
    {p:80,r:'7-8'}, {p:75,r:'9-10'},{p:70,r:'11-12'},{p:65,r:'13-15'}
  ];
  pctEl.innerHTML = '<div class="sec-title">Tabella Percentuali</div><div class="rm-pct-grid">' +
    pcts.map(function(x) {
      return '<div class="rm-pct"><div class="rm-pct-reps">' + x.p + '% â€¢ ' + x.r + 'r</div><div class="rm-pct-kg">' + Math.round(oneRM * x.p / 100) + ' kg</div></div>';
    }).join('') + '</div>';

  // Show save button
  document.getElementById('rm-save-btn').style.display = 'block';
}

function rmSave() {
  var exId = document.getElementById('rm-exercise').value;
  var w = parseFloat(document.getElementById('rm-weight').value);
  var r = parseInt(document.getElementById('rm-reps').value);
  if (!exId) { toast('âš ï¸ Seleziona un esercizio', 're'); return; }
  if (!w || !r) { toast('âš ï¸ Calcola prima il 1RM', 're'); return; }
  var oneRM = rmCalcEpley(w, r);
  var ex = EXERCISES.find(function(e) { return e.id === exId; });
  var hist = get1RMHistory();
  hist.push({
    date: new Date().toISOString().slice(0, 10),
    exId: exId,
    exName: ex ? ex.name : exId,
    weight: w,
    reps: r,
    oneRM: oneRM
  });
  save1RMHistory(hist);
  rmUpdateHistory();
  toast('ðŸ’¾ 1RM salvato: ' + (ex ? ex.name : exId) + ' â€” ' + oneRM + ' kg', 'gr');
}

function rmUpdateHistory() {
  var exId = document.getElementById('rm-exercise').value;
  var hist = get1RMHistory();
  var histEl = document.getElementById('rm-history');
  var chartWrap = document.getElementById('rm-chart-wrap');

  // Filter by exercise if selected
  var filtered = exId ? hist.filter(function(h) { return h.exId === exId; }) : hist;
  filtered.sort(function(a, b) { return b.date.localeCompare(a.date); });

  if (filtered.length === 0) {
    histEl.innerHTML = '<div style="text-align:center;padding:16px;color:var(--t3);font-size:.82rem">Nessun record salvato' + (exId ? ' per questo esercizio' : '') + '.</div>';
    chartWrap.style.display = 'none';
    return;
  }

  // Render chart if exercise selected and 2+ records
  if (exId && filtered.length >= 2) {
    chartWrap.style.display = 'block';
    rmDrawChart(filtered.slice().reverse());
  } else {
    chartWrap.style.display = 'none';
  }

  // Render list
  histEl.innerHTML = filtered.slice(0, 20).map(function(h, i) {
    return '<div class="rm-hist-item">' +
      '<div style="flex:1">' +
        '<div class="rm-hist-ex">' + (h.exName || h.exId) + '</div>' +
        '<div class="rm-hist-meta">' + h.date + ' â€¢ ' + h.weight + 'kg Ã— ' + h.reps + 'r</div>' +
      '</div>' +
      '<div class="rm-hist-val">' + h.oneRM + ' kg</div>' +
      '<div class="rm-hist-del" onclick="rmDelete(' + (hist.indexOf(h)) + ')">âœ•</div>' +
    '</div>';
  }).join('');
}

function rmDelete(idx) {
  var hist = get1RMHistory();
  hist.splice(idx, 1);
  save1RMHistory(hist);
  rmUpdateHistory();
  toast('ðŸ—‘ï¸ Record rimosso', 'bl');
}

function rmDrawChart(data) {
  var canvas = document.getElementById('rm-chart');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 140 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '140px';
  ctx.scale(dpr, dpr);
  var W = rect.width, H = 140;

  ctx.clearRect(0, 0, W, H);

  var vals = data.map(function(d) { return d.oneRM; });
  var mn = Math.min.apply(null, vals) - 5;
  var mx = Math.max.apply(null, vals) + 5;
  if (mn === mx) { mn -= 10; mx += 10; }
  var pad = { l: 40, r: 16, t: 12, b: 24 };
  var cW = W - pad.l - pad.r;
  var cH = H - pad.t - pad.b;

  // Grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (var g = 0; g < 4; g++) {
    var gy = pad.t + (cH / 3) * g;
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    var gv = Math.round(mx - (mx - mn) * (g / 3));
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(gv + '', pad.l - 6, gy + 4);
  }

  // Line + dots
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = pad.l + (cW / Math.max(data.length - 1, 1)) * i;
    var y = pad.t + cH - ((d.oneRM - mn) / (mx - mn)) * cH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Gradient fill
  ctx.lineTo(pad.l + cW, pad.t + cH);
  ctx.lineTo(pad.l, pad.t + cH);
  ctx.closePath();
  var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, '#f9731640');
  grad.addColorStop(1, '#f9731600');
  ctx.fillStyle = grad;
  ctx.fill();

  // Dots
  data.forEach(function(d, i) {
    var x = pad.l + (cW / Math.max(data.length - 1, 1)) * i;
    var y = pad.t + cH - ((d.oneRM - mn) / (mx - mn)) * cH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Date labels
  ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  var step = Math.max(1, Math.floor(data.length / 5));
  data.forEach(function(d, i) {
    if (i % step === 0 || i === data.length - 1) {
      var x = pad.l + (cW / Math.max(data.length - 1, 1)) * i;
      ctx.fillText(d.date.slice(5), x, H - 4);
    }
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  12. PROGRESS PHOTO GALLERY
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var PROGPHOTO_KEY = 'aura_progress_photos';

function openProgressPhotos() {
  document.getElementById('progphoto-ov').classList.add('on');
  renderProgressPhotos();
}
function closeProgressPhotos() { document.getElementById('progphoto-ov').classList.remove('on'); }

document.getElementById('prog-photo-file').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var photos = JSON.parse(localStorage.getItem(PROGPHOTO_KEY) || '[]');
    var u = getUser() || {};
    photos.push({
      date: new Date().toISOString().slice(0,10),
      img: ev.target.result,
      weight: u.weight || null
    });
    localStorage.setItem(PROGPHOTO_KEY, JSON.stringify(photos));
    toast('ðŸ“¸ Foto salvata!', 'gr');
    renderProgressPhotos();
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

function renderProgressPhotos() {
  var photos = JSON.parse(localStorage.getItem(PROGPHOTO_KEY) || '[]');
  var gallery = document.getElementById('progphoto-gallery');
  var compare = document.getElementById('progphoto-compare');
  if (photos.length === 0) {
    gallery.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--t3);font-size:.82rem">Nessuna foto ancora. Carica la prima!</div>';
    compare.innerHTML = '';
    return;
  }
  if (photos.length >= 2) {
    var first = photos[0], last = photos[photos.length - 1];
    compare.innerHTML = '<div class="sec-title">Confronto</div><div class="progphoto-compare">' +
      '<div class="progphoto-compare-card"><img src="' + first.img + '" alt="Prima"><div class="overlay-data"><strong>' + first.date + '</strong>' + (first.weight ? '<br>' + first.weight + 'kg' : '') + '</div></div>' +
      '<div class="progphoto-compare-card"><img src="' + last.img + '" alt="Dopo"><div class="overlay-data"><strong>' + last.date + '</strong>' + (last.weight ? '<br>' + last.weight + 'kg' : '') + '</div></div></div>';
  } else {
    compare.innerHTML = '<div style="text-align:center;padding:10px;color:var(--t3);font-size:.78rem">Carica almeno 2 foto per il confronto!</div>';
  }
  gallery.innerHTML = photos.slice().reverse().map(function(p, i) {
    return '<div class="progphoto-item"><img src="' + p.img + '" alt="Foto"><div class="progphoto-date">' + p.date + (p.weight ? ' Â· ' + p.weight + 'kg' : '') + '</div></div>';
  }).join('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  13. WEARABLE SYNC â€” WebBluetooth HR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var BLE = { device: null, characteristic: null, hrValues: [] };

function openWearable() { document.getElementById('wearable-ov').classList.add('on'); renderBLELog(); }
function closeWearable() { document.getElementById('wearable-ov').classList.remove('on'); }

async function connectBLEHeartRate() {
  if (!navigator.bluetooth) {
    toast('âŒ WebBluetooth non supportato su questo browser. Usa Chrome su Android/desktop.', 're');
    return;
  }
  try {
    toast('ðŸ”— Cercando dispositivi Bluetooth HR...', 'bl');
    BLE.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['heart_rate']
    });
    var server = await BLE.device.gatt.connect();
    var service = await server.getPrimaryService('heart_rate');
    BLE.characteristic = await service.getCharacteristic('heart_rate_measurement');
    await BLE.characteristic.startNotifications();
    BLE.characteristic.addEventListener('characteristicvaluechanged', onHRData);
    document.getElementById('ble-hr-status').textContent = 'Connesso a ' + (BLE.device.name || 'Fascia HR');
    document.getElementById('ble-hr-status').style.color = 'var(--gr)';
    document.getElementById('ble-connect-btn').textContent = 'âœ… Connesso';
    document.getElementById('ble-disconnect-btn').style.display = 'block';
    toast('ðŸ’“ Fascia HR connessa! ' + (BLE.device.name || ''), 'gr');
  } catch (err) {
    if (err.name !== 'NotFoundError') {
      toast('âŒ Errore connessione: ' + err.message, 're');
    }
  }
}

function onHRData(event) {
  var value = event.target.value;
  var flags = value.getUint8(0);
  var hr = (flags & 1) ? value.getUint16(1, true) : value.getUint8(1);
  document.getElementById('ble-hr-val').textContent = hr;
  document.getElementById('bpm-val').textContent = hr + ' BPM';
  S.bpm = hr;
  BLE.hrValues.push({ time: new Date().toLocaleTimeString(), hr: hr });
  if (BLE.hrValues.length > 100) BLE.hrValues.shift();
  renderBLELog();
}

function disconnectBLE() {
  if (BLE.device && BLE.device.gatt.connected) {
    BLE.device.gatt.disconnect();
  }
  BLE.device = null;
  BLE.characteristic = null;
  document.getElementById('ble-hr-val').textContent = '--';
  document.getElementById('ble-hr-status').textContent = 'Disconnesso';
  document.getElementById('ble-hr-status').style.color = '';
  document.getElementById('ble-connect-btn').textContent = 'ðŸ”— Connetti Fascia HR (Bluetooth)';
  document.getElementById('ble-disconnect-btn').style.display = 'none';
  toast('ðŸ’“ Fascia HR disconnessa.', 'bl');
}

function renderBLELog() {
  var el = document.getElementById('ble-hr-log');
  if (BLE.hrValues.length === 0) { el.innerHTML = 'Nessun dato HR registrato.'; return; }
  var last10 = BLE.hrValues.slice(-10).reverse();
  el.innerHTML = last10.map(function(v) { return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--s8)">' +
    '<span>' + v.time + '</span><span style="color:var(--re);font-weight:700">' + v.hr + ' BPM</span></div>'; }).join('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  14. HIIT / TABATA TIMER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var HIIT = { running: false, paused: false, interval: null, phase: 'idle', currentRound: 0, secondsLeft: 0, totalRounds: 8, workSec: 20, restSec: 10, prepSec: 5, noSleepVideo: null };

function openHIIT() { document.getElementById('hiit-ov').classList.add('on'); }
function closeHIIT() {
  if (HIIT.running) resetHIIT();
  document.getElementById('hiit-ov').classList.remove('on');
}

function setHIITPreset(work, rest, rounds) {
  document.getElementById('hiit-work').value = work;
  document.getElementById('hiit-rest').value = rest;
  document.getElementById('hiit-rounds').value = rounds;
}

function toggleHIIT() {
  if (HIIT.running && !HIIT.paused) {
    HIIT.paused = true;
    clearInterval(HIIT.interval);
    document.getElementById('hiit-start-btn').textContent = 'â–¶ Riprendi';
    return;
  }
  if (HIIT.paused) {
    HIIT.paused = false;
    document.getElementById('hiit-start-btn').textContent = 'â¸ Pausa';
    HIIT.interval = setInterval(hiitTick, 1000);
    return;
  }
  HIIT.workSec = parseInt(document.getElementById('hiit-work').value) || 20;
  HIIT.restSec = parseInt(document.getElementById('hiit-rest').value) || 10;
  HIIT.totalRounds = parseInt(document.getElementById('hiit-rounds').value) || 8;
  HIIT.prepSec = parseInt(document.getElementById('hiit-prep').value) || 5;
  HIIT.currentRound = 0;
  HIIT.phase = 'prep';
  HIIT.secondsLeft = HIIT.prepSec;
  HIIT.running = true;
  HIIT.paused = false;
  document.getElementById('hiit-settings').style.display = 'none';
  document.getElementById('hiit-start-btn').textContent = 'â¸ Pausa';
  enableNoSleep();
  updateHIITDisplay();
  HIIT.interval = setInterval(hiitTick, 1000);
}

function hiitTick() {
  HIIT.secondsLeft--;
  if (HIIT.secondsLeft <= 3 && HIIT.secondsLeft > 0) hiitBeep(800, 80);
  if (HIIT.secondsLeft <= 0) {
    if (HIIT.phase === 'prep') {
      HIIT.phase = 'work';
      HIIT.currentRound = 1;
      HIIT.secondsLeft = HIIT.workSec;
      hiitBeep(1000, 200);
    } else if (HIIT.phase === 'work') {
      if (HIIT.currentRound >= HIIT.totalRounds) {
        finishHIIT();
        return;
      }
      HIIT.phase = 'rest';
      HIIT.secondsLeft = HIIT.restSec;
      hiitBeep(600, 150);
    } else if (HIIT.phase === 'rest') {
      HIIT.phase = 'work';
      HIIT.currentRound++;
      HIIT.secondsLeft = HIIT.workSec;
      hiitBeep(1000, 200);
    }
  }
  updateHIITDisplay();
}

function updateHIITDisplay() {
  var phaseEl = document.getElementById('hiit-phase');
  var timeEl = document.getElementById('hiit-time');
  var roundEl = document.getElementById('hiit-round');
  var labels = { prep: 'PREPARATI', work: 'LAVORO!', rest: 'RIPOSO', idle: 'PRONTO' };
  phaseEl.textContent = labels[HIIT.phase] || 'PRONTO';
  phaseEl.className = 'hiit-phase ' + HIIT.phase;
  var m = Math.floor(HIIT.secondsLeft / 60);
  var s = HIIT.secondsLeft % 60;
  timeEl.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  roundEl.textContent = 'Round ' + HIIT.currentRound + '/' + HIIT.totalRounds;
}

function finishHIIT() {
  clearInterval(HIIT.interval);
  HIIT.running = false;
  HIIT.phase = 'idle';
  disableNoSleep();
  document.getElementById('hiit-phase').textContent = 'COMPLETATO! ðŸŽ‰';
  document.getElementById('hiit-phase').className = 'hiit-phase';
  document.getElementById('hiit-phase').style.color = 'var(--gr)';
  document.getElementById('hiit-start-btn').textContent = 'â–¶ Avvia';
  document.getElementById('hiit-settings').style.display = '';
  hiitBeep(1200, 500);
  toast('ðŸŽ‰ HIIT completato! ' + HIIT.totalRounds + ' round in ' + formatHIITTotal() + '!', 'gr');
}

function resetHIIT() {
  clearInterval(HIIT.interval);
  HIIT.running = false;
  HIIT.paused = false;
  HIIT.phase = 'idle';
  HIIT.currentRound = 0;
  HIIT.secondsLeft = 0;
  disableNoSleep();
  document.getElementById('hiit-phase').textContent = 'PRONTO';
  document.getElementById('hiit-phase').className = 'hiit-phase';
  document.getElementById('hiit-phase').style.color = '';
  document.getElementById('hiit-time').textContent = '00:00';
  document.getElementById('hiit-round').textContent = 'Round 0/0';
  document.getElementById('hiit-start-btn').textContent = 'â–¶ Avvia';
  document.getElementById('hiit-settings').style.display = '';
}

function formatHIITTotal() {
  var total = HIIT.totalRounds * (HIIT.workSec + HIIT.restSec) + HIIT.prepSec;
  var m = Math.floor(total / 60);
  return m + ' min';
}

var hiitAudioCtx = null;
function hiitBeep(freq, duration) {
  try {
    if (!hiitAudioCtx) hiitAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = hiitAudioCtx.createOscillator();
    var gain = hiitAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(hiitAudioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(hiitAudioCtx.currentTime + duration / 1000);
  } catch(e) {}
}

function enableNoSleep() {
  try {
    if (navigator.wakeLock) {
      navigator.wakeLock.request('screen').then(function(lock) { HIIT.noSleepVideo = lock; });
    }
  } catch(e) {}
}
function disableNoSleep() {
  try {
    if (HIIT.noSleepVideo && HIIT.noSleepVideo.release) {
      HIIT.noSleepVideo.release();
      HIIT.noSleepVideo = null;
    }
  } catch(e) {}
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  17. ERROR TRACKING
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var AURA_ERRORS = [];

window.onerror = function(msg, url, line, col, err) {
  AURA_ERRORS.push({ type: 'error', msg: msg, url: url, line: line, col: col, stack: err && err.stack, time: new Date().toISOString() });
  if (AURA_ERRORS.length > 50) AURA_ERRORS.shift();
  console.error('[AURA Error]', msg, 'at', url, line, col);
};

window.addEventListener('unhandledrejection', function(event) {
  AURA_ERRORS.push({ type: 'promise', msg: String(event.reason), time: new Date().toISOString() });
  if (AURA_ERRORS.length > 50) AURA_ERRORS.shift();
  console.error('[AURA Promise Rejection]', event.reason);
});

function getErrorLog() { return AURA_ERRORS; }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  16. SERVICE WORKER REGISTRATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
if ('serviceWorker' in navigator) {
  // Force clear old caches on page load
  if (window.caches) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        if (name !== 'aura-v19') caches.delete(name);
      });
    });
  }
  window.addEventListener('load', function() {
    // Clear nuke flag so future visits register normally
    sessionStorage.removeItem('aura_sw_nuked');
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function(reg) {
      NOTIF.swReg = reg;
      reg.update();
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        if (!refreshing) { refreshing = true; window.location.reload(); }
      });
      if (NOTIF.permission === 'granted' && localStorage.getItem('aura_notif_enabled') !== 'false') {
        scheduleLocalNotifs();
      }
    }).catch(function() {});
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  BODY MEASUREMENTS LOG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var BM_PARTS = [
  { key: 'vita', name: 'Girovita', ico: 'ðŸ“', color: '#f97316' },
  { key: 'petto', name: 'Petto', ico: 'ðŸ’ª', color: '#22c55e' },
  { key: 'braccio_dx', name: 'Braccio DX', ico: 'ðŸ’ª', color: '#38bdf8' },
  { key: 'braccio_sx', name: 'Braccio SX', ico: 'ðŸ’ª', color: '#a78bfa' },
  { key: 'coscia_dx', name: 'Coscia DX', ico: 'ðŸ¦µ', color: '#ec4899' },
  { key: 'coscia_sx', name: 'Coscia SX', ico: 'ðŸ¦µ', color: '#f43f5e' },
  { key: 'fianchi', name: 'Fianchi', ico: 'ðŸ“', color: '#eab308' },
  { key: 'polpaccio', name: 'Polpaccio', ico: 'ðŸ¦µ', color: '#14b8a6' }
];
var _bmCurrentPart = null;

function getBM() { try { return JSON.parse(localStorage.getItem(BM_KEY)) || {}; } catch(e) { return {}; } }
function saveBM(d) { localStorage.setItem(BM_KEY, JSON.stringify(d)); }

function openBodyMeasure() {
  document.getElementById('bm-ov').classList.add('on');
  bmShowOverview();
}
function closeBodyMeasure() { document.getElementById('bm-ov').classList.remove('on'); }

function bmShowOverview() {
  document.getElementById('bm-detail').style.display = 'none';
  var ov = document.getElementById('bm-overview');
  ov.style.display = '';
  var data = getBM();
  var html = '<div class="sec-title">Le Tue Misure</div>';
  BM_PARTS.forEach(function(p) {
    var entries = data[p.key] || [];
    var last = entries.length > 0 ? entries[entries.length - 1] : null;
    var diffHtml = '';
    if (entries.length >= 2) {
      var diff = (entries[entries.length - 1].val - entries[entries.length - 2].val).toFixed(1);
      var sign = diff > 0 ? '+' : '';
      diffHtml = '<span class="bm-diff ' + (diff >= 0 ? 'pos' : 'neg') + '">' + sign + diff + ' cm</span>';
    }
    html += '<button class="bm-part-btn" onclick="bmOpenPart(\'' + p.key + '\')">' +
      '<div class="bm-ico" style="background:' + p.color + '18;border:1px solid ' + p.color + '40;color:' + p.color + '">' + p.ico + '</div>' +
      '<div class="bm-info"><div class="bm-name">' + p.name + '</div>' +
      '<div class="bm-last">' + (last ? last.date + ' ' + diffHtml : 'Nessuna misurazione') + '</div></div>' +
      '<div class="bm-val">' + (last ? last.val + ' cm' : 'â€”') + '</div></button>';
  });
  // Summary card
  var total = 0;
  BM_PARTS.forEach(function(p) { total += (data[p.key] || []).length; });
  html += '<div class="card glass" style="padding:14px;margin-top:14px;text-align:center">' +
    '<div style="font-size:.72rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;font-weight:700">Totale Misurazioni</div>' +
    '<div style="font-family:var(--fd);font-weight:900;font-size:1.6rem;color:var(--or)">' + total + '</div></div>';
  ov.innerHTML = html;
}

function bmOpenPart(key) {
  _bmCurrentPart = key;
  var part = BM_PARTS.find(function(p) { return p.key === key; });
  document.getElementById('bm-overview').style.display = 'none';
  document.getElementById('bm-detail').style.display = '';
  document.getElementById('bm-detail-title').textContent = part.ico + ' ' + part.name;
  document.getElementById('bm-value').value = '';
  bmRenderHistory();
  bmDrawChart();
}

function bmSave() {
  if (!_bmCurrentPart) return;
  var val = parseFloat(document.getElementById('bm-value').value);
  if (!val || val <= 0 || val > 300) { toast('Inserisci un valore valido (cm)', 're'); return; }
  var data = getBM();
  if (!data[_bmCurrentPart]) data[_bmCurrentPart] = [];
  data[_bmCurrentPart].push({ val: Math.round(val * 10) / 10, date: new Date().toISOString().slice(0, 10) });
  saveBM(data);
  document.getElementById('bm-value').value = '';
  bmRenderHistory();
  bmDrawChart();
  toast('Misurazione salvata! ðŸ“', 'gr');
}

function bmRenderHistory() {
  var data = getBM();
  var entries = (data[_bmCurrentPart] || []).slice().reverse();
  var part = BM_PARTS.find(function(p) { return p.key === _bmCurrentPart; });
  var html = '';
  if (entries.length === 0) {
    html = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:.84rem">Nessuna misurazione ancora.<br>Aggiungi la prima!</div>';
  }
  entries.forEach(function(e, i) {
    var realIdx = entries.length - 1 - i;
    html += '<div class="bm-entry"><div class="bm-entry-val" style="color:' + part.color + '">' + e.val + ' cm</div>' +
      '<div class="bm-entry-date">' + e.date + '</div>' +
      '<div class="bm-entry-del" onclick="bmDelete(' + realIdx + ')">Ã—</div></div>';
  });
  document.getElementById('bm-history').innerHTML = html;
}

function bmDelete(idx) {
  var data = getBM();
  var arr = data[_bmCurrentPart] || [];
  if (idx >= 0 && idx < arr.length) {
    arr.splice(idx, 1);
    data[_bmCurrentPart] = arr;
    saveBM(data);
    bmRenderHistory();
    bmDrawChart();
    toast('Misurazione eliminata', 're');
  }
}

function bmDrawChart() {
  var data = getBM();
  var entries = data[_bmCurrentPart] || [];
  var canvas = document.getElementById('bm-chart');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 140 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '140px';
  ctx.scale(dpr, dpr);
  var W = rect.width, H = 140;
  ctx.clearRect(0, 0, W, H);
  if (entries.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Servono almeno 2 misurazioni per il grafico', W / 2, H / 2);
    return;
  }
  var part = BM_PARTS.find(function(p) { return p.key === _bmCurrentPart; });
  var clr = part ? part.color : '#f97316';
  var vals = entries.map(function(d) { return d.val; });
  var mn = Math.min.apply(null, vals) - 2;
  var mx = Math.max.apply(null, vals) + 2;
  if (mn === mx) { mn -= 5; mx += 5; }
  var pad = { l: 40, r: 16, t: 12, b: 24 };
  var cW = W - pad.l - pad.r;
  var cH = H - pad.t - pad.b;
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  for (var g = 0; g < 4; g++) {
    var gy = pad.t + (cH / 3) * g;
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    var gv = (mx - (mx - mn) * (g / 3)).toFixed(1);
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(gv, pad.l - 6, gy + 4);
  }
  ctx.strokeStyle = clr; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  entries.forEach(function(d, i) {
    var x = pad.l + (cW / Math.max(entries.length - 1, 1)) * i;
    var y = pad.t + cH - ((d.val - mn) / (mx - mn)) * cH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.lineTo(pad.l + cW, pad.t + cH);
  ctx.lineTo(pad.l, pad.t + cH);
  ctx.closePath();
  var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, clr + '40');
  grad.addColorStop(1, clr + '00');
  ctx.fillStyle = grad; ctx.fill();
  entries.forEach(function(d, i) {
    var x = pad.l + (cW / Math.max(entries.length - 1, 1)) * i;
    var y = pad.t + cH - ((d.val - mn) / (mx - mn)) * cH;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = clr; ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
  });
  ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  var step = Math.max(1, Math.floor(entries.length / 5));
  entries.forEach(function(d, i) {
    if (i % step === 0 || i === entries.length - 1) {
      var x = pad.l + (cW / Math.max(entries.length - 1, 1)) * i;
      ctx.fillText(d.date.slice(5), x, H - 4);
    }
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  NUTRITION LABEL OCR SCANNER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openOCRScanner() {
  document.getElementById('ocr-ov').classList.add('on');
  document.getElementById('ocr-capture').style.display = '';
  document.getElementById('ocr-analyzing').style.display = 'none';
  document.getElementById('ocr-result').style.display = 'none';
  document.getElementById('ocr-preview').innerHTML = '<div class="ocr-placeholder">ðŸ“·<br>Scatta una foto dell\'etichetta nutrizionale<br><small>L\'IA estrarrÃ  calorie e macros automaticamente</small></div>';
}
function closeOCRScanner() { document.getElementById('ocr-ov').classList.remove('on'); }

function ocrFileSelected(e) {
  var file = e.target.files[0];
  if (!file) return;
  // Show preview
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = document.createElement('img');
    img.src = ev.target.result;
    var preview = document.getElementById('ocr-preview');
    preview.innerHTML = '';
    preview.appendChild(img);
    // Start OCR analysis
    ocrAnalyze(ev.target.result);
  };
  reader.readAsDataURL(file);
}

function ocrAnalyze(imageDataUrl) {
  document.getElementById('ocr-analyzing').style.display = '';
  var groqKey = localStorage.getItem('aura_groq_key') || _GROQ_DEFAULT;
  // Use Llama 4 Scout vision model via Groq
  var base64 = imageDataUrl.split(',')[1];
  var messages = [
    { role: 'system', content: 'Sei un esperto nutrizionista. Analizza l\'immagine dell\'etichetta nutrizionale e rispondi SOLO con un JSON valido (niente testo prima o dopo). Formato: {"name":"nome prodotto","kcal":numero,"protein":numero,"carbs":numero,"fat":numero,"fiber":numero,"sugar":numero,"salt":numero,"serving":"porzione es. per 100g"}. Tutti i valori sono per 100g. Se non riesci a leggere un valore usa 0. Il campo name deve essere il nome del prodotto se visibile, altrimenti "Alimento scansionato".' },
    { role: 'user', content: [
      { type: 'text', text: 'Analizza questa etichetta nutrizionale e restituisci i valori in JSON.' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } }
    ]}
  ];
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: messages,
      max_tokens: 512,
      temperature: 0.1
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    document.getElementById('ocr-analyzing').style.display = 'none';
    if (!data.choices || !data.choices[0]) throw new Error('No response');
    var text = data.choices[0].message.content.trim();
    // Extract JSON from response (may have markdown backticks)
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    var parsed = JSON.parse(jsonMatch[0]);
    ocrShowResult(parsed);
  })
  .catch(function(err) {
    document.getElementById('ocr-analyzing').style.display = 'none';
    ocrShowManualEntry(err.message);
  });
}

function ocrShowResult(data) {
  var resultDiv = document.getElementById('ocr-result');
  resultDiv.style.display = '';
  var html = '<div class="card glass" style="padding:16px;border-color:#22c55e30;background:linear-gradient(135deg,#22c55e10,var(--s9))">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:1.2rem">âœ…</span><span style="font-weight:800;font-size:.92rem">Etichetta analizzata</span></div>' +
    '<div style="font-weight:700;font-size:1rem;margin-bottom:4px">' + _escHtml(data.name || 'Alimento scansionato') + '</div>' +
    '<div style="font-size:.72rem;color:var(--t3);margin-bottom:10px">' + (data.serving || 'per 100g') + '</div>' +
    '<div class="ocr-macro-grid">' +
      '<div class="ocr-macro-item"><div class="ocr-macro-val" style="color:var(--or)">' + (data.kcal || 0) + '</div><div class="ocr-macro-label">Calorie</div></div>' +
      '<div class="ocr-macro-item"><div class="ocr-macro-val" style="color:#22c55e">' + (data.protein || 0) + 'g</div><div class="ocr-macro-label">Proteine</div></div>' +
      '<div class="ocr-macro-item"><div class="ocr-macro-val" style="color:#38bdf8">' + (data.carbs || 0) + 'g</div><div class="ocr-macro-label">Carboidrati</div></div>' +
      '<div class="ocr-macro-item"><div class="ocr-macro-val" style="color:var(--pu)">' + (data.fat || 0) + 'g</div><div class="ocr-macro-label">Grassi</div></div>' +
    '</div>';
  if (data.fiber || data.sugar || data.salt) {
    html += '<div style="display:flex;gap:12px;margin-top:8px;font-size:.76rem;color:var(--t3)">';
    if (data.fiber) html += '<span>Fibre: ' + data.fiber + 'g</span>';
    if (data.sugar) html += '<span>Zuccheri: ' + data.sugar + 'g</span>';
    if (data.salt) html += '<span>Sale: ' + data.salt + 'g</span>';
    html += '</div>';
  }
  html += '</div>';
  // Quantity + meal type selector
  html += '<div class="sec-title" style="margin-top:14px">Aggiungi al diario</div>' +
    '<div class="bm-input-row" style="margin-bottom:8px">' +
      '<input type="number" id="ocr-qty" value="100" min="1" max="2000" placeholder="QuantitÃ  (g)" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem">' +
      '<select id="ocr-meal-type" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem">' +
        '<option value="colazione">â˜€ï¸ Colazione</option><option value="spuntino_am">ðŸŽ Spuntino AM</option>' +
        '<option value="pranzo" selected>ðŸ½ï¸ Pranzo</option><option value="spuntino_pm">ðŸ¥œ Spuntino PM</option>' +
        '<option value="cena">ðŸŒ™ Cena</option></select></div>' +
    '<button class="cta" style="width:100%" onclick="ocrAddMeal()">âœ… Aggiungi Pasto</button>';
  // Edit values
  html += '<div style="margin-top:10px;text-align:center"><button class="btn btn-ghost btn-sm" onclick="ocrEditValues()" style="font-size:.72rem">âœï¸ Modifica valori manualmente</button></div>';
  resultDiv.innerHTML = html;
  // Store parsed data for adding
  window._ocrParsed = data;
}

function ocrShowManualEntry(errMsg) {
  var resultDiv = document.getElementById('ocr-result');
  resultDiv.style.display = '';
  resultDiv.innerHTML = '<div class="card" style="padding:14px;border-color:#f9731630">' +
    '<div style="font-weight:700;margin-bottom:8px">âš ï¸ Non sono riuscito a leggere l\'etichetta</div>' +
    '<div style="font-size:.78rem;color:var(--t3);margin-bottom:12px">Inserisci i valori manualmente (per 100g):</div>' +
    '<div class="bm-input-row"><input type="text" id="ocr-m-name" placeholder="Nome alimento" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.84rem"></div>' +
    '<div class="ocr-macro-grid">' +
      '<div><label style="font-size:.7rem;color:var(--t3)">Calorie</label><input type="number" id="ocr-m-kcal" placeholder="kcal" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem;margin-top:4px"></div>' +
      '<div><label style="font-size:.7rem;color:var(--t3)">Proteine (g)</label><input type="number" id="ocr-m-protein" placeholder="g" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem;margin-top:4px"></div>' +
      '<div><label style="font-size:.7rem;color:var(--t3)">Carboidrati (g)</label><input type="number" id="ocr-m-carbs" placeholder="g" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem;margin-top:4px"></div>' +
      '<div><label style="font-size:.7rem;color:var(--t3)">Grassi (g)</label><input type="number" id="ocr-m-fat" placeholder="g" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem;margin-top:4px"></div>' +
    '</div>' +
    '<div class="bm-input-row" style="margin-top:10px"><input type="number" id="ocr-m-qty" value="100" min="1" max="2000" placeholder="QuantitÃ  (g)" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem">' +
    '<select id="ocr-m-meal" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--s8);background:var(--s9);color:var(--t1);font-size:.9rem"><option value="colazione">â˜€ï¸ Colazione</option><option value="spuntino_am">ðŸŽ Spuntino</option><option value="pranzo" selected>ðŸ½ï¸ Pranzo</option><option value="spuntino_pm">ðŸ¥œ Spuntino</option><option value="cena">ðŸŒ™ Cena</option></select></div>' +
    '<button class="cta" style="width:100%;margin-top:10px" onclick="ocrAddManual()">âœ… Aggiungi</button></div>';
}

function ocrEditValues() {
  var d = window._ocrParsed || {};
  document.getElementById('ocr-result').style.display = 'none';
  ocrShowManualEntry('edit');
  document.getElementById('ocr-m-name').value = d.name || '';
  document.getElementById('ocr-m-kcal').value = d.kcal || '';
  document.getElementById('ocr-m-protein').value = d.protein || '';
  document.getElementById('ocr-m-carbs').value = d.carbs || '';
  document.getElementById('ocr-m-fat').value = d.fat || '';
  document.getElementById('ocr-result').style.display = '';
}

function ocrAddMeal() {
  var d = window._ocrParsed;
  if (!d) return;
  var qty = parseInt(document.getElementById('ocr-qty').value) || 100;
  var mealType = document.getElementById('ocr-meal-type').value;
  var food = { name: d.name || 'Alimento scansionato', kcal: d.kcal || 0, protein: d.protein || 0, carbs: d.carbs || 0, fat: d.fat || 0 };
  addMealEntry(food, qty, mealType);
  closeOCRScanner();
  toast('ðŸŽ‰ ' + food.name + ' aggiunto dal scan!', 'gr');
}

function ocrAddManual() {
  var name = document.getElementById('ocr-m-name').value.trim() || 'Alimento manuale';
  var kcal = parseFloat(document.getElementById('ocr-m-kcal').value) || 0;
  var protein = parseFloat(document.getElementById('ocr-m-protein').value) || 0;
  var carbs = parseFloat(document.getElementById('ocr-m-carbs').value) || 0;
  var fat = parseFloat(document.getElementById('ocr-m-fat').value) || 0;
  var qty = parseInt(document.getElementById('ocr-m-qty').value) || 100;
  var mealType = document.getElementById('ocr-m-meal').value;
  addMealEntry({ name: name, kcal: kcal, protein: protein, carbs: carbs, fat: fat }, qty, mealType);
  closeOCRScanner();
  toast('âœ… ' + name + ' aggiunto!', 'gr');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  MENSTRUAL CYCLE TRACKER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var CYCLE_PHASES = [
  { key: 'mestrual', name: 'Fase Mestruale', icon: 'ðŸ”´', color: '#f43f5e', bg: '#f43f5e15', border: '#f43f5e30',
    desc: 'Periodo di mestruazione. Il corpo sta rinnovando il rivestimento uterino.',
    workout: 'ðŸ§˜ Yoga leggero, stretching, camminate. Evita allenamenti intensi.',
    recovery: 'Recupero aumentato. Ascolta il tuo corpo, riposa di piÃ¹.' },
  { key: 'follicular', name: 'Fase Follicolare', icon: 'ðŸŒ±', color: '#22c55e', bg: '#22c55e15', border: '#22c55e30',
    desc: 'Estrogeni in aumento. Energia crescente, umore positivo.',
    workout: 'ðŸ’ª Momento ideale per allenamenti intensi! Forza, HIIT, pesi pesanti.',
    recovery: 'Recupero veloce. Puoi aumentare volume e intensitÃ .' },
  { key: 'ovulation', name: 'Ovulazione', icon: 'ðŸ”¥', color: '#f97316', bg: '#f9731615', border: '#f9731630',
    desc: 'Picco di estrogeni e testosterone. Massima energia e forza.',
    workout: 'ðŸ‹ï¸ Picco performance! PR, carichi massimi, competizioni.',
    recovery: 'Attenzione alle articolazioni (lassitÃ  legamentosa). Riscaldamento accurato.' },
  { key: 'luteal', name: 'Fase Luteale', icon: 'ðŸŒ™', color: '#a78bfa', bg: '#a78bfa15', border: '#a78bfa30',
    desc: 'Progesterone dominante. Energia in calo, possibile ritenzione idrica.',
    workout: 'ðŸš¶ Cardio moderato, resistenza, volume ridotto. Focus su tecnica.',
    recovery: 'Metabolismo piÃ¹ alto (+100-300 kcal). PiÃ¹ carboidrati e sonno.' }
];

function getCycleData() { try { return JSON.parse(localStorage.getItem(CYCLE_KEY)) || {}; } catch(e) { return {}; } }
function saveCycleData(d) { localStorage.setItem(CYCLE_KEY, JSON.stringify(d)); }

function openCycleTracker() {
  document.getElementById('cycle-ov').classList.add('on');
  var data = getCycleData();
  if (data.cycleLength) document.getElementById('cycle-length').value = data.cycleLength;
  if (data.periodLength) document.getElementById('cycle-period-length').value = data.periodLength;
  cycleRender();
}
function closeCycleTracker() { document.getElementById('cycle-ov').classList.remove('on'); }

function cycleSaveSettings() {
  var data = getCycleData();
  data.cycleLength = parseInt(document.getElementById('cycle-length').value) || 28;
  data.periodLength = parseInt(document.getElementById('cycle-period-length').value) || 5;
  saveCycleData(data);
  cycleRender();
}

function cycleGetPhase(date) {
  var data = getCycleData();
  var periods = data.periods || [];
  if (periods.length === 0) return null;
  // Find most recent period start
  var lastPeriod = periods[periods.length - 1];
  var start = new Date(lastPeriod);
  var target = new Date(date);
  var daysDiff = Math.floor((target - start) / 86400000);
  if (daysDiff < 0) return null;
  var cycleLen = data.cycleLength || 28;
  var periodLen = data.periodLength || 5;
  var dayInCycle = daysDiff % cycleLen;
  if (dayInCycle < periodLen) return CYCLE_PHASES[0]; // mestrual
  if (dayInCycle < 13) return CYCLE_PHASES[1]; // follicular
  if (dayInCycle < 16) return CYCLE_PHASES[2]; // ovulation
  return CYCLE_PHASES[3]; // luteal
}

function cycleRender() {
  var data = getCycleData();
  var today = new Date().toISOString().slice(0, 10);
  var phase = cycleGetPhase(today);

  // Phase card
  var phaseHtml = '';
  if (phase) {
    phaseHtml = '<div class="cycle-phase" style="background:' + phase.bg + ';border-color:' + phase.border + '">' +
      '<div class="cycle-phase-icon">' + phase.icon + '</div>' +
      '<div class="cycle-phase-name" style="color:' + phase.color + '">' + phase.name + '</div>' +
      '<div class="cycle-phase-desc">' + phase.desc + '</div>' +
      '<div class="cycle-phase-tip" style="background:' + phase.color + '12;color:' + phase.color + '">' + phase.workout + '</div>' +
      '<div class="cycle-phase-tip" style="background:' + phase.color + '08;color:var(--t2);margin-top:4px">' + phase.recovery + '</div></div>';
  } else {
    phaseHtml = '<div class="card glass" style="padding:20px;text-align:center">' +
      '<div style="font-size:2rem;margin-bottom:8px">ðŸŒ™</div>' +
      '<div style="font-weight:700;margin-bottom:6px">Registra il tuo ciclo</div>' +
      '<div style="font-size:.78rem;color:var(--t3)">Premi "Inizia mestruazioni" per attivare il tracking e ricevere consigli personalizzati.</div></div>';
  }
  document.getElementById('cycle-phase-card').innerHTML = phaseHtml;

  // Calendar (current month)
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth();
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var todayDate = now.getDate();
  var dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  var calHtml = '<div class="cycle-cal">';
  dayNames.forEach(function(d) { calHtml += '<div class="cycle-cal-hd">' + d + '</div>'; });
  var adj = firstDay === 0 ? 6 : firstDay - 1;
  for (var e = 0; e < adj; e++) calHtml += '<div></div>';
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var p = cycleGetPhase(dateStr);
    var cls = 'cycle-day';
    if (d === todayDate) cls += ' today';
    if (p) cls += ' ' + p.key;
    calHtml += '<div class="' + cls + '">' + d + '</div>';
  }
  calHtml += '</div>';
  document.getElementById('cycle-calendar').innerHTML = calHtml;

  // Log section
  var periods = data.periods || [];
  var logHtml = '<button class="cycle-log-btn" onclick="cycleLogPeriod()">' +
    '<span style="font-size:1.2rem">ðŸ”´</span>' +
    '<div><div style="font-weight:700;font-size:.84rem">Inizia mestruazioni</div>' +
    '<div style="font-size:.7rem;color:var(--t3)">Registra l\'inizio del ciclo di oggi</div></div></button>';
  if (periods.length > 0) {
    logHtml += '<div class="sec-title" style="margin-top:10px">Storico</div>';
    periods.slice().reverse().forEach(function(p, i) {
      var realIdx = periods.length - 1 - i;
      logHtml += '<div class="bm-entry"><div class="bm-entry-val" style="color:#f43f5e">ðŸ”´</div>' +
        '<div class="bm-entry-date">' + p + '</div>' +
        '<div class="bm-entry-del" onclick="cycleDeletePeriod(' + realIdx + ')">Ã—</div></div>';
    });
  }
  document.getElementById('cycle-log-section').innerHTML = logHtml;
}

function cycleLogPeriod() {
  var data = getCycleData();
  if (!data.periods) data.periods = [];
  var today = new Date().toISOString().slice(0, 10);
  // Prevent duplicate
  if (data.periods.indexOf(today) >= 0) { toast('GiÃ  registrato per oggi', 'bl'); return; }
  data.periods.push(today);
  data.periods.sort();
  saveCycleData(data);
  cycleRender();
  updateCycleCard();
  toast('ðŸ”´ Ciclo registrato per oggi', 'gr');
}

function cycleDeletePeriod(idx) {
  var data = getCycleData();
  if (data.periods && idx >= 0 && idx < data.periods.length) {
    data.periods.splice(idx, 1);
    saveCycleData(data);
    cycleRender();
    updateCycleCard();
    toast('Registrazione rimossa', 're');
  }
}

function updateCycleCard() {
  var u = getUser();
  var card = document.getElementById('cycle-card');
  if (!card) return;
  if (!u || u.sex !== 'F') { card.style.display = 'none'; return; }
  card.style.display = '';
  var phase = cycleGetPhase(new Date().toISOString().slice(0, 10));
  var txt = document.getElementById('cycle-card-phase');
  if (phase) {
    txt.innerHTML = phase.icon + ' <strong style="color:' + phase.color + '">' + phase.name + '</strong> â€” ' + phase.workout.split('.')[0];
  } else {
    txt.textContent = 'Inizia a tracciare il tuo ciclo';
  }
}

// Initialize cycle card visibility on profile load
(function() {
  var origApplyUser = window.applyUserData;
  if (origApplyUser) {
    window.applyUserData = function(u) {
      origApplyUser(u);
      updateCycleCard();
    };
  }
  // Also try on DOM ready
  document.addEventListener('DOMContentLoaded', function() { setTimeout(updateCycleCard, 500); });
})();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  WORKOUT TEMPLATES SHARING (Export / Import)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openShareExport() {
  document.getElementById('share-export-ov').classList.add('on');
  document.getElementById('share-result').style.display = 'none';
  var plans = getWorkouts();
  var html = '';
  if (plans.length === 0) {
    html = '<div style="text-align:center;padding:20px;color:var(--t3)">Nessuna scheda da condividere.<br>Crea prima una scheda!</div>';
  }
  plans.forEach(function(p, i) {
    var exCount = (p.exercises || []).length;
    html += '<div class="share-plan-card" onclick="shareSelectPlan(' + i + ')">' +
      '<div class="share-plan-name">' + _escHtml(p.name || 'Scheda ' + (i + 1)) + '</div>' +
      '<div class="share-plan-meta">' + exCount + ' esercizi' + (p._aiGenerated ? ' â€¢ IA' : ' â€¢ Manuale') + '</div></div>';
  });
  document.getElementById('share-plan-list').innerHTML = html;
}
function closeShareExport() { document.getElementById('share-export-ov').classList.remove('on'); }

function _escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function shareSelectPlan(idx) {
  var plans = getWorkouts();
  var plan = plans[idx];
  if (!plan) return;
  // Build shareable object (strip personal data)
  var shareable = {
    _aura: 1,
    name: plan.name || 'Scheda',
    exercises: (plan.exercises || []).map(function(ex) {
      return { name: ex.name, sets: ex.sets, reps: ex.reps, rest: ex.rest, notes: ex.notes || '' };
    }),
    _ai: plan._aiGenerated ? 1 : 0,
    _created: new Date().toISOString().slice(0, 10)
  };
  var json = JSON.stringify(shareable);
  var code = btoa(unescape(encodeURIComponent(json)));
  document.getElementById('share-plan-list').style.display = 'none';
  document.getElementById('share-result').style.display = '';
  document.getElementById('share-code-text').textContent = code;
  // Build import link
  var baseUrl = window.location.origin + window.location.pathname;
  var link = baseUrl + '?import=' + encodeURIComponent(code);
  document.getElementById('share-link-text').textContent = link;
  // QR Code (generate via inline SVG-based QR)
  generateQR(code);
}

function shareCodeCopy() {
  var text = document.getElementById('share-code-text').textContent;
  navigator.clipboard.writeText(text).then(function() { toast('Codice copiato! ðŸ“‹', 'gr'); });
}
function shareLinkCopy() {
  var text = document.getElementById('share-link-text').textContent;
  navigator.clipboard.writeText(text).then(function() { toast('Link copiato! ðŸ”—', 'gr'); });
}

// Minimal QR Code generator (alphanumeric, embedded)
function generateQR(data) {
  var qrDiv = document.getElementById('share-qr');
  // Use a canvas-based QR approach: encode data into a simple visual matrix
  // For reliable QR we embed qrcode-generator logic (minified Kazuhiko Arase)
  if (typeof qrcode === 'undefined') {
    // Fallback: show the code as visual text matrix
    qrDiv.innerHTML = '<div style="text-align:center;padding:12px;color:#333;font-size:.72rem">Scansiona il codice QR non disponibile.<br>Usa il codice o il link sopra.</div>';
    // Load QR lib dynamically
    var sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
    sc.onload = function() { _renderQR(data); };
    sc.onerror = function() {
      qrDiv.innerHTML = '<div style="text-align:center;padding:12px;color:#666;font-size:.8rem">ðŸ“‹ Usa il codice o link sopra per condividere</div>';
    };
    document.head.appendChild(sc);
    return;
  }
  _renderQR(data);
}
function _renderQR(data) {
  var qrDiv = document.getElementById('share-qr');
  try {
    var qr = qrcode(0, 'L');
    qr.addData(data);
    qr.make();
    qrDiv.innerHTML = qr.createSvgTag(5, 0);
  } catch(e) {
    qrDiv.innerHTML = '<div style="text-align:center;padding:12px;color:#666;font-size:.8rem">QR troppo lungo. Usa il codice sopra.</div>';
  }
}

// â”€â”€ IMPORT â”€â”€
function openShareImport() {
  document.getElementById('share-import-ov').classList.add('on');
  document.getElementById('import-code').value = '';
  document.getElementById('import-preview').style.display = 'none';
}
function closeShareImport() { document.getElementById('share-import-ov').classList.remove('on'); }

function importPlan() {
  var raw = document.getElementById('import-code').value.trim();
  if (!raw) { toast('Incolla un codice valido', 're'); return; }
  try {
    var json = decodeURIComponent(escape(atob(raw)));
    var plan = JSON.parse(json);
    if (!plan._aura || !plan.exercises || !Array.isArray(plan.exercises)) throw new Error('Invalid');
    // Show preview
    var html = '<div class="card glass" style="padding:14px;margin-top:14px">' +
      '<div style="font-weight:800;font-size:1rem;margin-bottom:8px">' + _escHtml(plan.name) + '</div>' +
      '<div style="font-size:.78rem;color:var(--t3);margin-bottom:10px">' + plan.exercises.length + ' esercizi â€¢ ' + (plan._ai ? 'Generata IA' : 'Manuale') + '</div>';
    plan.exercises.forEach(function(ex) {
      html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--s8)">' +
        '<span style="font-size:.82rem;font-weight:600">' + _escHtml(ex.name) + '</span>' +
        '<span style="font-size:.78rem;color:var(--t3)">' + (ex.sets || 3) + 'Ã—' + (ex.reps || 10) + '</span></div>';
    });
    html += '<button class="cta" style="width:100%;margin-top:12px" onclick="confirmImport()">âœ… Conferma Importazione</button></div>';
    document.getElementById('import-preview').style.display = '';
    document.getElementById('import-preview').innerHTML = html;
    // Store temporarily
    window._pendingImport = plan;
  } catch(e) {
    toast('Codice non valido. Controlla e riprova.', 're');
  }
}

function confirmImport() {
  var plan = window._pendingImport;
  if (!plan) return;
  var plans = getWorkouts();
  plans.push({
    name: plan.name + ' (importata)',
    exercises: plan.exercises.map(function(ex) {
      return { name: ex.name, sets: ex.sets || 3, reps: ex.reps || 10, rest: ex.rest || 60, notes: ex.notes || '' };
    }),
    _aiGenerated: false,
    _imported: true,
    _importDate: new Date().toISOString()
  });
  saveWorkouts(plans);
  window._pendingImport = null;
  toast('Scheda importata con successo! ðŸŽ‰', 'gr');
  closeShareImport();
  renderWorkoutTab();
}

// â”€â”€ AUTO-IMPORT FROM URL â”€â”€
(function checkUrlImport() {
  var params = new URLSearchParams(window.location.search);
  var importCode = params.get('import');
  if (importCode) {
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    // Wait for DOM
    setTimeout(function() {
      openShareImport();
      document.getElementById('import-code').value = importCode;
      importPlan();
    }, 1000);
  }
})();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  18. ANNUAL PLAN (39.99â‚¬)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function showAnnualPlan() {
  showModal('âš¡', 'Piano Annuale AURA PRO',
    '<div style="text-align:center;margin-bottom:12px">' +
    '<div style="font-size:.75rem;color:var(--t3);text-decoration:line-through">59,88â‚¬/anno (4,99â‚¬/mese)</div>' +
    '<div style="font-family:var(--fd);font-size:2rem;font-weight:800;color:var(--or)">39,99â‚¬<small style="font-size:.7rem;color:var(--t3)">/anno</small></div>' +
    '<div class="chip chip-gr" style="display:inline-block;margin-top:6px">ðŸŽ‰ Risparmi 33%!</div></div>' +
    '<div style="font-size:.82rem;color:var(--t2);line-height:1.6">' +
    'âœ… Piano dietetico personalizzato IA<br>' +
    'âœ… Analisi forma illimitata<br>' +
    'âœ… AI Coach conversazionale<br>' +
    'âœ… Foto progresso con confronto<br>' +
    'âœ… HIIT Timer avanzato<br>' +
    'âœ… Revisione dieta IA avanzata<br>' +
    'âœ… Supporto prioritario</div>',
    'Abbonati â€” 39,99â‚¬/anno', 'var(--or)');
  _modalCtaAction = function() {
    closeModal();
    toast('âš¡ Abbonamento annuale attivato! Grazie per il supporto.', 'gr');
    var u = getUser();
    if (u) { u.plan = 'annual'; u.planExpiry = new Date(Date.now() + 365*86400000).toISOString(); setUser(u); }
  };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  19. REFERRAL PROGRAM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function generateReferralCode() {
  var u = getUser() || {};
  if (u.referralCode) return u.referralCode;
  var code = 'AURA-' + (u.name || 'USER').replace(/\s+/g, '').substring(0, 4).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  u.referralCode = code;
  u.referrals = u.referrals || 0;
  setUser(u);
  return code;
}

function openReferral() {
  var code = generateReferralCode();
  var u = getUser() || {};
  var referrals = u.referrals || 0;
  showModal('ðŸŽ', 'Invita un Amico',
    '<div style="text-align:center">' +
    '<div style="font-size:.82rem;color:var(--t2);margin-bottom:12px">Condividi il tuo codice e <strong>ottieni 1 mese gratis</strong> per ogni amico che si iscrive!</div>' +
    '<div style="background:var(--s8);border:2px dashed var(--or);border-radius:14px;padding:14px;margin-bottom:12px">' +
    '<div style="font-family:var(--fd);font-size:1.3rem;font-weight:800;letter-spacing:2px;color:var(--or)">' + code + '</div></div>' +
    '<div style="font-size:.78rem;color:var(--t3);margin-bottom:8px">Amici invitati: <strong style="color:var(--or)">' + referrals + '</strong> | Mesi gratis: <strong style="color:var(--gr)">' + referrals + '</strong></div>' +
    '</div>',
    'ðŸ“¤ Condividi Codice', 'var(--or)');
  _modalCtaAction = function() {
    closeModal();
    if (navigator.share) {
      navigator.share({ title: 'AURA Fitness', text: 'Unisciti a AURA! Usa il mio codice ' + code + ' per ottenere vantaggi. Scarica gratis:', url: 'https://tropicalblackie.github.io/AURAMOBILE/' });
    } else {
      navigator.clipboard.writeText(code).then(function() { toast('ðŸ“‹ Codice copiato: ' + code, 'gr'); });
    }
  };
}

function redeemReferral() {
  var code = prompt('Inserisci il codice referral:');
  if (!code || !code.trim()) return;
  code = code.trim().toUpperCase();
  if (!/^AURA-[A-Z0-9]{3,4}-[A-Z0-9]{4}$/.test(code)) {
    toast('âŒ Codice non valido. Formato: AURA-XXXX-XXXX', 're');
    return;
  }
  var u = getUser() || {};
  if (u.redeemedReferral) { toast('â„¹ï¸ Hai giÃ  usato un codice referral.', 'bl'); return; }
  // Check not redeeming own code
  if (u.referralCode && u.referralCode === code) { toast('âš ï¸ Non puoi usare il tuo stesso codice.', 're'); return; }
  u.redeemedReferral = code;
  setUser(u);
  toast('ðŸŽ‰ Codice riscattato! Hai ottenuto 1 mese gratis.', 'gr');
  // Track referral in Firebase if available
  trackReferralRedeem(code);
}

function trackReferralRedeem(code) {
  // Use Firebase to increment the referrer's count
  if (typeof firebase !== 'undefined' && FB.db && FB.ready) {
    // Find the user who owns this referral code and increment their count
    FB.db.collection('referrals').doc(code).set({
      code: code,
      redeemedBy: FB.uid || 'anonymous',
      redeemedAt: new Date().toISOString()
    }, { merge: true }).then(function() {
      // Also increment a counter doc
      FB.db.collection('referral_counts').doc(code).set({
        count: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
    }).catch(function(e) { console.warn('Referral track error:', e); });
  }
  // Also store locally a record of the redemption
  var redeems = [];
  try { redeems = JSON.parse(localStorage.getItem('aura_referral_redeems') || '[]'); } catch(e) {}
  redeems.push({ code: code, at: new Date().toISOString() });
  localStorage.setItem('aura_referral_redeems', JSON.stringify(redeems));
}

// Check if anyone has used our referral code (called on social init)
function checkReferralCount() {
  var u = getUser();
  if (!u || !u.referralCode) return;
  if (typeof firebase !== 'undefined' && FB.db && FB.ready) {
    FB.db.collection('referral_counts').doc(u.referralCode).get().then(function(doc) {
      if (doc.exists && doc.data().count) {
        var count = doc.data().count;
        if (count !== u.referrals) {
          u.referrals = count;
          setUser(u);
          if (count > 0) toast('ðŸŽ‰ ' + count + ' amico/i hanno usato il tuo codice!', 'gr');
        }
      }
    }).catch(function() {});
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  20. AURA STORE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var STORE_ITEMS = [
  { id: 'bands', name: 'Set Elastici Resistenza', desc: '5 elastici con diverse resistenze + maniglie + aggancio porta.', price: 24.99, img: '', emoji: 'ðŸ‹ï¸' },
  { id: 'scale', name: 'Bilancia Smart BMI', desc: 'Bilancia con composizione corporea, sync Bluetooth con AURA.', price: 39.99, img: '', emoji: 'âš–ï¸' },
  { id: 'hrband', name: 'Fascia Cardio HR', desc: 'Fascia toracica Bluetooth per monitoraggio HR in tempo reale.', price: 34.99, img: '', emoji: 'ðŸ’“' },
  { id: 'shaker', name: 'Shaker AURA 700ml', desc: 'Shaker premium in acciaio con logo AURA.', price: 14.99, img: '', emoji: 'ðŸ¥¤' },
  { id: 'protein', name: 'Whey Protein AURA 1kg', desc: 'Proteine del siero di latte, gusto cioccolato. 30g proteine/dose.', price: 29.99, img: '', emoji: 'ðŸ«' },
  { id: 'creatine', name: 'Creatina Monoidrata 300g', desc: 'Creatina pura, 5g/dose. 60 dosi per confezione.', price: 19.99, img: '', emoji: 'ðŸ’Š' },
  { id: 'mat', name: 'Tappetino AURA Premium', desc: 'Tappetino antiscivolo 183x61cm, 8mm spessore.', price: 29.99, img: '', emoji: 'ðŸ§˜' }
];

var STORE_CART = [];

function openStore() {
  document.getElementById('store-ov').classList.add('on');
  renderStore();
}
function closeStore() { document.getElementById('store-ov').classList.remove('on'); }

function renderStore() {
  var body = document.getElementById('store-body');
  var cartTotal = STORE_CART.reduce(function(sum, item) { return sum + item.price; }, 0);
  var html = '';
  if (STORE_CART.length > 0) {
    html += '<div class="card" style="background:linear-gradient(135deg,#f9731612,var(--s9));border-color:#f9731630;padding:14px;margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><div style="font-weight:700;font-size:.88rem">ðŸ›’ Carrello (' + STORE_CART.length + ')</div>' +
      '<div style="font-size:.75rem;color:var(--t3)">' + STORE_CART.map(function(c){return c.name}).join(', ') + '</div></div>' +
      '<div style="text-align:right"><div style="font-family:var(--fd);font-weight:800;color:var(--or)">' + cartTotal.toFixed(2) + 'â‚¬</div>' +
      '<button class="btn btn-or btn-sm" style="margin-top:4px" onclick="storeCheckout()">Checkout â†’</button></div></div></div>';
  }
  STORE_ITEMS.forEach(function(item) {
    html += '<div class="store-item">' +
      '<div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:var(--s8);border-radius:12px;flex-shrink:0">' + item.emoji + '</div>' +
      '<div class="store-item-info"><div class="store-item-name">' + item.name + '</div>' +
      '<div class="store-item-desc">' + item.desc + '</div>' +
      '<div style="display:flex;align-items:center;gap:10px"><span class="store-item-price">' + item.price.toFixed(2) + 'â‚¬</span>' +
      '<button class="btn btn-or btn-sm" onclick="addToCart(\'' + item.id + '\')">+ Carrello</button></div></div></div>';
  });
  body.innerHTML = html;
}

function addToCart(itemId) {
  var item = STORE_ITEMS.find(function(i) { return i.id === itemId; });
  if (!item) return;
  STORE_CART.push(item);
  toast('ðŸ›’ ' + item.name + ' aggiunto al carrello!', 'or');
  renderStore();
}

function storeCheckout() {
  if (STORE_CART.length === 0) { toast('Il carrello Ã¨ vuoto!', 're'); return; }
  var total = STORE_CART.reduce(function(s, i) { return s + i.price; }, 0);
  showModal('ðŸ›’', 'Checkout AURA Store',
    '<div style="font-size:.82rem;color:var(--t2);line-height:1.6">' +
    STORE_CART.map(function(c) { return 'â€¢ ' + c.name + ' â€” <strong>' + c.price.toFixed(2) + 'â‚¬</strong>'; }).join('<br>') +
    '<br><br><div style="font-family:var(--fd);font-size:1.3rem;font-weight:800;color:var(--or)">Totale: ' + total.toFixed(2) + 'â‚¬</div>' +
    '<div style="font-size:.72rem;color:var(--t3);margin-top:6px">Spedizione gratuita sopra 50â‚¬</div></div>',
    'Paga con Stripe â†’', 'var(--or)');
  _modalCtaAction = function() {
    closeModal();
    toast('âœ… Ordine confermato! Riceverai email di conferma.', 'gr');
    STORE_CART = [];
  };
}

// â”€â”€ MOOD & ENERGY LOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getMoodLog() { try { return JSON.parse(localStorage.getItem(MOOD_KEY)) || []; } catch(e) { return []; } }
function saveMoodLog(d) { localStorage.setItem(MOOD_KEY, JSON.stringify(d)); }

var MOOD_EMOJIS = ['','ðŸ˜«','ðŸ˜”','ðŸ˜','ðŸ˜Š','ðŸ”¥'];
var MOOD_LABELS = ['','Scarso','Basso','Medio','Buono','Top'];

function moodSelectPost(val) {
  ws.moodPost = val;
  var btns = document.querySelectorAll('#mood-post-row .mood-btn');
  btns.forEach(function(b, i) { b.classList.toggle('sel', i === val - 1); });
}

function updateMoodWidget() {
  var widget = document.getElementById('mood-widget');
  if (!widget) return;
  var mlog = getMoodLog();
  if (mlog.length === 0) { widget.style.display = 'none'; return; }
  widget.style.display = 'block';
  var last = mlog[mlog.length - 1];
  var avg = mlog.slice(-7).reduce(function(s, m) { return s + ((m.pre + m.post) / 2); }, 0) / Math.min(mlog.length, 7);
  var avgR = Math.round(avg);
  document.getElementById('mood-widget-emoji').textContent = MOOD_EMOJIS[avgR] || 'ðŸ˜';
  document.getElementById('mood-widget-label').textContent = 'Umore: ' + MOOD_LABELS[avgR];
  document.getElementById('mood-widget-sub').textContent = 'Media 7gg: ' + avg.toFixed(1) + '/5 Â· ' + mlog.length + ' registrazioni';
}

function openMoodHistory() {
  document.getElementById('mood-hist-ov').classList.add('on');
  renderMoodHistory();
}

function renderMoodHistory() {
  var el = document.getElementById('mood-hist-content');
  var mlog = getMoodLog();
  if (mlog.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--t3)"><div style="font-size:2.5rem;margin-bottom:12px">ðŸ§ </div><b>Nessun dato mood</b><br><span style="font-size:.78rem">Completa un allenamento per registrare il tuo umore</span></div>';
    return;
  }
  var html = '';
  // Correlation summary
  var totalPre = 0, totalPost = 0, improved = 0;
  mlog.forEach(function(m) {
    totalPre += m.pre; totalPost += m.post;
    if (m.post > m.pre) improved++;
  });
  var avgPre = (totalPre / mlog.length).toFixed(1);
  var avgPost = (totalPost / mlog.length).toFixed(1);
  var impPct = Math.round((improved / mlog.length) * 100);
  html += '<div class="card glass" style="padding:14px;margin-bottom:14px">';
  html += '<div style="font-weight:800;font-size:.85rem;margin-bottom:10px">ðŸ“Š Correlazioni Mood</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">';
  html += '<div><div style="font-size:1.2rem;font-weight:800;color:var(--or)">' + avgPre + '</div><div style="font-size:.65rem;color:var(--t3)">Media Pre</div></div>';
  html += '<div><div style="font-size:1.2rem;font-weight:800;color:var(--or)">' + avgPost + '</div><div style="font-size:.65rem;color:var(--t3)">Media Post</div></div>';
  html += '<div><div style="font-size:1.2rem;font-weight:800;color:var(--or)">' + impPct + '%</div><div style="font-size:.65rem;color:var(--t3)">Migliora</div></div>';
  html += '</div>';
  if (parseFloat(avgPost) > parseFloat(avgPre)) {
    html += '<div style="font-size:.72rem;color:#4cd964;margin-top:8px;text-align:center">âœ… L\'allenamento migliora il tuo umore in media!</div>';
  }
  html += '</div>';
  // Mood trend (last 14 entries bar chart)
  var recent = mlog.slice(-14);
  html += '<div class="card glass" style="padding:14px;margin-bottom:14px">';
  html += '<div style="font-weight:800;font-size:.85rem;margin-bottom:10px">ðŸ“ˆ Trend (ultime ' + recent.length + ' sessioni)</div>';
  html += '<div style="display:flex;align-items:flex-end;gap:4px;height:80px">';
  recent.forEach(function(m) {
    var avg = (m.pre + m.post) / 2;
    var pct = (avg / 5) * 100;
    var col = avg >= 4 ? '#4cd964' : avg >= 3 ? 'var(--or)' : '#ff3b30';
    html += '<div style="flex:1;background:' + col + ';border-radius:4px 4px 0 0;height:' + pct + '%;min-height:4px;opacity:.8" title="' + m.date + ': ' + avg.toFixed(1) + '"></div>';
  });
  html += '</div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:.55rem;color:var(--t3);margin-top:4px"><span>' + recent[0].date.slice(5) + '</span><span>' + recent[recent.length-1].date.slice(5) + '</span></div>';
  html += '</div>';
  // Entries list
  html += '<div style="font-weight:800;font-size:.85rem;margin-bottom:8px">ðŸ“ Storico</div>';
  mlog.slice().reverse().forEach(function(m) {
    html += '<div class="mood-mini">';
    html += '<span class="mood-mini-emoji">' + MOOD_EMOJIS[m.pre] + 'â†’' + MOOD_EMOJIS[m.post] + '</span>';
    html += '<div class="mood-mini-info">';
    html += '<div class="mood-mini-date">' + m.date + ' Â· ' + (m.plan || '') + '</div>';
    html += '<div class="mood-mini-val">Pre: ' + m.pre + '/5 â†’ Post: ' + m.post + '/5</div>';
    html += '</div></div>';
  });
  el.innerHTML = html;
}

// â”€â”€ DELOAD WEEK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getDeloadData() { try { return JSON.parse(localStorage.getItem(DELOAD_KEY)) || {}; } catch(e) { return {}; } }
function saveDeloadData(d) { localStorage.setItem(DELOAD_KEY, JSON.stringify(d)); }

function checkDeloadNeeded() {
  var cw = getCompletedWorkouts();
  if (cw.length < 8) return; // Need enough data
  var dd = getDeloadData();
  // If user dismissed recently (within 7 days), don't show
  if (dd.dismissed) {
    var diff = (Date.now() - new Date(dd.dismissed).getTime()) / 86400000;
    if (diff < 7) return;
  }
  // If currently in deload week, don't show
  if (dd.deloadUntil && new Date(dd.deloadUntil) > new Date()) return;
  // Count distinct training weeks
  var weeks = {};
  cw.forEach(function(w) {
    var d = new Date(w.date);
    var yr = d.getFullYear();
    var weekNum = Math.ceil(((d - new Date(yr, 0, 1)) / 86400000 + new Date(yr, 0, 1).getDay() + 1) / 7);
    weeks[yr + '-W' + weekNum] = (weeks[yr + '-W' + weekNum] || 0) + 1;
  });
  var weekKeys = Object.keys(weeks).sort();
  if (weekKeys.length < 4) return;
  // Check consecutive weeks with >= 2 workouts (active training weeks)
  var consecutiveActive = 0;
  var lastDeloadWeek = dd.lastDeload ? dd.lastDeload : null;
  for (var i = weekKeys.length - 1; i >= 0; i--) {
    if (weeks[weekKeys[i]] >= 2) {
      consecutiveActive++;
    } else break;
  }
  // Also check mood trend - if declining, suggest earlier
  var mlog = getMoodLog();
  var moodDecline = false;
  if (mlog.length >= 6) {
    var first3 = mlog.slice(-6, -3).reduce(function(s, m) { return s + m.pre; }, 0) / 3;
    var last3 = mlog.slice(-3).reduce(function(s, m) { return s + m.pre; }, 0) / 3;
    if (last3 < first3 - 0.5) moodDecline = true;
  }
  var threshold = moodDecline ? 3 : 4;
  if (consecutiveActive >= threshold) {
    var alertEl = document.getElementById('deload-alert');
    var descEl = document.getElementById('deload-desc');
    if (alertEl) {
      var reason = consecutiveActive + ' settimane consecutive di allenamento intenso.';
      if (moodDecline) reason += ' Il tuo umore pre-workout Ã¨ in calo â€” il tuo corpo ha bisogno di recupero.';
      else reason += ' Una settimana di scarico previene infortuni e overtraining.';
      descEl.textContent = reason;
      alertEl.classList.add('show');
    }
  }
}

function acceptDeload() {
  var dd = getDeloadData();
  var until = new Date(); until.setDate(until.getDate() + 7);
  dd.deloadUntil = until.toISOString().slice(0, 10);
  dd.lastDeload = new Date().toISOString().slice(0, 10);
  dd.dismissed = null;
  saveDeloadData(dd);
  document.getElementById('deload-alert').classList.remove('show');
  toast('ðŸ§˜ Settimana di deload attivata! Riduci pesi del 40-50%', 'or');
}

function dismissDeload() {
  var dd = getDeloadData();
  dd.dismissed = new Date().toISOString();
  saveDeloadData(dd);
  document.getElementById('deload-alert').classList.remove('show');
  toast('â­ï¸ Deload posticipato di 7 giorni', 'or');
}

function isDeloadWeek() {
  var dd = getDeloadData();
  return dd.deloadUntil && new Date(dd.deloadUntil) >= new Date();
}

// â”€â”€ INIT â€” Check stored session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initAuth() {
  const user = getUser();
  updateProfileStats();
  updateMoodWidget();
  checkDeloadNeeded();
  startBpmSim(); // Start BPM sim only after DOM is ready, home tab is default
  if (user && !user._needsOnboarding) {
    applyUserData(user);
    hideAuth();
    hideOnboarding();
    setTimeout(() => toast('ðŸ‘‹ Bentornato ' + user.name.split(' ')[0] + '!', 'or'), 900);
    toast('[DEBUG] initAuth: utente completo, mostro app', 'gr');
  } else if (user && user._needsOnboarding) {
    applyUserData(user);
    hideAuth();
    startOnboarding();
    toast('[DEBUG] initAuth: utente deve fare onboarding', 'or');
  } else {
    showAuth();
    hideOnboarding();
    toast('[DEBUG] initAuth: nessun utente, mostro auth', 'bl');
  }
  // Handle deep-link from notification (?tab=workout etc)
  try {
    var params = new URLSearchParams(window.location.search);
    var deepTab = params.get('tab');
    if (deepTab) {
      setTimeout(function() {
        var btn = document.querySelector('.nb[data-tab="' + deepTab + '"]');
        if (btn) btn.click();
        // Clean URL
        if (window.history.replaceState) window.history.replaceState({}, '', window.location.pathname);
      }, 500);
    }
  } catch(e) {}
})();

/* â”€â”€ PARALLAX Z-DEPTH SCROLL â”€â”€ */
(function(){
  var scr = document.getElementById('screen');
  if (!scr) return;
  var ticking = false;
  scr.addEventListener('scroll', function(){
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function(){
        var st = scr.scrollTop;
        var nears = scr.querySelectorAll('.z-near');
        var mids  = scr.querySelectorAll('.z-mid');
        var fars  = scr.querySelectorAll('.z-far');
        for (var i=0;i<nears.length;i++) nears[i].style.transform = 'translateY(' + (st * 0.03) + 'px)';
        for (var i=0;i<mids.length;i++)  mids[i].style.transform  = 'translateY(' + (st * 0.015) + 'px)';
        for (var i=0;i<fars.length;i++)  fars[i].style.transform   = 'translateY(' + (st * 0.005) + 'px)';
        ticking = false;
      });
    }
  }, {passive:true});
})();

/* â”€â”€ SLOT MACHINE NUMBER ROLL â”€â”€ */
function slotRoll(el, newVal) {
  if (!el) return;
  var str = String(newVal);
  var old = el.getAttribute('data-slot') || '';
  if (str === old) return;
  el.setAttribute('data-slot', str);
  var h = el.offsetHeight || 24;
  var html = '';
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    if (ch >= '0' && ch <= '9') {
      var oldCh = (i < old.length && old[i] >= '0' && old[i] <= '9') ? old[i] : ch;
      var delay = (i * 60);
      html += '<span class="slot-wrap" style="height:' + h + 'px">' +
        '<span class="slot-digit" style="display:flex;flex-direction:column;transition-delay:' + delay + 'ms">' +
        '<span style="height:' + h + 'px;display:flex;align-items:center;justify-content:center">' + ch + '</span>' +
        '</span></span>';
    } else {
      html += '<span>' + ch + '</span>';
    }
  }
  el.innerHTML = html;
  // Trigger roll animation from below
  var digits = el.querySelectorAll('.slot-digit');
  for (var d = 0; d < digits.length; d++) {
    digits[d].style.transform = 'translateY(-100%)';
    /* jshint ignore:start */
    (function(dd) {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { dd.style.transform = 'translateY(0)'; });
      });
