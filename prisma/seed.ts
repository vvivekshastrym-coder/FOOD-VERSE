import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting FoodVerse database seed...");

  // Clean existing transactional data for idempotent seeding
  await prisma.dispute.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.deliveryTask.deleteMany();
  await prisma.financialLedgerEntry.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.roomVote.deleteMany();
  await prisma.roomItem.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.foodRoom.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.ioTDevice.deleteMany();
  await prisma.antiWasteDeal.deleteMany();
  await prisma.creatorMenuItem.deleteMany();
  await prisma.creatorMenu.deleteMany();
  await prisma.portionVariant.deleteMany();
  await prisma.ingredientToggle.deleteMany();
  await prisma.dishAsset.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.businessVerification.deleteMany();
  await prisma.restaurantStaff.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.flavorProfile.deleteMany();
  await prisma.loyaltyLedger.deleteMany();
  await prisma.userSubscription.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. Feature Flags for All 22 Modular Features
  const featureFlags = [
    { key: "FEATURE_3D_DISH_VIEWER", name: "3D Dish Viewer", description: "Interactive 3D food inspection with portion scaling & ingredient toggles", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_AR_TABLE_PREVIEW", name: "AR Place on My Table", description: "WebXR & AR QuickLook tabletop food projection", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_WALKABLE_FOOD_STREET", name: "Walkable 3D Food Street", description: "Virtual 3D culinary street discovery mode", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_3D_FOOD_BUILDER", name: "3D Food Builder", description: "Interactive custom burger/bowl/pizza builder with live pricing", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_3D_ORDER_TRACKING", name: "3D Order Tracking", description: "Spatial delivery journey and kitchen timeline visualization", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_AI_FOOD_COMPANION", name: "AI Food Companion", description: "Conversational food discovery, diet guidance & smart ordering", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_PREDICTIVE_CRAVINGS", name: "Predictive Craving Engine", description: "Contextual recommendations based on weather, time & tastes", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_FLAVOR_DNA", name: "Flavor DNA", description: "Multi-dimensional taste profile and taste-twin matching", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_ALLERGEN_GUARDIAN", name: "Health & Allergen Guardian", description: "Cross-contact warnings and strict dietary safety checks", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_BUDGET_OPTIMIZER", name: "Budget Optimizer", description: "Algorithmic combo and discount price minimization", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_ANTI_WASTE_DEALS", name: "Anti-Waste Deals", description: "Atomic surplus food flash offers preventing kitchen waste", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_FOOD_ROOM", name: "Food Room Group Ordering", description: "Synchronized collaborative cart, voting, and bill splitting", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_TASTE_TWIN_MATCHING", name: "Taste-Twin Matching", description: "Privacy-preserving taste profile similarity discovery", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_CREATOR_MENUS", name: "Creator Menus", description: "Curated influencer and chef tasting menus with 1-click carting", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_PROVENANCE_CARD", name: "Provenance & Transparency", description: "Ingredient sourcing, FSSAI compliance, and hygiene metrics", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_GREEN_DELIVERY", name: "Carbon Footprint & Green Delivery", description: "EV delivery routing, carbon offset tracking, and eco-packaging", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_SMART_PACKAGING_IOT", name: "Smart Packaging & Temp Alerts", description: "IoT cold-chain & thermal bag real-time monitoring integration", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_VOICE_ORDERING", name: "Voice-First Ordering", description: "Speech-to-text voice search and hands-free basket control", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_KITCHEN_DIGITAL_TWIN", name: "Kitchen Digital Twin", description: "Live queue simulation, station throughput, and realistic prep ETAs", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_AUTONOMOUS_DELIVERY", name: "Autonomous Delivery Readiness", description: "Robot & drone dispatch integration interfaces", isEnabled: true, rolloutPercent: 50 },
    { key: "FEATURE_TOKENIZED_LOYALTY", name: "Verifiable Loyalty Ledger", description: "Idempotent rewards ledger with point redemptions", isEnabled: true, rolloutPercent: 100 },
    { key: "FEATURE_GEN_3D_ONBOARDING", name: "Generative 3D Onboarding", description: "Photogrammetry reconstruction submission & quality review pipeline", isEnabled: true, rolloutPercent: 80 }
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { isEnabled: flag.isEnabled, rolloutPercent: flag.rolloutPercent },
      create: flag
    });
  }
  console.log("✅ 22 Feature flags seeded.");

  // 2. Hash Password for Demo Users
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);

  // Customer User
  const customer = await prisma.user.upsert({
    where: { email: "arjun@foodverse.io" },
    update: {},
    create: {
      email: "arjun@foodverse.io",
      passwordHash: defaultPasswordHash,
      name: "Arjun Sharma",
      phone: "+91 98765 43210",
      role: "CUSTOMER",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      addresses: {
        create: [
          {
            title: "Home",
            addressLine: "Flat 402, Green Glen Heights, 12th Main, HAL 2nd Stage, Indiranagar",
            landmark: "Near Defense Colony Park",
            city: "Bengaluru",
            postalCode: "560038",
            latitude: 12.9784,
            longitude: 77.6408,
            isDefault: true
          },
          {
            title: "Work",
            addressLine: "WeWork Galaxy, 43 Residency Road, Shanthala Nagar, Ashok Nagar",
            landmark: "Opposite Ritz Carlton",
            city: "Bengaluru",
            postalCode: "560025",
            latitude: 12.9698,
            longitude: 77.6047,
            isDefault: false
          }
        ]
      },
      preferences: {
        create: {
          dietaryPreference: "ALL",
          maxBudget: 600,
          ecoPackagingOptIn: true,
          allergies: "Peanuts (Mild)",
          notificationEmails: true,
          notificationSMS: true,
          notificationPush: true
        }
      },
      flavorProfile: {
        create: {
          spicy: 75,
          sweet: 25,
          sour: 45,
          umami: 85,
          crunch: 60,
          richness: 70,
          dietaryTags: "High Protein, North Indian Lover, Spice Enthusiast"
        }
      },
      loyaltyEntries: {
        create: {
          points: 350,
          type: "EARNED",
          referenceId: "WELCOME_BONUS",
          balanceAfter: 350
        }
      },
      subscription: {
        create: {
          planName: "FoodVerse Gold VIP",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          freeDelivery: true
        }
      }
    }
  });

  // Restaurant Owner User
  const restaurantOwner = await prisma.user.upsert({
    where: { email: "chef.vikram@spicecraft.in" },
    update: {},
    create: {
      email: "chef.vikram@spicecraft.in",
      passwordHash: defaultPasswordHash,
      name: "Chef Vikram Oberoi",
      phone: "+91 98450 11223",
      role: "RESTAURANT_OWNER",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150"
    }
  });

  // Rider User
  const rider = await prisma.user.upsert({
    where: { email: "suresh.rider@foodverse.io" },
    update: {},
    create: {
      email: "suresh.rider@foodverse.io",
      passwordHash: defaultPasswordHash,
      name: "Suresh Kumar",
      phone: "+91 99887 66554",
      role: "RIDER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    }
  });

  // Admin User
  await prisma.user.upsert({
    where: { email: "admin@foodverse.io" },
    update: {},
    create: {
      email: "admin@foodverse.io",
      passwordHash: adminPasswordHash,
      name: "Administrator (FoodVerse HQ)",
      phone: "+91 80 4000 8000",
      role: "ADMIN"
    }
  });

  // CS Agent User
  await prisma.user.upsert({
    where: { email: "support@foodverse.io" },
    update: {},
    create: {
      email: "support@foodverse.io",
      passwordHash: defaultPasswordHash,
      name: "Ananya Roy (Customer Success)",
      phone: "+91 80 4000 8001",
      role: "CS_AGENT"
    }
  });

  console.log("✅ Core Users (Customer, Owner, Rider, Admin, CS) seeded.");

  // 3. Restaurants with FSSAI, Honest Ranking, and Business Details
  const spiceCraft = await prisma.restaurant.upsert({
    where: { slug: "spice-craft-kitchen" },
    update: {},
    create: {
      name: "Spice Craft Kitchen",
      slug: "spice-craft-kitchen",
      description: "Authentic slow-cooked Awadhi & Hyderabadi culinary creations with 100% verified portion sizes and sustainable packaging.",
      cuisineType: "North Indian, Biryani, Mughlai",
      address: "84, 100 Feet Road, Indiranagar",
      city: "Bengaluru",
      latitude: 12.9783,
      longitude: 77.6409,
      phone: "+91 80 2525 9090",
      email: "orders@spicecraft.in",
      fssaiNumber: "11221334000188",
      gstNumber: "29AABCS1429B1Z8",
      hygieneRating: 4.9,
      isOpen: true,
      openingTime: "11:30 AM",
      closingTime: "11:30 PM",
      avgPreparationTime: 22,
      deliveryRadiusKm: 8.5,
      commissionRate: 15.0,
      rating: 4.8,
      reviewCount: 342,
      isVerified: true,
      isSponsored: false,
      heroImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
      logoImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150",
      ownerId: restaurantOwner.id,
      verification: {
        create: {
          fssaiDocUrl: "/docs/fssai_spicecraft_2026.pdf",
          gstDocUrl: "/docs/gst_spicecraft.pdf",
          status: "APPROVED",
          reviewerNotes: "All physical kitchen inspection audits passed with top score."
        }
      }
    }
  });

  const tokyoDrift = await prisma.restaurant.upsert({
    where: { slug: "tokyo-drift-ramen" },
    update: {},
    create: {
      name: "Tokyo Drift Ramen Bar",
      slug: "tokyo-drift-ramen",
      description: "Handcrafted 18-hour slow simmered broth, springy artisan noodles, and crispy bao buns.",
      cuisineType: "Japanese, Asian, Ramen",
      address: "18, 5th Block, Koramangala",
      city: "Bengaluru",
      latitude: 12.9352,
      longitude: 77.6245,
      phone: "+91 80 4123 9988",
      email: "hello@tokyodriftramen.in",
      fssaiNumber: "11222334000551",
      gstNumber: "29AADCT5589E1ZX",
      hygieneRating: 4.8,
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:00 PM",
      avgPreparationTime: 18,
      deliveryRadiusKm: 9.0,
      commissionRate: 14.5,
      rating: 4.7,
      reviewCount: 219,
      isVerified: true,
      isSponsored: true, // Disclosed sponsored partner
      sponsoredLabel: "Featured Partner: Taste of Japan",
      heroImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
      logoImage: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=150"
    }
  });

  const greenHarvest = await prisma.restaurant.upsert({
    where: { slug: "green-harvest-bowls" },
    update: {},
    create: {
      name: "Green Harvest Artisanal Bowls",
      slug: "green-harvest-bowls",
      description: "Nutritious chef-curated high-protein salads, quinoa superbowls, and cold-pressed botanical tonics.",
      cuisineType: "Healthy, Salad, Bowls, Vegan",
      address: "12, Lavelle Road, Shanthala Nagar",
      city: "Bengaluru",
      latitude: 12.9719,
      longitude: 77.5996,
      phone: "+91 80 4999 1100",
      email: "contact@greenharvest.co.in",
      fssaiNumber: "11223344000912",
      gstNumber: "29AABCG8819F1Z2",
      hygieneRating: 5.0,
      isOpen: true,
      openingTime: "08:30 AM",
      closingTime: "10:00 PM",
      avgPreparationTime: 15,
      deliveryRadiusKm: 7.0,
      commissionRate: 12.0,
      rating: 4.9,
      reviewCount: 185,
      isVerified: true,
      isSponsored: false,
      heroImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
      logoImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150"
    }
  });

  const woodfireCrust = await prisma.restaurant.upsert({
    where: { slug: "woodfire-and-crust" },
    update: {},
    create: {
      name: "Woodfire & Crust Pizzeria",
      slug: "woodfire-and-crust",
      description: "Fermented sourdough crust, San Marzano tomato sauce, imported Fior di Latte and fresh basil baked in 450°C wood oven.",
      cuisineType: "Italian, Pizza, Desserts",
      address: "Sector 3, 27th Main, HSR Layout",
      city: "Bengaluru",
      latitude: 12.9116,
      longitude: 77.6389,
      phone: "+91 80 4333 7777",
      email: "ciao@woodfireandcrust.com",
      fssaiNumber: "11224335000789",
      gstNumber: "29AABCW9930D1Z1",
      hygieneRating: 4.8,
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:45 PM",
      avgPreparationTime: 20,
      deliveryRadiusKm: 8.0,
      commissionRate: 15.0,
      rating: 4.7,
      reviewCount: 412,
      isVerified: true,
      isSponsored: false,
      heroImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      logoImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=150"
    }
  });

  console.log("✅ 4 Authentic restaurants seeded.");

  // 4. Menus & Categories
  const spiceMenu = await prisma.menu.create({
    data: {
      restaurantId: spiceCraft.id,
      name: "Signature Dining Menu",
      categories: {
        create: [
          { name: "Biryanis & Rice", sortOrder: 1 },
          { name: "Kebabs & Starters", sortOrder: 2 },
          { name: "Artisanal Curries", sortOrder: 3 },
          { name: "Desserts & Coolers", sortOrder: 4 }
        ]
      }
    },
    include: { categories: true }
  });

  const biryaniCategory = spiceMenu.categories.find(c => c.name === "Biryanis & Rice")!;
  const kebabCategory = spiceMenu.categories.find(c => c.name === "Kebabs & Starters")!;

  // 5. Signature Menu Items with True-Size Promise & 3D Assets
  const royalBiryani = await prisma.menuItem.create({
    data: {
      restaurantId: spiceCraft.id,
      categoryId: biryaniCategory.id,
      name: "Signature Royal Dum Biryani",
      description: "Aromatic long-grain basmati layered with tender slow-cooked cuts, saffron infusion, caramelised onions, and fresh mint in a sealed clay handi.",
      price: 380,
      discountedPrice: 340,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
      isVeg: false,
      isAvailable: true,
      preparationTimeMin: 22,
      calories: 680,
      proteinG: 34.0,
      carbsG: 78.0,
      fatG: 22.0,
      allergenInfo: "Dairy (Ghee, Curd). Contains trace nuts in garnish.",
      servingSize: "Serves 1-2 (450g net portion)",
      trueSizeVerified: true,
      verificationStatus: "VERIFIED",
      portionWeightG: 450.0,
      portionDimensions: "18cm diameter x 7.5cm clay handi",
      trueSizePhotoUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
      verifiedBy: "FoodVerse Quality Audit Team #3",
      verifiedAt: new Date(),
      assets: {
        create: {
          polyCount: 14200,
          textureResolution: "1024x1024",
          scaleRatio: 1.0,
          isVerified: true,
          foodShapeType: "bowl",
          primaryColor: "#d97706",
          secondaryColor: "#b45309"
        }
      },
      portionVariants: {
        create: [
          { name: "Regular Handi (450g)", scaleFactor: 1.0, price: 340, weightG: 450, dimensions: "18cm x 7.5cm" },
          { name: "Feast Bowl (750g)", scaleFactor: 1.25, price: 540, weightG: 750, dimensions: "22cm x 9.0cm" }
        ]
      },
      ingredientToggles: {
        create: [
          { name: "Extra Fried Onions (Birista)", extraPrice: 20, isDefault: true, removable: true, meshName: "garnish_onions" },
          { name: "Boiled Spiced Egg", extraPrice: 25, isDefault: true, removable: true, meshName: "boiled_egg" },
          { name: "Fresh Mint & Coriander", extraPrice: 0, isDefault: true, removable: true, meshName: "herb_garnish" }
        ]
      },
      inventory: {
        create: {
          currentStock: 45,
          lowStockThreshold: 8,
          trackStock: true,
          isAvailable: true
        }
      }
    }
  });

  const galoutiKebab = await prisma.menuItem.create({
    data: {
      restaurantId: spiceCraft.id,
      categoryId: kebabCategory.id,
      name: "Melt-in-Mouth Galouti Kebab",
      description: "Silken minced patties infused with 24 royal Awadhi spices, smoked with clove and charcoal, served with saffron paratha.",
      price: 320,
      discountedPrice: 290,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
      isVeg: false,
      isAvailable: true,
      preparationTimeMin: 18,
      calories: 460,
      proteinG: 28.0,
      carbsG: 18.0,
      fatG: 28.0,
      allergenInfo: "Dairy (Clarified butter). Gluten in mini paratha.",
      servingSize: "4 Pieces + 2 Mini Parathas (300g)",
      trueSizeVerified: true,
      verificationStatus: "VERIFIED",
      portionWeightG: 300.0,
      portionDimensions: "4 patties x 6cm diameter",
      verifiedBy: "FoodVerse Quality Audit Team #3",
      verifiedAt: new Date(),
      assets: {
        create: {
          polyCount: 11000,
          textureResolution: "1024x1024",
          scaleRatio: 1.0,
          isVerified: true,
          foodShapeType: "burger",
          primaryColor: "#78350f",
          secondaryColor: "#92400e"
        }
      },
      inventory: {
        create: {
          currentStock: 25,
          lowStockThreshold: 5,
          trackStock: true,
          isAvailable: true
        }
      }
    }
  });

  // Tokyo Drift Menu & Items
  const tokyoMenu = await prisma.menu.create({
    data: {
      restaurantId: tokyoDrift.id,
      name: "Ramen & Bao Collection",
      categories: {
        create: [
          { name: "Ramen Bowls", sortOrder: 1 },
          { name: "Steamed Bao", sortOrder: 2 },
          { name: "Appetizers & Gyoza", sortOrder: 3 }
        ]
      }
    },
    include: { categories: true }
  });

  const ramenCategory = tokyoMenu.categories.find(c => c.name === "Ramen Bowls")!;
  const ramenItem = await prisma.menuItem.create({
    data: {
      restaurantId: tokyoDrift.id,
      categoryId: ramenCategory.id,
      name: "Tokyo Tonkotsu Special Ramen",
      description: "Rich 18-hour slow-cooked umami broth, handcrafted firm alkaline noodles, chashu pork or braised shiitake, seasoned ajitsuke tamago egg, and nori.",
      price: 490,
      discountedPrice: 450,
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
      isVeg: false,
      isAvailable: true,
      preparationTimeMin: 18,
      calories: 620,
      proteinG: 32.0,
      carbsG: 72.0,
      fatG: 21.0,
      allergenInfo: "Soy, Gluten, Egg, Sesame.",
      servingSize: "Large Ceramic Bowl (550ml soup + 180g solids)",
      trueSizeVerified: true,
      verificationStatus: "VERIFIED",
      portionWeightG: 550.0,
      portionDimensions: "21cm diameter ceramic bowl",
      verifiedBy: "FoodVerse Sensory Panel",
      verifiedAt: new Date(),
      assets: {
        create: {
          polyCount: 15400,
          textureResolution: "1024x1024",
          scaleRatio: 1.0,
          isVerified: true,
          foodShapeType: "bowl",
          primaryColor: "#b45309",
          secondaryColor: "#f59e0b"
        }
      },
      portionVariants: {
        create: [
          { name: "Standard Bowl (550g)", scaleFactor: 1.0, price: 450, weightG: 550, dimensions: "21cm bowl" },
          { name: "Monster Ramen with Double Chashu (780g)", scaleFactor: 1.3, price: 620, weightG: 780, dimensions: "24cm bowl" }
        ]
      },
      ingredientToggles: {
        create: [
          { name: "Ajitsuke Tamago (Marinated Ramen Egg)", extraPrice: 40, isDefault: true, removable: true, meshName: "egg" },
          { name: "Wood Ear Black Fungus", extraPrice: 0, isDefault: true, removable: true, meshName: "mushrooms" },
          { name: "Roasted Nori Seaweed Sheet", extraPrice: 15, isDefault: true, removable: true, meshName: "nori" },
          { name: "Spicy Chilli Rayu Oil", extraPrice: 20, isDefault: false, removable: false, meshName: "chilli_oil" }
        ]
      },
      inventory: {
        create: {
          currentStock: 30,
          lowStockThreshold: 6,
          trackStock: true,
          isAvailable: true
        }
      }
    }
  });

  // Green Harvest Items
  const greenMenu = await prisma.menu.create({
    data: {
      restaurantId: greenHarvest.id,
      name: "Clean Nutrition Menu",
      categories: {
        create: [
          { name: "Superfood Bowls", sortOrder: 1 },
          { name: "Cold-Pressed Tonics", sortOrder: 2 }
        ]
      }
    },
    include: { categories: true }
  });

  const greenCategory = greenMenu.categories.find(c => c.name === "Superfood Bowls")!;
  const greenBowl = await prisma.menuItem.create({
    data: {
      restaurantId: greenHarvest.id,
      categoryId: greenCategory.id,
      name: "Wild Quinoa & Avocado Power Bowl",
      description: "Organic tri-color quinoa, roasted sweet potatoes, Haas avocado, edamame beans, baby spinach, pumpkin seeds, and zesty tahini ginger dressing.",
      price: 360,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
      isVeg: true,
      isAvailable: true,
      preparationTimeMin: 14,
      calories: 420,
      proteinG: 22.0,
      carbsG: 48.0,
      fatG: 16.0,
      allergenInfo: "Sesame (Tahini), Soy (Edamame). 100% Gluten-Free.",
      servingSize: "Eco Biodegradable Bowl (380g)",
      trueSizeVerified: true,
      verificationStatus: "VERIFIED",
      portionWeightG: 380.0,
      portionDimensions: "19cm diameter biodegradable bowl",
      verifiedBy: "FoodVerse Nutrition Lab",
      verifiedAt: new Date(),
      assets: {
        create: {
          polyCount: 13000,
          textureResolution: "1024x1024",
          scaleRatio: 1.0,
          isVerified: true,
          foodShapeType: "bowl",
          primaryColor: "#15803d",
          secondaryColor: "#84cc16"
        }
      },
      inventory: {
        create: {
          currentStock: 50,
          lowStockThreshold: 10,
          trackStock: true,
          isAvailable: true
        }
      }
    }
  });

  // Woodfire Pizza Item
  const pizzaMenu = await prisma.menu.create({
    data: {
      restaurantId: woodfireCrust.id,
      name: "Pizzas & Calzones",
      categories: {
        create: [{ name: "Artisan Pizzas", sortOrder: 1 }]
      }
    },
    include: { categories: true }
  });

  const pizzaCategory = pizzaMenu.categories.find(c => c.name === "Artisan Pizzas")!;
  const burrataPizza = await prisma.menuItem.create({
    data: {
      restaurantId: woodfireCrust.id,
      categoryId: pizzaCategory.id,
      name: "Woodfired Truffle Burrata Pizza",
      description: "Charred blistered crust, creamy whole Puglia burrata ball, San Marzano marinara, white truffle oil, and torn sweet basil.",
      price: 520,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      isVeg: true,
      isAvailable: true,
      preparationTimeMin: 20,
      calories: 780,
      proteinG: 26.0,
      carbsG: 82.0,
      fatG: 34.0,
      allergenInfo: "Dairy (Burrata), Gluten (Wheat flour).",
      servingSize: "11-inch Hand-stretched (approx 440g)",
      trueSizeVerified: true,
      verificationStatus: "VERIFIED",
      portionWeightG: 440.0,
      portionDimensions: "28cm (11-inch) circular round",
      verifiedBy: "FoodVerse Culinary Verifier #1",
      verifiedAt: new Date(),
      assets: {
        create: {
          polyCount: 16000,
          textureResolution: "1024x1024",
          scaleRatio: 1.0,
          isVerified: true,
          foodShapeType: "pizza",
          primaryColor: "#dc2626",
          secondaryColor: "#fef08a"
        }
      },
      inventory: {
        create: {
          currentStock: 35,
          lowStockThreshold: 5,
          trackStock: true,
          isAvailable: true
        }
      }
    }
  });

  console.log("✅ Menu items with 3D parameters and true size verification created.");

  // 6. Anti-Waste Surplus Deals (Atomic stock & expiry)
  await prisma.antiWasteDeal.create({
    data: {
      restaurantId: woodfireCrust.id,
      menuItemId: burrataPizza.id,
      originalPrice: 520,
      dealPrice: 320,
      availableQuantity: 4,
      claimedCount: 1,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // In 6 hours
      isActive: true
    }
  });

  await prisma.antiWasteDeal.create({
    data: {
      restaurantId: greenHarvest.id,
      menuItemId: greenBowl.id,
      originalPrice: 360,
      dealPrice: 220,
      availableQuantity: 3,
      claimedCount: 0,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      isActive: true
    }
  });

  console.log("✅ Anti-Waste flash deals seeded.");

  // 7. Creator Menu
  await prisma.creatorMenu.create({
    data: {
      creatorName: "Chef Ranveer Brar",
      creatorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150",
      title: "Royal Awadhi Late Night Selection",
      description: "My personal go-to feast when craving unmatched aromatics and true slow-cooked perfection in Bengaluru.",
      badge: "MasterChef Curator",
      likesCount: 284,
      items: {
        create: [
          { menuItemId: royalBiryani.id },
          { menuItemId: galoutiKebab.id }
        ]
      }
    }
  });

  // 8. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "FIRST3D",
        description: "20% off your first 3D food order up to ₹100",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 299,
        maxDiscount: 100,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: "FOODVERSE50",
        description: "Flat ₹50 off on orders above ₹399",
        discountType: "FLAT",
        discountValue: 50,
        minOrderValue: 399,
        maxDiscount: 50,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: "GREENEARTH",
        description: "Free delivery on eco-friendly orders above ₹250",
        discountType: "FLAT",
        discountValue: 35,
        minOrderValue: 250,
        maxDiscount: 35,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ]
  });

  // 9. IoT Devices (Cold-Chain & Thermal monitoring)
  const thermalBag = await prisma.ioTDevice.create({
    data: {
      restaurantId: spiceCraft.id,
      name: "FoodVerse Smart Hot-Bag #09",
      deviceType: "THERMAL_BAG",
      status: "ONLINE",
      lastTemperature: 64.2, // degrees C (warm food)
      isAlerting: false,
      readings: {
        create: [
          { temperature: 63.8, batteryLevel: 94 },
          { temperature: 64.2, batteryLevel: 93 }
        ]
      }
    }
  });

  // 10. Sample Active Order with Full Kitchen-to-Door History
  const activeOrder = await prisma.order.create({
    data: {
      orderNumber: "FV-2026-90412",
      userId: customer.id,
      restaurantId: spiceCraft.id,
      status: "PREPARING", // Kitchen state
      subtotal: 630.0,
      discount: 100.0,
      deliveryFee: 35.0,
      platformFee: 5.0,
      gstAmount: 26.5,
      totalAmount: 596.5,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      deliveryAddress: "Flat 402, Green Glen Heights, 12th Main, Indiranagar, Bengaluru",
      deliveryLat: 12.9784,
      deliveryLng: 77.6408,
      otpCode: "5821",
      estimatedPrepMinutes: 20,
      estimatedDeliveryMinutes: 14,
      estimatedArrival: new Date(Date.now() + 24 * 60 * 1000),
      isEcoDelivery: true,
      carbonOffsetKg: 0.38,
      items: {
        create: [
          {
            menuItemId: royalBiryani.id,
            name: "Signature Royal Dum Biryani (450g)",
            quantity: 1,
            unitPrice: 340.0,
            selectedAddons: "Extra Fried Onions, Boiled Spiced Egg"
          },
          {
            menuItemId: galoutiKebab.id,
            name: "Melt-in-Mouth Galouti Kebab (4 pcs)",
            quantity: 1,
            unitPrice: 290.0
          }
        ]
      },
      events: {
        create: [
          { status: "PLACED", actorRole: "CUSTOMER", note: "Order placed via FoodVerse 3D Web", timestamp: new Date(Date.now() - 10 * 60 * 1000) },
          { status: "ACCEPTED", actorRole: "RESTAURANT", note: "Kitchen accepted order - Handi prep initiated", timestamp: new Date(Date.now() - 8 * 60 * 1000) },
          { status: "PREPARING", actorRole: "RESTAURANT", note: "Dum cooking on low flame with saffron seal", timestamp: new Date(Date.now() - 4 * 60 * 1000) }
        ]
      },
      deliveryTask: {
        create: {
          riderId: rider.id,
          status: "ACCEPTED",
          earningsAmount: 70.0,
          distanceKm: 3.2,
          startLat: 12.9750,
          startLng: 77.6350,
          currentLat: 12.9765,
          currentLng: 77.6380
        }
      },
      payments: {
        create: {
          transactionId: "pay_rzp_mock_live_90412",
          gateway: "RAZORPAY_SANDBOX",
          amount: 596.5,
          status: "SUCCESS"
        }
      },
      ledgerEntries: {
        create: [
          {
            restaurantId: spiceCraft.id,
            type: "ORDER_PAYMENT",
            amount: 507.0, // After 15% platform commission
            balanceAfter: 507.0,
            reference: "FV-2026-90412"
          },
          {
            type: "PLATFORM_COMMISSION",
            amount: 89.5,
            balanceAfter: 89.5,
            reference: "FV-2026-90412"
          }
        ]
      }
    }
  });

  // 11. Food Room Example for Shared Group Ordering
  const sampleRoom = await prisma.foodRoom.create({
    data: {
      code: "ROOM42",
      hostId: customer.id,
      restaurantId: spiceCraft.id,
      status: "OPEN",
      spendingLimit: 1500,
      splitType: "ITEM_BASED",
      members: {
        create: [
          {
            userId: customer.id,
            name: "Arjun (Host)",
            isHost: true
          }
        ]
      }
    },
    include: { members: true }
  });

  await prisma.roomItem.create({
    data: {
      foodRoomId: sampleRoom.id,
      memberId: sampleRoom.members[0].id,
      menuItemId: royalBiryani.id,
      name: "Signature Royal Dum Biryani",
      quantity: 1,
      price: 340.0
    }
  });

  console.log("✅ Seed completed successfully with demo users, authentic restaurants, 3D dishes, anti-waste deals, active order, and Food Room!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
