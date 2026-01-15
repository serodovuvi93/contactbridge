export enum ConversionType {
  CSV_TO_VCF = 'CSV_TO_VCF',
  VCF_TO_CSV = 'VCF_TO_CSV',
  VCF_SPLIT = 'VCF_SPLIT',
}

export enum VCardVersion {
  V2_1 = '2.1',
  V3_0 = '3.0', // iOS Standard
  V4_0 = '4.0', // Modern
}

export interface InternalContact {
  id: string;
  firstName: string;
  lastName: string;
  organization?: string;
  jobTitle?: string;
  mobilePhone?: string;
  workPhone?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
  // Dynamic fields for unexpected CSV columns can be stored here if needed
  [key: string]: string | undefined;
}

export interface MappingField {
  label: string;
  key: keyof InternalContact;
  required: boolean;
  description: string;
}

export const SUPPORTED_FIELDS: MappingField[] = [
  { label: 'First Name', key: 'firstName', required: true, description: 'Given Name' },
  { label: 'Last Name', key: 'lastName', required: false, description: 'Family Name' },
  { label: 'Organization', key: 'organization', required: false, description: 'Company' },
  { label: 'Job Title', key: 'jobTitle', required: false, description: 'Role / Position' },
  { label: 'Mobile Phone', key: 'mobilePhone', required: false, description: 'Cell' },
  { label: 'Work Phone', key: 'workPhone', required: false, description: 'Office' },
  { label: 'Email', key: 'email', required: false, description: 'Email Address' },
  { label: 'Website', key: 'website', required: false, description: 'URL' },
  { label: 'Address', key: 'address', required: false, description: 'Full Address' },
  { label: 'Notes', key: 'note', required: false, description: 'Remarks' },
];

export type ColumnMapping = Record<keyof InternalContact, string | null>; // ContactKey -> CSV Header