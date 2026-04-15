import { createDb } from "@repo/db/client";
import * as schema from "@repo/db/schema";

export const db = createDb(schema, "dotschoolPg");
