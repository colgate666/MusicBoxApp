import z from "zod";

export const DBUser = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    avatar: z.string().nullable().optional(),
});

export type DBUser = z.infer<typeof DBUser>;
