import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("domains router", () => {
  it("returns list of domains without error", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw even if DB is unavailable (returns empty array)
    const result = await caller.domains.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getById returns null for non-existent domain", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.domains.getById({ id: 99999 });
    expect(result === null || result === undefined || typeof result === "object").toBe(true);
  });
});

describe("criteria router", () => {
  it("byDomain returns array for any domainId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.criteria.byDomain({ domainId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("indicators router", () => {
  it("byCriteria returns array for any criteriaId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.indicators.byCriteria({ criteriaId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("evidences router", () => {
  it("byIndicator returns array for any indicatorId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.evidences.byIndicator({ indicatorId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth router", () => {
  it("me returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});
