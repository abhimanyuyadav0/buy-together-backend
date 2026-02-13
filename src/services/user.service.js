import User from "../models/user.model.js";

async function createUser({ name, email, password, avatar, location, currency }) {
  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar || undefined,
    location: location || undefined,
    currency: currency && ["INR", "USD", "SAR", "GBP", "EUR"].includes(currency) ? currency : "INR",
  });
  return user;
}

async function findByEmail(email) {
  return User.findOne({ email }).select("+password");
}

async function findById(id) {
  return User.findById(id);
}

async function getProfile(id) {
  return User.findById(id);
}

/** Public profile for viewing another user (no email). */
async function getPublicProfile(id) {
  const doc = await User.findById(id)
    .select("name avatar location currency rating reviewCount createdAt")
    .lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    avatar: doc.avatar ?? null,
    location: doc.location ?? null,
    currency: doc.currency ?? "INR",
    rating: doc.rating ?? 0,
    reviewCount: doc.reviewCount ?? 0,
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

const ALLOWED_CURRENCIES = ["INR", "USD", "SAR", "GBP", "EUR"];

async function updateProfile(userId, updates) {
  const allowed = ["name", "avatar", "location", "email", "mobile", "currency"];
  const doc = await User.findById(userId);
  if (!doc) return null;
  if (updates.email !== undefined) {
    const email = String(updates.email).toLowerCase().trim();
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) return false;
    doc.email = email;
  }
  if (updates.currency !== undefined) {
    doc.currency = ALLOWED_CURRENCIES.includes(updates.currency) ? updates.currency : doc.currency;
  }
  allowed.forEach((key) => {
    if (key === "email" || key === "currency") return;
    if (updates[key] !== undefined) doc[key] = updates[key];
  });
  await doc.save();
  return User.findById(userId);
}

export {
  createUser,
  findByEmail,
  findById,
  getProfile,
  getPublicProfile,
  updateProfile,
};
