# Comunity-Check-App

## Project Description

The ComCheckApp project is being developed to simplify the process of public validation of translated materials in electronic format. Users can provide comments and suggestions for changes, which are then collected.

## Application Functionality

The ComCheckApp provides the following functionality:
- Collection and sorting of comments in accordance with the sections and structure of the material
- Autonomous operation for receiving suggestions and comments
- Use in third-party applications for bible translations, for example, in V-Cana

## API Functions

Tokenized access is planned for the following application API functions:
- Creation of projects, books, and checks
- Book checking and downloading notes for one's book in JSON format

## Tokenized Access

Users will be provided with the ability to generate a token in the application, which will allow them to access our application's API from third-party applications.


## Project Build

To build and run the project, follow these steps:
1. Install the required packages using `npm i` or `yarn`.
2. Create a copy of .env.example and rename the file to .env.local.
3. Install the Supabase CLI (https://supabase.com/docs/guides/cli/getting-started) and ensure that Docker (https://docs.docker.com/engine/install/) is installed.
4. Start Supabase by running `supabase start`. If you want to become an admin, manually change the is_admin field in the database for your user.
5. After these steps, launch the project in debug mode using `npm run dev` or `yarn dev`, and for deployment, use `npm run build` or `yarn build`.




