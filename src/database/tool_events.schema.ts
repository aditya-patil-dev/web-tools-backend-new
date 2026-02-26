import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "tool_events");
            await DB.schema.dropTableIfExists("tool_events");
        }

        const exists = await DB.schema.hasTable("tool_events");

        if (!exists) {
            await DB.schema.createTable("tool_events", (table) => {
                table.bigIncrements("id").primary();

                /*
                RELATIONS
                */

                table
                    .bigInteger("tool_id")
                    .notNullable()
                    .references("id")
                    .inTable("tools")
                    .onDelete("CASCADE");

                table
                    .bigInteger("ref_tool_id")
                    .nullable()
                    .references("id")
                    .inTable("tools")
                    .onDelete("SET NULL");

                /*
                SESSION / USER
                */

                table.string("session_id", 120).notNullable();

                table.bigInteger("user_id").nullable();

                /*
                EVENT TYPE
                */

                table
                    .enu("event_type", [
                        "PAGE_VIEW",
                        "TOOL_RUN",
                        "RECOMMENDATION_CLICK",
                    ])
                    .notNullable();

                /*
                OPTIONAL META
                */

                table.jsonb("meta").defaultTo(DB.raw(`'{}'::jsonb`));

                /*
                TIMESTAMP
                */

                table.timestamp("created_at").defaultTo(DB.fn.now());

                /*
                INDEXES (VERY IMPORTANT FOR PERFORMANCE)
                */

                table.index(["tool_id"]);
                table.index(["session_id"]);
                table.index(["event_type"]);
                table.index(["created_at"]);
                table.index(["ref_tool_id"]);
            });
        }
    } catch (err) {
        console.error("tool_events.schema error", err);
    }
};