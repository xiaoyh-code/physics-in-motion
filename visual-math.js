/* Cached, genuinely TeX-typeset labels for live SVG diagrams. */
(function (scope) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let engine = scope && scope.katex;
  if (!engine && typeof module !== 'undefined' && module.exports) engine = require('./vendor/katex/katex.min.js');
  const markup = new Map(), widths = new Map(), LIMIT = 384;
  function remember(cache, key, value) {
    if (cache.size >= LIMIT) cache.delete(cache.keys().next().value);
    cache.set(key, value); return value;
  }
  function typeset(tex) {
    if (markup.has(tex)) return markup.get(tex);
    if (!engine) throw new Error('The local TeX renderer must load before visual-math.js.');
    return remember(markup, tex, engine.renderToString(tex, {
      displayMode: false, throwOnError: true, trust: false, strict: false,
      output: 'htmlAndMathml', maxExpand: 500
    }));
  }
  function svgMath(x, y, tex, size = 24, color = '#f1f4fa', anchor = 'start', width = 340) {
    const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;
    size = Math.max(10, n(size)); width = Math.max(24, n(width));
    const align = anchor === 'end' ? 'flex-end' : anchor === 'middle' ? 'center' : 'flex-start';
    const left = n(x) - (anchor === 'end' ? width : anchor === 'middle' ? width / 2 : 0);
    const key = `${size}|${width}|${tex}`, scale = widths.get(key) || 1;
    return `<foreignObject class="svg-tex" x="${left}" y="${n(y)-size*1.22}" width="${width}" height="${size*3.6}" data-math-key="${escape(key)}" data-tex="${escape(tex)}"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:${align};align-items:flex-start;width:100%;height:100%;color:${escape(color)};font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:1.2"><span class="visual-math-typeset" style="flex:none;display:inline-block;white-space:nowrap;transform-origin:${anchor==='end'?'right':anchor==='middle'?'center':'left'} top;${scale<1?`transform:scale(${scale})`:''}">${typeset(tex)}</span></div></foreignObject>`;
  }
  function fitSVG(svg) {
    if (!svg || typeof svg.querySelectorAll !== 'function') return;
    for (const node of svg.querySelectorAll('.svg-tex')) {
      const key = node.getAttribute('data-math-key'), span = node.querySelector('.visual-math-typeset');
      if (!span || widths.has(key)) continue;
      const available = Number(node.getAttribute('width')) - 2, natural = span.scrollWidth;
      if (!natural) continue;
      const scale = Math.min(1, available / natural);
      remember(widths, key, scale);
      span.style.transform = scale < 1 ? `scale(${scale})` : '';
    }
  }
  if (scope && scope.document && scope.document.fonts) {
    const refresh = () => { widths.clear(); fitSVG(scope.document.getElementById('scene')); };
    scope.document.fonts.ready.then(refresh);
    scope.document.fonts.addEventListener('loadingdone', refresh);
  }
  const api = Object.freeze({svgMath, fitSVG, typeset});
  if (scope) scope.PhysicsVisualMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
