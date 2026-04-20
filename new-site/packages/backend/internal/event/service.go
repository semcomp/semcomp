package event

type EventService interface {
	CreateEvent(request CreateEventRequest) (*Event, error)
}

type eventService struct {
	repo EventRepository
}

func NewEventService(repo EventRepository) EventService {
	return &eventService{repo: repo}
}

func (s *eventService) CreateEvent(request CreateEventRequest) (*Event, error) {
	newEvent := Event{
		Name:          request.Name,
		DateTime:      request.DateTime,
		Type:          request.Type,
		Location:      request.Location,
		Description:   request.Description,
		HasAttendance: request.HasAttendance,
	}

	if err := s.repo.Create(&newEvent); err != nil {
		return nil, err
	}

	return &newEvent, nil
}
