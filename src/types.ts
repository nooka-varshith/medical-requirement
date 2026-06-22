export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Oxygen' | 'Blood' | 'Ventilator' | 'Defibrillator' | 'Other';
  available: number;
  total: number;
  unit: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  category: string;
  available: boolean;
  stock: number;
  price: number;
}

export interface Hospital {
  id: string;
  name: string;
  licenseNumber: string;
  location: string;
  contact: string;
  lat: number; // For map representation
  lng: number;
  equipment: EquipmentItem[];
  verified: boolean;
}

export interface MedicalStore {
  id: string;
  name: string;
  licenseNumber: string;
  location: string;
  contact: string;
  lat: number;
  lng: number;
  medicines: MedicineItem[];
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  lat: number;
  lng: number;
  status: 'idle' | 'assigned' | 'delivering' | 'completed';
}

export interface RequestOrder {
  id: string;
  userEmail: string;
  userLocation: string;
  destinationLat: number;
  destinationLng: number;
  sourceType: 'hospital' | 'store';
  sourceId: string;
  sourceName: string;
  sourceLat: number;
  sourceLng: number;
  itemName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'assembling' | 'rider_assigned' | 'in_transit' | 'delivered';
  rider?: Rider;
  createdAt: string;
}

export interface UserSession {
  email: string;
  username: string;
  address: string;
}
