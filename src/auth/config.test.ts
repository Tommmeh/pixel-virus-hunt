import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("uses the supplied public Auth0 settings when no environment override exists", async () => {
  vi.stubEnv("VITE_AUTH0_DOMAIN", undefined);
  vi.stubEnv("VITE_AUTH0_CLIENT_ID", undefined);
  vi.resetModules();
  const config = await import("./config");
  expect(config.AUTH0_DOMAIN).toBe("dev-foxbravo.ca.auth0.com");
  expect(config.AUTH0_CLIENT_ID).toBe("VUw4PuZck775cog7Dr5SXg4LZEeSLS5W");
  expect(config.authEnabled).toBe(true);
});