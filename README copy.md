<p align="center">
  <a href="https://www.postgresql.org/docs/14/intro-whatis.html" target="blank"><img src="./imgs//pngwing.com.png" width="130" alt="Docker Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
  <a href="" target="blank"><img src="./imgs/png-docker.png" width="160" alt="Postgres Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

#

<p align="center">
  <strong style="font-size: 4em;">Postgres + Nest.js + Docker</strong>
</p>

## Description

Welcome to the Book-Keeper Service project! This backend application, built with [Nest.js](https://github.com/nestjs/nest) and [PostgreSQL](https://www.postgresql.org/docs/14/intro-whatis.html), provides a comprehensive book-keeping solution. Users can manage multiple posts associated with their accounts, creating a seamless experience for organizing and tracking various bookkeeping entries.

## Technologies Used

- **Nest.js:** A modern, server-side framework built on top of Node.js that facilitates building scalable and maintainable applications.
- **PostgreSQL:** A robust open-source relational database system used to store and manage the application's data.

- **Docker:** A platform that enables developers to automate the deployment of applications inside lightweight, portable containers.

- **pgAdmin4:** A web-based administration tool for PostgreSQL databases that simplifies database management tasks.

## Getting Started

Follow the steps below to set up and run the project locally on your machine:

1. Clone this repository to your local environment.

## Installation

```bash
$ git clone https://github.com/sam2426/nest-pg-proj.git
```

## Running the app

```bash
# Navigate to the project directory
cd nest-pg-proj

# Run Docker Compose

docker-compose up -d
```

## Testing the Application

Open Swagger Documentation at - http://localhost:3000/api

Open PgAdmin - http://localhost:5050/login

```
username: admin@admin.com
pass: pgadmin4
```

## Configuring DB Connection in pgAdmin

1. Go to servers > Register > Server
2. Enter any name in the General Section, say: "Postgres-Docker"
3. Goto Connection Tab, and enter the following details:
   ![Connection](./imgs/Screenshot-connection.png)
4. Click on save
5. On password prompt enter: `mysecretpassword`

## Stay in touch

- Author - [Shubham Kumar Shaw](https://www.linkedin.com/in/shubham-shaw-860471b7/)

## License

Nest is [MIT licensed](LICENSE).
