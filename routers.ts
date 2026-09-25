import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createEnquiry, createWaitlistEntry } from "./db";

const contactInput = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(160),
  email: z.string().trim().email("Please enter a valid work email").max(320),
  company: z.string().trim().max(200).optional(),
  interest: z.string().trim().min(2).max(160),
  message: z.string().trim().min(20, "Please share at least a little context").max(5000),
});

const waitlistInput = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(160),
  email: z.string().trim().email("Please enter a valid email").max(320),
  company: z.string().trim().max(200).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  leads: router({
    createEnquiry: publicProcedure.input(contactInput).mutation(async ({ input }) => {
      const result = await createEnquiry(input);
      const notified = await notifyOwner({ title: `New DHONZ enquiry from ${input.name}`, content: `${input.name} (${input.email}) from ${input.company || 'an independent business'} is interested in ${input.interest}.\n\n${input.message}` });
      return { success: true, id: result.id, notified };
    }),
    joinWaitlist: publicProcedure.input(waitlistInput).mutation(async ({ input }) => {
      const result = await createWaitlistEntry(input);
      if (!result.duplicate) await notifyOwner({ title: `New BizPilot waitlist registration from ${input.name}`, content: `${input.name} (${input.email})${input.company ? ` from ${input.company}` : ''} joined the BizPilot AI waitlist.` });
      return { success: true, duplicate: result.duplicate, id: result.id };
    }),
  }),
});

export type AppRouter = typeof appRouter;
