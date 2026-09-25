import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createEnquiry: vi.fn().mockResolvedValue({ id: 41 }),
  createWaitlistEntry: vi.fn().mockResolvedValue({ id: 9, duplicate: false }),
}));
vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));

const { appRouter } = await import("./routers");
const { createEnquiry, createWaitlistEntry } = await import("./db");
const { notifyOwner } = await import("./_core/notification");

const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("lead capture success flows", () => {
  it("persists and notifies on a valid enquiry", async () => {
    const result = await caller.leads.createEnquiry({ name: "Ada Lovelace", email: "ada@example.com", company: "Analytical Engines", interest: "AI & automation", message: "We need a clearer operating layer for our growing customer support team." });
    expect(result).toMatchObject({ success: true, id: 41, notified: true });
    expect(createEnquiry).toHaveBeenCalledOnce();
    expect(notifyOwner).toHaveBeenCalledOnce();
  });

  it("does not notify again for a duplicate waitlist registration", async () => {
    vi.mocked(createWaitlistEntry).mockResolvedValueOnce({ id: 9, duplicate: true });
    const before = vi.mocked(notifyOwner).mock.calls.length;
    const result = await caller.leads.joinWaitlist({ name: "Grace Hopper", email: "grace@example.com", company: "Compilers Co" });
    expect(result).toMatchObject({ success: true, duplicate: true, id: 9 });
    expect(vi.mocked(notifyOwner).mock.calls.length).toBe(before);
  });

  it("returns a waitlist success and notifies once for a new registration", async () => {
    const result = await caller.leads.joinWaitlist({ name: "Grace Hopper", email: "grace@example.com", company: "Compilers Co" });
    expect(result).toMatchObject({ success: true, duplicate: false, id: 9 });
    expect(createWaitlistEntry).toHaveBeenCalledTimes(2);
    expect(notifyOwner).toHaveBeenCalledTimes(2);
  });
});
