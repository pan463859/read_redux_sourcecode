/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 * 创建一个 store enhancer 去链接 middleware 到 store 中的 dispatch 方法。这个对于各种任务来说都很方便。比如
 * 简洁的异步操作，或者记录每个 action 的 payload。（log）
 * See `redux-thunk` package as an example of the Redux middleware.
 * 看看 rendux-thunk 如何实现去理解一个 redux middleware。
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 * 因为中间件是异步的，所以需要是组合链中的第一个 store enhancer。
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 * 每个 middleware 都会以 dispatch 和 getState 作为具名参数。
 * 
 * @param {...Function} middlewares The middleware chain to be applied.
 *  需要被链接到 dispatch 上的 middlewares。
 * @returns {Function} A store enhancer applying the middleware.
 *  一个包含各种 middleware 的 store enhancer。
 */
export default function applyMiddleware(...middlewares) {
  //返回一个 store enhancer 来作为创建 store 的增强版
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []
    //拼接 getState和dispatch 传如每个 middleware 中
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    //得到参数并执行了
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    //使用 compose 传入原始的 dispatch，得到增强后的 dispatchs
    let compose = function (...funcs) {
      if (funcs.length === 0) {
        return arg => arg
      }

      if (funcs.length === 1) {
        return funcs[0]
      }

      return funcs.reduce((a, b) => (...args) => a(b(...args)))
    }
    /** For example, compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
     */
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}



//redux-thunk
var redux_thunk = function (store) {
  var dispatch = store.dispatch, getState = store.getState;
  /*
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    //得到参数并执行了 得到 function(next){}
    chain = middlewares.map(middleware => middleware(middlewareAPI))

    // dispatch = compose(...chain)(store.dispatch)
    // next 就是上一个middleware 或者初始的 store.dispatch 传下来的 dispatch 
   */
  return function (next) {
    return function (action) {
      // The thunk middleware looks for any functions that were passed to `store.dispatch`.
      // thunk middleware 过滤每一个传给 store.dispatch 的函数
      // If this "action" is really a function, call it and return the result.
      // 如果 action 是函数，调用它并返回结果
      if (typeof action === 'function') {
        // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
        // 把 store 的 dispatch,getState 还有传入的 extraArgument 都传给 action
        return action(dispatch, getState, extraArgument);
      }
      // Otherwise, pass the action down the middleware chain as usual
      // 如果 action 不是函数，直接把 action 沿着 moddleware 链传下去
      return next(action);
    };
  };
};
