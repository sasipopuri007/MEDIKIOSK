import { DEMO_HOSPITALS } from '../data/hospitalsData';
import { calculateDistanceKm } from '../utils/haversine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '' 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Send SMS OTP via FastAPI backend or fallback to local Demo OTP (1234)
 */
export async function sendOtp(phoneNumber) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber })
    });
    
    const data = await res.json();
    return {
      success: data.success,
      isDemo: data.is_demo,
      message: data.message
    };
  } catch (err) {
    console.error('FastAPI send-otp error:', err);
    return {
      success: false,
      isDemo: false,
      message: 'Unable to connect to authentication server. Please check your connection.'
    };
  }
}

export async function verifyOtp(phoneNumber, code) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber, code })
    });

    const data = await res.json();
    return {
      success: data.verified,
      isDemo: data.is_demo,
      message: data.message
    };
  } catch (err) {
    console.error('FastAPI verify-otp error:', err);
    return {
      success: false,
      message: 'Unable to connect to verification server. Please try again.'
    };
  }
}

/**
 * Search Nearby Hospitals via FastAPI Google Places endpoint or Haversine Demo Fallback
 */
export async function searchNearbyHospitals(userLat, userLng, searchQuery = '', categoryFilter = 'ALL', radiusInMeters = 10000) {
  if (userLat && userLng) {
    try {
      const url = new URL(`${API_BASE_URL}/api/hospitals/nearby`);
      url.searchParams.append('latitude', userLat);
      url.searchParams.append('longitude', userLng);
      url.searchParams.append('radius', radiusInMeters);
      if (searchQuery) url.searchParams.append('query', searchQuery);
      if (categoryFilter) url.searchParams.append('category', categoryFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.hospitals && data.hospitals.length > 0) {
          const mapped = data.hospitals.map(h => ({
            id: h.id,
            name: h.name,
            category: h.category,
            type: h.type,
            address: h.address,
            phone: h.phone || null,
            lat: h.lat,
            lng: h.lng,
            rating: h.rating || 4.5,
            distance: h.distance_km,
            googleMapsUri: h.google_maps_uri || `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
            isDemo: h.is_demo
          }));
          return { data: mapped, isRealData: data.source === 'google_places', source: data.source };
        }
      }
    } catch (err) {
      console.warn('FastAPI hospital discovery notice, using Haversine dataset:', err);
    }
  }

  // Fallback to Demo Dataset with Haversine Distance Calculation
  let hospitals = DEMO_HOSPITALS.map((h) => {
    const dist = (userLat && userLng) ? calculateDistanceKm(userLat, userLng, h.lat, h.lng) : 3.2;
    return { ...h, distance: dist };
  });

  if (categoryFilter && categoryFilter !== 'ALL') {
    hospitals = hospitals.filter(h => 
      h.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      h.type.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    hospitals = hospitals.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.area.toLowerCase().includes(q) ||
      h.pincode.includes(q)
    );
  }

  hospitals.sort((a, b) => a.distance - b.distance);
  return { data: hospitals, isRealData: false };
}
