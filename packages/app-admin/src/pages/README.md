# Pages folder

This folder contains all components that represent a single page. Pages components should have a `index.js` file inside a folder with the page's name. Example:
```
-src
  -pages
    -home
      -index.js
    -login
      -index.js
    -create-user
      -index.js
```

Every page's `index.js` file should only define a single React component. If any other components are needed, and they will only be ever used on that specific page, then a separate folder with the component's name should be created inside the page's folder. The component's folder should have an `index.js` file that exports the component.