import z from "zod";

export const Message = z.object({
    body: z.string(),
    code: z.number().int()
});

export type Message = z.infer<typeof Message>;
