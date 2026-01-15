export function csvToJson(csv: string) {
  const lines = csv.trim().split('\n').map(line => line.trim());
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const obj: { [key: string]: any } = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      let value: string | number | null = currentline[j] ? currentline[j].trim() : null;
      
      if (value === null || value === 'null') {
        obj[headers[j]] = null;
        continue;
      }

      // Check for number
      if (!isNaN(Number(value))) {
        obj[headers[j]] = Number(value);
      } else {
        obj[headers[j]] = value;
      }
    }
    result.push(obj);
  }
  return result;
}
