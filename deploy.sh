#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_HOST="${TARGET_HOST:-deck@192.168.2.247}"
TARGET_DIR="${TARGET_DIR:-/home/deck/homebrew/plugins/XboxAchievements}"
DECK_PASS="${DECK_PASS:-deck}"
RESTART_PLUGIN_LOADER="${RESTART_PLUGIN_LOADER:-0}"
SSH_OPTS="-o StrictHostKeyChecking=accept-new"
RSYNC_SSH="sshpass -p ${DECK_PASS} ssh ${SSH_OPTS}"

cd "${SCRIPT_DIR}"

echo "[1/6] Installing frontend dependencies..."
pnpm install --frozen-lockfile

echo "[2/6] Building frontend bundle..."
pnpm build

echo "[3/6] Preparing target directory..."
sshpass -p "${DECK_PASS}" ssh ${SSH_OPTS} "${TARGET_HOST}" \
  "echo '${DECK_PASS}' | sudo -S mkdir -p '${TARGET_DIR}/assets' '${TARGET_DIR}/dist' && \
   echo '${DECK_PASS}' | sudo -S chown -R deck:deck '${TARGET_DIR}'"

echo "[4/6] Syncing files to Steam Deck..."
rsync -az --delete -e "${RSYNC_SSH}" "${SCRIPT_DIR}/dist/" "${TARGET_HOST}:${TARGET_DIR}/dist/"
rsync -az --delete -e "${RSYNC_SSH}" "${SCRIPT_DIR}/assets/" "${TARGET_HOST}:${TARGET_DIR}/assets/"
rsync -az -e "${RSYNC_SSH}" \
  "${SCRIPT_DIR}/main.py" \
  "${SCRIPT_DIR}/plugin.json" \
  "${SCRIPT_DIR}/package.json" \
  "${TARGET_HOST}:${TARGET_DIR}/"

echo "[5/6] Fixing ownership..."
sshpass -p "${DECK_PASS}" ssh ${SSH_OPTS} "${TARGET_HOST}" \
  "echo '${DECK_PASS}' | sudo -S chown -R deck:deck '${TARGET_DIR}'"

if [[ "${RESTART_PLUGIN_LOADER}" == "1" ]]; then
  echo "[5b/6] Restarting plugin loader..."
  sshpass -p "${DECK_PASS}" ssh ${SSH_OPTS} "${TARGET_HOST}" \
    "echo '${DECK_PASS}' | sudo -S systemctl restart plugin_loader"
else
  echo "[5b/6] Skipping plugin loader restart (RESTART_PLUGIN_LOADER=${RESTART_PLUGIN_LOADER})."
fi

echo "[6/6] Post-deploy checks..."
sshpass -p "${DECK_PASS}" ssh ${SSH_OPTS} "${TARGET_HOST}" \
  "test -d '${TARGET_DIR}' && echo 'PLUGIN_DIR_OK' && \
   systemctl --no-pager --full status plugin_loader | sed -n '1,12p' && \
   journalctl -u plugin_loader -n 40 --no-pager"

echo "Deploy complete: ${TARGET_HOST}:${TARGET_DIR}"
