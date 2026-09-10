// Comprehensive Demo Dataset for Indian Hospitals across Categories including Guntur & Telangana

export const DEMO_HOSPITALS = [
  {
    id: "hosp-guntur-101",
    name: "Government General Hospital (GGH) Guntur",
    category: "Government General",
    type: "Government",
    address: "Sambasiva Pet, Near Railway Station, Guntur, Andhra Pradesh",
    city: "Guntur",
    area: "Sambasiva Pet",
    pincode: "522001",
    phone: "+91 863 223 0001",
    lat: 16.3008,
    lng: 80.4375,
    rating: 4.6,
    openHours: "24/7 Emergency & OPD (8 AM - 2 PM)",
    specialties: ["General Medicine", "Cardiology", "Trauma Care", "Orthopedics", "Pediatrics"],
    doctors: [
      { id: "doc-g101", name: "Dr. P. Venkateswara Rao", specialty: "General Medicine", exp: "16 Yrs", status: "Available Today" },
      { id: "doc-g102", name: "Dr. K. Swathi", specialty: "Cardiology", exp: "12 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-guntur-102",
    name: "Ramesh Hospitals - Super Specialty Guntur",
    category: "Multispeciality",
    type: "Private",
    address: "Collector Office Road, Nagaralu, Guntur, Andhra Pradesh",
    city: "Guntur",
    area: "Nagaralu",
    pincode: "522004",
    phone: "+91 863 237 7777",
    lat: 16.3067,
    lng: 80.4365,
    rating: 4.8,
    openHours: "24 Hours Emergency & Critical Care",
    specialties: ["Cardiology", "Neurology", "Gastroenterology", "Pulmonology"],
    doctors: [
      { id: "doc-g103", name: "Dr. Ramesh Babu", specialty: "Cardiology", exp: "20 Yrs", status: "Available Today" },
      { id: "doc-g104", name: "Dr. V. Prasad", specialty: "Neurology", exp: "15 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-guntur-103",
    name: "Manipal Super Specialty Hospital Guntur",
    category: "Multispeciality",
    type: "Private",
    address: "Near Prakasam Barrage, Tadepalle, Guntur District, AP",
    city: "Guntur",
    area: "Tadepalle",
    pincode: "522501",
    phone: "+91 863 222 5555",
    lat: 16.4862,
    lng: 80.6025,
    rating: 4.7,
    openHours: "24/7 Emergency & Outpatient Care",
    specialties: ["Oncology", "Orthopedics", "Pediatrics", "Nephrology"],
    doctors: [
      { id: "doc-g105", name: "Dr. S. Radhakrishna", specialty: "Orthopedics", exp: "18 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-guntur-104",
    name: "Community Health Centre (CHC) Guntur Urban",
    category: "CHC",
    type: "Government",
    address: "Kothapet Main Road, Guntur, Andhra Pradesh",
    city: "Guntur",
    area: "Kothapet",
    pincode: "522001",
    phone: "+91 863 224 1122",
    lat: 16.3120,
    lng: 80.4410,
    rating: 4.2,
    openHours: "8:00 AM - 5:00 PM",
    specialties: ["Primary Care", "Maternal Care", "Vaccination"],
    doctors: [
      { id: "doc-g106", name: "Dr. M. Sailaja", specialty: "General Medicine", exp: "9 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-101",
    name: "Government General Hospital & Medical College",
    category: "Government General",
    type: "Government",
    address: "Station Road, Near Central Bus Stand, Hyderabad, Telangana",
    city: "Hyderabad",
    area: "Abids",
    pincode: "500001",
    phone: "+91 40 2460 0121",
    lat: 17.3850,
    lng: 78.4867,
    rating: 4.5,
    openHours: "24/7 Emergency & OPD (8 AM - 2 PM)",
    specialties: ["General Medicine", "Cardiology", "Orthopedics", "Emergency Care", "Pediatrics"],
    doctors: [
      { id: "doc-101", name: "Dr. Ananya Sharma", specialty: "General Medicine", exp: "14 Yrs", status: "Available Today" },
      { id: "doc-102", name: "Dr. Rajesh Verma", specialty: "Cardiology", exp: "18 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-102",
    name: "District Government Civil Hospital",
    category: "District Government",
    type: "Government",
    address: "Civil Hospital Road, Secunderabad, Telangana",
    city: "Secunderabad",
    area: "Paradise",
    pincode: "500003",
    phone: "+91 40 2780 4321",
    lat: 17.4399,
    lng: 78.4983,
    rating: 4.3,
    openHours: "24 Hours Emergency",
    specialties: ["General Surgery", "Pulmonology", "Gynecology", "ENT"],
    doctors: [
      { id: "doc-103", name: "Dr. K. Srinivas", specialty: "General Surgery", exp: "12 Yrs", status: "Available Today" },
      { id: "doc-104", name: "Dr. Lakshmi Reddy", specialty: "Gynecology", exp: "16 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-103",
    name: "Community Health Centre (CHC) - Urban Clinic",
    category: "CHC",
    type: "Government",
    address: "Main Road, Banjara Hills Colony, Hyderabad, Telangana",
    city: "Hyderabad",
    area: "Banjara Hills",
    pincode: "500034",
    phone: "+91 40 2335 9988",
    lat: 17.4156,
    lng: 78.4347,
    rating: 4.2,
    openHours: "8:00 AM - 6:00 PM",
    specialties: ["Primary Care", "Immunization", "Maternal Health", "General Medicine"],
    doctors: [
      { id: "doc-105", name: "Dr. Ramesh Babu", specialty: "General Medicine", exp: "10 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-104",
    name: "Primary Health Centre (PHC) - Community Care",
    category: "PHC",
    type: "Government",
    address: "High School Road, Gachibowli, Hyderabad, Telangana",
    city: "Hyderabad",
    area: "Gachibowli",
    pincode: "500032",
    phone: "+91 40 2300 1122",
    lat: 17.4401,
    lng: 78.3489,
    rating: 4.0,
    openHours: "9:00 AM - 4:00 PM",
    specialties: ["Basic Health", "Vaccination", "First Aid", "General Consultation"],
    doctors: [
      { id: "doc-106", name: "Dr. Sunita Rao", specialty: "General Medicine", exp: "8 Yrs", status: "Available Today" }
    ],
    isDemo: true
  },
  {
    id: "hosp-105",
    name: "Apollo Multispeciality Super Specialty Hospital",
    category: "Multispeciality",
    type: "Private",
    address: "Road No 92, Jubilee Hills, Hyderabad, Telangana",
    city: "Hyderabad",
    area: "Jubilee Hills",
    pincode: "500033",
    phone: "+91 40 2360 7777",
    lat: 17.4319,
    lng: 78.4071,
    rating: 4.8,
    openHours: "24/7 Critical Care & Emergency",
    specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
    doctors: [
      { id: "doc-107", name: "Dr. Vikram Varma", specialty: "Neurology", exp: "22 Yrs", status: "Available Today" },
      { id: "doc-108", name: "Dr. Meera Nambiar", specialty: "Cardiology", exp: "15 Yrs", status: "Available Today" }
    ],
    isDemo: true
  }
];
