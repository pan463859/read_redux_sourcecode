// 啦啦啦啦 我初始化了
function createStore(reducer, defaultState) {
  let state = defaultState || {};
  function getState() {
    return this.state;
  }
  function dispatch(action) {
    state = reducer(state, action);
  }
  return { dispatch, getState };
}

//reduce.js
function reducer(state = {}, action) {
  switch (type) {
    case "add":
      return {
        ...state,
        num: state.num + 1,
      };
    case "changeOperation":
      return {
        ...state,
        operation: value,
      };
    default:
      return state;
  }
}

function dispatchErroReport(store) {
  let next1 = store.dispatch;
  store.dispatch = function _dispatchErroReport(action) {
    try {
      return next1(action);
    } catch (err) {
      console.error("我是捕获异常操作!", err);
    }
  };
}

function dispatchLog(store) {
  let next2 = store.dispatch;
  store.dispatch = function _dispatchLog(action) {
    console.log("你正在派发的 action 是", action.type);
    return next2(action);
  };
}

// function dispatchLog(store) {
//     let next1 =store.dispatch
//     store.dispatch = function _dispatchLog(action) {
//       console.log("你正在派发的 action 是", action.type);
//       return  function _dispatchErroReport(action) {
//         try {
//           return next1(action);
//         } catch (err) {
//           console.error("我是捕获异常操作!", err);
//         }
//       }(action);
//     };
//   }

let store = createStore(reducer, { num: 0 });
dispatchErroReport(store);
dispatchLog(store);
store.dispatch({
  type: "add",
  value: "",
});
