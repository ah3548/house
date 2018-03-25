/* eslint-disable no-undef */
const baseUrl = 'https://search.onboard-apis.com';
function searchOnboard(postalcode) {
    return fetch(
            baseUrl + `/propertyapi/v1.0.0/property/address?postalcode='${postalcode}'&page=1&pagesize=10`,
            {
                headers: {
                    'Accept': 'application/json',
                    'apikey': "2f584a01fe335f6037915aeb827af5fe"
                }
            }
        )
        .then(checkStatus)
        .then(parseJSON)
}

const mongoBaseUrl = "http://127.0.0.1:8080";

function getMongo(collection, filter, sortby) {
    return fetch(
        mongoBaseUrl + '/restheart/' + collection
        + "?pagesize=1000"
        + ( sortby ? '&sort_by=' + sortby : '')
        + (filter ? '&filter={' + encodeURIComponent(filter) + '}' : ''),
        {
            headers: {
                'Accept': 'application/json',
            }
        }
    )
    .then(checkStatus)
    .then(parseJSON)
    .then(result => result._embedded);
}

function searchPropertiesMongo() {
    return getMongo('properties');
}

function searchSalesMongo() {
    return getMongo('sales',
        "'TOTAL UNITS':{ '$gt' : 0, '$lt' : 3}" +
        ",'BUILDING CLASS AT TIME OF SALE': { '$nin': ['R4','V0']}" +
        ",'APARTMENT NUMBER': ''" +
        ",'COMMERCIAL UNITS': 0" +
        ",'ZIP CODE': { '$in': [11230]}");
}

function searchAddressesMongo() {
    return getMongo('addresses',
        "'POSTCODE': { '$in': [11230]}" +
        //",'loc': { $near: [-73.962714, 40.623866] }" +
        ",'loc': { " +
        "        $geoWithin: { " +
        "            $box: [ " +
        "                [-73.952770, 40.606276], " +
        "                [-73.968734, 40.643897] " +
        "           ]  " +
        "        } " +
        "    },",
        "STREET");
}

function searchPotential() {
    return getMongo('pluto_addr', "'sales': null");
}


function writeMongo(data) {
    return fetch(
        mongoBaseUrl + `/restheart/col1`,
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
        .then(checkStatus)
        .then(parseJSON)
}


function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
}

function parseJSON(response) {
    return response.json();
}

const Client = { searchOnboard, searchPropertiesMongo, searchSalesMongo, searchAddressesMongo, writeMongo, searchPotential };
export default Client;