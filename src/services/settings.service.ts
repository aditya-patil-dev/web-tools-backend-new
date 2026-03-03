import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

class SettingsService {
  /* =====================================================
       PUBLIC
    ===================================================== */

  /**
   * Get active site settings (Frontend use)
   */
  public async getSiteSettings() {
    const settings = await DB(T.SITE_SETTINGS).where("is_active", true).first();

    if (!settings) throw new HttpException(404, "Site settings not found");

    return settings;
  }

  /* =====================================================
       ADMIN
    ===================================================== */

  /**
   * Get settings for admin panel
   */
  public async getSiteSettingsAdmin() {
    const settings = await DB(T.SITE_SETTINGS).first();

    if (!settings) throw new HttpException(404, "Site settings not found");

    return settings;
  }

  /**
   * Update site settings (Single row system)
   */
  public async updateSiteSettings(data: any) {
    const existing = await DB(T.SITE_SETTINGS).first();

    if (!existing) throw new HttpException(404, "Site settings not found");

    const updateData: any = {};

    /*
        SITE IDENTITY
        */

    if (data.site_name !== undefined) updateData.site_name = data.site_name;

    if (data.site_tagline !== undefined)
      updateData.site_tagline = data.site_tagline;

    if (data.site_url !== undefined) updateData.site_url = data.site_url;

    if (data.site_description !== undefined)
      updateData.site_description = data.site_description;

    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;

    if (data.favicon_url !== undefined)
      updateData.favicon_url = data.favicon_url;

    /*
        ANALYTICS
        */

    if (data.google_analytics_id !== undefined)
      updateData.google_analytics_id = data.google_analytics_id;

    if (data.google_tag_manager_id !== undefined)
      updateData.google_tag_manager_id = data.google_tag_manager_id;

    if (data.google_search_console !== undefined)
      updateData.google_search_console = data.google_search_console;

    if (data.bing_webmaster !== undefined)
      updateData.bing_webmaster = data.bing_webmaster;

    if (data.facebook_pixel_id !== undefined)
      updateData.facebook_pixel_id = data.facebook_pixel_id;

    if (data.hotjar_site_id !== undefined)
      updateData.hotjar_site_id = data.hotjar_site_id;

    /*
        SYSTEM FLAGS
        */

    if (data.maintenance_mode !== undefined)
      updateData.maintenance_mode = data.maintenance_mode;

    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    updateData.updated_at = DB.fn.now();
    updateData.updated_by = data.updated_by || null;

    await DB(T.SITE_SETTINGS).where("id", existing.id).update(updateData);

    return this.getSiteSettingsAdmin();
  }
}

export default SettingsService;
