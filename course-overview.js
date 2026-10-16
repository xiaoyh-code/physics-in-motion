(function () {
  'use strict';
  const map = window.CURRICULUM_MAP;
  if (!map) return;
  const byId = id => document.getElementById(id);
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label = key => `<span class="match-label ${escape(key)}">${escape(map.classifications[key].label)}</span>`;
  const ref = item => `<a href="${escape(item.url)}" target="_blank" rel="noopener">${escape(item.unit)} · ${escape(item.points)}</a> — ${escape(item.topic)} <small>(spec. p. ${escape(item.printedPage)})</small>`;
  const weekLabel = value => /^\d/.test(String(value)) ? `Weeks ${value}` : String(value);
  const lessonNames = {motion:'Velocity & acceleration',displacement:'Displacement & SUVAT',projectile:'Projectile motion',vectors:'Vector resolution',newton:'Newton & terminal velocity',momentum:'Momentum',momentum2d:'Momentum in two dimensions',impulse:'Impulse',kinetic:'Kinetic energy & momentum',moments:'Moments',beam:'Beam equilibrium',work:'Work',energy:'Energy conservation',efficiency:'Efficiency',power:'Power',elastic:'Elastic & inelastic collisions'};
  byId('courseIntroduction').textContent = map.introduction;
  byId('originalPlan').href = map.sources.schoolPlan.url;
  byId('planPDF').href = map.sources.schoolPlan.pdfUrl;
  byId('originalFilename').textContent = map.sources.schoolPlan.originalFilename;
  byId('coverageCaveat').textContent = map.caveat;
  byId('siteScope').textContent = map.siteScope;
  byId('calendarNote').textContent = map.calendarNote;
  byId('extractionNote').textContent = map.extractionNote;
  byId('specificationSource').href = map.sources.ialSpecification.url;
  byId('specificationSource').textContent = map.sources.ialSpecification.title;
  byId('mapChecked').textContent = `Mapping checked: ${map.checkedDate}. References use the specification's printed page numbers.`;
  byId('classificationKey').innerHTML = Object.entries(map.classifications).map(([key,item]) => `<dt>${label(key)}</dt><dd>${escape(item.description)}</dd>`).join('');
  byId('courseSummary').innerHTML = map.summaryRows.map(row => `<tr><td>${escape(weekLabel(row.weeks))}</td><td>${escape(row.schoolFocus)}</td><td>${escape(row.ialLink)}</td><td>${label(row.classification)}<p>${escape(row.nextStep)}</p></td></tr>`).join('');
  byId('courseDetails').innerHTML = map.detailedRows.map(row => `<details class="mapping-detail"><summary>${escape(row.schoolFocus)}<small>${escape(weekLabel(row.weeks))} · ${escape(map.classifications[row.classification].label)}</small></summary>${row.matches.length ? `<h4>Specific IAL connections</h4><ul>${row.matches.map(item => `<li>${ref(item)}</li>`).join('')}</ul>` : '<p class="guide-small">No direct IAL requirement is claimed from these stated objectives alone; see the related requirements below.</p>'}<h4>Evidence from the original school plan</h4>${row.evidence.map(item => `<blockquote><p>“${escape(item.quote)}”</p><cite>${escape(item.section)} · original school plan</cite></blockquote>`).join('')}<p><strong>Scope:</strong> ${escape(row.scopeNote)}</p><p><strong>Next step:</strong> ${escape(row.nextStep)}</p>${row.relatedRefs ? `<h4>Related requirements to check</h4><ul>${row.relatedRefs.map(item => `<li>${ref(item)}</li>`).join('')}</ul>` : ''}${row.siteLessonIds.length ? `<div class="lesson-jumps">${row.siteLessonIds.map(id => `<a href="index.html#${escape(id)}">${escape(lessonNames[id] || id)} →</a>`).join('')}</div>` : ''}</details>`).join('');
  byId('courseGaps').innerHTML = map.gaps.map(item => `<details class="gap-entry"><summary>${escape(item.title)}</summary>${label(item.classification)}<p>${escape(item.note)}</p><ul>${item.refs.map(item => `<li>${ref(item)}</li>`).join('')}</ul></details>`).join('');
  byId('courseCalendar').innerHTML = map.calendar.map(item => `<dt>Week ${escape(item.weeks)}</dt><dd>${escape(item.event)}</dd>`).join('');
  byId('guideSources').innerHTML = Object.values(map.sources).map(item => `<li><a href="${escape(item.url)}"${item.url.startsWith('https:') ? ' target="_blank" rel="noopener"' : ''}>${escape(item.title)}</a> — ${escape(item.description)}</li>`).join('');
  byId('planPreviewToggle').addEventListener('toggle', event => {
    if (!event.currentTarget.open || byId('planEmbed').children.length) return;
    const iframe = document.createElement('iframe');
    iframe.src = `${map.sources.schoolPlan.pdfUrl}#view=FitH`;
    iframe.title = '2026–27 school annual teaching plan — PDF reading copy, layout adapted';
    byId('planEmbed').append(iframe);
  });
  byId('guideEditor').hidden = window.LESSON_LIBRARY_MODE === 'student';
  if (map.canvaEditUrl && window.LESSON_LIBRARY_MODE !== 'student') {
    byId('canvaEdit').href = map.canvaEditUrl;
    byId('canvaEdit').hidden = false;
  }
})();
