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
    let killSwitch = true; // kills the main loop if set to false
    let fields = Object.keys(query);
    for (let j = 0; (j < fields.length) && killSwitch; j++) {
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
                    res = false
                    for (let i = 0; i < query[fields[j]].length; i++) {
                        if (evaluateCondition(query[fields[j]][i], doc)) {
                            res = true;
                            break;
                        }
                    }
                    break;
                default:
                    throw new Error(`${fields[j]} comparison operator is not supported`)
            }
        }

        

        // if not, then treat it as a doc field or single line operator query
        // { fname: "vasa", lname: "develop" }
        // { qty: { $lt: 20, $gt: 10 }, age: { $lt: 20, $gt: 10 } }

        // TODO: Support updates via JSON typed field. Eg, "user.age"
        else {
            res = true;
            for (let i = 0; i < fields.length; i++) {
                let check = {}
                check[fields[i]] = query[fields[i]]
                if (!evaluateCondition(check, doc)) {
                    res = false;
                    killSwitch = false;
                    break;
                }
            }
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
                for (let i = 0; (i < logicConditions.length) && res; i++) {
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
                            throw new Error(`${logicConditions[i]} logical operator is not supported`)
                    }
                }
            }
            else {
                //{qty: {"fname": "vasa", "lname": "develop"}}
                if (!jsonEqual(doc[field], condition[field])) {
                    res = false;
                }
            }
        }
        else {
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