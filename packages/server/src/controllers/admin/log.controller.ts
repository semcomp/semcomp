import AdminLog from "../../models/admin-log";

export const list = async (req, res) => {
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
