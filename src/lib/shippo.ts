/**
 * Shippo REST client for USPS rate quotes (live rates from your Shippo account).
 * @see https://docs.goshippo.com/docs/shipments/rateshoppingwithcarriers
 */

const SHIPPO_BASE = "https://api.goshippo.com";

export type ShippoAddressInput = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
};

export type ShippoParcelInput = {
  length: string;
  width: string;
  height: string;
  distanceUnit: "in" | "cm";
  weight: string;
  massUnit: "lb" | "kg" | "oz";
};

export type UspsRateQuote = {
  /** Amount in USD cents (rounded). */
  amountCents: number;
  /** Shippo rate object_id (for fulfillment / labels later). */
  rateObjectId: string;
  serviceName: string;
  provider: string;
};

function getToken() {
  const token = process.env.SHIPPO_API_TOKEN?.trim();
  if (!token) return null;
  return token;
}

function getFromAddress(): ShippoAddressInput | null {
  const street1 = process.env.SHIPPO_FROM_STREET1?.trim();
  const city = process.env.SHIPPO_FROM_CITY?.trim();
  const state = process.env.SHIPPO_FROM_STATE?.trim();
  const zip = process.env.SHIPPO_FROM_ZIP?.trim();
  if (!street1 || !city || !state || !zip) return null;
  return {
    name: process.env.SHIPPO_FROM_NAME?.trim() || "Ritualmaker",
    street1,
    street2: process.env.SHIPPO_FROM_STREET2?.trim() || undefined,
    city,
    state,
    zip,
    country: (process.env.SHIPPO_FROM_COUNTRY?.trim() || "US").toUpperCase(),
    phone: process.env.SHIPPO_FROM_PHONE?.trim() || undefined,
    email: process.env.SHIPPO_FROM_EMAIL?.trim() || undefined,
  };
}

function getDefaultParcel(): ShippoParcelInput {
  return {
    length: process.env.SHIPPO_PARCEL_LENGTH_IN?.trim() || "8",
    width: process.env.SHIPPO_PARCEL_WIDTH_IN?.trim() || "6",
    height: process.env.SHIPPO_PARCEL_HEIGHT_IN?.trim() || "4",
    distanceUnit: "in",
    weight: process.env.SHIPPO_PARCEL_WEIGHT_LB?.trim() || "1",
    massUnit: "lb",
  };
}

type ShippoRateRow = {
  object_id?: string;
  amount?: string;
  currency?: string;
  provider?: string;
  servicelevel?: { name?: string };
};

type ShippoShipmentResponse = {
  rates?: ShippoRateRow[];
  messages?: { text?: string }[];
  __all__?: unknown;
};

export function isShippoConfigured() {
  return Boolean(getToken() && getFromAddress());
}

/**
 * Returns the cheapest USPS rate Shippo returns for this lane (optionally filtered to one carrier account).
 */
export async function getCheapestUspsRateCents(
  addressTo: ShippoAddressInput,
  parcel: ShippoParcelInput = getDefaultParcel(),
): Promise<{ ok: true; quote: UspsRateQuote } | { ok: false; error: string; status?: number }> {
  const token = getToken();
  const addressFrom = getFromAddress();
  if (!token) {
    return { ok: false, error: "Shipping quotes are not configured (missing SHIPPO_API_TOKEN)." };
  }
  if (!addressFrom) {
    return {
      ok: false,
      error:
        "Shipping origin is not configured. Set SHIPPO_FROM_STREET1, SHIPPO_FROM_CITY, SHIPPO_FROM_STATE, SHIPPO_FROM_ZIP.",
    };
  }

  const carrierId = process.env.SHIPPO_USPS_CARRIER_ACCOUNT_ID?.trim();
  const body: Record<string, unknown> = {
    address_from: {
      name: addressFrom.name,
      street1: addressFrom.street1,
      ...(addressFrom.street2 ? { street2: addressFrom.street2 } : {}),
      city: addressFrom.city,
      state: addressFrom.state,
      zip: addressFrom.zip,
      country: addressFrom.country,
      ...(addressFrom.phone ? { phone: addressFrom.phone } : {}),
      ...(addressFrom.email ? { email: addressFrom.email } : {}),
    },
    address_to: {
      name: addressTo.name,
      street1: addressTo.street1,
      ...(addressTo.street2 ? { street2: addressTo.street2 } : {}),
      city: addressTo.city,
      state: addressTo.state,
      zip: addressTo.zip,
      country: addressTo.country.toUpperCase(),
      ...(addressTo.phone ? { phone: addressTo.phone } : {}),
      ...(addressTo.email ? { email: addressTo.email } : {}),
    },
    parcels: [
      {
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
        distance_unit: parcel.distanceUnit,
        weight: parcel.weight,
        mass_unit: parcel.massUnit,
      },
    ],
    async: false,
  };
  if (carrierId) {
    body.carrier_accounts = [carrierId];
  }

  const res = await fetch(`${SHIPPO_BASE}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as ShippoShipmentResponse;

  if (!res.ok) {
    const msg =
      typeof (data as { detail?: string }).detail === "string"
        ? (data as { detail: string }).detail
        : `Shippo error (${res.status})`;
    return { ok: false, error: msg, status: res.status };
  }

  const rates = Array.isArray(data.rates) ? data.rates : [];
  const uspsRates = rates.filter(
    (r) =>
      (r.provider || "").toUpperCase() === "USPS" &&
      typeof r.amount === "string" &&
      Number.isFinite(Number.parseFloat(r.amount)) &&
      r.object_id,
  );

  if (!uspsRates.length) {
    const fallback = rates
      .filter(
        (r) =>
          typeof r.amount === "string" &&
          Number.isFinite(Number.parseFloat(r.amount)) &&
          r.object_id,
      )
      .sort((a, b) => Number.parseFloat(a.amount!) - Number.parseFloat(b.amount!));
    if (!fallback.length) {
      return {
        ok: false,
        error:
          data.messages?.map((m) => m.text).filter(Boolean).join(" ") ||
          "No shipping rates returned for this address. Try another ZIP or check Shippo carrier setup.",
      };
    }
    const best = fallback[0]!;
    const dollars = Number.parseFloat(best.amount!);
    return {
      ok: true,
      quote: {
        amountCents: Math.max(0, Math.round(dollars * 100)),
        rateObjectId: best.object_id!,
        serviceName: best.servicelevel?.name || "Standard",
        provider: best.provider || "Carrier",
      },
    };
  }

  uspsRates.sort(
    (a, b) => Number.parseFloat(a.amount!) - Number.parseFloat(b.amount!),
  );
  const best = uspsRates[0]!;
  const dollars = Number.parseFloat(best.amount!);
  return {
    ok: true,
    quote: {
      amountCents: Math.max(0, Math.round(dollars * 100)),
      rateObjectId: best.object_id!,
      serviceName: best.servicelevel?.name || "USPS",
      provider: best.provider || "USPS",
    },
  };
}
