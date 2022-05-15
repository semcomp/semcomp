export const formatUser = function (user, fields) {
  const formatedUser = {
    _id: user._id,
    nusp: user.nusp,
    email: user.email,
    name: user.name,
    password: user.password,
    course: user.course,
    userTelegram: user.userTelegram,
    permission: user.permission,
    resetPasswordCode: user.resetPasswordCode,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  for (const field of Object.keys(formatedUser)) {
    if (fields.indexOf(field) === -1) delete formatedUser[field];
  }

  return formatedUser;
};
