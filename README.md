# Berkeley Eco Engine compare demo

For issues with this repository, please file over at [http://github.com/stamen/ecoengine/issues](http://github.com/stamen/ecoengine/issues)

## Setup

```bash
gem install sass
npm install
cp .env.json.sample .env.json
```

## Deploy

```bash
gulp dist
scp -prq ./public/. studio.stamen.com:www/berkeley/show/compare/
scp -prq ./public/. studio.stamen.com:www/berkeley/show/compare-[year]-[month]-[day]/
```

Open [http://studio.stamen.com/berkeley/show/compare/](http://studio.stamen.com/berkeley/show/compare/)

This ...

## Develop

```bash
npm start
```

This ...

Open [http://localhost:8000/](http://localhost:8000/)

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
Follow these steps if integrating with Holos
1. Run `gulp dist:holos` the root directory
2. Copy the contents of the build directory to the holos filesystem and rename it static.
3. Create an HTML document at the same level as the static directory
4. In the `<head>` of this new document link to `../static/css/vendor.css` as well as `../static/css/base.css` in that order
5. At the end of the `<body>` of this new document link to `./build/js/stamen/ecoengine-compare.min.js`

Here is a [working example](http://studio.stamen.com/berkeley/show/holos/compare/)
