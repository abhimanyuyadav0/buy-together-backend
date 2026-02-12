import User from "../models/user.model.js";

async function createUser({ name, email, password, avatar, location }) {
  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar || undefined,
    location: location || undefined,
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

async function updateProfile(userId, updates) {
  const allowed = ["name", "avatar", "location", "email", "mobile"];
  const doc = await User.findById(userId);
  if (!doc) return null;
  if (updates.email !== undefined) {
    const email = String(updates.email).toLowerCase().trim();
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) return false;
    doc.email = email;
  }
  allowed.forEach((key) => {
    if (key === "email") return;
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
  updateProfile,
};
