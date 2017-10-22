const defaultOpts = {
  continuous: true,
  capture: false
}

export default function instructions () {
  const orders = {}
  const replacers = []
  let currentOrder = null
  const api = { add, order, toObj, replacer }

  return api

  function replacer (fromStr, toStr) {
    replacers.push({
      reg: new RegExp(fromStr, 'g'),
      to: toStr
    })
    return api
  }

  function order (name = '') {
    if (typeof name === 'string' && name.length > 0) {
      currentOrder = name
      if (!orders[currentOrder]) orders[currentOrder] = []
    }
    return api
  }

  function add (exp = '', opts = {}) {
    if (currentOrder && typeof exp === 'string' && exp.length > 0) {
      orders[currentOrder].push({
        regex: new RegExp('(?:^| )(' + exp + ')(?: |$)', 'g'),
        opts: Object.assign({}, defaultOpts, opts)
      })
    }
    return api
  }

  function toObj () {
    let max = 0
    let maxs = {}
    for (let k in orders) {
      if (orders[k].length > max) max = orders[k].length
      maxs[k] = orders[k].length
    }
    return {
      orders,
      replacers,
      max,
      maxs
    }
  }
}
