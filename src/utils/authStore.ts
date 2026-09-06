// Local storage keys for credential management
const ADMIN_CREDENTIALS_KEY = 'sacristy_admin_credentials_v1';
const OFFICER_PINS_KEY = 'sacristy_officer_pins_v1';

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

export interface OfficerPinMap {
  [officerId: string]: string;
}

// 1. Get current admin credentials (default: admin / sakristi123)
export function getAdminCredentials(): AdminCredentials {
  try {
    const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read admin credentials from localStorage', e);
  }
  return {
    username: 'admin',
    password: 'sakristi123'
  };
}

// 2. Save new admin credentials
export function saveAdminCredentials(username: string, password: string): boolean {
  try {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!cleanUser || !cleanPass) return false;

    const data: AdminCredentials = {
      username: cleanUser,
      password: cleanPass,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save admin credentials', e);
    return false;
  }
}

// 3. Get officer / koorlap PIN (default: 1234)
export function getOfficerPin(officerId: string): string {
  try {
    const cleanId = officerId.trim();
    const id3 = cleanId.padStart(3, '0');
    const saved = localStorage.getItem(OFFICER_PINS_KEY);
    if (saved) {
      const map: OfficerPinMap = JSON.parse(saved);
      if (map[id3]) return map[id3];
      if (map[cleanId]) return map[cleanId];
    }
  } catch (e) {
    console.warn('Failed to read officer PIN', e);
  }
  return '1234';
}

// 4. Save officer / koorlap PIN
export function saveOfficerPin(officerId: string, newPin: string): boolean {
  try {
    const cleanId = officerId.trim();
    const id3 = cleanId.padStart(3, '0');
    const cleanPin = newPin.trim();
    if (!cleanPin) return false;

    let map: OfficerPinMap = {};
    const saved = localStorage.getItem(OFFICER_PINS_KEY);
    if (saved) {
      try {
        map = JSON.parse(saved) || {};
      } catch {}
    }

    map[id3] = cleanPin;
    map[cleanId] = cleanPin;
    localStorage.setItem(OFFICER_PINS_KEY, JSON.stringify(map));
    return true;
  } catch (e) {
    console.error('Failed to save officer PIN', e);
    return false;
  }
}

// 5. Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  const current = getAdminCredentials();
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();
  return cleanUser === current.username.toLowerCase() && cleanPass === current.password;
}

// 6. Verify officer / koorlap PIN
export function verifyOfficerPin(officerId: string, pin: string): boolean {
  const expected = getOfficerPin(officerId);
  return pin.trim() === expected;
}
