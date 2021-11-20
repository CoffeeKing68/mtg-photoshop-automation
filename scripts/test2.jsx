#include "json2.js";
#include "layouts.jsx";
#include "templates.jsx";
#include "constants.jsx";
#include "../settings.jsx";
// #include "../dist/polyfills.js";

var filePath = File($.fileName).parent.parent.fsName;


function makeLogFile() { var logFolder = new Folder(filePath + "/logs"); logFolder.create(); var logFile = new File(filePath + "/logs/" + "log.log"); logFile.open("w", "TEXT"); logFile.close(); }
function log(s) { var logFile = new File(filePath + "/logs/" + "log.log"); if (s === undefined) s = ""; logFile.open("a", "TEXT"); logFile.write(s + "\n"); logFile.close(); }



function main2() {
    // read json
    card = { "artist": "Adam Paquette", "layout": "normal", "name": "Ancient Tomb", "text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.", "power": null, "toughness": null, "type": "Land", "types": null, "rarity": "mythic", "card_faces": null, "flavor_name": null, "printed_name": null, "number": "21", "original_text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.", "original_type": "Land", "set": "ZNE", "flavor": null, "image_location": null, "count": 30 };

    // fixes for scryfall codes
    card.oracle_text = card.text;
    card.flavor_text = card.flavor;
    card.image_uris = { large: null };
    card.type_line = card.type;

    log(card.name);

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
    var artFile = new File(card.image_location); // .exists()

    // layout, ArtFileObj, relativePath
    var template = new NormalTemplate(layout, artFile, filePath)
    template.execute();
}
function cardIsBasic(card) { return card.type.indexOf("Basic") !== -1; }

function main() {
    makeLogFile();

    try {
        main2();
    } catch (error) {
        log(error);
    }
}

