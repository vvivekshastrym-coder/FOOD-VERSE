import { prisma } from "./prisma";

// Defaults for all 22 PRD features
export const DEFAULT_FLAGS: Record<string, boolean> = {
  FEATURE_3D_DISH_VIEWER: true,
  FEATURE_AR_TABLE_PREVIEW: true,
  FEATURE_WALKABLE_FOOD_STREET: true,
  FEATURE_3D_FOOD_BUILDER: true,
  FEATURE_3D_ORDER_TRACKING: true,
  FEATURE_AI_FOOD_COMPANION: true,
  FEATURE_PREDICTIVE_CRAVINGS: true,
  FEATURE_FLAVOR_DNA: true,
  FEATURE_ALLERGEN_GUARDIAN: true,
  FEATURE_BUDGET_OPTIMIZER: true,
  FEATURE_ANTI_WASTE_DEALS: true,
  FEATURE_FOOD_ROOM: true,
  FEATURE_TASTE_TWIN_MATCHING: true,
  FEATURE_CREATOR_MENUS: true,
  FEATURE_PROVENANCE_CARD: true,
  FEATURE_GREEN_DELIVERY: true,
  FEATURE_SMART_PACKAGING_IOT: true,
  FEATURE_VOICE_ORDERING: true,
  FEATURE_KITCHEN_DIGITAL_TWIN: true,
  FEATURE_AUTONOMOUS_DELIVERY: false, // Pilot mode
  FEATURE_TOKENIZED_LOYALTY: true,
  FEATURE_GEN_3D_ONBOARDING: true
};

export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key }
    });
    if (flag) return flag.isEnabled;
  } catch {
    // Return default if db is unreachable
  }
  return DEFAULT_FLAGS[key] ?? false;
}

export async function getAllFeatureFlags() {
  try {
    return await prisma.featureFlag.findMany({
      orderBy: { key: "asc" }
    });
  } catch {
    return Object.entries(DEFAULT_FLAGS).map(([key, isEnabled]) => ({
      id: key,
      key,
      name: key.replace("FEATURE_", "").replace(/_/g, " "),
      description: "Modular feature flag",
      isEnabled,
      rolloutPercent: isEnabled ? 100 : 0
    }));
  }
}
