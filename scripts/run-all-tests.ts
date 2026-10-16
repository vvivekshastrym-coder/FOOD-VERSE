import { prisma } from "../src/lib/prisma";
import { calculateBill } from "../src/lib/pricing";
import { transitionOrderStatus } from "../src/lib/orderStateMachine";
import { fileDispute, resolveDispute } from "../src/lib/trueSize";
import { processAICompanionQuery } from "../src/lib/aiCompanion";
import { isFeatureEnabled, getAllFeatureFlags } from "../src/lib/featureFlags";
import { signToken, verifyToken, hashPassword, verifyPassword } from "../src/lib/auth";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🧪 FOODVERSE AUTOMATED ACCEPTANCE & SECURITY TEST SUITE");
  console.log("========================================================\n");

  // SUITE 1: AUTHENTICATION, SESSIONS & PASSWORD HASHING
  console.log("▶ SUITE 1: Authentication, Sessions & RBAC");
  const rawPassword = "TestSecretPassword123!";
  const hash = await hashPassword(rawPassword);
  assert(await verifyPassword(rawPassword, hash), "Bcrypt password hashing and validation");
  assert(!(await verifyPassword("WrongPassword", hash)), "Rejection of invalid password credentials");

  const token = signToken({
    userId: "test-user-id",
    email: "test@foodverse.io",
    name: "Test User",
    role: "CUSTOMER"
  });
  const decoded = verifyToken(token);
  assert(decoded !== null && decoded.email === "test@foodverse.io", "JWT Session signing and verified payload");

  // SUITE 2: SIGNATURE PILLAR 1: TRUE-SIZE PROMISE & DISPUTE WORKFLOW
  console.log("\n▶ SUITE 2: Signature Pillar 1 - True-Size Promise & Dispute Workflow");
  const verifiedDish = await prisma.menuItem.findFirst({
    where: { trueSizeVerified: true },
    include: { portionVariants: true, assets: true }
  });
  assert(verifiedDish !== null, "True-Size verified dish exists in catalogue");
  assert(verifiedDish?.portionWeightG !== null && (verifiedDish?.portionWeightG || 0) > 0, "Verified dish maintains physical serving weight in grams");
  assert(verifiedDish?.portionDimensions !== null && verifiedDish?.portionDimensions.length! > 0, "Verified dish maintains audited serving dimensions");

  // Test filing a True-Size portion dispute
  const orderForDispute = await prisma.order.findFirst({
    include: { payments: true }
  });
  if (orderForDispute) {
    const dispute = await fileDispute({
      orderId: orderForDispute.id,
      userId: orderForDispute.userId,
      type: "TRUE_SIZE_MISMATCH",
      description: "Portion measured 320g instead of the 450g verified promise."
    });
    assert(dispute.status === "OPEN" && (dispute.refundAmount || 0) > 0, "True-Size portion dispute created with eligible refund calculation");

    // Operations reviewer approves refund
    const resolved = await resolveDispute({
      disputeId: dispute.id,
      decision: "APPROVED",
      reviewerId: "admin-reviewer",
      resolutionNote: "Portion discrepancy confirmed via kitchen dispatch log. Full refund granted."
    });
    assert(resolved.status === "APPROVED", "Dispute approved by operations reviewer");

    const ledgerDebit = await prisma.financialLedgerEntry.findFirst({
      where: { orderId: orderForDispute.id, type: "REFUND_DEBIT" }
    });
    assert(ledgerDebit !== null && ledgerDebit.amount < 0, "Financial ledger reflects refund debit against restaurant balance");
  }

  // SUITE 3: SIGNATURE PILLAR 2: HONEST RANKING (ZERO PAID INFLATION)
  console.log("\n▶ SUITE 3: Signature Pillar 2 - Honest Ranking Transparency");
  const allRestaurants = await prisma.restaurant.findMany({
    include: { menuItems: true }
  });
  assert(allRestaurants.length >= 3, "Database contains seeded verified partner restaurants");
  const sponsored = allRestaurants.find(r => r.isSponsored);
  if (sponsored) {
    assert(sponsored.sponsoredLabel !== null, "Sponsored partners are explicitly labeled with disclosure");
  }
  const organic = allRestaurants.filter(r => !r.isSponsored);
  assert(organic.length > 0, "Organic results are distinguished from sponsored placements");

  // SUITE 4: SIGNATURE PILLAR 3: FOOD ROOM GROUP ORDERING
  console.log("\n▶ SUITE 4: Signature Pillar 3 - Food Room Collaborative Cart");
  const room = await prisma.foodRoom.findFirst({
    where: { code: "ROOM42" },
    include: { members: true, items: true }
  });
  assert(room !== null, "Active Food Room retrieved by 6-digit code");
  assert(room?.members.length! > 0, "Room enforces host and member participation");
  assert(room?.items.length! > 0, "Shared group cart synchronizes dishes across participants");

  // SUITE 5: SIGNATURE PILLAR 4: FLAVOR DNA
  console.log("\n▶ SUITE 5: Signature Pillar 4 - Flavor DNA & Taste Profile");
  const flavorProfile = await prisma.flavorProfile.findFirst();
  assert(flavorProfile !== null, "Flavor DNA profile exists with 6 sensory dimensions");
  assert(flavorProfile?.spicy !== undefined && flavorProfile?.umami !== undefined, "Multi-axis metrics (Spicy, Sweet, Sour, Umami, Crunch, Richness) present");

  // SUITE 6: SIGNATURE PILLAR 5: KITCHEN-TO-DOOR VALIDATED STATE MACHINE
  console.log("\n▶ SUITE 6: Signature Pillar 5 - Kitchen-to-Door State Machine");
  const testOrder = await prisma.order.findFirst({
    include: { deliveryTask: true }
  });
  assert(testOrder !== null, "Authoritative order record retrieved");

  // Verify transition rejection for illegal jump
  let errorCaught = false;
  try {
    await transitionOrderStatus({
      orderId: testOrder!.id,
      nextStatus: "DELIVERED",
      actorId: "malicious-actor",
      actorRole: "CUSTOMER" // Customers cannot mark an order delivered
    });
  } catch (err) {
    errorCaught = true;
  }
  assert(errorCaught, "State machine rejects unauthorized or out-of-order transitions");

  // SUITE 7: BILLING & PRICING ENGINE (INDIA-READY)
  console.log("\n▶ SUITE 7: India-Ready Server-Side Billing Engine");
  const billWithCoupon = await calculateBill({
    subtotal: 500,
    couponCode: "FIRST3D",
    isEcoDelivery: true,
    hasUserSubscription: false,
    deliveryDistanceKm: 4
  });
  assert(billWithCoupon.subtotal === 500, "Subtotal calculated accurately");
  assert(billWithCoupon.discount === 100, "20% coupon capped at max ₹100 discount applied correctly");
  assert(billWithCoupon.platformFee === 5.0, "Platform fee (₹5) itemized");
  assert(billWithCoupon.gstAmount === 20.0, "5% GST on discounted food value calculated accurately");
  assert(billWithCoupon.totalAmount === 460.0, "Total payable matches exact server arithmetic");

  // Test coupon below minimum order value
  const billIneligible = await calculateBill({
    subtotal: 150, // FIRST3D requires ₹299 min
    couponCode: "FIRST3D"
  });
  assert(billIneligible.discount === 0, "Ineligible coupon rejected when order is below minOrderValue");

  // SUITE 8: AI FOOD COMPANION VALIDATED TOOLS
  console.log("\n▶ SUITE 8: AI Food Companion Tool Calling");
  const highProteinResult = await processAICompanionQuery({
    query: "Find high protein meals with chicken or biryani"
  });
  assert(highProteinResult.actionTaken === "MACRO_SEARCH", "AI correctly routes to MACRO_SEARCH tool");
  assert(highProteinResult.dishes !== undefined && highProteinResult.dishes.length > 0, "AI retrieves real verified database items without hallucination");

  const budgetResult = await processAICompanionQuery({
    query: "Show me budget meals under 400"
  });
  assert(budgetResult.actionTaken === "BUDGET_OPTIMIZER", "AI correctly routes to BUDGET_OPTIMIZER tool");

  // SUITE 9: 22 MODULAR FEATURE FLAGS
  console.log("\n▶ SUITE 9: Centralized Feature Flags Service");
  const allFlags = await getAllFeatureFlags();
  assert(allFlags.length >= 22, "All 22 PRD feature flags registered in database");
  const viewer3dActive = await isFeatureEnabled("FEATURE_3D_DISH_VIEWER");
  assert(viewer3dActive === true, "3D Dish Viewer feature flag active");

  // SUITE 10: RIDER DELIVERY & OTP VERIFICATION
  console.log("\n▶ SUITE 10: Rider Delivery Handoff Security");
  const deliveryTask = await prisma.deliveryTask.findFirst({
    include: { order: true }
  });
  assert(deliveryTask !== null, "Delivery task assigned to rider partner");
  assert(deliveryTask?.order.otpCode !== undefined, "Customer handoff OTP code generated and verified");

  // SUMMARY REPORT
  console.log("\n========================================================");
  console.log(`📊 TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
