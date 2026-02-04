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

export {
  createUser,
  findByEmail,
  findById,
  getProfile,
};
