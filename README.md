# Berkeley Eco Engine compare demo

## Setup

```bash
npm install
```

## Deploy

```bash
npm run dist
scp -prq ./public/. studio.stamen.com:www/berkeley/show/compare/
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
