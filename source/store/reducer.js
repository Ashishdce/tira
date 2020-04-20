import {
  initialState
} from './initialState.js';

const getNewDashbaordObject = (id) => ({
  name: `Dashboard ${id}`,
  id,
  created: new Date().getTime(),
  updated: undefined,
  updates: [],
  listIds: [],
  lastIdCreated: -1,
  lists: {}
});

const getNewListObject = (id, data) => ({
  name: data.name || `List ${id}`,
  id,
  taskIds: [],
  lastIdCreated: -1,
  tasks: {}
});

const getNewTaskObject = (id, data) => ({
  id,
  edit: true,
  description: data.description || '',
  lastUpdated: new Date().getTime()
});


export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SELECTED_DASHBOARD':
      return {
        ...state,
        selected: Number(action.id)
      };
    case 'SAVE_DASHBOARD_DETAILS':
      return {
        ...state,
        dashboards: {
          ...state.dashboards,
          [state.selected]: {
            ...state.dashboards[state.selected],
            ...action.data
          }
        }
      };
    case 'DELETE_DASHBOARD': {
      const dashboards = state.dashboards;
      delete dashboards[state.selected];

      const indexOfId = state.dashboardIds.indexOf(state.selected);

      if (state.dashboardIds.length === 1) {
        return {
          ...state,
          selected: -1,
          dashboardIds: [],
          lastIdCreated: -1,
          dashboards: {}
        };
      }
      const dashboardIds = state.dashboardIds;
      dashboardIds.splice(indexOfId, 1);
      return {
        ...state,
        selected: state.dashboardIds[0],
        dashboardIds,
        dashboards
      };
    }
    case 'CREATE_DASHBOARD':
      const newDashBoardId = ++state.lastIdCreated;
      return {
        ...state,
        selected: newDashBoardId,
        lastIdCreated: newDashBoardId,
        dashboardIds: [...state.dashboardIds, newDashBoardId],
        dashboards: {
          ...state.dashboards,
          [newDashBoardId]: {
            ...getNewDashbaordObject(newDashBoardId)
          }
        }
      };
    case 'CREATE_LIST': {
      const dashboards = {
        ...state.dashboards
      };
      const dashboard = dashboards[state.selected];

      const newListId = ++dashboard.lastIdCreated;
      dashboard.lastIdCreated = newListId;

      dashboard.listIds.push(newListId);
      dashboard.lists = {
        ...dashboard.lists,
        [newListId]: {
          ...getNewListObject(newListId, action.data)
        }
      }

      return {
        ...state,
        dashboards: {
          ...dashboards
        }
      };
    }
    case 'DELETE_LIST': {
      const dashboards = state.dashboards;
      const dashboard = state.dashboards[state.selected];


      const indexOfId = dashboard.listIds.indexOf(action.data.id);

      dashboard.updated = new Date().getTime();

      if (dashboard.listIds.length === 1) {
        dashboard.listIds = [];
        dashboard.lastIdCreated = -1;
        dashboard.lists = {};
      } else {
        delete dashboard.lists[action.data.id];
        dashboard.listIds.splice(indexOfId, 1);
      }

      return {
        ...state,
        dashboards
      };
    }

    case 'DELETE_TASK': {
      const dashboards = state.dashboards;
      const list = state.dashboards[state.selected].lists[action.data.listId];


      const indexOfId = list.taskIds.indexOf(action.data.id);

      dashboards[state.selected].updated = new Date().getTime();

      if (list.taskIds.length === 1) {
        list.taskIds = [];
        list.lastIdCreated = -1;
        list.tasks = {};
      } else {
        delete list.tasks[action.data.id];
        list.taskIds.splice(indexOfId, 1);
      }

      return {
        ...state,
        dashboards
      };
    }

    case 'SAVE_LIST_DETAILS': {
      const dashboards = {
        ...state.dashboards
      };
      const dashboard = dashboards[state.selected];

      dashboard.lists = {
        ...dashboard.lists,
        [action.data.id]: {
          ...dashboard.lists[[action.data.id]],
          ...action.data
        }
      }

      return {
        ...state,
        dashboards: {
          ...dashboards
        }
      };
    }

    case 'CREATE_TASK': {
      const dashboards = {
        ...state.dashboards
      };
      const dashboard = dashboards[state.selected];

      const list = dashboard.lists[action.data.id];

      const newTaskId = ++list.lastIdCreated;
      list.lastIdCreated = newTaskId;

      list.taskIds.push(newTaskId);
      list.tasks = {
        ...list.tasks,
        [newTaskId]: {
          ...getNewTaskObject(newTaskId, action.data)
        }
      }

      return {
        ...state,
        dashboards: {
          ...dashboards
        }
      };
    }

    case 'SAVE_TASK_DETAILS': {
      const dashboards = {
        ...state.dashboards
      };
      const dashboard = dashboards[state.selected];

      const list = dashboard.lists[action.data.listId];

      list.tasks[action.data.id] = {
        ...list.tasks[action.data.id],
        ...action.data
      }

      return {
        ...state,
        dashboards: {
          ...dashboards
        }
      };
    }

    case 'DRAG_DROP_CHANGE': {
      const {
        targetCardId,
        targetListId,
        listId,
        cardId,
        sameList
      } = action.data;

      const selectedDasboard = state.dashboards[state.selected];

      if (sameList) {
        // same list swap

        let taskIds = selectedDasboard.lists[listId].taskIds;

        const indexOfSource = taskIds.indexOf(cardId);
        if (targetCardId !== undefined && targetCardId !== null) {
          const indexOfTarget = taskIds.indexOf(targetCardId);
          if (indexOfTarget === 0) {
            taskIds.splice(indexOfSource, 1);
            taskIds.unshift(cardId);
          } else {
            taskIds.splice(taskIds.indexOf(cardId), 1);
            const indexOfTarget = taskIds.indexOf(targetCardId);
            const partOne = taskIds.slice(0, indexOfTarget);
            const partTwo = taskIds.slice(indexOfTarget);
            taskIds = [...partOne, cardId, ...partTwo];
          }

        } else {
          // append to the end of the taskIds
          taskIds.splice(indexOfSource, 1);
          taskIds.push(cardId);

        }

        selectedDasboard.lists[listId].taskIds = taskIds;
        return {
          ...state
        }

      } else {
        // inter list swap
        let sourceList = selectedDasboard.lists[listId];
        let targetList = selectedDasboard.lists[targetListId];

        // get taskDetails from the source list and remove it from there
        const sourceIndex = sourceList.taskIds.indexOf(cardId);
        sourceList.taskIds.splice(sourceIndex, 1);

        const sourceTask = {
          ...sourceList.tasks[cardId]
        }

        delete sourceList.tasks[cardId];


        // Add a new task to the targetList
        const newTaskId = ++targetList.lastIdCreated;
        targetList.lastIdCreated = newTaskId;
        sourceTask.id = newTaskId;

        targetList.tasks = {
          ...targetList.tasks,
          [newTaskId]: {
            ...sourceTask
          }
        }

        if (targetCardId !== undefined && targetCardId !== null) {
          const indexOfTarget = targetList.taskIds.indexOf(targetCardId);
          if (indexOfTarget === 0) {
            targetList.taskIds.unshift(newTaskId);
          } else {
            const indexOfTarget = targetList.taskIds.indexOf(targetCardId);
            const partOne = targetList.taskIds.slice(0, indexOfTarget);
            const partTwo = targetList.taskIds.slice(indexOfTarget);
            targetList.taskIds = [...partOne, newTaskId, ...partTwo];
          }
        } else {
          targetList.taskIds.push(newTaskId);
        }
      }
    }
    default:
      return state
  }
};