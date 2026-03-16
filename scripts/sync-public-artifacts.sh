#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/../keel-api/docs/public-artifacts"
TARGET_DIR="${REPO_ROOT}/data"

PUBLIC_ROUTES_SOURCE="${SOURCE_DIR}/public-routes.json"
PROVIDER_SUPPORT_SOURCE="${SOURCE_DIR}/provider-support.json"
PUBLIC_ROUTES_TARGET="${TARGET_DIR}/public-routes.json"
PROVIDER_SUPPORT_TARGET="${TARGET_DIR}/provider-support.json"

if [[ ! -f "${PUBLIC_ROUTES_SOURCE}" ]]; then
  echo "Error: missing source file: ${PUBLIC_ROUTES_SOURCE}" >&2
  exit 1
fi

if [[ ! -f "${PROVIDER_SUPPORT_SOURCE}" ]]; then
  echo "Error: missing source file: ${PROVIDER_SUPPORT_SOURCE}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"

cp "${PUBLIC_ROUTES_SOURCE}" "${PUBLIC_ROUTES_TARGET}"
cp "${PROVIDER_SUPPORT_SOURCE}" "${PROVIDER_SUPPORT_TARGET}"

echo "Synced public artifacts into ${TARGET_DIR}"
