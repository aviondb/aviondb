module.exports = parseAndUpdate = (doc, modification) => {
    Object.keys(modification).forEach(operator => {
        switch (operator) {
            case "$set":
                doc = set(doc, modification[operator])
                break;
            default:
                throw new Error(`${operator} operator is not supported`)
        }
    })
}
// Fields

const currentDate = (doc, modification) => { 
    
}

const inc = (doc, modification) => { 
    
}

const min = (doc, modification) => { 
    
}

const max = (doc, modification) => { 
    
}

const mul = (doc, modification) => { 
    
}

const rename = (doc, modification) => { 
    
}

const set = (doc, modification) => { 
    //TODO: Support updates via JSON typed field. Eg, "user.age"
    for (field in modification) { 
        doc[field] = modification[field];
    }
    return doc
}

const setOnInsert = (doc, modification) => { 

}

const unset = (doc, modification) => { 

}

// Arrays

const addToSet = (doc, modification) => { 

}

const pop = (doc, modification) => { 

}

const pull = (doc, modification) => { 

}

const push = (doc, modification) => { 

}

const pullAll = (doc, modification) => { 

}

// Modifiers

const each = (doc, modification) => { 

}

const position = (doc, modification) => { 

}

const slice = (doc, modification) => { 

}

const sort = (doc, modification) => { 

}

// Bitwise

const bit = (doc, modification) => { 

}