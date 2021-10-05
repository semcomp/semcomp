const AdminLog = require("../../models/admin-log");

module.exports.list = async (req, res) => {
  try {
    const adminLogs = await AdminLog.find();

    return res.status(200).json(adminLogs);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
