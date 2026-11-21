export function validateRecords(payload) {
  if (!payload || !Array.isArray(payload.internships)) throw new Error('Invalid internship data.');
  const ids = new Set();
  for (const row of payload.internships) {
    if (!row || !['id','title','domain','mode','location'].every(key => typeof row[key] === 'string' && row[key].trim()) || !['Remote','Hybrid','On-site'].includes(row.mode) || !Array.isArray(row.skills) || !row.skills.every(skill => typeof skill === 'string' && skill.trim()) || !Number.isInteger(row.openings) || row.openings < 1 || ids.has(row.id)) throw new Error('Invalid internship record.');
    ids.add(row.id);
  }
  return payload.internships;
}
export function filterRecords(records, {search = '', domain = '', mode = ''}) {
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.filter(row => (!domain || row.domain === domain) && (!mode || row.mode === mode) && terms.every(term => [row.title,row.domain,row.location,row.mode,...row.skills].join(' ').toLocaleLowerCase().includes(term)));
}
