package log

type Service interface {
    CreateAudit(entry AuditLog) error
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
