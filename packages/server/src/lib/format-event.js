module.exports.formatEvent = function (event, fields) {
  const formatedEvent = {
    _id: event._id,
    id: event._id,
    name: event.name,
    description: event.description,
    speaker: event.speaker,
    maxOfSubscriptions: event.maxOfSubscriptions,
    link: event.link,
    startDate: event.startDate,
    endDate: event.endDate,
    type: event.type,
    isInGroup: event.isInGroup,
    needInfoOnSubscription: event.needInfoOnSubscription,
    presentUsers: event.presentUsers,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };

  for (const field of Object.keys(formatedEvent)) {
    if (fields.indexOf(field) === -1) delete formatedEvent[field];
  }

  return formatedEvent;
};
