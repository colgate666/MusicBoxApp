import { createPool, DatabasePool, sql } from "slonik";
import { LOG } from "../..";
import { DBUser } from "../../types/database/user";
import { Message } from "../../types/message";
import { saveFromBase64 } from "../../utils/image";
import bcrypt from "bcrypt";

export class DatabaseSource {
    private dbPool!: DatabasePool;

    constructor() {
        this.initializeDbConnection().then(pool => {
            if (pool) {
                this.dbPool = pool;
            } else {
                throw "Error connecting to database";
            }
        });
    }

    async initializeDbConnection(): Promise<DatabasePool | null> {
        try {
            return await createPool(process.env.DB_URI!);
        } catch(err) {
            LOG.error(err);
            return null;
        }
    }

    async getUser(userId: string): Promise<DBUser | Message> {
        try {
            return await this.dbPool!.connect(async conn => {
                const query = sql.type(DBUser)`
                    SELECT * FROM users
                    WHERE id = ${userId}
                `;

                const user = await conn.maybeOne(query);

                if (user) {
                    return user;
                } else {
                    return {
                        body: "User not found.",
                        code: 404,
                    };
                }
            });
        } catch (err) {
            LOG.error(err);
            return {
                body: "Error fetching users.",
                code: 500,
            };
        }
    }

    async getByUsernameOrEmail(username: string, email: string): Promise<DBUser | null> {
        try {
            return await this.dbPool!.connect(async conn => {
                const query = sql.type(DBUser)`
                    SELECT * FROM users
                    WHERE username = ${username}
                    OR email = ${email}
                `;

                const user = await conn.maybeOne(query);

                if (user) {
                    return user;
                } else {
                    return null;
                }
            });
        } catch (err) {
            LOG.error(err);
            return null;
        }
    }

    async insertUser(username: string, email: string, password: string, avatar?: string): Promise<DBUser | null> {
        try {
            return await this.dbPool!.connect(async conn => {
                await conn.query(sql.unsafe`BEGIN`);
                
                const insertQuery = sql.type(DBUser)`
                    INSERT INTO users(username, email, password)
                    VALUES(${username}, ${email}, ${password})
                    RETURNING *
                `;

                const user = await conn.one(insertQuery);
                
                if (!avatar) {
                    await conn.query(sql.unsafe`ROLLBACK`);
                    return user;
                }

                const file = await saveFromBase64(user.id, avatar);

                if (!file) {
                    await conn.query(sql.unsafe`ROLLBACK`);
                    return null;
                }

                const avatarQuery = sql.type(DBUser)`
                    UPDATE users 
                    SET avatar = ${file}
                    WHERE id = ${user.id}
                    RETURNING *
                `;

                await conn.query(avatarQuery);
                await conn.query(sql.unsafe`COMMIT`);
                return user;
            });
        } catch (err) {
            LOG.error(err);
            return null;
        }
    }

    async checkPassword(user: string, password: string): Promise<Message> {
        try {
            const res = await this.getUser(user);
            const message = await Message.spa(res);

            if (message.success) {
                if (message.data.code === 404) {
                    return message.data;
                }

                return {
                    code: 500,
                    body: "Error loging in.",
                };
            }

            const usr = res as DBUser;
            const same = await bcrypt.compare(password, usr.password);

            if (!same) {
                return {
                    code: 400,
                    body: "Incorrect password.",
                };
            }

            return {
                code: 200,
                body: "Correct password",
            };
        } catch (err) {
            LOG.error(err);
            return {
                body: "Error fetching users.",
                code: 500,
            };
        }
    }
}