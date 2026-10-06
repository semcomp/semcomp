FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o seed cmd/seed/main.go

FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/seed .

EXPOSE 4000

CMD ["./main"]