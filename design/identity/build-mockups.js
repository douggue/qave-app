// Two identity directions for Lokal, rendered as phone mockups.
const { chromium } = require('playwright');
const fs = require('fs');
const E = (n) => `file:///home/user/qave-app/assets/emoji/${n}.png`;

// Seeded street grid so both directions share one believable map.
function mapSVG(t, w = 390, h = 844) {
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="${t.land}"/>`;
  // water
  s += `<path d="M-20 520 C 80 480, 150 560, 260 540 S 420 600, 440 590 L 440 640 C 330 650, 260 600, 170 610 S 40 560, -20 575 Z" fill="${t.water}"/>`;
  // park
  s += `<path d="M28 640 h120 a14 14 0 0 1 14 14 v70 a14 14 0 0 1 -14 14 h-120 a14 14 0 0 1 -14 -14 v-70 a14 14 0 0 1 14 -14z" fill="${t.park}"/>`;
  s += `<path d="M262 120 h96 a12 12 0 0 1 12 12 v54 a12 12 0 0 1 -12 12 h-96 a12 12 0 0 1 -12 -12 v-54 a12 12 0 0 1 12 -12z" fill="${t.park}"/>`;
  s += `<g transform="rotate(-8 195 420)">`;
  for (let x = -120; x < 520; x += 46) s += `<line x1="${x}" y1="-100" x2="${x}" y2="960" stroke="${t.street}" stroke-width="${x % 184 === 0 ? 0 : 5}"/>`;
  for (let y = -100; y < 960; y += 54) s += `<line x1="-120" y1="${y}" x2="520" y2="${y}" stroke="${t.street}" stroke-width="5"/>`;
  s += `<line x1="-120" y1="300" x2="520" y2="300" stroke="${t.major}" stroke-width="11"/>`;
  s += `<line x1="160" y1="-100" x2="160" y2="960" stroke="${t.major}" stroke-width="11"/>`;
  s += `<line x1="-120" y1="462" x2="520" y2="462" stroke="${t.major}" stroke-width="8"/>`;
  s += `</g>`;
  const lab = (x, y, txt, r = -8, size = 9.5) => `<text x="${x}" y="${y}" transform="rotate(${r} ${x} ${y})" font-family="Figtree" font-weight="700" font-size="${size}" letter-spacing="1.6" fill="${t.label}">${txt}</text>`;
  s += lab(30, 316, 'E 6TH ST') + lab(176, 210, 'CHICON ST', -98) + lab(240, 455, 'E CESAR CHAVEZ') + lab(150, 595, 'LADY BIRD LAKE', -4, 10) + lab(44, 700, 'PLAZA SALTILLO', 0, 8.5);
  return s + `</svg>`;
}

const pin = (t, food, x, y, opt = {}) => {
  const size = opt.size || 46;
  return `<div class="pin" style="left:${x - size / 2}px;top:${y - size}px;width:${size}px;height:${size}px">
    ${opt.halo ? `<div class="sel" style="background:${opt.halo}"></div>` : ''}
    <img src="${E('food-' + food)}" style="width:${size}px;height:${size}px;${opt.dim ? 'opacity:.45;filter:grayscale(.5)' : ''}">
    ${opt.tag ? `<div class="tag">${opt.tag}</div>` : ''}
  </div>`;
};

// The bite: three tooth circles cut from a corner, the brand's signature shape.
const biteMask = (r = 9) => `mask: radial-gradient(circle ${r}px at calc(100% - ${r * 1.9}px) 0, transparent ${r - 0.5}px, #000 ${r}px), radial-gradient(circle ${r}px at 100% ${r * 1.2}px, transparent ${r - 0.5}px, #000 ${r}px), radial-gradient(circle ${r}px at calc(100% + ${r * 0.2}px) ${r * 3.1}px, transparent ${r - 0.5}px, #000 ${r}px); mask-composite: intersect; -webkit-mask-composite: source-in;`;

const icon = (name, color, sw = 2.2, size = 24) => {
  const P = {
    map: '<path d="M3 6.6l6-2.5 6 2.5 6-2.5v13.4l-6 2.5-6-2.5-6 2.5z"/><path d="M12 7.8c-1.7 0-3 1.3-3 2.9 0 2.3 3 4.6 3 4.6s3-2.3 3-4.6c0-1.6-1.3-2.9-3-2.9z"/>',
    drops: '<path d="M4.2 6h15.6a1.2 1.2 0 0 1 1.2 1.2v2.6a2.2 2.2 0 0 0 0 4.4v2.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 16.8v-2.6a2.2 2.2 0 0 0 0-4.4V7.2A1.2 1.2 0 0 1 4.2 6z"/>',
    ask: '<path d="M10.5 2.8c.6 4.4 2.8 6.6 7.2 7.2-4.4.6-6.6 2.8-7.2 7.2-.6-4.4-2.8-6.6-7.2-7.2 4.4-.6 6.6-2.8 7.2-7.2z"/>',
    you: '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/><path d="M8.6 14.2c1.9 2.1 4.9 2.1 6.8 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    bell: '<path d="M6 16.4V11a6 6 0 0 1 12 0v5.4l1.6 2.1H4.4z"/><path d="M10 20.8a2 2 0 0 0 4 0"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    go: '<path d="M20 4L4 11l7.2 1.8L13 20z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    share: '<path d="M12 3.6v11M7.8 7.8L12 3.6l4.2 4.2M5 12.6v5.9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.9"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${P[name]}</svg>`;
};

function tabbar(t) {
  const it = (n, l, a) => `<div class="tab ${a ? 'on' : ''}">${icon(n, a ? t.ink : t.ink3, 2.2, 24)}<span>${l}</span></div>`;
  return `<div class="tabbar">${it('map', 'Map', 1)}${it('drops', 'Drops')}<div class="tab"><div class="report">${icon('plus', '#fff', 2.8, 28)}</div><span>Report</span></div>${it('ask', 'Ask')}${it('you', 'You')}</div>`;
}

function css(t) {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${t.board};font-family:Figtree,system-ui;display:flex;gap:28px;padding:40px 36px 36px;flex-wrap:wrap;width:1352px}
  .head{width:100%;color:${t.boardInk};margin-bottom:6px}
  .head h1{font:800 30px Unbounded;letter-spacing:-.5px}
  .head p{font:500 15px Figtree;opacity:.7;margin-top:6px;max-width:980px;line-height:1.45}
  .chips{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.chips span{font:600 12px Figtree;padding:6px 10px;border-radius:99px;background:${t.boardChip};color:${t.boardInk}}
  .phone{width:390px;height:844px;border-radius:46px;overflow:hidden;position:relative;background:${t.bg};box-shadow:0 30px 60px rgba(0,0,0,.28),0 0 0 10px ${t.bezel};flex:none}
  .cap{font:600 13px Figtree;color:${t.boardInk};opacity:.6;margin-top:14px;text-align:center}
  .col{display:flex;flex-direction:column;align-items:center}
  .status{position:absolute;top:0;left:0;right:0;height:50px;display:flex;justify-content:space-between;align-items:center;padding:14px 34px 0;font:700 15px Figtree;color:${t.ink};z-index:9}
  .pin{position:absolute;z-index:3}.pin img{position:relative;z-index:2;filter:drop-shadow(0 6px 8px ${t.pinShadow})}
  .pin .tag{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;white-space:nowrap;font:700 10.5px Figtree;padding:3px 7px;border-radius:99px;background:${t.tagBg};color:${t.tagInk};letter-spacing:.2px}
  .pin .sel{position:absolute;left:50%;top:55%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;opacity:.9;z-index:1}
  .tabbar{position:absolute;left:0;right:0;bottom:0;height:88px;padding:8px 10px 26px;display:flex;justify-content:space-around;align-items:flex-end;background:${t.bar};border-top:1px solid ${t.line};z-index:8}
  .tab{display:flex;flex-direction:column;align-items:center;gap:4px;width:64px;font:600 11px Figtree;color:${t.ink3}}.tab.on{color:${t.ink}}
  .report{width:58px;height:58px;border-radius:29px;margin-top:-30px;background:${t.cta};display:flex;align-items:center;justify-content:center;box-shadow:${t.ctaShadow};${biteMask(8)}}
  .h-display{font:800 ${t.displaySize}px/1.02 Unbounded;letter-spacing:-.8px;color:${t.ink}}
  .eyebrow{font:700 11px Figtree;letter-spacing:1.8px;text-transform:uppercase;color:${t.ink3}}
  .sheet{position:absolute;left:0;right:0;bottom:0;background:${t.sheet};border-radius:30px 30px 0 0;padding:10px 0 100px;box-shadow:0 -12px 40px rgba(0,0,0,${t.sheetShadow});z-index:6}
  .grab{width:38px;height:5px;border-radius:3px;background:${t.line2};margin:0 auto 14px}
  .row{display:flex;gap:10px;overflow:hidden;padding:0 20px}
  .tile{flex:none;width:68px;display:flex;flex-direction:column;align-items:center;gap:6px;font:600 11.5px Figtree;color:${t.ink2}}
  .tile .sq{width:64px;height:64px;border-radius:20px;background:${t.tile};display:flex;align-items:center;justify-content:center}
  .tile.on .sq{background:${t.tileOn};box-shadow:inset 0 0 0 2px ${t.tileOnRing}}
  .tile.on{color:${t.ink}}
  .sec{display:flex;justify-content:space-between;align-items:baseline;padding:20px 20px 12px}
  .sec h3{font:800 18px Unbounded;color:${t.ink};letter-spacing:-.3px}.sec a{font:700 13px Figtree;color:${t.ink3}}
  .card{flex:none;width:224px;border-radius:22px;background:${t.card};overflow:hidden;${t.cardBorder}}
  .art{height:118px;position:relative;display:flex;align-items:center;justify-content:center}
  .art img{width:92px;height:92px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.25))}
  .rank{position:absolute;left:12px;top:4px;font:800 54px/1 Unbounded;color:${t.rankInk};${t.rankStroke}}
  .ribbon{position:absolute;right:10px;bottom:10px;font:800 10.5px Figtree;letter-spacing:.6px;text-transform:uppercase;padding:5px 9px;border-radius:99px}
  .meta{padding:12px 14px 14px}.meta b{display:block;font:700 15.5px Figtree;color:${t.ink}}.meta span{font:500 12.5px Figtree;color:${t.ink2}}
  .tags{display:flex;gap:6px;margin-top:8px}.tags i{font:600 10.5px Figtree;font-style:normal;padding:3px 7px;border-radius:7px;background:${t.tagChip};color:${t.ink2}}
  .btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:18px;font:700 16px Figtree}
  `;
}

function mapScreen(t, d) {
  return `<div class="col"><div class="phone">
  <div style="position:absolute;inset:0">${mapSVG(t)}</div>
  ${t.mapFade}
  <div class="status"><span>9:41</span><span>●●● ▮</span></div>
  <div style="position:absolute;top:56px;left:20px;right:20px;z-index:7">
    <div class="eyebrow" style="color:${t.ink2}">${d.eyebrow}</div>
    <div class="h-display" style="margin-top:6px">${d.headline}</div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <div style="flex:1;height:48px;border-radius:16px;background:${t.glass};${t.glassBorder};display:flex;align-items:center;gap:10px;padding:0 14px;backdrop-filter:blur(16px)">${icon('search', t.ink2, 2.3, 20)}<span style="font:600 14.5px Figtree;color:${t.ink2}">Birria, where you at?</span></div>
      <div style="width:48px;height:48px;border-radius:16px;background:${t.glass};${t.glassBorder};display:flex;align-items:center;justify-content:center;position:relative">${icon('bell', t.ink, 2.2, 21)}<div style="position:absolute;top:10px;right:11px;width:8px;height:8px;border-radius:4px;background:${t.accent}"></div></div>
    </div>
  </div>
  <!-- crowd halo -->
  <div style="position:absolute;left:214px;top:300px;width:150px;height:150px;margin:-75px;border-radius:50%;background:radial-gradient(circle,${t.haloIn},${t.haloOut} 70%);z-index:2;box-shadow:inset 0 0 0 1.5px ${t.haloRing}"></div>
  <div style="position:absolute;left:252px;top:356px;z-index:4;display:flex;align-items:center;gap:6px;padding:5px 10px 5px 5px;border-radius:99px;background:${t.haloPill};box-shadow:0 6px 14px rgba(0,0,0,.25)">
    <div style="display:flex">${['fox', 'panda', 'frog'].map((a, i) => `<img src="${E('avatar-' + a)}" style="width:22px;height:22px;margin-left:${i ? -7 : 0}px">`).join('')}</div>
    <span style="font:800 12px Figtree;color:${t.haloPillInk}">23 here tonight</span></div>
  ${pin(t, 'taco', 214, 318, { size: 58, halo: t.selHalo })}
  <svg style="position:absolute;left:${214 - 48}px;top:${318 - 29 - 48}px;z-index:2" width="96" height="96" viewBox="0 0 96 96"><defs><path id="ring" d="M48 6 a42 42 0 1 1 -0.1 0"/></defs><text font-family="Figtree" font-weight="800" font-size="9" letter-spacing="2.2" fill="${t.ringInk}"><textPath href="#ring">0.3 MI · 6 MIN WALK · 0.3 MI · 6 MIN WALK ·</textPath></text></svg>
  ${pin(t, 'burger', 92, 262, { tag: 'just parked' })}
  ${pin(t, 'coffee', 60, 398, {})}
  ${pin(t, 'bbq', 316, 236, { tag: 'closes 10:30' })}
  ${pin(t, 'pho', 120, 470, { tag: '8 left' })}
  ${pin(t, 'paleta', 336, 470, {})}
  ${pin(t, 'kolache', 262, 520, { dim: true })}
  <div class="sheet" style="height:330px">
    <div class="grab"></div>
    <div class="row">${[['taco', 'Tacos', 1], ['bbq', 'BBQ'], ['pho', 'Asian'], ['croissant', 'Sweets'], ['coffee', 'Coffee']].map(([f, l, on]) => `<div class="tile ${on ? 'on' : ''}"><div class="sq"><img src="${E('food-' + f)}" style="width:44px;height:44px"></div>${l}</div>`).join('')}</div>
    <div class="sec"><h3>Top 10 tonight</h3><a>See all</a></div>
    <div class="row">${[['taco', 'Taquería La Güera', '4.8 · 0.3 mi · until 10 PM', 'hot right now', t.ribHot], ['bbq', 'Post Oak Pit BBQ', '4.7 · 0.5 mi · closes 10:30', 'closing soon', t.ribAmber]].map(([f, n, m, r, rc], i) => `<div class="card"><div class="art" style="background:${t.artBg[i]}"><div class="rank">${i + 1}</div><img src="${E('food-' + f)}"><div class="ribbon" style="${rc}">${r}</div></div><div class="meta"><b>${n}</b><span>${m}</span></div></div>`).join('')}</div>
  </div>
  ${tabbar(t)}
  </div><div class="cap">Map home</div></div>`;
}

function spotScreen(t) {
  return `<div class="col"><div class="phone" style="background:${t.bg}">
  <div style="height:330px;position:relative;background:${t.heroBg};overflow:hidden">
    ${t.heroDeco}
    <img src="${E('food-taco')}" style="position:absolute;left:50%;top:150px;width:200px;height:200px;margin-left:-100px;transform:rotate(-8deg);filter:drop-shadow(0 22px 26px rgba(0,0,0,.35))">
    <div class="status" style="color:${t.heroInk}"><span>9:41</span><span>●●● ▮</span></div>
    <div style="position:absolute;top:58px;left:20px;right:20px;display:flex;justify-content:space-between">
      <div style="width:44px;height:44px;border-radius:15px;background:${t.heroBtn};display:flex;align-items:center;justify-content:center">${icon('back', t.heroInk, 2.4, 22)}</div>
      <div style="width:44px;height:44px;border-radius:15px;background:${t.heroBtn};display:flex;align-items:center;justify-content:center">${icon('share', t.heroInk, 2.2, 20)}</div>
    </div>
  </div>
  <div style="padding:22px 22px 0;position:relative">
    <div style="display:flex;gap:8px;align-items:center"><span class="eyebrow" style="color:${t.live}">● Here now · until 10 PM</span></div>
    <div class="h-display" style="font-size:31px;margin-top:10px">Taquería<br>La Güera</div>
    <div style="display:flex;gap:14px;align-items:center;margin-top:12px;font:600 14px Figtree;color:${t.ink2}">
      <span style="display:flex;gap:5px;align-items:center;color:${t.ink}">${icon('star', t.accent, 2.2, 16)}4.8</span><span>Food truck</span><span>0.3 mi</span><span>$</span></div>
    <div style="display:flex;gap:8px;margin-top:14px">${t.badges}</div>
    <div style="margin-top:18px;border-radius:22px;padding:16px;background:${t.card};${t.cardBorder}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font:800 15px Figtree;color:${t.ink}">Seen 3 min ago</div><div style="font:500 13px Figtree;color:${t.ink2};margin-top:3px">17 people confirmed tonight</div></div>
        <div style="display:flex">${['fox', 'unicorn', 'cowboy'].map((a, i) => `<img src="${E('avatar-' + a)}" style="width:30px;height:30px;margin-left:${i ? -9 : 0}px">`).join('')}</div>
      </div>
      <div style="display:flex;gap:6px;margin-top:14px">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => `<div style="flex:1;text-align:center;padding:7px 0;border-radius:11px;font:700 11px Figtree;${i === 3 ? `background:${t.dayOn};color:${t.dayOnInk}` : `background:${t.tagChip};color:${t.ink2}`}">${d}<div style="font:600 9.5px Figtree;opacity:.8;margin-top:2px">${i === 2 ? '—' : i > 4 ? 'Rainey' : 'E 6th'}</div></div>`).join('')}</div>
    </div>
  </div>
  <div style="position:absolute;left:22px;right:22px;bottom:34px;display:flex;gap:10px">
    <div class="btn" style="flex:1.3;background:${t.cta};color:${t.ctaInk};box-shadow:${t.ctaShadow}">${icon('check', t.ctaInk, 2.6, 19)}Check in</div>
    <div class="btn" style="flex:1;background:${t.btn2};color:${t.ink};${t.cardBorder}">${icon('go', t.ink, 2.3, 18)}Go</div>
  </div>
  </div><div class="cap">Spot page</div></div>`;
}

function youScreen(t) {
  const stat = (n, l, f, bg, ink, rot) => `<div style="border-radius:24px;padding:16px;background:${bg};position:relative;overflow:hidden;transform:rotate(${rot}deg);${t.statBorder}"><div style="font:800 34px/1 Unbounded;color:${ink};letter-spacing:-1px">${n}</div><div style="font:700 12.5px Figtree;color:${ink};opacity:.8;margin-top:6px">${l}</div><img src="${E(f)}" style="position:absolute;right:-6px;bottom:-8px;width:64px;height:64px;transform:rotate(12deg)"></div>`;
  return `<div class="col"><div class="phone">
  <div class="status"><span>9:41</span><span>●●● ▮</span></div>
  <div style="padding:64px 22px 0">
    <div style="display:flex;align-items:center;gap:14px"><img src="${E('avatar-me')}" style="width:62px;height:62px"><div><div style="font:800 21px Unbounded;color:${t.ink}">@you</div><div style="font:600 13px Figtree;color:${t.ink2};margin-top:3px">East Austin · Night Owl</div></div></div>
    <div class="eyebrow" style="margin-top:24px">Your food passport</div>
    <div style="margin-top:10px;height:190px;border-radius:26px;overflow:hidden;position:relative;${t.cardBorder}">
      <div style="position:absolute;inset:0;transform:scale(.62) translate(-118px,-260px);transform-origin:0 0">${mapSVG(t, 630, 844)}</div>
      <div style="position:absolute;inset:0;background:${t.fog}"></div>
      <div style="position:absolute;left:46%;top:26%;width:120px;height:110px;border-radius:44% 56% 52% 48%;background:transparent;box-shadow:0 0 0 400px transparent"></div>
      <div style="position:absolute;left:18px;bottom:16px"><div style="font:800 40px/1 Unbounded;color:${t.passInk};letter-spacing:-1px">23</div><div style="font:700 13px Figtree;color:${t.passInk};opacity:.85">trucks tried · 2 of 9 hoods unlocked</div></div>
      <div style="position:absolute;right:14px;top:14px;font:800 10.5px Figtree;letter-spacing:.8px;padding:6px 10px;border-radius:99px;background:${t.cta};color:${t.ctaInk}">EAST AUSTIN 80%</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
      ${stat('Tacos', 'Your top taste', 'food-taco', t.stat1, t.stat1Ink, -1.2)}
      ${stat('7', 'Night streak', 'avatar-owl', t.stat2, t.stat2Ink, 1)}
    </div>
  </div>
  ${tabbar(t)}
  </div><div class="cap">You · food passport</div></div>`;
}

const A = {
  name: 'A · Night Market', board: '#0b0910', boardInk: '#f4eefb', boardChip: '#221b2b', bezel: '#1a1622',
  bg: '#0f0c14', land: '#14111b', water: '#0f1a2a', park: '#122019', street: '#1f1a28', major: '#2d2433', label: '#5d5570',
  ink: '#f7f2ff', ink2: '#a9a1bb', ink3: '#6e6782', line: 'rgba(255,255,255,.07)', line2: 'rgba(255,255,255,.18)',
  accent: '#ff7a45', glass: 'rgba(28,23,36,.82)', glassBorder: 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)',
  pinShadow: 'rgba(0,0,0,.55)', tagBg: 'rgba(15,12,20,.86)', tagInk: '#e9e2f5',
  selHalo: 'radial-gradient(circle,rgba(255,122,69,.55),rgba(255,45,111,0) 68%)', ringInk: '#ffb08a',
  haloIn: 'rgba(255,122,69,.22)', haloOut: 'rgba(255,122,69,0)', haloRing: 'rgba(255,150,100,.25)', haloPill: '#f7f2ff', haloPillInk: '#17131f',
  bar: '#0f0c14', cta: 'linear-gradient(135deg,#ffb23d,#ff5a3c 55%,#ff2d6f)', ctaInk: '#fff', ctaShadow: '0 10px 24px rgba(255,60,80,.35)',
  displaySize: 30, sheet: '#17131f', sheetShadow: .5, tile: '#221c2b', tileOn: '#2d2236', tileOnRing: '#ff7a45',
  card: '#1f1928', cardBorder: 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)', artBg: ['linear-gradient(140deg,#3a1d26,#5a2430)', 'linear-gradient(140deg,#2c1d18,#4a2a1c)'],
  rankInk: 'transparent', rankStroke: '-webkit-text-stroke:2px rgba(255,255,255,.85)',
  ribHot: 'background:#ff5a3c;color:#fff', ribAmber: 'background:#ffb23d;color:#2a1600', tagChip: '#2a2333',
  mapFade: '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,12,20,.96) 0,rgba(15,12,20,.6) 190px,rgba(15,12,20,0) 270px);z-index:5"></div>',
  heroBg: 'radial-gradient(circle at 50% 70%,#5a2430 0,#2a1520 55%,#0f0c14 100%)', heroInk: '#fff', heroBtn: 'rgba(255,255,255,.12)',
  heroDeco: '<div style="position:absolute;left:50%;top:250px;width:300px;height:300px;margin:-150px;border-radius:50%;background:radial-gradient(circle,rgba(255,122,69,.45),rgba(255,122,69,0) 70%)"></div>',
  live: '#3ee0a1', btn2: '#1f1928', dayOn: '#f7f2ff', dayOnInk: '#17131f',
  badges: `<span style="font:700 12px Figtree;padding:6px 10px;border-radius:99px;background:#2a2333;color:#e9e2f5">Family-owned</span><span style="font:700 12px Figtree;padding:6px 10px;border-radius:99px;background:rgba(255,122,69,.16);color:#ffb08a">Not a chain</span>`,
  fog: 'radial-gradient(ellipse 120px 90px at 58% 42%, rgba(15,12,20,0) 60%, rgba(15,12,20,.92) 100%)', passInk: '#fff',
  stat1: 'linear-gradient(150deg,#3a1d26,#22161f)', stat1Ink: '#ffd9c8', stat2: 'linear-gradient(150deg,#241d40,#17131f)', stat2Ink: '#d9d0ff', statBorder: 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)',
};
const B = {
  name: 'B · Sticker Book', board: '#efe7d8', boardInk: '#17131a', boardChip: '#e2d7c3', bezel: '#17131a',
  bg: '#f7f1e6', land: '#f1e9db', water: '#bfe0ee', park: '#cfe5b6', street: '#ffffff', major: '#ffd98a', label: '#a0937d',
  ink: '#17131a', ink2: '#5f5664', ink3: '#9a8f9c', line: 'rgba(23,19,26,.08)', line2: 'rgba(23,19,26,.18)',
  accent: '#ff5a3c', glass: '#ffffff', glassBorder: 'box-shadow:0 0 0 2px #17131a,0 4px 0 #17131a',
  pinShadow: 'rgba(80,50,20,.35)', tagBg: '#17131a', tagInk: '#fff6e0',
  selHalo: 'radial-gradient(circle,rgba(255,204,51,.75),rgba(255,204,51,0) 68%)', ringInk: '#17131a',
  haloIn: 'rgba(255,204,51,.45)', haloOut: 'rgba(255,204,51,0)', haloRing: 'rgba(23,19,26,.25)', haloPill: '#17131a', haloPillInk: '#fff6e0',
  bar: '#fffaf1', cta: '#ffcc33', ctaInk: '#17131a', ctaShadow: '0 0 0 2px #17131a, 0 5px 0 #17131a',
  displaySize: 30, sheet: '#fffaf1', sheetShadow: .15, tile: '#f3ead9', tileOn: '#ffe9a6', tileOnRing: '#17131a',
  card: '#ffffff', cardBorder: 'box-shadow:0 0 0 2px #17131a,0 5px 0 #17131a', artBg: ['#ffd9c2', '#f2dcc1'],
  rankInk: '#ffcc33', rankStroke: '-webkit-text-stroke:2.5px #17131a;paint-order:stroke fill',
  ribHot: 'background:#ff5a3c;color:#fff;box-shadow:0 0 0 2px #17131a', ribAmber: 'background:#ffcc33;color:#17131a;box-shadow:0 0 0 2px #17131a', tagChip: '#f3ead9',
  mapFade: '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(247,241,230,.97) 0,rgba(247,241,230,.7) 190px,rgba(247,241,230,0) 270px);z-index:5"></div>',
  heroBg: '#ffd9c2', heroInk: '#17131a', heroBtn: '#ffffff;box-shadow:0 0 0 2px #17131a,0 3px 0 #17131a',
  heroDeco: '<div style="position:absolute;inset:0;background:repeating-linear-gradient(-30deg,rgba(255,255,255,.35) 0 18px,rgba(255,255,255,0) 18px 44px)"></div><div style="position:absolute;left:24px;top:118px;font:800 64px/0.9 Unbounded;color:rgba(23,19,26,.08);letter-spacing:-2px">TACOS<br>TACOS</div>',
  live: '#0f9b62', btn2: '#ffffff', dayOn: '#17131a', dayOnInk: '#fff6e0',
  badges: `<span style="font:800 12px Figtree;padding:6px 10px;border-radius:99px;background:#fff;box-shadow:0 0 0 2px #17131a;color:#17131a">Family-owned</span><span style="font:800 12px Figtree;padding:6px 10px;border-radius:99px;background:#ffcc33;box-shadow:0 0 0 2px #17131a;color:#17131a">Not a chain</span>`,
  fog: 'radial-gradient(ellipse 120px 90px at 58% 42%, rgba(247,241,230,0) 60%, rgba(239,231,216,.94) 100%)', passInk: '#17131a',
  stat1: '#ffd9c2', stat1Ink: '#17131a', stat2: '#d9d0ff', stat2Ink: '#17131a', statBorder: 'box-shadow:0 0 0 2px #17131a,0 5px 0 #17131a',
};

const dirs = [
  [A, { eyebrow: 'East Austin · 61° · Tonight', headline: 'Tacos are out.' }, 'Warm, dark and calm, like a night market. One glowing accent (the Report button and the place you picked); everything else steps back. Thin outline pins replaced by stickers with soft shadows, a muted real-map look, big Unbounded headlines, the three-tooth bite cut into the Report button.'],
  [B, { eyebrow: 'East Austin · 61° · Tonight', headline: 'Tacos are out.' }, 'Bright, bold and collectible, like a sticker book. Warm paper background, thick ink outlines with a hard drop shadow on cards and buttons, our sun-yellow as the signature button, huge outlined rank numbers. Loud personality like Bump, but warm and foodie.'],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1352, height: 1100 }, deviceScaleFactor: 2 });
  for (const [t, d, blurb] of dirs) {
    const html = `<html><head><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;600;700;800&family=Unbounded:wght@700;800&display=swap" rel="stylesheet"><style>${css(t)}</style></head><body>
    <div class="head"><h1>${t.name}</h1><p>${blurb}</p><div class="chips"><span>Signature: three-tooth bite</span><span>Unbounded display</span><span>Custom stickers</span><span>Crowd halo</span><span>Distance ring</span><span>Top 10</span><span>Food passport</span></div></div>
    ${mapScreen(t, d)}${spotScreen(t)}${youScreen(t)}</body></html>`;
    const f = `/tmp/claude-0/-home-user-qave-app/16cdf127-600e-5d69-942b-202f0afbc4e9/scratchpad/identity/${t.name[0]}.html`;
    fs.writeFileSync(f, html);
    await p.goto('file://' + f); await p.waitForTimeout(1800);
    await p.screenshot({ path: f.replace('.html', '.png'), fullPage: true });
  }
  await b.close();
})();
