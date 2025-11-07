# syntax=docker/dockerfile:1

FROM rust:1.91.0-bookworm
WORKDIR /app
COPY . .
RUN cargo build --release -p nodeindex && cp ./target/release/nodeindex ./  && rm -rf ./target
CMD ["./nodeindex"]
