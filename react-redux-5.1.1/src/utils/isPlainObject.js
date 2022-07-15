/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false
 //检查是不是使用 Object.create(null) 创建的对象
  let proto = Object.getPrototypeOf(obj)
  if (proto === null) return true
  //检查是不是使用 new Object() 或者对象字面量创建的对象
  //为什么不直接使用 Object.getPrototypeOf(baseProto)===Object.property?=>据说是为了防止跨 iframe 两个Object原型有不等
  let baseProto = proto
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto)
  }

  return proto === baseProto
}
