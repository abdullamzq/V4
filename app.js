
(() => {
  'use strict';

  const DATA_BASE = 'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/v1.4/wordlists/exclusive';
  const FALLBACK = [
    {s:'爱',p:'ài',m:'to love; to like',r:'爫',level:1},{s:'爸爸',p:'bàba',m:'father; dad',r:'父',level:1},
    {s:'朋友',p:'péngyou',m:'friend',r:'月',level:1},{s:'老师',p:'lǎoshī',m:'teacher',r:'老',level:1},
    {s:'学生',p:'xuésheng',m:'student',r:'子',level:1},{s:'学校',p:'xuéxiào',m:'school',r:'木',level:1},
    {s:'觉得',p:'juéde',m:'to feel; to think',r:'见',level:1},{s:'认识',p:'rènshi',m:'to know; recognize',r:'讠',level:1},
    {s:'知道',p:'zhīdào',m:'to know',r:'矢',level:1},{s:'喜欢',p:'xǐhuan',m:'to like',r:'口',level:1},
    {s:'时间',p:'shíjiān',m:'time',r:'日',level:1},{s:'现在',p:'xiànzài',m:'now',r:'王',level:1},
    {s:'因为',p:'yīnwèi',m:'because',r:'囗',level:2},{s:'所以',p:'suǒyǐ',m:'so; therefore',r:'户',level:2},
    {s:'但是',p:'dànshì',m:'but; however',r:'亻',level:2},{s:'希望',p:'xīwàng',m:'to hope',r:'巾',level:2},
    {s:'需要',p:'xūyào',m:'to need',r:'雨',level:2},{s:'已经',p:'yǐjīng',m:'already',r:'己',level:2},
    {s:'一起',p:'yìqǐ',m:'together',r:'一',level:2},{s:'问题',p:'wèntí',m:'question; problem',r:'门',level:2},
    {s:'决定',p:'juédìng',m:'to decide',r:'冫',level:3},{s:'参加',p:'cānjiā',m:'to participate; attend',r:'厶',level:3},
    {s:'发现',p:'fāxiàn',m:'to discover; notice',r:'又',level:3},{s:'重要',p:'zhòngyào',m:'important',r:'里',level:3},
    {s:'情况',p:'qíngkuàng',m:'situation; condition',r:'忄',level:3},{s:'影响',p:'yǐngxiǎng',m:'influence; affect',r:'彡',level:3},
    {s:'办法',p:'bànfǎ',m:'method; way',r:'力',level:3},{s:'当然',p:'dāngrán',m:'of course',r:'⺌',level:3},
    {s:'安排',p:'ānpái',m:'to arrange; plan',r:'宀',level:4},{s:'安全',p:'ānquán',m:'safe; safety',r:'宀',level:4},
    {s:'按时',p:'ànshí',m:'on time',r:'扌',level:4},{s:'按照',p:'ànzhào',m:'according to',r:'扌',level:4},
    {s:'帮助',p:'bāngzhù',m:'to help',r:'巾',level:4},{s:'保证',p:'bǎozhèng',m:'to guarantee',r:'亻',level:4},
    {s:'表达',p:'biǎodá',m:'to express',r:'衣',level:4},{s:'标准',p:'biāozhǔn',m:'standard',r:'木',level:4},
    {s:'部分',p:'bùfen',m:'part; section',r:'阝',level:4},{s:'成功',p:'chénggōng',m:'to succeed; success',r:'戈',level:4},
    {s:'诚实',p:'chéngshí',m:'honest',r:'讠',level:4},{s:'处理',p:'chǔlǐ',m:'to handle; deal with',r:'夂',level:4},
    {s:'大概',p:'dàgài',m:'probably; approximately',r:'大',level:4},{s:'调查',p:'diàochá',m:'to investigate; survey',r:'讠',level:4},
    {s:'发展',p:'fāzhǎn',m:'to develop; development',r:'又',level:4},{s:'负责',p:'fùzé',m:'to be responsible for',r:'贝',level:4}
  ];

  const state = {
    track: localStorage.getItem('hsk.track') || 'new',
    minutes: Number(localStorage.getItem('hsk.minutes') || 45),
    vocab: [],
    session: [],
    sessionIndex: 0,
    sessionXp: 0,
    diagnostic: [],
    diagnosticIndex: 0,
    diagnosticRevealed: false,
    listeningFirst: localStorage.getItem('hsk.listeningFirst') !== 'false',
    autoSpeak: localStorage.getItem('hsk.autoSpeak') === 'true',
    sessionComplete: false,
    diagnosticComplete: false
  };

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];

  const key = (suffix) => `hsk.${state.track}.${suffix}`;
  const today = () => new Date().toISOString().slice(0,10);

  function progressMap() {
    try { return JSON.parse(localStorage.getItem(key('progress')) || '{}'); }
    catch { return {}; }
  }

  function saveProgress(map) {
    flashSaving();
    localStorage.setItem(key('progress'), JSON.stringify(map));
    localStorage.setItem('hsk.track', state.track);
    updateDailyStreak();
    setTimeout(() => $('#saveBadge').classList.remove('saving'), 220);
  }

  function flashSaving() {
    const b = $('#saveBadge');
    b.textContent = 'Saving…';
    b.classList.add('saving');
    setTimeout(() => { b.textContent = 'Saved ✓'; }, 120);
  }

  function settingsSave() {
    localStorage.setItem('hsk.track', state.track);
    localStorage.setItem('hsk.minutes', String(state.minutes));
    localStorage.setItem('hsk.listeningFirst', String(state.listeningFirst));
    localStorage.setItem('hsk.autoSpeak', String(state.autoSpeak));
  }

  function updateDailyStreak() {
    const raw = JSON.parse(localStorage.getItem(key('streak')) || '{"last":"","count":0}');
    const t = today();
    if (raw.last === t) return;
    if (raw.last) {
      const a = new Date(raw.last + 'T00:00:00Z');
      const b = new Date(t + 'T00:00:00Z');
      const diff = Math.round((b-a)/86400000);
      raw.count = diff === 1 ? raw.count + 1 : 1;
    } else raw.count = 1;
    raw.last = t;
    localStorage.setItem(key('streak'), JSON.stringify(raw));
  }

  function getStreak() {
    try { return JSON.parse(localStorage.getItem(key('streak')) || '{"count":0}').count || 0; }
    catch { return 0; }
  }

  function cleanMeaning(text) {
    if (!text) return 'meaning unavailable';
    const first = String(text).split(';')[0].trim();
    return first.length > 95 ? first.slice(0,92) + '…' : first;
  }

  function normalizeEntry(entry, level) {
    const form = (entry.f && entry.f[0]) || {};
    const trans = form.i || {};
    const meanings = form.m || [];
    return {
      s: entry.s || '',
      p: trans.y || '',
      m: cleanMeaning(meanings[0] || ''),
      r: entry.r || '',
      level
    };
  }

  async function fetchTrack(track) {
    const cacheKey = `hsk.${track}.vocab.v14`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 100) return parsed;
      } catch {}
    }

    const parts = [];
    for (let level=1; level<=4; level++) {
      const url = `${DATA_BASE}/${track}/${level}.min.json`;
      const res = await fetch(url, {cache:'force-cache'});
      if (!res.ok) throw new Error(`Vocabulary download failed at HSK ${level}`);
      const data = await res.json();
      for (const entry of data) parts.push(normalizeEntry(entry, level));
    }
    const unique = [];
    const seen = new Set();
    for (const w of parts) {
      if (!w.s || seen.has(w.s)) continue;
      seen.add(w.s); unique.push(w);
    }
    try { localStorage.setItem(cacheKey, JSON.stringify(unique)); } catch {}
    return unique;
  }

  async function loadVocabulary(force=false) {
    $('#dataStatus').textContent = 'Loading HSK vocabulary…';
    $('#loadDataBtn').disabled = true;
    if (force) localStorage.removeItem(`hsk.${state.track}.vocab.v14`);
    try {
      state.vocab = await fetchTrack(state.track);
      $('#dataStatus').textContent = `Ready: ${state.vocab.length.toLocaleString()} HSK 1–4 words loaded.`;
      $('#dataNotice').classList.add('hidden');
    } catch (err) {
      state.vocab = FALLBACK.slice();
      $('#dataStatus').textContent = 'Offline starter set loaded. Connect to the internet once later to load the complete HSK list.';
      $('#dataNotice').classList.remove('hidden');
    } finally {
      $('#loadDataBtn').disabled = false;
      renderHome();
    }
  }

  function itemProgress(word, map=progressMap()) {
    return map[word.s] || {status:'new',correct:0,wrong:0,streak:0,interval:0,due:0,last:0,xp:0,seen:0};
  }

  function statusFrom(p) {
    if ((p.correct || 0) >= 8 && (p.streak || 0) >= 5 && (p.interval || 0) >= 14) return 'mastered';
    if ((p.correct || 0) >= 4 && (p.streak || 0) >= 3) return 'strong';
    if ((p.seen || 0) > 0) return 'learning';
    return 'new';
  }

  function recordResult(word, correct, quality=3) {
    const map = progressMap();
    const p = itemProgress(word, map);
    const now = Date.now();
    p.seen = (p.seen || 0) + 1;
    p.last = now;

    if (correct) {
      p.correct = (p.correct || 0) + 1;
      p.streak = (p.streak || 0) + 1;
      if (quality >= 4) p.interval = p.interval ? Math.min(Math.round(p.interval * 2.2), 90) : 3;
      else if (quality === 3) p.interval = p.interval ? Math.min(Math.round(p.interval * 1.8), 60) : 1;
      else p.interval = p.interval ? Math.max(1, Math.round(p.interval * 1.25)) : 1;
      p.due = now + p.interval * 86400000;
      p.xp = (p.xp || 0) + 10;
    } else {
      p.wrong = (p.wrong || 0) + 1;
      p.streak = 0;
      p.interval = 0;
      p.due = now + 10 * 60 * 1000;
      p.xp = (p.xp || 0) + 2;
    }
    p.status = statusFrom(p);
    map[word.s] = p;
    saveProgress(map);
    return p;
  }

  function recordIntroduction(word) {
    const map = progressMap();
    const p = itemProgress(word, map);
    p.seen = (p.seen || 0) + 1;
    p.last = Date.now();
    p.status = 'learning';
    p.due = Date.now() + 15 * 60 * 1000;
    p.xp = (p.xp || 0) + 3;
    map[word.s] = p;
    saveProgress(map);
  }

  function totalXp() {
    return Object.values(progressMap()).reduce((s,p) => s + (p.xp || 0), 0);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function screen(name) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === `screen-${name}`));
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    window.scrollTo({top:0,behavior:'smooth'});
    if (name === 'home') renderHome();
    if (name === 'progress') renderProgress();
    if (name === 'settings') renderSettings();
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = .82;
    speechSynthesis.speak(u);
  }

  function renderHome() {
    const map = progressMap();
    const values = Object.values(map);
    const mastered = values.filter(p => statusFrom(p)==='mastered').length;
    const due = state.vocab.filter(w => {
      const p = itemProgress(w,map);
      return p.seen && (!p.due || p.due <= Date.now());
    }).length;
    const xp = totalXp();
    const lvl = Math.max(1, Math.floor(xp/500)+1);
    $('#xpValue').textContent = xp;
    $('#masteredValue').textContent = mastered;
    $('#dueValue').textContent = due;
    $('#streakValue').textContent = getStreak();
    $('#levelNumber').textContent = lvl;
    $('#trackLabel').textContent = state.track === 'new' ? 'HSK 3.0 • Levels 1–4' : 'Legacy HSK 2.0 • Levels 1–4';
    $('#sessionEstimate').textContent = `≈ ${state.minutes} min`;
    const known = values.filter(p => ['strong','mastered'].includes(statusFrom(p))).length;
    const denom = state.vocab.length || 1;
    $('#masteryBar').style.width = `${Math.min(100, known/denom*100)}%`;
    $('#progressSentence').textContent = state.vocab.length
      ? `${known.toLocaleString()} strong/mastered out of ${state.vocab.length.toLocaleString()} loaded words.`
      : 'Load the vocabulary to begin.';
    $$('.duration-btn').forEach(b => b.classList.toggle('selected', Number(b.dataset.minutes)===state.minutes));
  }

  function buildSession() {
    if (!state.vocab.length) return [];
    const map = progressMap();
    const now = Date.now();
    const count = state.minutes === 10 ? 12 : state.minutes === 20 ? 25 : 45;
    const due = [];
    const learning = [];
    const newWords = [];

    for (const w of state.vocab) {
      const p = itemProgress(w,map);
      if (p.seen && (!p.due || p.due <= now)) due.push(w);
      else if (p.seen && !['strong','mastered'].includes(statusFrom(p))) learning.push(w);
      else if (!p.seen) newWords.push(w);
    }

    due.sort((a,b) => (itemProgress(a,map).due||0)-(itemProgress(b,map).due||0));
    learning.sort((a,b) => (itemProgress(b,map).wrong||0)-(itemProgress(a,map).wrong||0));

    // Recovery-first: unseen HSK 1–3 before HSK 4, but still allow HSK 4 into longer sessions.
    const unseenOld = shuffle(newWords.filter(w=>w.level<=3));
    const unseen4 = shuffle(newWords.filter(w=>w.level===4));
    const targetNew = state.minutes === 10 ? 3 : state.minutes === 20 ? 6 : 10;

    let deck = [...due.slice(0, Math.max(0,count-targetNew)), ...learning.slice(0,8)];
    const slots = Math.max(0, count - deck.length);
    const newPool = [...unseenOld, ...unseen4];
    deck.push(...newPool.slice(0, Math.min(slots,targetNew)));
    if (deck.length < count) {
      const extra = shuffle(state.vocab.filter(w => !deck.includes(w)));
      deck.push(...extra.slice(0,count-deck.length));
    }
    return deck.slice(0,count);
  }

  function startStudy() {
    if (!state.vocab.length) {
      loadVocabulary().then(() => { if (state.vocab.length) startStudy(); });
      return;
    }
    state.session = buildSession();
    state.sessionIndex = 0;
    state.sessionXp = 0;
    state.sessionComplete = false;
    $('#introHearBtn').classList.remove('hidden');
    $('#learnedBtn').textContent = "I've got it — quiz me later";
    screen('study');
    renderStudyCard();
  }

  function distractorsFor(word) {
    const sameLevel = state.vocab.filter(w => w.s!==word.s && w.level===word.level && w.m!==word.m);
    return shuffle(sameLevel.length >= 3 ? sameLevel : state.vocab.filter(w=>w.s!==word.s && w.m!==word.m)).slice(0,3);
  }

  function renderStudyCard() {
    const idx = state.sessionIndex;
    const total = state.session.length;
    if (idx >= total) return finishSession();
    const word = state.session[idx];
    const p = itemProgress(word);
    const isNew = !p.seen;
    $('#sessionCount').textContent = `${idx+1} / ${total}`;
    $('#sessionBar').style.width = `${(idx/total)*100}%`;
    $('#sessionXp').textContent = `+${state.sessionXp} XP`;
    $('#hskLevelBadge').textContent = `HSK ${word.level}`;
    $('#cardType').textContent = isNew ? 'NEW' : 'REVIEW';
    $('#newWordIntro').classList.toggle('hidden', !isNew);
    $('#quizArea').classList.toggle('hidden', isNew);

    if (isNew) {
      $('#introHanzi').textContent = word.s;
      $('#introPinyin').textContent = word.p;
      $('#introMeaning').textContent = word.m;
      $('#introRadical').textContent = word.r ? `Main radical/component: ${word.r}. For now, notice it rather than memorizing a radical list.` : 'Notice the shape and recurring components.';
      if (state.autoSpeak) setTimeout(()=>speak(word.s),150);
      return;
    }

    $('#quizHanzi').textContent = word.s;
    $('#quizPinyin').textContent = word.p;
    $('#quizPinyin').classList.add('hidden');
    $('#revealPinyinBtn').classList.remove('hidden');
    $('#answerFeedback').textContent = '';
    $('#nextBtn').classList.add('hidden');

    const options = shuffle([word, ...distractorsFor(word)]);
    $('#answerChoices').innerHTML = options.map(o =>
      `<button class="choice" data-answer="${encodeURIComponent(o.m)}">${escapeHtml(o.m)}</button>`
    ).join('');
    $$('.choice').forEach(btn => btn.addEventListener('click', () => answerWord(btn, word)));
    if (state.listeningFirst) setTimeout(()=>speak(word.s),100);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function answerWord(btn, word) {
    if ($('#nextBtn').classList.contains('shown')) return;
    const chosen = decodeURIComponent(btn.dataset.answer);
    const correct = chosen === word.m;
    $$('.choice').forEach(b => {
      b.disabled = true;
      const value = decodeURIComponent(b.dataset.answer);
      if (value === word.m) b.classList.add('correct');
      else if (b === btn && !correct) b.classList.add('wrong');
    });
    $('#quizPinyin').classList.remove('hidden');
    $('#revealPinyinBtn').classList.add('hidden');
    if (correct) {
      recordResult(word,true,3);
      state.sessionXp += 10;
      $('#answerFeedback').innerHTML = `<strong>Correct.</strong> ${escapeHtml(word.s)} · ${escapeHtml(word.p)} · ${escapeHtml(word.m)}<br><span class="muted">Saved to your iPad ✓</span>`;
    } else {
      recordResult(word,false,1);
      state.sessionXp += 2;
      $('#answerFeedback').innerHTML = `<strong>Not yet.</strong> ${escapeHtml(word.s)} · ${escapeHtml(word.p)} = ${escapeHtml(word.m)}<br><span class="muted">I moved it earlier in your review queue. Saved ✓</span>`;
    }
    $('#sessionXp').textContent = `+${state.sessionXp} XP`;
    $('#nextBtn').classList.remove('hidden');
    $('#nextBtn').classList.add('shown');
  }

  function finishSession() {
    state.sessionComplete = true;
    $('#quizArea').classList.add('hidden');
    $('#newWordIntro').classList.remove('hidden');
    $('#introHanzi').textContent = '完成';
    $('#introPinyin').textContent = 'wánchéng';
    $('#introMeaning').textContent = 'session complete';
    $('#introRadical').innerHTML = `You earned <strong>${state.sessionXp} XP</strong>. Every answer has already been saved on this device.`;
    $('#introHearBtn').classList.add('hidden');
    $('#learnedBtn').textContent = 'Back home';
    $('#sessionBar').style.width = '100%';
    $('#sessionCount').textContent = `${state.session.length} / ${state.session.length}`;
  }

  function startDiagnostic() {
    if (!state.vocab.length) {
      loadVocabulary().then(() => { if (state.vocab.length) startDiagnostic(); });
      return;
    }
    const base = state.vocab.filter(w => w.level <= 3);
    const perLevel = 10;
    state.diagnostic = [1,2,3].flatMap(level => shuffle(base.filter(w=>w.level===level)).slice(0,perLevel));
    state.diagnosticIndex = 0;
    state.diagnosticComplete = false;
    $$('.diag-btn').forEach(b=>b.classList.remove('hidden'));
    $('#diagRevealBtn').classList.remove('hidden');
    $('#diagHearBtn').classList.remove('hidden');
    screen('diagnostic');
    renderDiagnostic();
  }

  function renderDiagnostic() {
    const i = state.diagnosticIndex;
    const total = state.diagnostic.length;
    if (i >= total) {
      state.diagnosticComplete = true;
      $('#diagCount').textContent = `${total} / ${total}`;
      $('#diagBar').style.width = '100%';
      $('#diagHanzi').textContent = '继续';
      $('#diagPinyin').textContent = 'jìxù';
      $('#diagMeaning').textContent = 'continue — your reboot map is saved';
      $('#diagReveal').classList.remove('hidden');
      $$('.diag-btn').forEach(b=>b.classList.add('hidden'));
      $('#diagHearBtn').classList.add('hidden');
      $('#diagRevealBtn').classList.remove('hidden');
      $('#diagRevealBtn').textContent = 'Start adaptive study →';
      return;
    }
    $('#diagRevealBtn').textContent = 'Reveal answer';
    const w = state.diagnostic[i];
    state.diagnosticRevealed = false;
    $('#diagCount').textContent = `${i+1} / ${total}`;
    $('#diagBar').style.width = `${(i/total)*100}%`;
    $('#diagHanzi').textContent = w.s;
    $('#diagPinyin').textContent = w.p;
    $('#diagMeaning').textContent = w.m;
    $('#diagReveal').classList.add('hidden');
  }

  function rateDiagnostic(rating) {
    const w = state.diagnostic[state.diagnosticIndex];
    if (!w) return;
    const map = progressMap();
    const p = itemProgress(w,map);
    p.seen = Math.max(1,p.seen||0);
    p.last = Date.now();
    if (rating==='known') {
      p.correct = Math.max(2,p.correct||0); p.streak = Math.max(2,p.streak||0);
      p.interval = Math.max(4,p.interval||0); p.due = Date.now()+4*86400000; p.status='learning'; p.xp=(p.xp||0)+5;
    } else if (rating==='shaky') {
      p.correct = Math.max(1,p.correct||0); p.interval=1; p.due=Date.now()+86400000; p.status='learning'; p.xp=(p.xp||0)+4;
    } else {
      p.wrong=(p.wrong||0)+1; p.streak=0; p.interval=0; p.due=Date.now(); p.status='learning'; p.xp=(p.xp||0)+3;
    }
    map[w.s]=p; saveProgress(map);
    state.diagnosticIndex++;
    renderDiagnostic();
  }

  function renderProgress() {
    const map = progressMap();
    const counts = {new:0,learning:0,strong:0,mastered:0};
    for (const w of state.vocab) counts[statusFrom(itemProgress(w,map))]++;
    $('#pNew').textContent = counts.new;
    $('#pLearning').textContent = counts.learning;
    $('#pStrong').textContent = counts.strong;
    $('#pMastered').textContent = counts.mastered;

    $('#levelBreakdown').innerHTML = [1,2,3,4].map(level => {
      const words = state.vocab.filter(w=>w.level===level);
      const good = words.filter(w=>['strong','mastered'].includes(statusFrom(itemProgress(w,map)))).length;
      const pct = words.length ? Math.round(good/words.length*100) : 0;
      return `<div class="level-row">
        <div class="level-row-head"><strong>HSK ${level}</strong><span>${good}/${words.length} strong · ${pct}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');

    const weak = state.vocab
      .filter(w => {
        const p=itemProgress(w,map); return p.seen && ((p.wrong||0)>0 || statusFrom(p)==='learning');
      })
      .sort((a,b) => (itemProgress(b,map).wrong||0)-(itemProgress(a,map).wrong||0))
      .slice(0,35);
    $('#weakWords').innerHTML = weak.length ? weak.map(w =>
      `<button class="word-chip" data-speak-word="${escapeHtml(w.s)}"><strong>${escapeHtml(w.s)}</strong>${escapeHtml(w.p)}</button>`
    ).join('') : '<span class="small muted">No weak words yet — run the reboot check or start studying.</span>';
    $$('[data-speak-word]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speakWord)));
  }

  function renderSettings() {
    $('#trackSelect').value = state.track;
    $('#listeningFirstToggle').checked = state.listeningFirst;
    $('#autoSpeakToggle').checked = state.autoSpeak;
  }

  function exportBackup() {
    const payload = {
      app:'HSK Reboot',
      version:1,
      exportedAt:new Date().toISOString(),
      track:state.track,
      settings:{minutes:state.minutes,listeningFirst:state.listeningFirst,autoSpeak:state.autoSpeak},
      newProgress: JSON.parse(localStorage.getItem('hsk.new.progress') || '{}'),
      oldProgress: JSON.parse(localStorage.getItem('hsk.old.progress') || '{}'),
      newStreak: JSON.parse(localStorage.getItem('hsk.new.streak') || '{"last":"","count":0}'),
      oldStreak: JSON.parse(localStorage.getItem('hsk.old.streak') || '{"last":"","count":0}')
    };
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`hsk-reboot-backup-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#backupStatus').textContent='Backup exported.';
  }

  async function importBackup(file) {
    try {
      const payload=JSON.parse(await file.text());
      if (!payload || payload.app!=='HSK Reboot') throw new Error('Not an HSK Reboot backup');
      if (payload.newProgress) localStorage.setItem('hsk.new.progress',JSON.stringify(payload.newProgress));
      if (payload.oldProgress) localStorage.setItem('hsk.old.progress',JSON.stringify(payload.oldProgress));
      if (payload.newStreak) localStorage.setItem('hsk.new.streak',JSON.stringify(payload.newStreak));
      if (payload.oldStreak) localStorage.setItem('hsk.old.streak',JSON.stringify(payload.oldStreak));
      if (payload.settings) {
        state.minutes=payload.settings.minutes||45;
        state.listeningFirst=payload.settings.listeningFirst!==false;
        state.autoSpeak=payload.settings.autoSpeak===true;
      }
      settingsSave(); renderHome(); renderSettings();
      $('#backupStatus').textContent='Backup imported successfully.';
    } catch (e) {
      $('#backupStatus').textContent='Could not import that backup file.';
    }
  }

  function resetCurrentProgress() {
    if (!confirm(`Reset all ${state.track==='new'?'HSK 3.0':'Legacy HSK 2.0'} progress on this device? This cannot be undone unless you exported a backup.`)) return;
    localStorage.removeItem(key('progress'));
    localStorage.removeItem(key('streak'));
    renderHome(); renderProgress();
  }

  // Events
  $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{
    if (b.dataset.nav==='study') startStudy(); else screen(b.dataset.nav);
  }));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>screen(b.dataset.go)));
  $$('.duration-btn').forEach(b=>b.addEventListener('click',()=>{
    state.minutes=Number(b.dataset.minutes); settingsSave(); renderHome();
  }));
  $('#startStudyBtn').addEventListener('click',startStudy);
  $('#startDiagnosticBtn').addEventListener('click',startDiagnostic);
  $('#openProgressBtn').addEventListener('click',()=>screen('progress'));
  $('#loadDataBtn').addEventListener('click',()=>loadVocabulary(true));
  $('#introHearBtn').addEventListener('click',()=>speak(state.session[state.sessionIndex]?.s||''));
  $('#learnedBtn').addEventListener('click',()=>{
    if (state.sessionComplete) { screen('home'); return; }
    const w=state.session[state.sessionIndex]; if (!w) return;
    recordIntroduction(w); state.sessionXp+=3; state.sessionIndex++; renderStudyCard();
  });
  $('#hearBtn').addEventListener('click',()=>speak(state.session[state.sessionIndex]?.s||''));
  $('#revealPinyinBtn').addEventListener('click',()=>$('#quizPinyin').classList.remove('hidden'));
  $('#nextBtn').addEventListener('click',()=>{
    $('#nextBtn').classList.remove('shown'); state.sessionIndex++; renderStudyCard();
  });
  $('#diagHearBtn').addEventListener('click',()=>speak(state.diagnostic[state.diagnosticIndex]?.s||''));
  $('#diagRevealBtn').addEventListener('click',()=>{
    if (state.diagnosticComplete) { startStudy(); return; }
    $('#diagReveal').classList.remove('hidden');
  });
  $$('.diag-btn').forEach(b=>b.addEventListener('click',()=>rateDiagnostic(b.dataset.rating)));
  $('#trackSelect').addEventListener('change',async e=>{
    state.track=e.target.value; settingsSave(); state.vocab=[]; await loadVocabulary(); renderHome(); renderProgress();
  });
  $('#listeningFirstToggle').addEventListener('change',e=>{state.listeningFirst=e.target.checked;settingsSave();});
  $('#autoSpeakToggle').addEventListener('change',e=>{state.autoSpeak=e.target.checked;settingsSave();});
  $('#exportBtn').addEventListener('click',exportBackup);
  $('#importInput').addEventListener('change',e=>{if(e.target.files?.[0]) importBackup(e.target.files[0]);});
  $('#resetProgressBtn').addEventListener('click',resetCurrentProgress);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }

  renderHome();
  renderSettings();
  loadVocabulary();
})();
