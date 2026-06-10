import type { FulfillmentMode } from "@/lib/standAvailability";

export type SuccessCopy = {
  lead: string;
  detailTitle: string;
  detailLines: string[];
  showStandLinks: boolean;
};

const PICKUP: SuccessCopy = {
  lead: "Thanks. Stop by the stand at 38 Miller Hill Road and take the matching seasonal offering from today's inventory.",
  detailTitle: "At the stand",
  detailLines: [
    "Stand at 38 Miller Hill Road",
    "Take the matching seasonal offering from the shelf",
    "Shelf changed? Choose what is available and message us",
  ],
  showStandLinks: true,
};

const SHIPPED: SuccessCopy = {
  lead: "Thanks — your order is confirmed. We will prepare your items for USPS shipment to the address you provided.",
  detailTitle: "Shipping",
  detailLines: [
    "You'll receive carrier tracking when the label is created",
    "Delivery timing depends on USPS service selected at checkout",
    "Questions? Reply via Instagram or email from the site footer",
  ],
  showStandLinks: false,
};

const MIXED: SuccessCopy = {
  lead: "Thanks — your order is confirmed. Shipped items will go out to your address; any stand pickup items follow the instructions below.",
  detailTitle: "Next steps",
  detailLines: [
    "Shipped items: prepared for USPS to your checkout address",
    "Stand items: pick up at 38 Miller Hill Road when the stand is open",
    "Shelf changed? Choose what is available and message us",
  ],
  showStandLinks: true,
};

const UNKNOWN: SuccessCopy = {
  lead: "Thanks — your payment went through. Check your email receipt for order details, or visit the shop if you expected stand pickup.",
  detailTitle: "Need help?",
  detailLines: [
    "Stand address: 38 Miller Hill Road, Hudson Valley, NY",
    "Shipped orders use the address from checkout",
    "Message us on Instagram if anything looks off",
  ],
  showStandLinks: true,
};

export function resolveSuccessCopy(mode: FulfillmentMode): SuccessCopy {
  switch (mode) {
    case "shipped":
      return SHIPPED;
    case "pickup":
      return PICKUP;
    case "mixed":
      return MIXED;
    default:
      return UNKNOWN;
  }
}
