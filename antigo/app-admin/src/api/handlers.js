import API from './base-api';
import {withNoErrorMessage} from './error-message';

const Handlers = {
  // Auth
  login: (email, password) => API.post(`/admin/auth/login`, {email, password}),

  // Users
  getAllUsers: () => API.get('/admin/users'),
  updateUser: (id, user) => API.put('/admin/users/' + id, user),
  deleteUser: withNoErrorMessage((userId) => API.delete('/admin/users/' + userId)),

  // Admin
  getAllAdmins: () => API.get('/admin/admin-users'),
  createAdmin: (user) => API.post('/admin/admin-users', user),
  updateAdmin: (id, user) => API.put('/admin/admin-users/' + id, user),
  deleteAdmin: withNoErrorMessage((userId) => API.delete('/admin/admin-users/' + userId)),

  // Achievements
  getAllAchievements: () => API.get('/admin/achievements'),
  deleteAchievement: withNoErrorMessage((achievementId) => API.delete('/admin/achievements/' + achievementId)),
  createAchievement: (newAchievement) => API.post('/admin/achievements', newAchievement),
  updateAchievement: (id, newAchievement) => API.put('/admin/achievements/' + id, newAchievement),
  addUserAchievement: (userId, achievementId) => API.post(`/admin/users/${userId}/achievements/${achievementId}`),

  // Events
  getAllEvents: () => API.get('/admin/events'),
  deleteEvent: withNoErrorMessage((eventId) => API.delete('/admin/events/' + eventId)),
  createEvent: (newEvent) => API.post('/admin/events', newEvent),
  updateEvent: (id, newEvent) => API.put('/admin/events/' + id, newEvent),
  markAttendance: (eventId, userId) => API.post(`/admin/events/${eventId}/mark-attendance`, {userId: userId}),

  // Riddle Questions
  getRiddleQuestions: () => API.get('/admin/riddle/questions'),
  deleteRiddleQuestions: (id) => API.delete('/admin/riddle/questions/' + id),
  createRiddleQuestion: (question) => API.post('/admin/riddle/questions', question),
  updateRiddleQuestion: (id, question) => API.put('/admin/riddle/questions/' + id, question),

  // Riddle Groups
  getRiddleGroups: () => API.get('/admin/riddle/groups'),
  deleteRiddleGroup: (id) => API.delete('/admin/riddle/groups/' + id),

  // Riddlethon Questions
  getRiddlethonQuestions: () => API.get('/admin/riddlethon/questions'),
  deleteRiddlethonQuestions: (id) => API.delete('/admin/riddlethon/questions/' + id),
  createRiddlethonQuestion: (question) => API.post('/admin/riddlethon/questions', question),
  updateRiddlethonQuestion: (id, question) => API.put('/admin/riddlethon/questions/' + id, question),

  // Riddlethon Groups
  getRiddlethonGroups: () => API.get('/admin/riddlethon/groups'),
  deleteRiddlethonGroup: (id) => API.delete('/admin/riddlethon/groups/' + id),

  // Hard to Click
  getHardToClickQuestions: () => API.get('/admin/hard-to-click/questions'),
  deleteHardToClickQuestions: (id) => API.delete('/admin/hard-to-click/questions/' + id),
  createHardToClickQuestion: (question) => API.post('/admin/hard-to-click/questions', question),
  updateHardToClickQuestion: (id, question) => API.put('/admin/hard-to-click/questions/' + id, question),
  getHardToClickGroups: () => API.get('/admin/hard-to-click/groups'),
  deleteHardToClickGroup: (id) => API.delete('/admin/hard-to-click/groups/' + id),

  // Logs
  getAllLogs: () => API.get('/admin/logs?items=100000&page=0'),

  // Houses
  getHouses: () => API.get('/admin/houses'),
  createHouse: (newHouse) => API.post('/admin/houses', newHouse),
  updateHouse: (id, newHouse) => API.put('/admin/houses/' + id, newHouse),
  assignHouses: () => API.post('/admin/houses/assign-houses'),
  addPointToHouse: (houseId, points) => API.post('/admin/houses/' + houseId + '/add-points', {points}),
  addHouseAchievement: (houseId, achievementId) => API.post(`/admin/houses/${houseId}/achievements/${achievementId}`),

  // Email
  broadcastEmail: (subject, text, html) => API.post('/admin/email/send', {subject, text, html}),
};

export default Handlers;
