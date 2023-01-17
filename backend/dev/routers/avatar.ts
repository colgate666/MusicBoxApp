import { FastifyPluginAsync, FastifyReply } from "fastify";
import path from "path";
import { Database } from "..";
import { DBUser } from "../types/database/user";
import { Message } from "../types/message";
import { verifyToken } from "../utils/jwt";

export const avatarRouter: FastifyPluginAsync = async (instance) => {
    instance.get("/avatar", { preHandler: verifyToken }, async (request, reply) => {
        const response = await Database.getUser(request.user!);
        const isMessage = await Message.spa(response);

        await avatarHandler(isMessage.success, response as DBUser, reply);
    });

    instance.get("/:userId/avatar", async (request, reply) => {
        const { userId } = request.params as { userId: string };

        const response = await Database.getUser(userId);
        const isMessage = await Message.spa(response);

        await avatarHandler(isMessage.success, response as DBUser, reply);
    });

    const avatarHandler = async (error: boolean, userData: DBUser, reply: FastifyReply) => {
        if (error || !userData.avatar) {
            return await reply.code(404).send("Avatar not found for this user.");
        }

        return await reply.sendFile(path.join("images", "avatars", userData.avatar));
    }
}