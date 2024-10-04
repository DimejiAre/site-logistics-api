# Project Name

Site Logistics API

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Documentation](#documentation)

## About

This is the backend API for managing logistics operations related to sites, trucks, and tickets. The project uses Node.js, PostgreSQL, and follows modern backend development practices with NestJS.

## Getting Started

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites

- **Node.js**: It is recommended to use Node v22.
- **PostgreSQL**: Ensure PostgreSQL is installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DimejiAre/site-logistics-api.git
   cd yourproject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Update `.env.development` and `.env.local` with your PostgreSQL username and password.

4. Set up the project:
   ```bash
   npm run setup
   ```

## Usage

To start the project in development mode, run: npm run start:dev

## Running Tests

To run the full test suite, including unit and integration tests, use the following command: npm run test:all

## Documentation

The documentation and hosted version of the project can be found [here](https://site-logistics-api.onrender.com/api).
