import { Hospital, MedicalStore, Rider } from './types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'City General Medical Center',
    licenseNumber: 'LIC-2023-88912',
    location: 'Road No. 12, Banjara Hills, Hyderabad',
    contact: '+91 40 2345-6789',
    lat: 17.4126,
    lng: 78.4503,
    verified: true,
    equipment: [
      { id: 'eq-1-1', name: 'O2 Cylinder (45L)', category: 'Oxygen', available: 12, total: 15, unit: 'cylinders' },
      { id: 'eq-1-2', name: 'O2 Cylinder (10L Mini)', category: 'Oxygen', available: 6, total: 20, unit: 'cylinders' },
      { id: 'eq-1-3', name: 'O- Negative Blood', category: 'Blood', available: 8, total: 10, unit: 'bags' },
      { id: 'eq-1-4', name: 'AB+ Positive Blood', category: 'Blood', available: 4, total: 12, unit: 'bags' },
      { id: 'eq-1-5', name: 'A+ Positive Blood', category: 'Blood', available: 15, total: 15, unit: 'bags' },
      { id: 'eq-1-6', name: 'ICU Ventilator (Portable)', category: 'Ventilator', available: 3, total: 5, unit: 'units' },
      { id: 'eq-1-7', name: 'AED Defibrillator', category: 'Defibrillator', available: 5, total: 8, unit: 'units' },
    ],
  },
  {
    id: 'hosp-2',
    name: 'St. Jude Specialty Hospital',
    licenseNumber: 'LIC-2021-44120',
    location: 'Road No. 36, Jubilee Hills, Hyderabad',
    contact: '+91 40 6677-8899',
    lat: 17.4195,
    lng: 78.4465,
    verified: true,
    equipment: [
      { id: 'eq-2-1', name: 'O2 Cylinder (45L)', category: 'Oxygen', available: 2, total: 10, unit: 'cylinders' },
      { id: 'eq-2-2', name: 'B+ Positive Blood', category: 'Blood', available: 9, total: 10, unit: 'bags' },
      { id: 'eq-2-3', name: 'O+ Positive Blood', category: 'Blood', available: 11, total: 12, unit: 'bags' },
      { id: 'eq-2-4', name: 'ICU Ventilator (High-Flow)', category: 'Ventilator', available: 0, total: 4, unit: 'units' },
      { id: 'eq-2-5', name: 'AED Defibrillator', category: 'Defibrillator', available: 2, total: 4, unit: 'units' },
    ],
  },
  {
    id: 'hosp-3',
    name: 'Metro Trauma & Emergency Hospital',
    licenseNumber: 'LIC-2024-11094',
    location: 'Punjagutta Circle, Hyderabad',
    contact: '+91 40 2789-0011',
    lat: 17.4080,
    lng: 78.4535,
    verified: true,
    equipment: [
      { id: 'eq-3-1', name: 'O2 Cylinder (45L)', category: 'Oxygen', available: 20, total: 25, unit: 'cylinders' },
      { id: 'eq-3-2', name: 'O2 Cylinder (10L Mini)', category: 'Oxygen', available: 15, total: 15, unit: 'cylinders' },
      { id: 'eq-3-3', name: 'O- Negative Blood', category: 'Blood', available: 2, total: 4, unit: 'bags' },
      { id: 'eq-3-4', name: 'AB- Negative Blood', category: 'Blood', available: 3, total: 5, unit: 'bags' },
      { id: 'eq-3-5', name: 'ICU Ventilator (Portable)', category: 'Ventilator', available: 6, total: 8, unit: 'units' },
      { id: 'eq-3-6', name: 'AED Defibrillator', category: 'Defibrillator', available: 4, total: 6, unit: 'units' },
    ],
  }
];

export const INITIAL_STORES: MedicalStore[] = [
  {
    id: 'store-1',
    name: 'Apothecary 24/7 Wellness Pharmacy',
    licenseNumber: 'PHAR-2022-9901',
    location: 'Road No. 2, Banjara Hills, Hyderabad',
    contact: '+91 40 4455-6677',
    lat: 17.4155,
    lng: 78.4478,
    medicines: [
      { id: 'med-1-1', name: 'Remdesivir Infusion (100mg)', category: 'Antiviral', available: true, stock: 18, price: 120 },
      { id: 'med-1-2', name: 'Epipen Auto-Injector (0.3mg)', category: 'Emergency', available: true, stock: 8, price: 95 },
      { id: 'med-1-3', name: 'Paxlovid (Nirmatrelvir/Ritonavir)', category: 'Antiviral', available: true, stock: 15, price: 150 },
      { id: 'med-1-4', name: 'Albuterol Inhaler (90mcg)', category: 'Respiratory', available: true, stock: 40, price: 35 },
      { id: 'med-1-5', name: 'Insulin Glargine Pen (100 U/mL)', category: 'Diabetes', available: true, stock: 25, price: 55 },
      { id: 'med-1-6', name: 'Amoxicillin 500mg (30 Caps)', category: 'Antibiotic', available: true, stock: 100, price: 15 },
    ],
  },
  {
    id: 'store-2',
    name: 'MediQuick Rx Center',
    licenseNumber: 'PHAR-2020-1123',
    location: 'Panjagutta Road, Hyderabad',
    contact: '+91 40 9988-7766',
    lat: 17.4058,
    lng: 78.4458,
    medicines: [
      { id: 'med-2-1', name: 'Remdesivir Infusion (100mg)', category: 'Antiviral', available: false, stock: 0, price: 130 },
      { id: 'med-2-2', name: 'Epipen Auto-Injector (0.3mg)', category: 'Emergency', available: true, stock: 4, price: 98 },
      { id: 'med-2-3', name: 'Albuterol Inhaler (90mcg)', category: 'Respiratory', available: true, stock: 12, price: 32 },
      { id: 'med-2-4', name: 'Insulin Glargine Pen (100 U/mL)', category: 'Diabetes', available: true, stock: 8, price: 60 },
      { id: 'med-2-5', name: 'Amoxicillin 500mg (30 Caps)', category: 'Antibiotic', available: true, stock: 50, price: 18 },
      { id: 'med-2-6', name: 'Paracetamol Emergency Infusion (1000mg)', category: 'Analgesic', available: true, stock: 30, price: 22 },
    ],
  }
];

export const INITIAL_RIDERS: Rider[] = [
  { id: 'rider-1', name: 'Sarah Connor', phone: '+91 98765-43210', vehicleNo: 'TS-01-EV-8800', lat: 17.4140, lng: 78.4490, status: 'idle' },
  { id: 'rider-2', name: 'David Miller', phone: '+91 97654-32109', vehicleNo: 'TS-02-DX-9900', lat: 17.4110, lng: 78.4520, status: 'idle' },
  { id: 'rider-3', name: 'Marcus Vance', phone: '+91 96543-21098', vehicleNo: 'TS-03-EV-4040', lat: 17.4160, lng: 78.4510, status: 'idle' }
];
