[![Stelace-platform-runner](https://user-images.githubusercontent.com/12909094/59638847-c41f1900-9159-11e9-9fa5-6d7806d57c92.png)](https://stelace.com)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/stelace/heroes-platform-demo)

# Stelace API Starter Kit

> This Stelace starter kit is free to use, under the terms of the [MIT license](./LICENSE).
Feel free to [fork](
  https://app.netlify.com/start/deploy?repository=https://github.com/stelace/heroes-platform-demo
), contribute or just make it your own :heart:.

---

This __Web Platform starter kit with pre-configured serverless deployment__ leverages Stelace Search and Automation APIs to run a real-time platform full of super heroes operating in NYC.

- __[Live Demo](https://heroes.demo.stelace.com/s)__
- [Stelace docs quick start](https://stelace.com/docs/getting-started)
- [Blog post](https://stelace.com/blog/building-a-real-time-web-platform-from-scratch-in-one-week/)
- [More details](./HEROES.md) on how this works

[![stelace-heroes-platform-screenshot](https://user-images.githubusercontent.com/12909094/60439766-abac0580-9c13-11e9-954d-9aaa7bc6f22e.gif)](https://heroes.demo.stelace.com/s)

Free your mind and imagine how many cool things you could build on your own with Stelace API…
From online marketplaces to real-time platforms.

A more classical [marketplace starter kit](https://github.com/stelace/marketplace-demo) is also available with additional marketplace features such as Ratings, real-time Messaging, Asset pages and Transactions.

**What is Stelace?**

[Stelace](https://stelace.com/) provides search, inventory and user management infrastructure and APIs for Web platforms, ranging from search-intensive marketplaces to online community apps.

Stelace offers powerful backend and APIs including advanced search, automation, and content delivery, to let you focus on what makes your platform unique.

[API Docs](https://stelace.com/docs)

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

Serverless [JAMStack architecture](https://jamstack.org/):

- [Vue.js](https://github.com/vuejs/vue)
- [Quasar](https://github.com/quasarframework/quasar) framework
- [Stelace API](https://stelace.com) as backend
- [Stelace headless CMS](https://stelace.com/docs/content)
- [Stelace.js](https://github.com/stelace/stelace.js) SDK

Node.js >= 8.9 is used for tooling.

## Make it your own

You first need to get your Stelace API keys. Good news: [it’s free](https://stelace.com/pricing).

1. Clone this repository

```sh
git clone https://github.com/stelace/heroes-platform-demo.git
cd heroes-platform-demo
```

2. Install node_modules

```sh
# using yarn instead of npm is recommended
yarn
```

> If you don’t have [yarn](https://yarnpkg.com/) installed, you can follow these [instructions](https://yarnpkg.com/docs/install).

3. Create environment files for development and production.

You can copy `.env.example` and fill it with Stelace API keys.

```sh
cp .env.example .env.development
# You may want to use live Stelace API keys in this file
cp .env.example .env.production
```

You need to fill the following environment variables:

- STELACE_*PUBLISHABLE_API_KEY (pubk_*...) used in Vue app
- STELACE_*SECRET_API_KEY (seck_*...) used in data seeding scripts
- VUE_APP_MAPBOX_STYLE to activate the map. You can upload live demo [dark map style](/map/darknyc.json) with [Maptiler](
  https://www.maptiler.com/cloud/
) and get a [map style URL](
  https://cloud.maptiler.com/maps/upload
): `https://api.maptiler.com/maps/YOUR_MAP_STYLE_ID/style.json?key=MAPTILER_KEY`.

You can get your API Keys in [Stelace Dashboard](https://stelace.com/dashboard).

4. Seed [data](./docs/development-data.md) and [workflows](https://stelace.com/docs/command/worflows).

```sh
yarn seed
```

5. Start front-end development server

```sh
yarn dev
# same as quasar dev
```

Please refer to [Quasar docs](https://v1.quasar-framework.org/) for more details about configuration and info on components.

Enjoy your platform :)

## Deployment

We’ve set up continuous deployment for you with Netlify.

You just have to click "_Deploy to netlify_" above and follow the instructions to deploy.

Please refer to [deployment docs section](./docs/deployment.md) for more details or alternatives.

## Stelace Dashboard

Create you own account for free to build your own platform and use [official Stelace dashboard](
  https://stelace.com
), enabling your team to access real-time stats, settings, live design and content editing with translation tools, asset and user management and much more.

[
  ![Stelace Dashboard](https://user-images.githubusercontent.com/12909094/38527674-415ac06c-3c5c-11e8-89d3-c92c3be1d377.png)
](https://stelace.com)
