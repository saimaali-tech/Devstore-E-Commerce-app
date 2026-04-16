#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

info() { printf "\033[1;34m[info]\033[0m %s\n" "$*"; }
ok() { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; }

have() { command -v "$1" >/dev/null 2>&1; }

if ! have curl; then
  err "curl is required to bootstrap Docker. Install curl and re-run."
  exit 1
fi

install_docker_if_missing() {
  if have docker; then
    ok "docker already installed"
    return
  fi

  info "docker not found; installing with official convenience script"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  rm -f /tmp/get-docker.sh
  ok "docker installed"
}

install_compose_plugin_if_missing() {
  if docker compose version >/dev/null 2>&1; then
    ok "docker compose plugin already available"
    return
  fi

  info "docker compose plugin not found; installing to ~/.docker/cli-plugins"
  mkdir -p "$HOME/.docker/cli-plugins"
  local arch
  arch="$(uname -m)"
  case "$arch" in
    x86_64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *)
      err "unsupported CPU architecture for auto compose install: $arch"
      exit 1
      ;;
  esac
  curl -SL \
    "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-${arch}" \
    -o "$HOME/.docker/cli-plugins/docker-compose"
  chmod +x "$HOME/.docker/cli-plugins/docker-compose"
  ok "docker compose plugin installed"
}

docker_cmd() {
  if docker info >/dev/null 2>&1; then
    docker "$@"
  else
    warn "running docker with sudo (daemon may require privileges)"
    sudo docker "$@"
  fi
}

if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  ok "created .env from .env.example"
fi

install_docker_if_missing
install_compose_plugin_if_missing

info "starting services (web, api, postgres)"
docker_cmd compose up --build -d

info "waiting for postgres + running migrations/seed"
docker_cmd compose --profile setup run --rm db-setup

ok "devstore is up"
echo "Web:  http://localhost:3000"
echo "API:  http://localhost:4000/health"
echo "DB:   localhost:5433 (container 5432)"
echo
echo "Stop with: docker compose down"
