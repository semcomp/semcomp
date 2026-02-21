# Reduxs Folder

Here are all things related to redux. It should only have a `store.js` file, a `actions` folder and a `reducers` folder.

- **store.js**: Contains things related to creating the Redux Store.
- **actions**: Holds all Action Creators. These should be imported by the components that will use an action. In this architecture, the actions are smart (not dumb), and therefore, can make things like call APIs or validate their data.
- **reducers**: Holds all Reducers.