import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
// 一些redux的保留action，同时给出提醒：对于任何未知的actiion，都需要有一个返回当前state作为保底。
// 如果当前的state是undefined，则必须返回初始化的state
export const ActionTypes = {
  INIT: '@@redux/INIT'
}

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 * 
 * 创建一个 store 去保存 state 状态树，改变 store 中 state 的唯一方法就是调用 store 中的 dispatch()
 * 
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * 一个 app 中应该只有一个 store，为了区分不同模块的状态如何对 acitons 的响应，你可能需要使用 combineReducers 来
 * 合并不同的 reducers
 * 到一个reducer方法中。
 * 
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 * 传入当前的 state 和 action 返回新的 state
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 * 初始化 state，可选。可以是从服务器中拿到的数据来初始化或者保存之前的用户 session。
 * 如果你使用 combineReducers 来生成根reducer，初始化 state 的数据结构需要和 combineReducers 里面的 
 * key 要保持一致。
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 * store 增强函数。你可能需要如 moddleware，time-travel，数据持久化等第三方插件，来增强你 store 的能力。Redux 本身
 * 官方给的唯一的增强器就是 applyMiddleware()
 * 
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 *  
 * redux store 让你读取 state， dispatch actions 并且监听变化。
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // 如果没有传递 preloadedState的时候，同时也没有enhencer的情况
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  //enhancer存在的情况
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    //使用 调用 enhancer 传入 createStore 再调用 (reducer, preloadedState)
    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // 初始化所有变量
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false
  //浅拷贝所有listener 防止更新过程中listener更新
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   * 返回当前 store 的 state，房子外界直接读取并修改，使用方法返回
   */
  function getState() {
    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   * 
   * 添加一个变化的listener，当 action 被 dispatched 的时候 listener 会被调用。部分 state 可能会被改变。
   * 你可以使用 getState() 方法在 listener 内部获取到 state。
   * 
   * 
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   * 
   * 你可能在 listener 变化的时候调用 dispatch,有以下两点需要注意：
   * 
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   * 
   * 1.dispatch 调用之前，所有的订阅，也就是 listenerlist 会被拷贝一份。当你在 listeners 在遍历执行过程中加入listener 或取消 listener 
   * 都不会影响正在执行的 dipatch，当时你下一个diapatch，无论封装与否，都会拿最新的 listeners 去执行。
   * 
   * 
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   * 
   * 2.listener 别指望知道所有的 state 变化，毕竟在一个封装的 disapatch 中，在listener 调用之前， 
   * state 可能会更新很多次。能保证的是。所有在 dispatch 调用之前注册的 listener 会在执行的时候拿到最新
   * 的 state。
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    .push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   * 
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   * 
   * dispatches 一个 action 是唯一改变 state 的方法。reducer ，创建 store 时候的第一个参数，会使用当前的
   * state 和 dispatch 传过来的 action，然后返回一个新的 state 更新 state 树，同时 listeners 也会被通知。
   * 
   * 
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   * 
   * 基础的 dispatch 只支持普通对象。如果你想要 dispatch 一个 promise 一个 observalbable 一个 thunk
   * 或者其他东西，你需要使用相应的 middleware 去包裹你的创建 store 的函数。举个例子，去看看 redux-thunk
   * 的文档，最后也是 dispatch 一个普通对象。
   * 
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   * 一个普通对象描述 ‘什么变化了’。表示“发生了什么变化”的普通对象。 保持 action 可序列化，就可以记录和重放用户会话，或者使用“redux-devtools”工具。一个 action 必须要有一个不为 undefined 的 type.推荐把 action 定义成常量字符串。
   * @returns {Object} For convenience, the same action object you dispatched.
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   * 
   * 返回一个和你传进来一样的 action，值得注意的是，如果你使用了一个自定义 middleware，返回值可能会包一层 dispatch（） 返回一些别的值（比如，一个promise）
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    //执行 reducer 得到最新的 state
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // 拿到最新的 listener，遍历执行
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    //返回 action
    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   * 替换一个新的 reducer 来处理 store。
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  // 执行一次初始化 dispatch ，让每个 reducer 返回他们的初始 state，高效填充初始状态树，isdispatching 的值也会在这个时候变成 true。
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
