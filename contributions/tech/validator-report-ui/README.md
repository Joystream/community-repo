# Joystream Validator Loggin Tool UI

To get a validator report you can choose your validator stash account from autocomplete
or copy-paste your own stash if your validator is not active atm.

Then you can use either a date filter or blocks filter tab to filter your data per period.
In every tab, there are buttons to prefill filter with the last two weeks (or the block equivalent).
When data is loaded app generates a string that can be copied directly to the submission report for the validator.
(For now, it assumes that the validator was active all the period.)
Then you can use the button to copy the report string to the clipboard and then use it in your submission.
In the table below the valdiator report you can see the list of eras with some metadata and the number of blocks produced by your validator.

## Demo

Live version is accessible at [gh-pages](https://oleksanderkorn.github.io/joystream-live/)

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy`

Builds the app for production to the `build` folder and deploys to github-pages using `gh-pages` library.
