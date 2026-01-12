const supabase = require("../supabaseClient");
const supabaseAdmin = require("../supabaseAdmin");

//get all users
async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//get user by ID
async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//delete user from users table
async function deleteUserProfile(userId) {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("userid", userId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

//delete user from supabase auth
async function deleteAuthUser(authUserId) {
  try {
    //use admin client to delete user from auth.users
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(
      authUserId
    );

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  deleteUserProfile,
  deleteAuthUser,
};
