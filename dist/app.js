import {validateRecords, filterRecords} from './board.js';
const $ = id => document.getElementById(id);
const results = $('results'), form = $('filters'), dialog = $('details');
let records = [], loading = false, failed = false;
const icons = ['⌘','{ }','◈','▥','◇'];
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function state(title, copy, buttonText, action, isError = false) {
  const box = element('div','state');
  if (isError) box.setAttribute('role','alert');
  const icon = element('span','state-icon',isError ? '!' : '⌕'); icon.setAttribute('aria-hidden','true');
  box.append(icon,element('h3','',title),element('p','',copy));
  if (buttonText) { const button = element('button','primary',buttonText); button.type = 'button'; button.addEventListener('click',action); box.append(button); }
  results.replaceChildren(box);
}
function resetFilters() { form.reset(); render(); $('search').focus(); }
function skillList(row) {const list = element('ul','skills'); list.setAttribute('aria-label','Skills'); row.skills.forEach(skill => list.append(element('li','',skill))); return list;}
function showDetails(row) {
  const content = element('div','detail-body');
  const title = element('h2','',row.title); title.id = 'detail-title';
  content.append(title,element('p','',row.domain));
  const dl = element('dl');
  for (const [key,value] of [['Location',row.location],['Work mode',row.mode],['Openings',String(row.openings)],['Reference',row.id]]) {const group = element('div');group.append(element('dt','',key),element('dd','',value));dl.append(group);}
  content.append(dl,element('h3','','Skills you’ll explore'),skillList(row),element('p','demo-notice','This is a fictional internship from the EdVyro learning dataset. Applications are not collected on this practice board.'));
  $('detail-content').replaceChildren(content); dialog.showModal();
}
function card(row) {
  const index = records.indexOf(row), item = element('li'), article = element('article','card');
  const headingId = `role-${row.id}`;article.setAttribute('aria-labelledby',headingId);
  const top = element('div','card-top'), icon = element('span',`role-icon tone-${index}`,icons[index % icons.length]);icon.setAttribute('aria-hidden','true');top.append(icon,element('span','mode',row.mode));
  const heading = element('h3','',row.title);heading.id = headingId;
  const location = element('p','location',row.location); location.append(element('span','','·'),document.createTextNode(row.mode === 'Remote' ? 'Work from anywhere' : row.mode === 'Hybrid' ? 'A little of both' : 'Together, in person'));
  const bottom = element('div','card-bottom'), opening = element('p'); opening.append(element('strong','',String(row.openings)),document.createTextNode(row.openings === 1 ? ' opening' : ' openings'));
  const button = element('button','details-btn','View details');button.type = 'button';button.setAttribute('aria-label',`View details for ${row.title}`);button.addEventListener('click',() => showDetails(row));bottom.append(opening,button);
  article.append(top,element('p','card-domain',row.domain),heading,location,skillList(row),bottom);item.append(article);return item;
}
function render() {
  if (loading || failed) return;
  const matches = filterRecords(records,Object.fromEntries(new FormData(form)));
  $('result-count').replaceChildren(element('strong','',String(matches.length)),document.createTextNode(` ${matches.length === 1 ? 'opportunity' : 'opportunities'} to explore`));
  if (!matches.length) return state('A different search, a new possibility.','No internships match these filters. Try another skill or clear your filters.','Clear filters',resetFilters);
  const list = element('ul','cards');matches.forEach(row => list.append(card(row)));results.replaceChildren(list);
}
async function load() {
  loading = true;failed = false;results.setAttribute('aria-busy','true');$('result-count').textContent = 'Loading opportunities…';
  state('Finding your starting point…','Loading the internship board.');
  try {
    const response = await fetch('data/internships.json',{cache:'no-cache'});
    if (!response.ok) throw new Error('Unable to load internships.');
    records = validateRecords(await response.json());
    const domainValue = $('domain').value;
    $('domain').replaceChildren(new Option('All domains',''),...[...new Set(records.map(row => row.domain))].sort().map(value => new Option(value,value)));
    $('domain').value = domainValue; loading = false; render();
  } catch {
    failed = true;loading = false;$('result-count').textContent = 'Internships are temporarily unavailable.';
    state('A small bump in the road.','We couldn’t load the internships. Check your connection and try again.','Try again',load,true);
  } finally { results.setAttribute('aria-busy','false'); }
}
form.addEventListener('submit',event => {event.preventDefault();render();});
form.addEventListener('input',render);
form.addEventListener('reset',() => queueMicrotask(render));
$('close-dialog').addEventListener('click',() => dialog.close());
dialog.addEventListener('keydown',event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(node => !node.disabled);
  const first = controls[0], last = controls.at(-1);
  if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {event.preventDefault();(event.shiftKey ? last : first).focus();}
});
dialog.addEventListener('click',event => {if(event.target === dialog) {const rect = dialog.getBoundingClientRect();if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();}});
load();
