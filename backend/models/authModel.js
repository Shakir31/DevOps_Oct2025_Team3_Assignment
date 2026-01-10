const supabase = require("../supabaseClient");

//register new user with Supabase Auth (its in-built alr)
async function registerUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { authUser: data.user, error: null };
  } catch (error) {
    return { authUser: null, error };
  }
}

//create user profile in database
async function createUserProfile(authUserId, email, username, role) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          authuserid: authUserId,
          email,
          username,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//login user
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { session: data.session, user: data.user, error: null };
  } catch (error) {
    return { session: null, user: null, error };
  }
}

//get user profile by auth user ID
async function getUserProfile(authUserId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("authuserid", authUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//logout user
async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

//verify Supabase JWT token
async function verifyToken(token) {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

module.exports = {
  registerUser,
  createUserProfile,
  loginUser,
  getUserProfile,
  logoutUser,
  verifyToken,
};
