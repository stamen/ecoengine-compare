# Berkeley Eco Engine Compare

Find the live version of Compare [here](https://holos.berkeley.edu/compare/).

## Setup

```bash
gem install sass
npm install
cp .env.json.sample .env.json
```

## Develop

```bash
npm start
```

Open [http://localhost:8000/](http://localhost:8000/)

## URL Shortening
For the URL shortener to work, you will need to get a key for the [Google URL Shortener API](https://developers.google.com/url-shortener/v1/getting_started). The key must be in the .env.json file in the repo root as `google-key`

## Adding vendor JS libraries
```bash
bower install [bower package name]
```
_All bower components are bundled into the minified JS for the site. Any required css is wrapped into vendor.css and included in the header_

## Things to know about javascript in this project
   * All JS is linted as you save. Errors can stop JS from being built. Keep you eye on the terminal for errors
   * view specific code is in the ./viewJs file and all shared scripts are in the ./js folder.
   * All js is included in the footer.

## Holos integration
A django/jinja2 compatible template has been added to the root of the build directory. This can be used as a jinja2 include to bring in the markup needed to run this application without the header and footer. The following files need to be linked in the main document:

   * css/vendor.css (in the document head)
   * css/base.css (in the document head)
   * js/ecoengine-compare.min.js (at the bottom of the document body)
