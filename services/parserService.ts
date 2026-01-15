import { InternalContact } from '../types';

/**
 * A lightweight CSV parser implemented to avoid external heavy dependencies
 * and ensure utf-8-sig compliance.
 */
export const parseCSV = (content: string): Record<string, string>[] => {
  const rows: Record<string, string>[] = [];
  const lines = content.split(/\r\n|\n/);

  if (lines.length < 1) return [];

  // Handle headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let inQuote = false;
    let currentValue = '';

    // Basic CSV state machine to handle commas inside quotes
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      // Clean quotes
      let val = values[index] || '';
      val = val.replace(/^"|"$/g, '').replace(/""/g, '"');
      row[header] = val;
    });
    rows.push(row);
  }

  return rows;
};

/**
 * Simple VCard Parser to extract contacts into a flat structure for CSV export.
 */
export const parseVCF = (content: string): InternalContact[] => {
  // Regex to split by BEGIN:VCARD and END:VCARD
  const cardBlocks = content.split(/BEGIN:VCARD/i).slice(1);
  const contacts: InternalContact[] = [];

  cardBlocks.forEach((block, idx) => {
    if (!block.trim()) return;

    const contact: InternalContact = {
      id: `vcf-${idx}`,
      firstName: '',
      lastName: '',
    };

    const lines = block.split(/\r\n|\n/);

    // Helper to unwrap folded lines (lines starting with space)
    const unfoldedLines: string[] = [];
    lines.forEach(line => {
      if (line.startsWith(' ') && unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.trim();
      } else {
        unfoldedLines.push(line);
      }
    });

    unfoldedLines.forEach(line => {
      // Simple parsing logic. In a real heavy production app, use a dedicated tokenizer.
      const [keyPart, ...valueParts] = line.split(':');
      if (!valueParts.length) return;

      const value = valueParts.join(':').replace(/\\;/g, ';').replace(/\\,/g, ',').trim();
      const [key, ...params] = keyPart.split(';');

      switch (key.toUpperCase()) {
        case 'N': // Name: Family;Given;Middle;Prefix;Suffix
          const nameParts = value.split(';');
          contact.lastName = nameParts[0] || '';
          contact.firstName = nameParts[1] || '';
          break;
        case 'FN': // Formatted Name - fallback
          if (!contact.firstName && !contact.lastName) {
             const parts = value.split(' ');
             contact.firstName = parts[0];
             contact.lastName = parts.slice(1).join(' ');
          }
          break;
        case 'ORG':
          contact.organization = value.split(';')[0];
          break;
        case 'TITLE':
          contact.jobTitle = value;
          break;
        case 'EMAIL':
          contact.email = value;
          break;
        case 'TEL':
          const isCell = params.some(p => p.toUpperCase().includes('CELL'));
          const isWork = params.some(p => p.toUpperCase().includes('WORK'));
          if (isCell || !contact.mobilePhone) contact.mobilePhone = value;
          else if (isWork) contact.workPhone = value;
          break;
        case 'URL':
          contact.website = value;
          break;
        case 'NOTE':
          contact.note = value;
          break;
        case 'ADR': // Post Office Box;Extended Address;Street;Locality;Region;Postal Code;Country Name
           const adrParts = value.split(';');
           // Naive join
           contact.address = adrParts.filter(p => p).join(', ');
           break;
      }
    });

    contacts.push(contact);
  });

  return contacts;
};