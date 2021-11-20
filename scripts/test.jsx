#include "json2.js";
#include "layouts.jsx";
#include "templates.jsx";
#include "constants.jsx";
#include "../settings.jsx";
#include "logging.jsx";

var filePath = File($.fileName).parent.parent.fsName;

function main2() {
    // read json
    var deckName = "BRAN";
    var deckJson = parseDecklist(deckName);

    for (var i = 0; i < deckJson.length; i++) {
        var card = deckJson[i]
        
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

        log(card.image_location);
        // select and execute the template - insert text fields, set visibility of layers, etc. - and save to disk
        var artFile = new File(card.image_location); // .exists()

        // layout, ArtFileObj, relativePath
        log(filePath);
        var template = WomensDayTemplate(layout, artFile, filePath)

        template.execute();
        log("test execute");

        throw new Error("Exiting...");

        // save_and_close(file_name, file_path);
    }

    // exit();

    // var logFile = new File(filePath + "/logs/" + "log.log");
    // logFile.open("w", "TEXT");
    // logFile.close();

    // iterate card
    // select template
    // render
    // save
    // revert template
}

function parseDecklist(deckName) {
    var decklistFilename = deckName + ".json";

    var deckFile = new File(filePath + "/decklists/" + decklistFilename);

    deckFile.open("r")
    var deckJson = JSON.parse(deckFile.read());
    deckFile.close();

    return deckJson;
}

function exit() {
    throw new Error("Exiting");
}

function cardIsBasic(card) {
    return card.type.indexOf("Basic") !== -1;
}

function main() {
    // will called from run_script.py
    makeLogFile();

    try {
        main2();
    } catch (error) {
        // var regex = /\((.*):(\d+):(\d+)\)$/
        // log(error.stack.split("\n")[2]);
        // var match = regex.exec(error.stack.split("\n")[2]);

        // var filepath = match[1];
        // var line = match[2];
        // var column = match[3];

        log(error);
        // log(filepath);
        // log(line);
        // log(column);
    }
}