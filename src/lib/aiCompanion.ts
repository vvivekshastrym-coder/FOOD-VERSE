import { prisma } from "./prisma";

export interface AICompanionRequest {
  query: string;
  userId?: string;
}

export interface AICompanionResponse {
  message: string;
  actionTaken?: string;
  suggestions?: string[];
  dishes?: any[];
  orderStatus?: any;
  budgetCombo?: any;
  allergenAlert?: string;
}

export async function processAICompanionQuery(req: AICompanionRequest): Promise<AICompanionResponse> {
  const q = req.query.toLowerCase().trim();

  // 1. Tool 1: Order Tracking check
  if (q.includes("where is my order") || q.includes("track my order") || q.includes("order status")) {
    if (!req.userId) {
      return {
        message: "Please sign in to track your live orders.",
        suggestions: ["Sign In", "Browse 3D Dishes"]
      };
    }

    const order = await prisma.order.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: true,
        items: true,
        events: { orderBy: { timestamp: "desc" } }
      }
    });

    if (!order) {
      return {
        message: "You don't have any recent orders. Would you like to explore verified 3D dishes from top Bengaluru restaurants?",
        suggestions: ["Show Biryanis", "Healthy Superbowls", "Woodfired Pizzas"]
      };
    }

    return {
      message: `Your order #${order.orderNumber} from **${order.restaurant.name}** is currently **${order.status}**. Kitchen prep ETA is ~${order.estimatedPrepMinutes} mins.`,
      actionTaken: "ORDER_TRACKING",
      orderStatus: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        restaurantName: order.restaurant.name,
        otpCode: order.otpCode,
        totalAmount: order.totalAmount,
        lastEvent: order.events[0]?.note || "In progress"
      },
      suggestions: ["Open 3D Tracker", "View Receipt", "Contact Support"]
    };
  }

  // 2. Tool 2: High protein or low calorie search
  if (q.includes("high protein") || q.includes("protein") || q.includes("gym") || q.includes("calorie") || q.includes("healthy")) {
    const dishes = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        proteinG: { gte: 25.0 }
      },
      include: {
        restaurant: true,
        assets: true,
        portionVariants: true
      },
      take: 4
    });

    return {
      message: `Found ${dishes.length} high-protein verified dishes with complete macro transparency and true portion sizes:`,
      actionTaken: "MACRO_SEARCH",
      dishes: dishes.map(d => ({
        id: d.id,
        name: d.name,
        restaurantName: d.restaurant.name,
        price: d.price,
        proteinG: d.proteinG,
        calories: d.calories,
        trueSizeVerified: d.trueSizeVerified,
        servingSize: d.servingSize,
        allergenInfo: d.allergenInfo,
        imageUrl: d.imageUrl
      })),
      suggestions: ["Inspect in 3D", "Filter Vegetarian", "Under ₹400"]
    };
  }

  // 3. Tool 3: Budget Optimizer (e.g. "under 300", "under 400", "budget lunch")
  const budgetMatch = q.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:rupees|rs|inr)/i);
  if (budgetMatch || q.includes("budget") || q.includes("cheapest")) {
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : 400;

    const dishes = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        price: { lte: maxBudget }
      },
      include: { restaurant: true },
      orderBy: { price: "asc" },
      take: 3
    });

    return {
      message: `Here are the best verified options under ₹${maxBudget} that optimize portion value and nutritional quality:`,
      actionTaken: "BUDGET_OPTIMIZER",
      dishes: dishes.map(d => ({
        id: d.id,
        name: d.name,
        restaurantName: d.restaurant.name,
        price: d.price,
        discountedPrice: d.discountedPrice,
        servingSize: d.servingSize,
        trueSizeVerified: d.trueSizeVerified,
        imageUrl: d.imageUrl
      })),
      suggestions: ["Apply FIRST3D coupon", "View in 3D", "Show Veg Only"]
    };
  }

  // 4. Tool 4: Spicy / Flavor DNA queries
  if (q.includes("spicy") || q.includes("biryani") || q.includes("craving") || q.includes("sweet")) {
    const dishes = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: "Biryani" } },
          { name: { contains: "Ramen" } },
          { description: { contains: "spice" } }
        ]
      },
      include: { restaurant: true, assets: true },
      take: 3
    });

    return {
      message: "Matched these rich, aromatic dishes matching high-spice Flavor DNA profiles:",
      actionTaken: "FLAVOR_DNA_MATCH",
      dishes: dishes.map(d => ({
        id: d.id,
        name: d.name,
        restaurantName: d.restaurant.name,
        price: d.price,
        portionWeightG: d.portionWeightG,
        servingSize: d.servingSize,
        trueSizeVerified: d.trueSizeVerified,
        imageUrl: d.imageUrl
      })),
      suggestions: ["Inspect in 3D Handi", "Portion Dimensions", "Add to Bag"]
    };
  }

  // Default intelligent assistant response
  return {
    message: "I am your FoodVerse AI Companion. I can inspect verified 3D portion sizes, calculate high-protein or dietary meals, optimize budget combos under ₹400, track your live kitchen order, and check allergen cross-contamination.",
    suggestions: [
      "Find a spicy meal under ₹400 with high protein",
      "Where is my order?",
      "Show dishes with verified true-size handi portions",
      "Woodfired Truffle Pizza allergens"
    ]
  };
}
