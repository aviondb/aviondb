module.exports = parseAndUpdate = (doc, modification) => {
    Object.keys(modification).forEach(operator => {
        switch (operator) {
            case "$inc":
                doc = inc(doc, modification[operator])
                break;
            case "$min":
                doc = min(doc, modification[operator])
                break;
            case "$max":
                doc = max(doc, modification[operator])
                break;
            case "$mul":
                doc = mul(doc, modification[operator])
                break;
            case "$set":
                doc = set(doc, modification[operator])
                break;
            case "$unset":
                doc = unset(doc, modification[operator])
                break;
            default:
                throw new Error(`${operator} operator is not supported`)
        }
    })
}
// Fields

 /**
  * $currentDate Sets the value of a field to current date,
  * either as a Date or a Timestamp.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const currentDate = (doc, modification) => { 
    
}

 /**
  * $inc Increments the value of the field by the specified amount.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const inc = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        if (doc[field] && (typeof doc[field] == 'number')) {
            doc[field] += modification[field];
        }
    }
    return doc
}

/**
 * The $min updates the value of the field to a specified value if
 * the specified value is less than the current value of the field.
 * @param {JSON Object} doc 
 * @param {JSON Object} modification 
 */

const min = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        if (doc[field]) { 
            if (doc[field] >= modification[field]) {
                doc[field] = modification[field];   
            }
        }
    }
    return doc
}

 /**
  * The $max operator updates the value of the field to a specified
  * value if the specified value is greater than the current value of the field.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const max = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) {
        if (doc[field]) { 
            if (doc[field] <= modification[field]) {
                doc[field] = modification[field];   
            }
        }
    }
    return doc
}

 /**
  * $mul Multiplies the value of the field by the specified amount.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const mul = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        if (doc[field] && (typeof doc[field] == 'number')) {
            doc[field] *= modification[field];
        }
    }
    return doc
}

 /**
  * $rename Renames a field.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const rename = (doc, modification) => { 
    
}

 /**
  * $set Sets the value of a field in a document.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const set = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        doc[field] = modification[field];
    }
    return doc
}

 /**
  * Sets the value of a field if an update results in an insert
  * of a document. Has no effect on update operations that modify existing documents.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const setOnInsert = (doc, modification) => { 

}

 /**
  * Removes the specified field from a document.
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const unset = (doc, modification) => { 
//TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        delete doc[field]
    }
    return doc
}

// Arrays

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const addToSet = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const pop = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const pull = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const push = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const pullAll = (doc, modification) => { 

}

// Modifiers

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const each = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const position = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const slice = (doc, modification) => { 

}

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const sort = (doc, modification) => { 

}

// Bitwise

 /**
  * 
  * @param {JSON Object} doc 
  * @param {JSON Object} modification 
  */

const bit = (doc, modification) => { 

}