import { LocalityInfo } from '../types';

/**
 * Verified GVMC Localities with realistic coordinates, zones, and delimitation wards.
 */
export const GVMC_LOCALITIES: LocalityInfo[] = [
  {
    name: 'MVP Colony',
    teluguName: 'ఎంవిపి కాలనీ',
    ward: 18,
    zone: 'Zone 2 (Asilmetta)',
    lat: 17.7410,
    lng: 83.3340,
    description: 'Major residential and commercial hub in eastern Visakhapatnam'
  },
  {
    name: 'Madhurawada',
    teluguName: 'మధురవాడ',
    ward: 6,
    zone: 'Zone 1 (Bheemili)',
    lat: 17.8010,
    lng: 83.3420,
    description: 'Rapidly expanding IT and residential corridor on NH16'
  },
  {
    name: 'Seethammadhara',
    teluguName: 'సీతమ్మధార',
    ward: 24,
    zone: 'Zone 2 (Asilmetta)',
    lat: 17.7380,
    lng: 83.3100,
    description: 'Established civic and commercial neighborhood'
  },
  {
    name: 'Gajuwaka',
    teluguName: 'గాజువాక',
    ward: 65,
    zone: 'Zone 5 (Gajuwaka)',
    lat: 17.6900,
    lng: 83.2120,
    description: 'Heavy industrial and high-density commercial district'
  },
  {
    name: 'Pendurthi',
    teluguName: 'పెందుర్తి',
    ward: 72,
    zone: 'Zone 6 (Pendurthi)',
    lat: 17.8300,
    lng: 83.2000,
    description: 'Western suburb and major railway transit interchange'
  },
  {
    name: 'Akkayyapalem',
    teluguName: 'అక్కయ్యపాలెం',
    ward: 31,
    zone: 'Zone 3 (Central)',
    lat: 17.7280,
    lng: 83.3000,
    description: 'Dense residential neighborhood near National Highway'
  },
  {
    name: 'Dwaraka Nagar',
    teluguName: 'ద్వారకా నగర్',
    ward: 28,
    zone: 'Zone 3 (Central)',
    lat: 17.7250,
    lng: 83.3150,
    description: 'City central transit and main commercial quarter (RTC Complex)'
  },
  {
    name: 'Gopalapatnam',
    teluguName: 'గోపాలపట్నం',
    ward: 54,
    zone: 'Zone 4 (NAD)',
    lat: 17.7550,
    lng: 83.2250,
    description: 'Railway and transit hub near Simhachalam foothills'
  },
  {
    name: 'NAD Junction',
    teluguName: 'ఎన్.ఎ.డి జంక్షన్',
    ward: 52,
    zone: 'Zone 4 (NAD)',
    lat: 17.7420,
    lng: 83.2380,
    description: 'Key multi-level flyover arterial junction'
  },
  {
    name: 'Rushikonda',
    teluguName: 'ఋషికొండ',
    ward: 4,
    zone: 'Zone 1 (Bheemili)',
    lat: 17.7820,
    lng: 83.3850,
    description: 'Coastal IT SEZ and Blue Flag certified beach zone'
  },
  {
    name: 'Bheemili',
    teluguName: 'భీమిలి',
    ward: 1,
    zone: 'Zone 1 (Bheemili)',
    lat: 17.8900,
    lng: 83.4500,
    description: 'Historic coastal township and northern municipal limit'
  },
  {
    name: 'Simhachalam',
    teluguName: 'సింహాచలం',
    ward: 58,
    zone: 'Zone 4 (NAD)',
    lat: 17.7660,
    lng: 83.2500,
    description: 'Heritage temple township with pilgrim transit flows'
  },
  {
    name: 'Kancharapalem',
    teluguName: 'కంచరపాలెం',
    ward: 45,
    zone: 'Zone 3 (Central)',
    lat: 17.7310,
    lng: 83.2750,
    description: 'Historic cultural quarter and railway colony'
  },
  {
    name: 'Arilova',
    teluguName: 'ఆరిలోవ',
    ward: 12,
    zone: 'Zone 2 (Asilmetta)',
    lat: 17.7650,
    lng: 83.3320,
    description: 'Health city medical corridor and residential sector'
  },
  {
    name: 'Kurmannapalem',
    teluguName: 'కూర్మన్నపాలెం',
    ward: 68,
    zone: 'Zone 5 (Gajuwaka)',
    lat: 17.6650,
    lng: 83.1600,
    description: 'Steel Plant township gate and gateway junction'
  },
  {
    name: 'Sheela Nagar',
    teluguName: 'షీలా నగర్',
    ward: 60,
    zone: 'Zone 5 (Gajuwaka)',
    lat: 17.7120,
    lng: 83.2450,
    description: 'Airport transit corridor and industrial logistics zone'
  },
  {
    name: 'Aganampudi',
    teluguName: 'అగనంపూడి',
    ward: 70,
    zone: 'Zone 5 (Gajuwaka)',
    lat: 17.6520,
    lng: 83.1420,
    description: 'Southern suburban municipal toll corridor'
  }
];

/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Find closest verified GVMC locality
 */
export function getClosestLocality(lat: number, lng: number): LocalityInfo {
  let closest = GVMC_LOCALITIES[0];
  let minDistance = Infinity;

  for (const locality of GVMC_LOCALITIES) {
    const dist = haversineDistanceMeters(lat, lng, locality.lat, locality.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = locality;
    }
  }

  return closest;
}
