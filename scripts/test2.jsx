var MACOS = true;

#include "json2.js";
#include "layouts.jsx";
#include "templates.jsx";
#include "constants.jsx";
#include "../settings.jsx";
#include "logging.jsx";

var filePath = File($.fileName).parent.parent.fsName;

function main2() {
    log("main2");
    exit();
    // read json
    card = { "artist": "Adam Paquette", "layout": "normal", "name": "Ancient Tomb", "text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.", "power": null, "toughness": null, "type": "Land", "types": null, "rarity": "mythic", "card_faces": null, "flavor_name": null, "printed_name": null, "number": "21", "original_text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.", "original_type": "Land", "set": "ZNE", "flavor": null, "image_location": null, "count": 30 };

    // fixes for scryfall codes
    card.oracle_text = card.text ? card.text : "";
    card.flavor_text = card.flavor ? card.flavor : "";
    card.power = (card.power != null) ? card.power : undefined;
    card.toughness = (card.toughness != null) ? card.toughness : undefined;

    card.image_uris = { large: null };
    card.type_line = card.type;

    if (cardIsBasic(card)) {
        // manually construct layout obj for basic lands
        var layout = {
            name: card.name,
            card_class: basic_class,
        };
    } else {
        // instantiate layout obj (unpacks scryfall json and stores relevant parts in obj properties)
        if (card.layout in layout_map) {
            var layout = new layout_map[card.layout](card, card.name);
        } else {
            throw new Error("Layout" + card.layout + " is not supported. Sorry!");
        }
    }

    layout.artist = card.artist;

    // select and execute the template - insert text fields, set visibility of layers, etc. - and save to disk
    var artFile = new File(card.image_location);

    // layout, ArtFileObj, relativePath
    var templateLocation = "~/Downloads/templates/";
    if (!MACOS) templateLocation = "//MACBOOKPRO-B170/ashley/Downloads/templates";
    
    var template = new NormalTemplate(layout, artFile, templateLocation);

    log('executing');

    template.execute();
}
function cardIsBasic(card) {
    return card.type.indexOf("Basic") !== -1;
}

function main() {
    makeLogFile();

    // try {
    //     main2();
    // } catch (error) {
    //     log("Error occurred");
    //     log(error.message);
    //     log(error.fileName + ":" + error.line);
    // }
}

