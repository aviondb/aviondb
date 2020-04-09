module.exports = parseAndFind = (query, docs, findOne = false) => { 
    var docs = Object.values(docs);
    if (!findOne) {
        return docs.filter(doc => { 
            return evaluateQuery(doc, query)
        })
    }
    else {
        for (let i = 0; i < docs.length; i++) {
            if (evaluateQuery(docs[i], query)) {
                return docs[i];
            }
        }
        return {}
    }
}

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
    for (field in query) { 
        // check for comparison operators by "$"
        if (field[0] === "$") {
            switch (field) {
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
                    query[field].forEach(condition => { 
                        res = res && evaluateCondition(condition, doc)
                    })
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
                    res = false
                    for (let i = 0; i < query[field].length; i++) {
                        if (evaluateCondition(query[field][i], doc)) {
                            res = true;
                            break;
                        }
                    }
                    break;
                default:
                    throw new Error(`${operator} comparison operator is not supported`)
            }
        }

        

        // if not, then treat it as a doc field or single line operator query
        // { fname: "vasa", lname: "develop" }
        // { qty: { $lt: 20, $gt: 10 }, age: { $lt: 20, $gt: 10 } }

        // TODO: Support updates via JSON typed field. Eg, "user.age"
        else {
            res = true
            Object.keys(query).forEach(field => { 
                let check = {}
                check[field] = query[field]
                res = res && evaluateCondition(check, doc)
            })
        }
    }
    return res;
}

/**
 * Evaluates if a condition is satisfied by a specific field value.
 * 
 * @param {JSON Object} condition 
 * @param {JSON Object} doc 
 * @returns {boolean} 
 */

const evaluateCondition = (condition, doc) => {
    var res = true;
    Object.keys(condition).forEach(field => { 
        //Check if condition[field] is a JSON object with keys having "$" character 
        if (condition[field].constructor === Object && (Object.keys(condition[field]).length > 0)) {
            var logicConditions = Object.keys(condition[field])
            if (logicConditions[0][0] === "$") {
                //{ qty: { $lt: 20, $gt: 10 } }
                logicConditions.forEach(operator => {
                    switch (operator) {
                        case "$lt":
                            res = res && lt(doc[field], condition[field][operator])
                            break;
                        case "$gt":
                            res = res && gt(doc[field], condition[field][operator])
                            break;
                        case "$lte":
                            res = res && lte(doc[field], condition[field][operator])
                            break;
                        case "$gte":
                            res = res && gte(doc[field], condition[field][operator])
                            break;
                        default:
                            throw new Error(`${operator} logical operator is not supported`)
                    }
                })
            }
            else {
                //{qty: {"fname": "vasa", "lname": "develop"}}
                res = res && jsonEqual(doc[field], condition[field])
            }
        }
        else {
            //{qty: [1,2]}
            if (condition[field].constructor === Array) {
                res = res && arraysEqual(doc[field], condition[field])
            }
            //{qty: {}}
            else if (condition[field].constructor === Object) {
                res = res && jsonEqual(doc[field], condition[field])
            }
            //{ qty: 30 }
            //{qty: null}
            else {
                res = res && (doc[field] === condition[field])
            }
        }
        
    })
    return res
}


// Comparison

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const eq = (argValue, comparisonValue) => {
    return (argValue === comparisonValue)
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const gt = (argValue, comparisonValue) => {
    return (argValue > comparisonValue)
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const gte = (argValue, comparisonValue) => {
    return (argValue >= comparisonValue)
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const inop = (argValue, comparisonValue) => {
    return docs
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const lt = (argValue, comparisonValue) => {
    return (argValue < comparisonValue)
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const lte = (argValue, comparisonValue) => {
    return (argValue <= comparisonValue)
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const ne = (arg, val) => {
    return docs
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const nin = (arg, val) => {
    return docs
}

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
    return docs
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const nor = (arg, val) => {
    return docs
}

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
    return docs
}

/**
 * 
 * @param {JSON Object} query 
 * @param {Array} docs 
 */

const type = (arg, val) => {
    return docs
}


// Utility Functions

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function jsonEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}