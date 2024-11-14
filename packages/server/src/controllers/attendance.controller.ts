import { handleError } from "../lib/handle-error";
import AttendanceService from "../services/attendance.service";

const attendanceController = {
  userAttendances: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const attendances = await AttendanceService.findByUserId(userId);

      return res.status(200).json(attendances);
    } catch (error) {
      return handleError(error, next);
    }
  },
  listAttendanceInfoWithEventTypeRate: async (req, res, next) => {
    try {
      const { eventType } = req.body;
      const attendances = await AttendanceService.listAttendanceInfoWithEventTypeRate(eventType);

      return res.status(200).json(attendances);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default attendanceController;
