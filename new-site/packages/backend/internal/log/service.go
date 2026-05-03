package log

type Service interface {
    CreateAudit(entry AuditLog) error
    CreateError(entry ErrorLog) error
}

type service struct {
    repo Repository
}

func NewService(repo Repository) Service {
    return &service{repo: repo}
}

func (s *service) CreateAudit(entry AuditLog) error {
    return s.repo.CreateAudit(entry)
}

func (s *service) CreateError(entry ErrorLog) error {
    return s.repo.CreateError(entry)
}
