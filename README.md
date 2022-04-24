# observable-sorrow

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### Runs unit tests

```
yarn test
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Game dev tools

To enable the developer tools for `observable-sorrow`, open the browser console and run:

```
__OS_DEVTOOLS__.on = true
```

Once this flag is set, a button will appear in the bottom-end corner of the page, which will allow you to open the developer tools panel.

The panel can also be opened by pressing `` ` `` while focus is in the page.

## Roadmap

- Architecture

  - Generic event queue system (WIP)
  - A real ECS implementation as much as JavaScript will allow it...
  - `SystemSet` capability for better system organization.
  - Rework all systems to receive only the parts of EntityAdmin they need.
  - Rework all systems to not need reactivity - will probably speed up simulation _a lot_.

- Gameplay

  - `Send hunters`
