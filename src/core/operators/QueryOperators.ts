import * as arrSort from "array-sort";

const parseAndFind = (
  query: Object = {},
  options: any,
  documents: any,
  findOne: boolean = false
) => {
  const docs = Object.values(documents);
  let filteredDocs = [];
  let skipped = 0;
  const doSort = !!options.sort;
  const sortFirst = !!(Object.keys(options)[0] === "sort");
  const emptyQuery = Object.keys(query).length === 0;
  options.skip = options.skip || 0;
  const condition = (len) => (options.limit ? options.limit === len : false);
  if (!findOne) {
    if (emptyQuery) {
      filteredDocs = docs;
      if (doSort && sortFirst) {
        Object.keys(options.sort).map((field, index) => {
          filteredDocs = arrSort(filteredDocs, field, {
            reverse: options.sort[field] === 1 ? false : true,
          });
        });
      }
      if (options.limit) {
        filteredDocs = filteredDocs.splice(options.skip, options.limit);
      } else {
        filteredDocs = filteredDocs.splice(options.skip);
      }
      if (doSort && !sortFirst) {
        Object.keys(options.sort).map((field, index) => {
          filteredDocs = arrSort(filteredDocs, field, {
            reverse: options.sort[field] === 1 ? false : true,
          });
        });
      }
      return filteredDocs;
    } else {
      if (doSort && sortFirst) {
        for (let i = 0; i < docs.length; i++) {
          if (evaluateQuery(docs[i], query)) {
            filteredDocs.push(docs[i]);
          }
        }
        Object.keys(options.sort).map((field, index) => {
          filteredDocs = arrSort(index === 0 ? docs : filteredDocs, field, {
            reverse: options.sort[field] === 1 ? false : true,
          });
        });
        if (options.limit) {
          filteredDocs = filteredDocs.splice(options.skip, options.limit);
        } else {
          filteredDocs = filteredDocs.splice(options.skip);
        }
        return filteredDocs;
      } else {
        for (let i = 0; i < docs.length; i++) {
          if (evaluateQuery(docs[i], query)) {
            if (skipped >= options.skip) {
              filteredDocs.push(docs[i]);
            }
            if (condition(filteredDocs.length)) {
              if (options.sort) {
                Object.keys(options.sort).map((field, index) => {
                  filteredDocs = arrSort(
                    index === 0 ? docs : filteredDocs,
                    field,
                    {
                      reverse: options.sort[field] === 1 ? false : true,
                    }
                  );
                });
              }
              return filteredDocs;
            }
            ++skipped;
          }
        }
        if (doSort && !sortFirst) {
          Object.keys(options.sort).map((field, index) => {
            filteredDocs = arrSort(index === 0 ? docs : filteredDocs, field, {
              reverse: options.sort[field] === 1 ? false : true,
            });
          });
        }
        return filteredDocs;
      }
    }
  } else {
    if (emptyQuery) {
      return docs[0];
    }
    for (let i = 0; i < docs.length; i++) {
      if (evaluateQuery(docs[i], query)) {
        return docs[i];
      }
    }
    return null;
  }
};

// Possible optimization
// https://docs.mongodb.com/manual/reference/operator/query/or/#or-clauses-and-indexes

/* 
Possible queries 

    with operators
    
    {
        $and: 
        [ 
            { qty: { $lt: 20, $gt: 10 } }, 
            { age: { $lt: 20, $gt: 10 } },
            { bal: { $lt: 20, $gt: 10 } },
        ] 
    }


    without operators

    {
        age: 10, bal: 50
    }

    {
        pets: ["cat", "dog"], names: ["fluffy", "tommy"]
    }

    {
        name: {"fname": "elon", "lname": "musk"},
        companies: {"space": "spacex", "car": "tesla"}
    }


    mix

    {
        $and: 
        [ 
            { qty: { $lt: 20, $gt: 10 } }, 
            { age: 10 },
            { name: {"fname": "elon", "lname": "musk"}  },
        ] 
    }
*/

/**
 * Evaluates if a document satisfies a condition or not.
 *
 * @param {JSON Object} doc
 * @param {JSON Object} query
 * @returns {boolean}
 */

const evaluateQuery = (doc, query) => {
  let res;
  let killSwitch = true; // kills the main loop if set to false
  const fields = Object.keys(query);
  for (let j = 0; j < fields.length && killSwitch; j++) {
    // check for comparison operators by "$"
    if (fields[j][0] === "$") {
      switch (fields[j]) {
        case "$and":
          /**
                     * $and: 
                        [ 
                            { qty: { $lt: 20, $gt: 10 } }, 
                            { age: 10 },
                            { bal: { $lt: 20, $gt: 10 } },
                        ]
                     */
          res = true;
          for (let i = 0; i < query[fields[j]].length; i++) {
            if (!evaluateCondition(query[fields[j]][i], doc)) {
              res = false;
              break;
            }
          }
          break;
        case "$or":
          /**
                     * $or: 
                        [ 
                            { qty: { $lt: 20, $gt: 10 } }, 
                            { age: 10 },
                            { bal: { $lt: 20, $gt: 10 } },
                        ]
                     */
          res = false;
          for (let i = 0; i < query[fields[j]].length; i++) {
            if (evaluateCondition(query[fields[j]][i], doc)) {
              res = true;
              break;
            }
          }
          break;
        default:
          throw new Error(`${fields[j]} comparison operator is not supported`);
      }
    }

    // if not, then treat it as a doc field or single line operator query
    // { fname: "vasa", lname: "develop" }
    // { qty: { $lt: 20, $gt: 10 }, age: { $lt: 20, $gt: 10 } }

    // TODO: Support updates via JSON typed field. Eg, "user.age"
    else {
      res = true;
      for (let i = 0; i < fields.length; i++) {
        const check = {};
        check[fields[i]] = query[fields[i]];
        if (!evaluateCondition(check, doc)) {
          res = false;
          killSwitch = false;
          break;
        }
      }
    }
  }
  return res;
};

/**
 * Evaluates if a condition is satisfied by a specific field value.
 *
 * @param {JSON Object} condition
 * @param {JSON Object} doc
 * @returns {boolean}
 */

const evaluateCondition = (condition, doc) => {
  let res = true;
  Object.keys(condition).forEach((field) => {
    //Check if condition[field] is a JSON object with keys having "$" character
    if (
      condition[field].constructor === Object &&
      Object.keys(condition[field]).length > 0
    ) {
      const logicConditions = Object.keys(condition[field]);
      if (logicConditions[0][0] === "$") {
        //{ qty: { $lt: 20, $gt: 10 } }
        for (let i = 0; i < logicConditions.length && res; i++) {
          switch (logicConditions[i]) {
            case "$lt":
              if (!lt(doc[field], condition[field][logicConditions[i]])) {
                res = false;
              }
              break;
            case "$gt":
              if (!gt(doc[field], condition[field][logicConditions[i]])) {
                res = false;
              }
              break;
            case "$lte":
              if (!lte(doc[field], condition[field][logicConditions[i]])) {
                res = false;
              }
              break;
            case "$gte":
              if (!gte(doc[field], condition[field][logicConditions[i]])) {
                res = false;
              }
              break;
            default:
              throw new Error(
                `${logicConditions[i]} logical operator is not supported`
              );
          }
        }
      } else {
        //{qty: {"fname": "vasa", "lname": "develop"}}
        if (!jsonEqual(doc[field], condition[field])) {
          res = false;
        }
      }
    } else {
      //{qty: [1,2]}
      if (condition[field].constructor === Array) {
        if (!arraysEqual(doc[field], condition[field])) {
          res = false;
        }
      }
      //{qty: {}}
      else if (condition[field].constructor === Object) {
        if (!jsonEqual(doc[field], condition[field])) {
          res = false;
        }
      }
      //{ qty: 30 }
      //{qty: null}
      else {
        if (!(doc[field] === condition[field])) {
          res = false;
        }
      }
    }
  });
  return res;
};

// Comparison

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const eq = (argValue, comparisonValue) => {
  return argValue === comparisonValue;
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const gt = (argValue, comparisonValue) => {
  return argValue > comparisonValue;
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const gte = (argValue, comparisonValue) => {
  return argValue >= comparisonValue;
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const inop = (argValue, comparisonValue) => {
  throw new Error("Not yet implemented.");
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const lt = (argValue, comparisonValue) => {
  return argValue < comparisonValue;
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const lte = (argValue, comparisonValue) => {
  return argValue <= comparisonValue;
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const ne = (arg, val) => {
  throw new Error("Not yet implemented.");
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const nin = (arg, val) => {
  throw new Error("Not yet implemented.");
};

// Logical

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

//$and

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const not = (arg, val) => {
  throw new Error("Not yet implemented.");
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const nor = (arg, val) => {
  throw new Error("Not yet implemented.");
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

//$or

// Element

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const exists = (arg, val) => {
  throw new Error("Not yet implemented.");
};

/**
 *
 * @param {JSON Object} query
 * @param {Array} docs
 */

const type = (arg, val) => {
  throw new Error("Not yet implemented.");
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

function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export { parseAndFind };
