const ObjectId = require("bson-objectid")

module.exports = parseAndFilterIds = async (filter, options, collection) => {
    let ids = [];
    Object.keys(options).forEach(async option => {
        switch (option) { 
            case "upsert":
                ids = await upsert(filter, options[option], collection, ids)
        }
    })
}

const upsert = async (filter, optionValue, collection, ids) => {
    ObjectId.generate()
    return ids
}

const multi = async (filter, optionValue, collection, ids) => {
    if (optionValue) { 
        ids.push(...(await collection.find(filter)).map(item => (item._id)))
    }
    return ids
}

const writeConcern = async (filter, optionValue, collection, ids) => {
    return ids
}

const collation = async (filter, optionValue, collection, ids) => {
    return ids
}

const arrayFilters = async (filter, optionValue, collection, ids) => {
    return ids
}

const hint = async (filter, optionValue, collection, ids) => {
    return ids
}