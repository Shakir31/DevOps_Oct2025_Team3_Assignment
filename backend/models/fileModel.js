const supabase = require("../supabaseClient");

//get all files for a specific user
async function getUserFiles(userId) {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("userid", userId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//get single file by ID
async function getFileById(fileId) {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("fileid", fileId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

//create file record
async function createFileRecord(userId, fileData) {
  try {
    const { data, error } = await supabase
      .from("files")
      .insert([
        {
          userid: userId,
          filename: fileData.filename,
          originalname: fileData.originalname,
          filepath: fileData.filepath,
          filesize: fileData.filesize,
          mimetype: fileData.mimetype,
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

//delete file record
async function deleteFileRecord(fileId) {
  try {
    const { error } = await supabase
      .from("files")
      .delete()
      .eq("fileid", fileId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUserFiles,
  getFileById,
  createFileRecord,
  deleteFileRecord,
};
