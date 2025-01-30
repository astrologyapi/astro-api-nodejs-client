// Categories
const PlanCategory = Object.freeze({
  VEDIC: "vedic",
  WESTERN: "western",
});

// Vedic Plans
const VedicPlans = Object.freeze({
  BASIC: "basic",
  PROFESSIONAL: "professional",
  PREMIUM: "premium",
});

// Western Plans
const WesternPlans = Object.freeze({
  STARTER: "starter",
  GROWTH: "growth",
  BUSINESS: "business",
});

//API Types
const API_TYPES = Object.freeze({
  PDF: "PDF",
  JSON: "JSON",
});

// Helper function to check if a given value is in a “frozen” enum object
function isValidEnumValue(enumObj, value) {
  return Object.values(enumObj).includes(value);
}

module.exports = {
  PlanCategory,
  VedicPlans,
  WesternPlans,
  API_TYPES,
  isValidEnumValue,
};
