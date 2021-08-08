let duccck = function () {
  function chunk(array, size) {
    var result = []
    var count = 0
    var arr = []
    for (var i = 0; i < array.length; i++) {
      arr.push(array[i])
      count++
      if (count === size) {
        result.push(arr)
        arr = []
        count = 0
      }
    }
    if (count != 0) {
      result.push(arr)
    }
    return result
  }

  function concat(array) {
    var temp = []
    for (var i = 0; i < this.length; i++) {
      temp[i] = this[i];
    }
    for (var i = 0; i < array.length; i++) {
      temp.push(array[i])
    }
    return temp
  }

  function reverse(array) {
    var i = array.length - 1
    var j = 0
    while (j < i) {
      var temp = array[i]
      array[i] = array[j]
      array[j] = temp
      j++
      i--
    }
    return array
  }

  function uniq(array) {
    for (var i = 0; i < array.length; i++) {
      for (var j = i + 1; j < array.length; j++) {
        if (array[i] == array[j]) {
          var del = j
          array.splice(del, 1)
        }
      }
    }
    return array
  }

  function sum(array) {
    var sum = 0
    for (var i = 0; i < array.length; i++) {
      sum += array[i]
    }
    return sum
  }

  function fill(array, val, start, end) {
    var result = []
    for (var i = 0; i < array.length; i++) {
      result.push(array.fill[i], val)
    }
    return result
  }

  function zip([arrays]) {
      var result = []
      var arr = []
    for (var i = 0; i < array.length; i++) {
      arr.push(arrays.zip[i])
    }
  }

  function compact(array) {
    var final = []
    for (num in array) {
      if (array[num])
          final.push(array[num])
    }
    return final
  }
  
  function sumBy(ary, predicate) {
    predicate = iteratee(predicate)

    var sum = 0
    for (var i = 0; i < ary.length; i++) {
      sum += predicate(ary[i])
    }
    return sum
  }

  function flatten(array) {
    return[].concat(...array)
  }

  function flattenDeep(array) {
    var res = []
    for (var i = 0; i < array.length; i++) {
      if (Array.isArray(array[i])) {
        res.push(...flattenDeep(array[i]))
      } else {
        res.push(array[i])
      }
    }
    return res
  }

  function flattenDepth(ary, depth = 1) {
    if (Depth == 0) {
      return ary;
    }
    var result = []
    for (var i = 0; i < depth; i++) {
      var item = ary[i]
      if (Array.isArray(item)) {
        item = flattenDepth(item, Depth - 1)
        for (j = 0; j < item.length; j++) {
          result.push(item[j])
        }
      } else {
        result.push(item)
      }
    }
    return result
  }

  function difference(array,...value) {
    var result = []
    var val = []
    for (var i = 0; i < value.length; i++) {
      val = val.concat(value[i])
    }
    for (var i = 0; i < array.length; i++) {
      if (val.indexOf(array[i]) < 0) {
        result.push(array[i])
      }
    }
    return result
  }

  function head(array) {
    return array[0]
  }

  return {
    chunk: chunk,
    concat: concat,
    reverse: reverse,
    uniq: uniq,
    sum: sum,
    fill: fill,
    zip: zip,
    compact: compact,
    sumBy: sumBy,
    flatten: flatten,
    flattenDeep: flattenDeep,
    flattenDepth: flattenDepth,
    difference: difference,
    head: head,
  }
};