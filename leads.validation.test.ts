import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const caller = appRouter.createCaller({
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("lead capture validation", () => {
  it("rejects incomplete enquiries before database work", async () => {
    await expect(caller.leads.createEnquiry({ name: "A", email: "bad", interest: "", message: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid BizPilot waitlist emails", async () => {
    await expect(caller.leads.joinWaitlist({ name: "Ada", email: "not-an-email" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
