const parseAndUpdate = (doc, modification, options) => {
  Object.keys(modification).forEach((operator) => {
    switch (operator) {
      case "$inc":
        doc = inc(doc, modification[operator], options);
        break;
      case "$min":
        doc = min(doc, modification[operator], options);
        break;
      case "$max":
        doc = max(doc, modification[operator], options);
        break;
      case "$mul":
        doc = mul(doc, modification[operator], options);
        break;
      case "$set":
        doc = set(doc, modification[operator], options);
        break;
      case "$unset":
        doc = unset(doc, modification[operator], options);
        break;
      case "$rename":
        doc = rename(doc, modification[operator], options);
        break;
      case "$addToSet":
        doc = addToSet(doc, modification[operator], options);
        break;
      case "$pop":
        doc = pop(doc, modification[operator], options);
        break;
      case "$pullAll":
        doc = pullAll(doc, modification[operator], options);
        break;
      default:
        throw new Error(`${operator} update operator is not supported`);
    }
  });
};

// Fields

/**
 * $currentDate Sets the value of a field to current date,
 * either as a Date or a Timestamp.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const currentDate = (doc, modification, options) => {};

/**
 * $inc Increments the value of the field by the specified amount.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const inc = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && typeof doc[field] == "number") {
      doc[field] += modification[field];
    }
  }
  return doc;
};

/**
 * The $min updates the value of the field to a specified value if
 * the specified value is less than the current value of the field.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const min = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field]) {
      if (doc[field] >= modification[field]) {
        doc[field] = modification[field];
      }
    }
  }
  return doc;
};

/**
 * The $max operator updates the value of the field to a specified
 * value if the specified value is greater than the current value of the field.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const max = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field]) {
      if (doc[field] <= modification[field]) {
        doc[field] = modification[field];
      }
    }
  }
  return doc;
};

/**
 * $mul Multiplies the value of the field by the specified amount.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const mul = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && typeof doc[field] == "number") {
      doc[field] *= modification[field];
    } else if (!doc[field]) {
      doc[field] = 0;
    }
  }
  return doc;
};

/**
 * $rename Renames a field.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const rename = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field]) {
      const value = doc[field];
      doc = unset(doc, { field: "" });
      const newField = {};
      newField[modification.field] = value;
      doc = set(doc, newField);
    }
  }
  return doc;
};

/**
 * $set Sets the value of a field in a document.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const set = (doc, modification, options?) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    doc[field] = modification[field];
  }
  return doc;
};

/**
 * Sets the value of a field if an update results in an insert
 * of a document. Has no effect on update operations that modify existing documents.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const setOnInsert = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"

  return doc;
};

/**
 * Removes the specified field from a document.
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const unset = (doc, modification, options: any = {}) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    delete doc[field];
  }
  return doc;
};

// Arrays

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const addToSet = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && doc[field].constructor === Array) {
      if (!doc[field].includes(modification[field])) {
        doc[field].push(modification[field]);
      }
    } else if (!doc[field]) {
      doc[field] = [modification[field]];
    }
  }
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const pop = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && doc[field].constructor === Array) {
      if (doc[field].length > 0) {
        if (modification[field] === -1) {
          doc[field].shift();
        } else if (modification[field] === 1) {
          doc[field].pop();
        }
      }
    }
  }
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const pull = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && doc[field].constructor === Array) {
      //If the modification[field] is an Object
      if (
        Object.keys(modification[field]).length === 0 &&
        modification[field].constructor === Object
      ) {
        //TODO: remove the items that satisfy the condition
        //eg. condition => { $in: [ "apples", "oranges" ] }
      } else {
        doc = doc[field].filter((item) => {
          return item !== modification[field];
        });
      }
    }
  }
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const push = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && doc[field].constructor === Array) {
      //TODO: Support the following modifiers
      //https://docs.mongodb.com/manual/reference/operator/update/push/#modifiers
      doc[field].push(modification[field]);
    } else if (!doc[field]) {
      doc[field] = [modification[field]];
    }
  }
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const pullAll = (doc, modification, options) => {
  //TODO: Support updates via JSON typed field. Eg, "user.age"
  for (const field in modification) {
    if (doc[field] && doc[field].constructor === Array) {
      modification[field].forEach((element) => {
        doc = doc[field].filter((item) => {
          if (item.constructor === Array) {
            return !arraysEqual(item, element);
          }
          return item !== element;
        });
      });
    }
  }
  return doc;
};

// Modifiers

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const each = (doc, modification, options) => {
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const position = (doc, modification, options) => {
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const slice = (doc, modification, options) => {
  return doc;
};

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const sort = (doc, modification, options) => {
  return doc;
};

// Bitwise

/**
 *
 * @param {JSON Object} doc
 * @param {JSON Object} modification
 */

const bit = (doc, modification, options) => {
  return doc;
};

// Utility Functions

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export { parseAndUpdate };
