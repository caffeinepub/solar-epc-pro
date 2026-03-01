import { useState } from "react";

const STORAGE_KEY = "solarEpcCompanyProfile";

export interface CompanyProfile {
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  logoBase64: string;
}

const defaultProfile: CompanyProfile = {
  companyName: "",
  companyAddress: "",
  gstNumber: "",
  logoBase64: "",
};

function loadFromStorage(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile>(loadFromStorage);

  const saveProfile = (updates: Partial<CompanyProfile>) => {
    const merged = { ...profile, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // localStorage might be unavailable in some contexts
    }
    setProfile(merged);
  };

  return { profile, saveProfile };
}
