// Format date → DD/MM/YYYY
export function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Format datetime → DD/MM/YYYY HH:MM
export function formatDateTime(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) {
    // Try parsing "YYYY-MM-DD HH:MM" format
    const parts = str.split(' ');
    if (parts.length === 2) {
      const [date, time] = parts;
      const [y, m, day] = date.split('-');
      return `${day}/${m}/${y} ${time}`;
    }
    return str;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
