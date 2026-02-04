import { CATEGORIES } from "../utils/constants.js";
import { success } from "../utils/response.util.js";

function list(_req, res) {
  return success(res, { categories: CATEGORIES }, "Categories");
}

export {
  list,
};
