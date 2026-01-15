<!-- Auto-generated: concise guidance for AI coding agents. Ask author before major edits. -->
# Copilot instructions for AI coding agents

Purpose
- Provide immediate, actionable orientation for AI code helpers working in this repository.

Repository status
- This workspace currently contains no source files discovered by the agent. If files are added, follow the "How to orient" checklist below.

How to orient (first 5–10 minutes)
- Open `README.md` and any `docs/` directory to learn the project's goal and architecture.
- Search for top-level build and manifest files: `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `Dockerfile`, `.github/workflows/`.
- Inspect source layout patterns: look for `src/`, `cmd/`, `internal/`, `pkg/`, `services/`, or `api/` to determine component boundaries.

Big-picture analysis checklist (what to synthesize)
- Identify major components and their responsibilities (API, workers, data-store, infra). Use `cmd/` or `services/` folders as component roots.
- Locate inter-process or network contracts: Open files referencing HTTP routes, message queues (e.g., `kafka`, `rabbitmq`), or gRPC (protobuf files). Document where messages originate and which service consumes them.
- Find deployment and infra code in `deploy/`, `k8s/`, or `.github/workflows/` and map which service each manifest targets.

Project-specific conventions to discover (examples)
- Routing and handlers: controllers often live under `src/.../handlers` or `pkg/handlers`. Look for `handle*` naming and tests under `tests/` prefixed with the same route.
- Configuration: prefer environment-driven config files (search for `.env`, `config/*.yaml`, or `config/*.json`). Respect `CONFIG_` env var overrides.
- Packaging and modules: use `go.mod` for Go, `pyproject.toml` for Python, and `package.json` for Node — prefer the tool named in the manifest for builds.

Build / test / debug workflows (discover and prefer project scripts)
- If present, run project-provided scripts first: `make test`, `npm test`, `pytest -q`, or `go test ./...` depending on manifest files found.
- Check `scripts/` and `tools/` for non-standard test or lint commands and prefer them over generic commands.
- For debugging, prefer the repo's debug entry points (e.g., `cmd/` binaries or `app:app` in Python) instead of ad-hoc invocations.

Integration points and dependencies
- Record external services referenced in code or manifests: databases (Postgres, Redis), queues (Kafka, Rabbit), and external APIs. Note credentials location (GitHub Secrets, `.env`, or `secrets/`).
- Note any Docker images/tags used in `Dockerfile` or `docker-compose.yml` and the expected runtime ports.

What to change and how to propose edits
- Small edits: follow existing style and tests; open and update `README.md` or `docs/` with brief rationale.
- Larger changes: create a short PR description that includes: motivation, files touched, and any rollout steps.

If you see TODOs or failing tests
- Reproduce failing tests locally with the repo's test command; add minimal, focused fixes and tests that demonstrate the regression is resolved.

Examples to look for when writing code (replace with actual repo paths once discovered)
- Service entrypoint: `cmd/<service>/main.go` or `src/<service>/app.py`.
- HTTP handlers: `pkg/api/handlers/*.go` or `src/<service>/routes/*.js`.
- Background workers: `workers/` or `services/<name>/worker.py`.

Notes for maintainers
- This file is a living guide. If the repository has specific CI, build, or deployment commands, paste them into the "Build / test / debug workflows" section.

Questions for the repo owner
- Confirm the primary language/build system (Go / Python / Node / other).
- Point to the canonical service entrypoints and test commands to replace the placeholders above.

— End of guidance —