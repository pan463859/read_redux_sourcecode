"use strict";
exports.__esModule = true;
/** A function that accepts a potential "extra argument" value to be injected later,
 * and returns an instance of the thunk middleware that uses that value
 */
/**
 * 接收一个可能的额外的参数，返回一个使用该额外参数的 thunk middleware 实例
 */
function createThunkMiddleware(extraArgument) {
    // Standard Redux middleware definition pattern:
    // 标准的 Redux middleware 的定义模式
    // See: https://redux.js.org/tutorials/fundam/*  */entals/part-4-store#writing-custom-middleware
    var middleware = function (_a) {
        var dispatch = _a.dispatch, getState = _a.getState;
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
    return middleware;
}
var thunk = createThunkMiddleware();
// Attach the factory function so users can create a customized version
// with whatever "extra arg" they want to inject into their thunks
// 工厂函数可以让用户使用额外参数构建自定义版本的 thunks
thunk.withExtraArgument = createThunkMiddleware;
exports["default"] = thunk;
