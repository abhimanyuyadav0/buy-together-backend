/**
 * Wraps async route handlers so promise rejections are passed to error middleware
 * and the server never crashes from unhandled rejections.
 * @param {Function} fn - Async (req, res, next) => ...
 * @returns {Function} Express middleware
 */
export default function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
