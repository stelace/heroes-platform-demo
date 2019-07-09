[![Stelace-platform-runner](https://user-images.githubusercontent.com/12909094/59638847-c41f1900-9159-11e9-9fa5-6d7806d57c92.png)](https://stelace.com)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/stelace/heroes-platform-demo)

# Stelace Heroes Platform demo

> This Stelace template is free to use, under the terms of the [MIT license](./LICENSE).
Feel free to fork, contribute or just make it your own :heart:.

---

This template leverages Stelace API to run a platform full of super heroes operating in NYC. __[Live Demo](https://heroes.demo.stelace.com/s)__

[![stelace-heroes-platform-screenshot](https://user-images.githubusercontent.com/12909094/60439766-abac0580-9c13-11e9-954d-9aaa7bc6f22e.gif)](https://heroes.demo.stelace.com/s)

Here is a [blog post](https://stelace.com/blog/building-a-real-time-web-platform-from-scratch-in-one-week/) introducing this demo, and a more [precise description](./HEROES.md) of the demo, but we invite you to play [live](https://heroes.demo.stelace.com/s).

Free your mind and imagine how many cool things you could build on your own… From online marketplaces to real-time platforms.

**What is Stelace?**

[Stelace](https://stelace.com/) provides search, automation and marketplace infrastructure for Web platforms, ranging from search-intensive apps to online communities. Stelace offers powerful backend that lets you focus on what makes your platform unique.

[API Docs](https://stelace.com/docs)

A more complex [marketplace template](https://github.com/stelace/jobs-marketplace-template) is also available with additional marketplace features such as Ratings, gated access, Organizations or real-time messaging.

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Netlify Status](https://api.netlify.com/api/v1/badges/6532f66b-bef6-40cd-963b-81f1481e3a69/deploy-status)](https://app.netlify.com/sites/stelace-heroes-platform-demo/deploys)
---

## Features

- Super Heroes as platform [Assets](https://stelace.com/docs/assets) that can be created by [Users](https://stelace.com/docs/users).
- Powerful and typo-tolerant [Search](https://stelace.com/docs/search) :mag:, and advanced filtering with [Custom Attributes](https://stelace.com/docs/assets/custom-attributes).
- Real-time [Events](https://stelace.com/docs/command/events) to automate the platform
- Automation with Stelace [Workflows](https://stelace.com/docs/command/workflows) and Tasks, making the Website demo aware of Heroes missions and locations in real-time, as you would for a ride-sharing platform (like Lyft) :traffic_light:
- Headless CMS :page_with_curl: with Stelace [Content API](https://stelace.com/docs/content)
- i18n :earth_africa: and full [translations](./docs/i18n.md)
- [Performance](./docs/performance.md) (90+ Lighthouse score) :checkered_flag:
- JSON [data import script](./docs/development-data.md), including Assets in CSV format.
- …
- and [much more](https://stelace.com) with Stelace API

## Integrations

Leverage these integrations to start running your platform even faster:

- Automated and continuous deployment with [Netlify](https://www.netlify.com/)
- Maps with [OpenStreetMap](https://www.openstreetmap.org/) provider
- [Sentry](https://sentry.io/) for logging in production environment
- Google Analytics

## Stack

- [Vue.js](https://github.com/vuejs/vue) and [Quasar](https://github.com/quasarframework/quasar)
- [Stelace Backend](https://stelace.com)
- [Stelace.js](https://github.com/stelace/stelace.js) SDK
- Node.js >= 8.9 for tooling

## Make it your own

You first need to get your Stelace API Key. Good news: [it’s free](https://stelace.com/pricing).

1. Clone this repository

```
git clone https://github.com/stelace/heroes-platform-demo.git
cd stelace-instant
```

2. Install node_modules

```
yarn
# or
npm install
```

3. Create environment files for development and production.
You can copy `.env.example` and fill it with Stelace API keys.

```
cp .env.example .env.development
cp .env.example .env.production
```

You need to fill the following environment variables:

- STELACE_*PUBLISHABLE_API_KEY (pubk_*...) used in Vue app
- STELACE_*SECRET_API_KEY (seck_*...) used in data seeding scripts

4. Start the development server

```
yarn dev
# or
quasar dev
```

Please refer to [Quasar docs](https://v1.quasar-framework.org/) for more details about configuration and info on components.

5. Seed [data](./docs/development-data.md)

```
yarn seed
```

Enjoy your platform :)

## Deployment

We’ve set up continuous deployment for you with Netlify.

You just have to click "_Deploy to netlify_" above and follow the instructions to deploy.

Please refer to [deployment docs section](./docs/deployment.md) for more details or alternatives.

## Stelace Dashboard

Create you own account for free to build your own platform and use [official Stelace dashboard](https://stelace.com), enabling your team to access real-time stats, settings, live design and content editing with translation tools, asset and user management and much more.

[![Stelace Dashboard](https://user-images.githubusercontent.com/12909094/38527674-415ac06c-3c5c-11e8-89d3-c92c3be1d377.png)](https://stelace.com)
