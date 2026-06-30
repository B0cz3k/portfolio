# Lukasz Borak Portfolio

Static GitHub Pages portfolio built as an interactive reflection of a machine-learning CV: AI agents, production systems, accessible ML, cars, and music.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 5173
```

## GitHub Pages

Pushing to `master` deploys the static site through `.github/workflows/deploy-pages.yml`.

In GitHub repository settings, set Pages to **GitHub Actions** as the build and deployment source. The workflow packages only `index.html`, `styles.css`, `script.js`, `.nojekyll`, and `assets/` into `dist/`.

Use `dev` for ongoing adjustments. Merge or fast-forward `dev` into `master` when a version is ready to publish.
