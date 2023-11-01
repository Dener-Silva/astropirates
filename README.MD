# AstroPirates
<img src="./packages/frontend/public/og-image.png" width="400" height="400" />

## About
This game is a demonstration piece for my portfolio. [You can play it here!](https://dener-silva.github.io/astropirates/)

Many technologies were used to make this possible:

### Front-end:
- Graphics made using PixiJS
- User interface made with React

### Back-end:
- Running on Node.js
- Using MariaDB for the global leaderboards

### Other:
- Client-server communication with WebSockets
- Serialization done with Avro
- Automated deployment via GitHub Actions

## Local Setup

### Install dependencies

This is a monorepo using the [pnpm](https://pnpm.io/) package manager. If you don't have pnpm installed, please follow [their instructions](https://pnpm.io/installation).

With pnpm installed, run

```bash
pnpm i #install dependencies
```

A MariaDB database server is needed to run the backend locally. If you don't have it installed, you can follow these instructions for [Windows](https://mariadb.com/kb/en/installing-mariadb-msi-packages-on-windows/), [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-ubuntu-20-04) or [Arch Linux](https://wiki.archlinux.org/title/MariaDB#Installation).

### Set up database

Create a new database on MariaDB. I suggest calling it `astropirates`.
Create the highscores table using the script on [docs/create_table_highscores.sql](docs/create_table_highscores.sql)

### Create the .env files

For security reasons, .env files are not uploaded to Git. You should create them to configure the environment variables.

1. Copy `packages/backend/.env` to `packages/backend/.env.development`.
2. On `packages/backend/.env.development`:
    1. Uncomment the variable `#DB_PASSWORD=`
    2. Replace all values for the `DB` variables with the ones that you configured for your MariaDB installation, including the passowrd
    3. Don't worry about the `SSL` variables on localhost, keep them commented.
3. Copy `packages/frontend/.env` to `packages/frontend/.env.development`.

You are now ready to run the project.

## Running Locally

Run back-end and front-end in development mode:
```bash
npm run dev
```

You can also run the back-end and front-end separately:
```bash
npm run dev:backend # Runs only the back-end in development mode
npm run dev:frontend # Runs only the front-end in development mode
```

Run all unit tests:
```bash
npm run test
```

Build project (you need to build before you can preview):
```bash
npm run build
```

Preview project (run using built artifacts):
```bash
npm run preview
```
