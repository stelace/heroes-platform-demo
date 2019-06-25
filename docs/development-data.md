# Data in development

## Setup

`cp scripts/data.example.js scripts/data.js`

## Initializing data

We provide the `init-data.js` script to ease development with sample data provided in `data.js`.

Currently, the script supports the following object types:

- assets
- assetTypes
- customAttributes
- categories
- config
- messages
- ratings
- transactions
- users
- workflows

To create an object, you need:

- an identifier that can be used to be referenced in other objects (e.g. the property 'ownerId' for asset)
- the payload that will be used to create the object

To reference the ID of another object, provide a string with the format: '[objectType]::[identifier]' (e.g 'users::employer1' to reference the user created with the key 'employer1').

Note: Transactions cannot be removed via API. Instead transactions are cancelled.

## Stelace Heroes Platform Demo

All Heroes included in `heroes.csv` file are also imported as Assets.
