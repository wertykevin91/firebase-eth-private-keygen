# firebase-eth-private-keygen

## Required

You will need to have firebase tools.

[firebase-tools](https://www.npmjs.com/package/firebase-tools)

`npm install --global firebase-tools`

## Run locally

Install dependencies
```
cd functions
npm install
```
Then serve locally from the root folder
`firebase serve`

>Note that you will need to change "npm --prefix \"%RESOURCE_DIR%\" run lint" to "npm --prefix \"$RESOURCE_DIR\" run lint" if you're not working on windows.

