# Berkeley Eco Engine compare demo

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

## Things to know about JS
   * All JS is linted as you save. Errors can stop JS from being built. Keep you eye on the terminal for errors
   * view specific code is in the ./viewJs file and all shared scripts are in the ./js folder.
   * All js is included in the footer.
