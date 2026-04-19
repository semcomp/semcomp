# Build
FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod tidy

COPY . .

RUN go build -o main cmd/api/main.go


# Executa
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 4000

CMD ["./main"]