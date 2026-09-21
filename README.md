# Latte’s Little Home

A cozy browser life simulation: look after Latte, cook, fish, grow crops, decorate and visit friends.

## Run locally

```sh
npm ci
npm start
```

Open http://127.0.0.1:8793/ in a browser.

## Publish

In repository Settings → Pages, choose **GitHub Actions** as the source. Push to main or run the Publish Latte workflow.

```sh
npm test
npm run build
```

Only dist/ is deployed. Three.js is served locally with its license, without a CDN. Saves are stored in the current browser; there are no accounts or cloud saves.
