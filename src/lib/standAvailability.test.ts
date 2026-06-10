import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSuccessCopy } from "./checkoutSuccessCopy";
import {
  canPurchaseProductWhenStandClosed,
  cartHasStandOnlyItems,
  filterProductsForStandStatus,
  isStandClosed,
  isStandOnlyProduct,
  resolveFulfillmentMode,
  resolveHeroSubline,
  resolvePublicTagline,
  validateCartForStandClosed,
} from "./standAvailability";

describe("standAvailability", () => {
  it("detects closed stand", () => {
    assert.equal(isStandClosed("closed"), true);
    assert.equal(isStandClosed("open"), false);
    assert.equal(isStandClosed("restocking"), false);
  });

  it("filters stand-only SKUs when closed", () => {
    const products = [
      { _id: "1", shipsNationwide: false },
      { _id: "2", shipsNationwide: true },
    ];
    const visible = filterProductsForStandStatus(products, "closed");
    assert.equal(visible.length, 1);
    assert.equal(visible[0]._id, "2");
  });

  it("keeps all SKUs when stand open", () => {
    const products = [
      { _id: "1", shipsNationwide: false },
      { _id: "2", shipsNationwide: true },
    ];
    assert.equal(filterProductsForStandStatus(products, "open").length, 2);
  });

  it("blocks stand-only purchase when closed", () => {
    assert.equal(canPurchaseProductWhenStandClosed({ shipsNationwide: false }), false);
    assert.equal(canPurchaseProductWhenStandClosed({ shipsNationwide: true }), true);
  });

  it("validates cart for closed stand", () => {
    const standOnly = [{ shipsNationwide: false }];
    const shipped = [{ shipsNationwide: true }];
    assert.equal(validateCartForStandClosed(standOnly, "closed").ok, false);
    assert.equal(validateCartForStandClosed(shipped, "closed").ok, true);
    assert.equal(validateCartForStandClosed(standOnly, "open").ok, true);
  });

  it("identifies stand-only cart lines", () => {
    assert.equal(cartHasStandOnlyItems([{ shipsNationwide: true }]), false);
    assert.equal(
      cartHasStandOnlyItems([{ shipsNationwide: true }, { shipsNationwide: false }]),
      true,
    );
    assert.equal(isStandOnlyProduct({ shipsNationwide: false }), true);
  });

  it("softens 24/7 tagline when stand closed", () => {
    const tagline = resolvePublicTagline("Fresh flowers in the neighborhood, 24/7", "closed");
    assert.match(tagline, /Seasonal/i);
    assert.doesNotMatch(tagline, /24\/7/i);
  });

  it("preserves custom tagline when stand closed without 24/7", () => {
    assert.equal(resolvePublicTagline("Spring on the hill", "closed"), "Spring on the hill");
  });

  it("uses open default tagline when stand open", () => {
    assert.match(resolvePublicTagline(null, "open"), /24\/7/);
  });

  it("changes hero subline when closed", () => {
    assert.match(resolveHeroSubline("closed"), /closed for the season/i);
    assert.match(resolveHeroSubline("open"), /38 Miller Hill Road/i);
  });

  it("resolves fulfillment mode", () => {
    assert.equal(resolveFulfillmentMode([{ shipsNationwide: true }]), "shipped");
    assert.equal(resolveFulfillmentMode([{ shipsNationwide: false }]), "pickup");
    assert.equal(
      resolveFulfillmentMode([
        { shipsNationwide: true },
        { shipsNationwide: false },
      ]),
      "mixed",
    );
  });

  it("forbidden internal terms absent from public copy helpers", () => {
    const forbidden = [
      "sphere",
      "wedge",
      "gravity",
      "topology",
      "metasystem",
      "doctrine",
      "proof gate",
      "operating system",
    ];
    const blob = [
      resolvePublicTagline(null, "open"),
      resolvePublicTagline(null, "closed"),
      resolveHeroSubline("closed"),
      resolveSuccessCopy("pickup").lead,
      resolveSuccessCopy("shipped").lead,
    ].join(" ");
    for (const term of forbidden) {
      assert.equal(blob.toLowerCase().includes(term), false, `forbidden term: ${term}`);
    }
  });
});

describe("checkoutSuccessCopy", () => {
  it("pickup copy mentions the stand", () => {
    const copy = resolveSuccessCopy("pickup");
    assert.match(copy.lead, /stand/i);
    assert.equal(copy.showStandLinks, true);
  });

  it("shipped copy does not assume stand pickup", () => {
    const copy = resolveSuccessCopy("shipped");
    assert.match(copy.lead, /ship/i);
    assert.doesNotMatch(copy.lead, /take the matching seasonal offering from today/i);
    assert.equal(copy.showStandLinks, false);
  });

  it("unknown mode uses softened copy", () => {
    const copy = resolveSuccessCopy("unknown");
    assert.match(copy.lead, /payment went through/i);
    assert.doesNotMatch(copy.lead, /take the matching seasonal offering from today/i);
  });
});
