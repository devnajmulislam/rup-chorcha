import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { DB_NAME } from "@/lib/db";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db(DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  user: {
    additionalFields: {
      role: {
        type: ["customer", "admin"],
        required: false,
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {},
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userId = session.userId;
          const filter = ObjectId.isValid(userId)
            ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }] }
            : { id: userId };
          const existingUser = await db
            .collection("user")
            .findOne(filter, { projection: { isBlocked: 1 } });

          if (existingUser?.isBlocked === true) {
            throw new APIError("FORBIDDEN", {
              code: "USER_BLOCKED",
              message:
                "This account is blocked. Contact RupChorcha to restore access.",
            });
          }
        },
      },
    },
  },
});
