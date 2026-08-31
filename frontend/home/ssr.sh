#!/usr/bin/env bash

jobs_dir="$(dirname "$0")/../../../../uploads/dc-cache/jobs"

[ -d "$jobs_dir" ] || exit 0

for job in "$jobs_dir"/*.json; do
    [ -f "$job" ] || break
    echo "[INFO] Spawning worker for job: $(basename "$job")"
    node "$(dirname "$0")/ssr.js" "$job" || echo "[ERROR] Worker failed for job $job"
done
