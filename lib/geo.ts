// District detection and geolocation utilities

export type DistrictId =
  | 'tvm' | 'kln' | 'ptm' | 'alp' | 'ktm' | 'idk'
  | 'ekm' | 'tsr' | 'pkd' | 'mlp' | 'koz' | 'wyd' | 'knr' | 'ksg'

export interface DistrictInfo {
  id: DistrictId
  name: string
  region: string
}

export const KERALA_DISTRICT_LIST: DistrictInfo[] = [
  { id: 'tvm', name: 'Thiruvananthapuram', region: 'South Coast' },
  { id: 'kln', name: 'Kollam',             region: 'South Coast' },
  { id: 'ptm', name: 'Pathanamthitta',     region: 'Central Hills' },
  { id: 'alp', name: 'Alappuzha',          region: 'Backwaters' },
  { id: 'ktm', name: 'Kottayam',           region: 'Backwaters' },
  { id: 'idk', name: 'Idukki',             region: 'Western Ghats' },
  { id: 'ekm', name: 'Ernakulam',          region: 'Central Coast' },
  { id: 'tsr', name: 'Thrissur',           region: 'Central' },
  { id: 'pkd', name: 'Palakkad',           region: 'Central' },
  { id: 'mlp', name: 'Malappuram',         region: 'Malabar' },
  { id: 'koz', name: 'Kozhikode',          region: 'Malabar' },
  { id: 'wyd', name: 'Wayanad',            region: 'Western Ghats' },
  { id: 'knr', name: 'Kannur',             region: 'North Malabar' },
  { id: 'ksg', name: 'Kasaragod',          region: 'North Malabar' },
]

// Comprehensive city/town → district mapping
const CITY_TO_DISTRICT: Record<string, DistrictId> = {
  // Thiruvananthapuram
  trivandrum: 'tvm', thiruvananthapuram: 'tvm', tvm: 'tvm',
  neyyattinkara: 'tvm', attingal: 'tvm', nedumangad: 'tvm',
  varkala: 'tvm', kazhakkoottam: 'tvm', technopark: 'tvm',
  // Kollam
  kollam: 'kln', quilon: 'kln', punalur: 'kln',
  paravur: 'kln', karunagappally: 'kln', kottarakkara: 'kln',
  // Pathanamthitta
  pathanamthitta: 'ptm', adoor: 'ptm', thiruvalla: 'ptm',
  pandalam: 'ptm', ranni: 'ptm', konni: 'ptm',
  // Alappuzha
  alappuzha: 'alp', alleppey: 'alp', chengannur: 'alp',
  kayamkulam: 'alp', mavelikkara: 'alp', haripad: 'alp',
  // Kottayam
  kottayam: 'ktm', changanacherry: 'ktm', pala: 'ktm',
  ettumanoor: 'ktm', vaikom: 'ktm', kanjirappally: 'ktm',
  // Idukki
  idukki: 'idk', munnar: 'idk', thodupuzha: 'idk',
  devikulam: 'idk', kumily: 'idk', peerumade: 'idk',
  // Ernakulam
  kochi: 'ekm', cochin: 'ekm', ernakulam: 'ekm',
  'fort kochi': 'ekm', aluva: 'ekm', angamaly: 'ekm',
  perumbavoor: 'ekm', muvattupuzha: 'ekm', 'north paravur': 'ekm',
  thrippunithura: 'ekm', kalamassery: 'ekm', kakkanad: 'ekm',
  edapally: 'ekm', tripunithura: 'ekm', piravom: 'ekm',
  // Thrissur
  thrissur: 'tsr', trichur: 'tsr', guruvayur: 'tsr',
  chalakudy: 'tsr', irinjalakuda: 'tsr', kodungallur: 'tsr',
  // Palakkad
  palakkad: 'pkd', palghat: 'pkd', ottapalam: 'pkd',
  shoranur: 'pkd', chittur: 'pkd', mankara: 'pkd',
  // Malappuram
  malappuram: 'mlp', manjeri: 'mlp', tirur: 'mlp',
  perinthalmanna: 'mlp', tirurrangadi: 'mlp', ponnani: 'mlp',
  tanur: 'mlp', kondotty: 'mlp',
  // Kozhikode
  kozhikode: 'koz', calicut: 'koz', vatakara: 'koz',
  koyilandy: 'koz', ramanattukara: 'koz', beypore: 'koz',
  feroke: 'koz', mukkom: 'koz',
  // Wayanad
  wayanad: 'wyd', kalpetta: 'wyd', mananthavady: 'wyd',
  'sulthan bathery': 'wyd', vythiri: 'wyd', ambalavayal: 'wyd',
  // Kannur
  kannur: 'knr', cannanore: 'knr', thalassery: 'knr',
  iritty: 'knr', payyanur: 'knr', kuthuparamba: 'knr',
  thaliparamba: 'knr', tellicherry: 'knr',
  // Kasaragod
  kasaragod: 'ksg', kasargod: 'ksg', kanhangad: 'ksg',
  hosdurg: 'ksg', bekal: 'ksg', manjeshwar: 'ksg',
}

export function detectDistrictFromCity(city: string): DistrictId | null {
  if (!city) return null
  const normalized = city.toLowerCase().trim()

  if (CITY_TO_DISTRICT[normalized]) return CITY_TO_DISTRICT[normalized]

  // Partial: city contains known alias
  for (const [alias, id] of Object.entries(CITY_TO_DISTRICT)) {
    if (normalized.includes(alias)) return id
  }

  // Partial: alias contains city (for short city names ≥ 4 chars)
  if (normalized.length >= 4) {
    for (const [alias, id] of Object.entries(CITY_TO_DISTRICT)) {
      if (alias.includes(normalized)) return id
    }
  }

  return null
}

export function getDistrictById(id: string): DistrictInfo | undefined {
  return KERALA_DISTRICT_LIST.find(d => d.id === id)
}

export interface GeoResult {
  isKerala: boolean
  districtId: DistrictId | null
  districtName: string | null
  city: string | null
}
