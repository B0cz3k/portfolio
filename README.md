# Lukasz Borak Portfolio

Static GitHub Pages portfolio built as an interactive reflection of a machine-learning CV: AI agents, production systems, accessible ML, cars, and music.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 5173
```

## Repository Model

This project is intended to live in a dedicated source repository:

- Source code: `B0cz3k/portfolio`
- Published site: `B0cz3k/B0cz3k.github.io`

Use `dev` for ongoing adjustments. Merge or fast-forward `dev` into `master` when a version is ready to publish.

## Deployment

Pushing to `master` in `B0cz3k/portfolio` deploys the static site through `.github/workflows/deploy-pages.yml`.

The workflow packages only `index.html`, `styles.css`, `script.js`, `.nojekyll`, and `assets/` into `dist/`, then publishes that output to the `gh-pages` branch of `B0cz3k/B0cz3k.github.io`.

Create a repository secret named `PAGES_DEPLOY_TOKEN` in `B0cz3k/portfolio`. It should contain a GitHub token with write access to `B0cz3k/B0cz3k.github.io`.

In `B0cz3k/B0cz3k.github.io`, set GitHub Pages to deploy from the `gh-pages` branch.
