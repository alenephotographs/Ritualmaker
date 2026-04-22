type CreateAccountInput = {
  email?: string;
  displayName: string;
};

type ConnectAccount = {
  id: string;
};

const CONNECT_API_VERSION = "2026-03-25.dahlia";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

async function stripeFetch(path: string, body: URLSearchParams, version?: string) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(version ? { "Stripe-Version": version } : {}),
    },
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Stripe request failed";
    throw new Error(message);
  }
  return data;
}

export async function createConnectedAccountV2(input: CreateAccountInput): Promise<ConnectAccount> {
  const body = new URLSearchParams();
  body.append("display_name", input.displayName);
  body.append("dashboard", "express");
  body.append("defaults[responsibilities][fees_collector]", "application");
  body.append("defaults[responsibilities][losses_collector]", "application");
  body.append(
    "configuration[merchant][capabilities][card_payments][requested]",
    "true",
  );
  body.append("configuration[merchant][capabilities][transfers][requested]", "true");
  if (input.email) body.append("contact_email", input.email);

  const account = (await stripeFetch("/v2/core/accounts", body, CONNECT_API_VERSION)) as {
    id: string;
  };
  return { id: account.id };
}

export async function createAccountOnboardingLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const body = new URLSearchParams();
  body.append("account", accountId);
  body.append("type", "account_onboarding");
  body.append("refresh_url", refreshUrl);
  body.append("return_url", returnUrl);
  const result = (await stripeFetch("/v1/account_links", body)) as { url: string };
  return result.url;
}

export async function createExpressDashboardLink(accountId: string) {
  const body = new URLSearchParams();
  body.append("account", accountId);
  const result = (await stripeFetch("/v1/accounts/" + accountId + "/login_links", body)) as {
    url: string;
  };
  return result.url;
}
