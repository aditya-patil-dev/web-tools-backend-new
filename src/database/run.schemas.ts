import { createProcedure } from "./index.schema";
import { seed as seedUsers } from "./users.schema";
import { seed as seedWorkspaces } from "./workspaces.schema";
import { seed as seedWorkspaceMembers } from "./workspace_members.schema";
import { seed as seedUserTokens } from "./user_tokens.schema";
import { seed as seedBillingAccounts } from "./billing_accounts.schema";
import { seed as seedPlans } from "./plans.schema";
import { seed as seedSubscriptions } from "./subscriptions.schema";
import { seed as seedCreditLedger } from "./credit_ledger.schema";
import { seed as seedUsageEvents } from "./usage_events.schema";
import { seed as seedFiles } from "./files.schema";
import { seed as seedTools } from "./tools.schema";
import { seed as seedToolPages } from "./tool_pages.schema";
import { seed as seedToolsCategoryPages } from "./tools_category_pages.schema";
import { seed as seedSeoStaticPages } from "./seo_static_pages.schema";
import { seed as seedSeoRobotsRules } from "./seo-robots.schema";
import { seed as seedPageComponents } from "./page_components.schema";
import { seed as seedToolEvents } from "./tool_events.schema";
import { seed as seedLegalPages } from "./legal_pages.schema";
import { seed as seedContactMessages } from "./contact.schema";

const run = async () => {
    await createProcedure();

    // Order matters due to FKs
    await seedUsers(false);
    await seedWorkspaces(false);
    await seedWorkspaceMembers(false);
    await seedUserTokens(false);
    await seedBillingAccounts(false);
    await seedPlans(false);
    await seedSubscriptions(false);
    await seedCreditLedger(false);
    await seedUsageEvents(false);
    await seedFiles(false);
    await seedTools(false);
    await seedToolPages(false);
    await seedToolsCategoryPages(false);
    await seedSeoStaticPages(false);
    await seedSeoRobotsRules(false);
    await seedPageComponents(false);
    await seedToolEvents(false);
    await seedLegalPages(false);
    await seedContactMessages(false);

};

run().catch(console.error);
