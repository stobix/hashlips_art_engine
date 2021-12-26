const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;

const { layerConfigurations } = require(`${basePath}/src/config.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];
let rarityJson = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
    let layerName =
      layer.options?.["displayName"] != undefined
        ? layer.options?.["displayName"]
        : layer.name;
    let layerTraits = [];
    elements.forEach((element) => {
      // just get name and weight for each element
      let rarityDataElement = {
        trait: element.name,
        weight: element.weight.toFixed(0),
        occurrence: 0, // initialize at 0
      };
      elementsForLayer.push(rarityDataElement);
    });
    if (!rarityData.hasOwnProperty(layerName)) {
      // add elements for each layer to chart
      //console.log(layerName);
      rarityData[layerName] = elementsForLayer;
    } else {
        // Only add elements that are not there yet.
        let existingTraits = rarityData[layerName].map(x => x.trait);
        //console.log(layerName, existingTraits);
        elementsForLayer.forEach((element) => {
            if(!existingTraits.includes(element.trait)){
               rarityData[layerName].push(element);
            }
        });
    }
  });
});

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;
  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to occurence string
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // get chance
    let chance =
      ((rarityData[layer][attribute].occurrence / editionSize) * 100).toFixed(2);

    rarityData[layer][attribute].chance = chance
    // show two decimal places in percent
    rarityData[layer][attribute].occurrenceTxt =
      `${rarityData[layer][attribute].occurrence} in ${editionSize} editions (${chance} %)`;
  }
}

//console.log("{traits:[");
// print out rarity data
//for (var layer in rarityData) {
  //console.log(`${layer}:[`);
  //for (var trait in rarityData[layer]) {
    //console.log(rarityData[layer][trait]);
  //}
  //console.log("]")
  //console.log(",");
//}
//console.log(rarityData);
//console.log(JSON.stringify(rarityData));
//console.log(JSON.stringify({rare:rarityData}));
//

var ux = {}
for (var layer in rarityData) {
    ux[layer] = rarityData[layer]
}
console.log(JSON.stringify(ux));
//console.log(ux);
