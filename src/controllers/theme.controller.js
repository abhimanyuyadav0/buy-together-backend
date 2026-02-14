import { success } from "../utils/response.util.js";
import { THEME_CONFIG } from "../config/theme.config.js";

function getTheme(_req, res) {
  return success(res, { theme: THEME_CONFIG }, "Theme");
}

export { getTheme };
