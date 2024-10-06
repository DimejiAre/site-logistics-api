# Project Name

Site Logistics API

Live Link: https://site-logistics-api.onrender.com/api

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Project Installation](#project-installation)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Api Endpoints](#api-endpoints)
- [Documentation](#documentation)

## About

This is the backend API for managing logistics operations related to sites, trucks, and tickets. The project uses Node.js, PostgreSQL, and follows modern backend development practices with NestJS.

## Getting Started

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites

- **Node.js**: It is highly recommended to use Node v22. You can find installation instructions [here](https://nodejs.org/en/download/package-manager)
- **PostgreSQL**: Ensure PostgreSQL is installed and running on your machine. Installation details are available [here](https://www.postgresql.org/download/)

### Project Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DimejiAre/site-logistics-api.git
   ```

2. Navigate into the project folder
   ``` bash
   cd site-logistics-api
   ```

3. Configure environment variables:
   - Update `.env.development` and `.env.local` with your PostgreSQL username and password.

4. Set up the project:
   ```bash
   npm run setup
   ```
   This command will:
   - Install dependencies
   - Create development and test databases
   - Run migrations
   - Import the sites and trucks JSON files

## Usage

To start the project in development mode, run: 
   ```bash
   npm run start:dev
   ```
The default port is: 3000

## Running Tests

To run the full test suite, including unit and integration tests, use the following command:
   ```bash
   npm run test:all
   ```

## API Endpoints

Below are the main API endpoints available in the Site Logistics API.

### Trucks

- **POST /trucks/:id/tickets/bulk_create**  
  Bulk creates tickets for a specific truck, identified by the truck's ID (`:id`).

  **Request Body:**
  ```json
  [
    {
      "dispatchTime": "string (ISO 8601 format)",  // Required
      "material": "string"                         // Optional
    }
  ]
  ```

### Tickets

- **GET /tickets**  
  Fetches tickets with optional filters like siteIds, startDate, endDate, page, and limit.

## Documentation

The full documentation and hosted version of the project can be found [here](https://site-logistics-api.onrender.com/api).

Please note that it may take up to a minute for the application to cold start.”
