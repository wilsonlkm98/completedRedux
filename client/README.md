# Table of Content

- [Table of Content](#table-of-content)
- [Folder Structures](#folder-structures)
  - [assets](#assets)
  - [components](#components)
  - [configs](#configs)
  - [pages](#pages)
  - [redux](#redux)
  - [services](#services)
  - [utils](#utils)
- [Tests](#tests)
- [Todo:](#todo)

# Folder Structures

## assets

To store all the static assets in this folder, example

1. images
2. logos
3. fonts

## components

To store all the small reusable components to be used in Pages  
Pre-built in components

1. [Auth Form](./src/components/forms/AuthForm.js)
   1. [Register Form](./src/components/forms/RegisterForm.js)
   2. Login Form
   3. Verification Form
2. [Error Popup Modal](./src/components/modals/ErrorPopup.js)

## configs

To store all your json/js config file

## pages

To store your app pages

## redux

To store all redux related codes like:

1. Redux Store
2. Redux Slices (action, reducers)
3. Async Thunk

## services

To store all your APi services

## utils

To store all helper functions and etc

# Tests

In every component folder will have a \_\_test\_\_ folder to hold all the test file for each of the components.

# Todo:

- [ ] Form submission click event test (loader, disabled ...)
