"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class SeoRobotsService {
    /* =====================================================
       PUBLIC METHOD - FORMATTED ROBOTS.TXT
    ===================================================== */
    /**
     * Generate formatted robots.txt output
     */
    async getFormattedRobots() {
        const environment = process.env.NODE_ENV === "production"
            ? "production"
            : "development";
        const rules = await (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .where("status", "active")
            .where("environment", environment)
            .orderBy("user_agent", "asc");
        if (!rules.length) {
            return "User-agent: *\nAllow: /";
        }
        // Group rules by user_agent
        const grouped = {};
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
                }
                else {
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
    async getAllRobotsRules() {
        return (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .select("*")
            .orderBy("created_at", "desc");
    }
    async getRobotsRuleById(id) {
        return (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .where("id", id)
            .first();
    }
    async createRobotsRule(data) {
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
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
    async updateRobotsRule(id, data) {
        const existing = await (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .where("id", id)
            .first();
        if (!existing) {
            throw new HttpException_1.default(404, "Robots rule not found");
        }
        const updateData = {};
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
        updateData.updated_at = index_schema_1.default.fn.now();
        await (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .where("id", id)
            .update(updateData);
        return this.getRobotsRuleById(id);
    }
    async deleteRobotsRule(id) {
        const deleted = await (0, index_schema_1.default)(index_schema_1.T.SEO_ROBOTS_RULES)
            .where("id", id)
            .delete();
        if (deleted === 0) {
            throw new HttpException_1.default(404, "Robots rule not found");
        }
        return true;
    }
}
exports.default = SeoRobotsService;
//# sourceMappingURL=seo-robots.services.js.map