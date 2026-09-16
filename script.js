const TYPE_COLORS = {
  normal:  "#92a212", fire: "#a83800", water: "#0058a8", electric: "#a88800",
  grass:   "#306230", ice:  "#388888", fighting: "#800000", poison: "#600060",
  ground:  "#886800", flying: "#584888", psychic: "#880040", bug: "#587000",
  rock:    "#685800", ghost: "#402858", dragon: "#3800a8", dark: "#382818",
  steel:   "#606070", fairy: "#884060"
};

const els = {
  form: document.getElementById('searchForm'),
  input: document.getElementById('searchInput'),
  stateMessage: document.getElementById('stateMessage'),
  card: document.getElementById('pokemonCard'),
  dexNumber: document.getElementById('dexNumber'),
  sprite: document.getElementById('sprite'),
  model: document.getElementById('model'),
  modelShiny: document.getElementById('model-shiny'),
  name: document.getElementById('pName'),
  meta: document.getElementById('pMeta'),
  typeBadges: document.getElementById('typeBadges'),
  factHeight: document.getElementById('factHeight'),
  factWeight: document.getElementById('factWeight'),
  factExp: document.getElementById('factExp'),
  factDefault: document.getElementById('factDefault'),
  abilityList: document.getElementById('abilityList'),
  statList: document.getElementById('statList'),
  crySection: document.getElementById('crySection'),
  cryBtn: document.getElementById('cryBtn'),
  cryAudio: document.getElementById('cryAudio'),
  quickBtns: document.querySelectorAll('.quick-btn')
};

function showState(glyph, text){
  els.card.classList.remove('visible');
  els.stateMessage.style.display = 'flex';
  els.stateMessage.innerHTML = `<div class="glyph">${glyph}</div><div>${text}</div>`;
}

function statLabel(name){
  const map = {
    hp: 'HP', attack: 'ataque', defense: 'defesa',
    'special-attack': 'atk esp.', 'special-defense': 'def esp.', speed: 'veloc.'
  };
  return map[name] || name;
}

async function loadPokemon(query){
  const key = query.trim().toLowerCase();
  if(!key) return;

  showState('...', 'BUSCANDO DADOS...');

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}/`);
    if(!res.ok){
      if(res.status === 404){
        showState('X', `SEM REGISTRO PARA "${query.toUpperCase()}".`);
      } else {
        showState('!', 'ERRO DE CONEXÃO COM A POKÉAPI.');
      }
      return;
    }
    const data = await res.json();
    renderPokemon(data);
  } catch (err) {
    showState('!', 'FALHA DE REDE. TENTE NOVAMENTE.');
  }
}

function renderPokemon(data){
  els.stateMessage.style.display = 'none';
  els.card.classList.add('visible');

  els.dexNumber.textContent = `Nº ${String(data.id).padStart(3, '0')}`;

  const artwork = data.sprites?.other?.['official-artwork']?.front_default
    || data.sprites?.front_default
    || '';
  els.sprite.src = artwork;
  els.sprite.alt = data.name;

  els.model.src = data.sprites?.other?.['showdown']?.front_default || data.sprites?.front_default || '';
  els.modelShiny.src = data.sprites?.other?.['showdown']?.front_shiny || data.sprites?.front_shiny || '';

  els.name.textContent = data.name;
  els.meta.textContent = `ORDEM: ${data.order ?? '—'}`;

  els.typeBadges.innerHTML = '';
  (data.types || []).forEach(t => {
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.textContent = t.type.name;
    els.typeBadges.appendChild(badge);
  });

  els.factHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
  els.factWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;
  els.factExp.textContent = data.base_experience != null ? data.base_experience : '—';
  els.factDefault.textContent = data.is_default ? 'SIM' : 'NÃO';

  els.abilityList.innerHTML = '';
  (data.abilities || []).forEach(a => {
    const chip = document.createElement('span');
    chip.className = 'ability-chip' + (a.is_hidden ? ' hidden-ability' : '');
    chip.textContent = a.ability.name.replace(/-/g, ' ');
    els.abilityList.appendChild(chip);
  });

  els.statList.innerHTML = '';
  (data.stats || []).forEach(s => {
    const max = 180;
    const pct = Math.min(100, Math.round((s.base_stat / max) * 100));
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-label">${statLabel(s.stat.name)}</span>
      <span class="stat-track"><span class="stat-fill" style="width:${pct}%"></span></span>
      <span class="stat-value">${s.base_stat}</span>
    `;
    els.statList.appendChild(row);
  });

  const cryUrl = data.cries?.latest || data.cries?.legacy;
  if (cryUrl) {
    els.crySection.style.display = 'block';
    els.cryAudio.src = cryUrl;
    els.cryBtn.onclick = () => {
      els.cryAudio.currentTime = 0;
      els.cryAudio.play().catch(() => {});
    };
  } else {
    els.crySection.style.display = 'none';
  }
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadPokemon(els.input.value);
});

els.quickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    els.input.value = btn.dataset.pick;
    loadPokemon(btn.dataset.pick);
  });
});

loadPokemon('bulbasaur');