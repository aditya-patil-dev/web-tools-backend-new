import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

class SeoRobotsService {
    /* =====================================================
       PUBLIC METHOD - FORMATTED ROBOTS.TXT
    ===================================================== */

    /**
     * Generate formatted robots.txt output
     */
    public async getFormattedRobots(): Promise<string> {
        const environment = process.env.NODE_ENV === "production"
            ? "production"
            : "development";

        const rules = await DB(T.SEO_ROBOTS_RULES)
            .where("status", "active")
            .where("environment", environment)
            .orderBy("user_agent", "asc");

        if (!rules.length) {
            return "User-agent: *\nAllow: /";
        }

        // Group rules by user_agent
        const grouped: Record<string, any[]> = {};

        for (const rule of rules) {
            if (!grouped[rule.user_agent]) {
                grouped[rule.user_agent] = [];
            }
            grouped[rule.user_agent].push(rule);
        }

        let robotsText = "";

        for (const agent in grouped) {
            robotsText += `User-agent: ${agent}\n`;

            const agentRules = grouped[agent];

            for (const rule of agentRules) {
                if (rule.rule_type === "allow") {
                    robotsText += `Allow: ${rule.path}\n`;
                } else {
                    robotsText += `Disallow: ${rule.path}\n`;
                }

                if (rule.crawl_delay) {
                    robotsText += `Crawl-delay: ${rule.crawl_delay}\n`;
                }
            }

            robotsText += "\n";
        }

        return robotsText.trim();
    }

    /* =====================================================
       ADMIN METHODS
    ===================================================== */

    public async getAllRobotsRules() {
        return DB(T.SEO_ROBOTS_RULES)
            .select("*")
            .orderBy("created_at", "desc");
    }

    public async getRobotsRuleById(id: number) {
        return DB(T.SEO_ROBOTS_RULES)
            .where("id", id)
            .first();
    }

    public async createRobotsRule(data: any) {
        const [created] = await DB(T.SEO_ROBOTS_RULES)
            .insert({
                user_agent: data.user_agent,
                rule_type: data.rule_type,
                path: data.path,
                crawl_delay: data.crawl_delay || null,
                status: data.status || "active",
                environment: data.environment || "production",
            })
            .returning("*");

        return created;
    }

    public async updateRobotsRule(id: number, data: any) {
        const existing = await DB(T.SEO_ROBOTS_RULES)
            .where("id", id)
            .first();

        if (!existing) {
            throw new HttpException(404, "Robots rule not found");
        }

        const updateData: any = {};

        if (data.user_agent !== undefined)
            updateData.user_agent = data.user_agent;

        if (data.rule_type !== undefined)
            updateData.rule_type = data.rule_type;

        if (data.path !== undefined)
            updateData.path = data.path;

        if (data.crawl_delay !== undefined)
            updateData.crawl_delay = data.crawl_delay;

        if (data.status !== undefined)
            updateData.status = data.status;

        if (data.environment !== undefined)
            updateData.environment = data.environment;

        updateData.updated_at = DB.fn.now();

        await DB(T.SEO_ROBOTS_RULES)
            .where("id", id)
            .update(updateData);

        return this.getRobotsRuleById(id);
    }

    public async deleteRobotsRule(id: number) {
        const deleted = await DB(T.SEO_ROBOTS_RULES)
            .where("id", id)
            .delete();

        if (deleted === 0) {
            throw new HttpException(404, "Robots rule not found");
        }

        return true;
    }
}

export default SeoRobotsService;