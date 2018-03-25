// mongoimport --type csv --db restheart --collection addresses --file city_of_new_york.csv --headerline
db.getCollection('addresses').deleteMany({POSTCODE: {$nin: [11230, 11226, 11218, 11229] }})
db.getCollection('addresses').find().forEach(function(addr) {
    addr.NUMBER = ('' + addr.NUMBER).trim();
    addr.loc = {type: "Point", coordinates: [addr.LON, addr.LAT]};
    addr.STREET = addr.STREET.replace(/  /, ' ');
    addr.ADDRESS = addr.NUMBER + ' ' + addr.STREET;
    db.getCollection('addresses').save(addr);
});
db.getCollection('addresses').createIndex({loc: "2dsphere"});

// mongoimport --type csv --db restheart --collection pluto --file BK2017V11.csv --headerline
db.getCollection('pluto').deleteMany({ZipCode: {$nin: ['11230', '11226', "11218", "11229"] }})
db.getCollection('pluto').find().forEach(function(addr) {
    addr.Address = addr.Address
        .replace("AVENUE", "AVE")
        .replace("STREET", "ST")
        .replace("ROAD", "RD")
        .replace("EAST", "E");
    db.getCollection('pluto').save(addr);
});

db.createView('pluto_addr', 'addresses', [{
    "$match": {
        "loc": {
            "$geoWithin": {
                "$geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -73.9692,
                                40.64631
                            ],
                            [
                                -73.96056,
                                40.6473
                            ],
                            [
                                -73.95312,
                                40.6082
                            ],
                            [
                                -73.96184,
                                40.60737
                            ],
                            [
                                -73.9692,
                                40.64631
                            ]
                        ]
                    ]
                }
            }
        },
        "STREET": {
            "$nin": [
                "E 15 ST",
                "E 16 ST"
            ]
        }
    }
},
    {
        "$lookup": {
            "from": "pluto",
            "localField": "ADDRESS",
            "foreignField": "Address",
            "as": "pluto"
        }
    },
    {
        "$match": {
            "pluto": {
                "$exists": true,
                "$ne": []
            },
            "pluto.LandUse": 1.0
        }
    },
    {
        "$unwind": "$pluto"
    },
    {
        "$match": {
            "pluto.BldgClass": {
                "$nin": [
                    "A2",
                    "A7",
                    "V0"
                ]
            },
            "pluto.OwnerType": {
                "$nin": [
                    "X"
                ]
            }
        }
    },
    {
        "$addFields": {
            "amir estimate": {
                "$multiply": [
                    "$pluto.NumFloors",
                    "$pluto.BldgDepth",
                    "$pluto.BldgFront",
                    500.0
                ]
            }
        }
    },
    {
        "$match": {
            "$and": [
                {
                    "amir estimate": {
                        "$gte": 800000.0
                    }
                },
                {
                    "amir estimate": {
                        "$lte": 1500000.0
                    }
                }
            ]
        }
    }
]);

/*
1. How many missing between address and pluto

 */