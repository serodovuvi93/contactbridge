import { InternalContact, VCardVersion } from '../types';

const escapeVCardValue = (str: string | undefined): string => {
  if (!str) return '';
  // VCard 3.0/4.0 escaping
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

export const generateVCard = (contact: InternalContact, version: VCardVersion): string => {
  const n = `${escapeVCardValue(contact.lastName)};${escapeVCardValue(contact.firstName)};;;`;
  const fn = `${contact.firstName} ${contact.lastName}`.trim();

  let vcard = `BEGIN:VCARD\nVERSION:${version}\n`;
  vcard += `N:${n}\n`;
  vcard += `FN:${fn}\n`;

  if (contact.organization) vcard += `ORG:${escapeVCardValue(contact.organization)}\n`;
  if (contact.jobTitle) vcard += `TITLE:${escapeVCardValue(contact.jobTitle)}\n`;
  
  if (contact.mobilePhone) {
    // Basic normalization could happen here, but we trust input for now
    vcard += `TEL;TYPE=CELL:${contact.mobilePhone}\n`;
  }
  if (contact.workPhone) {
    vcard += `TEL;TYPE=WORK:${contact.workPhone}\n`;
  }
  
  if (contact.email) vcard += `EMAIL;TYPE=INTERNET:${contact.email}\n`;
  if (contact.website) vcard += `URL:${contact.website}\n`;
  if (contact.address) {
    // Assuming flat address for simplicity in this utility
    vcard += `ADR;TYPE=HOME:;;${escapeVCardValue(contact.address)};;;;\n`;
  }
  if (contact.note) vcard += `NOTE:${escapeVCardValue(contact.note)}\n`;

  vcard += `END:VCARD\n`;
  return vcard;
};

export const generateBulkVCF = (contacts: InternalContact[], version: VCardVersion): string => {
  return contacts.map(c => generateVCard(c, version)).join('\n');
};

export const generateCSV = (contacts: InternalContact[]): string => {
  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const headers = [
    'First Name', 'Last Name', 'Organization', 'Job Title', 
    'Mobile Phone', 'Work Phone', 'Email', 'Website', 'Address', 'Notes'
  ];
  
  const csvRows = contacts.map(c => {
    return [
      c.firstName,
      c.lastName,
      c.organization,
      c.jobTitle,
      c.mobilePhone,
      c.workPhone,
      c.email,
      c.website,
      c.address,
      c.note
    ].map(val => {
      const v = val || '';
      // Escape double quotes
      if (v.includes('"') || v.includes(',') || v.includes('\n')) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    }).join(',');
  });

  return BOM + headers.join(',') + '\n' + csvRows.join('\n');
};