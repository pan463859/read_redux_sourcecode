function dispatchErroReport(store) {
  let next1 = store.dispatch;
  return function _dispatchErroReport(action) {
    try {
      return next1(action);
    } catch (err) {
      console.error("我是捕获异常操作!", err);
    }
  };
}

function dispatchLog(store) {
  let next2 = store.dispatch;
  return function _dispatchLog(action) {
    console.log("你正在派发的 action 是", action.type);
    return next2(action);
  };
}

function dispatchLog(store) {
  let next2 = dispatchErroReport(store);
  return function _dispatchLog(action) {
    console.log("你正在派发的 action 是", action.type);
    return next2(action);
  };
}

const dispatchLog = () => {
  let next2 = (store) => {
    let next1 = store.dispatch;
    return (action) => {
      try {
        return next1(action);
      } catch (err) {
        console.error("我是捕获异常操作!", err);
      }
    };
  };
  return (action) => {
    console.log("你正在派发的 action 是", action.type);
    return next2(action);
  };
};


const dispatchLog = (store) => (next2) => (action) => {
    console.log("你正在派发的 action 是", action.type);
    return next2(action);
  };
  
  dispatchLog(store)(dispatchErroReport(store))
  
  
  const middlewares = [dispatchErroReport,dispatchLog]
  const chain = middlewares.map(item=>item(store))
  
//   let compose = function (...funcs) {
//     if (funcs.length === 0) {
//       return (arg) => arg;
//     }
  
//     if (funcs.length === 1) {
//       return funcs[0];
//     }
  
//     return funcs.reduce(
//       (a, b) =>
//         (...args) =>
//           a(b(...args))
//     );
//   };
  compose(...chain)()