// var templateLocation is set in run_script.py
// main(); is called
var MACOS = File.fs == "Macintosh";

// Save file based on template

#include "json2.js";
#include "layouts.jsx";
#include "templates.jsx";
#include "constants.jsx";
#include "../settings.jsx";
#include "logging.jsx";

var filePath = File($.fileName).parent.parent.fsName;

function main2() {
    var decklistNames = ["BRAN"];

    for (var i = 0; i < decklistNames.length; i++) {
        var decklistPath = filePath + "/decklists/" + decklistNames[i] + ".json";
        var deckJson = loadJson(decklistPath);

        for (cardIndex = 0; cardIndex < deckJson.length; cardIndex++) {
            var card = deckJson[cardIndex];

            exportCard(card);
        }
    }
}

function exportCard(card) {
    // fixes for scryfall codes
    card.oracle_text = card.text ? card.text : "";
    card.flavour_text = (card.flavor) ? card.flavor : "";
    card.power = (card.power != null) ? card.power : undefined;
    card.toughness = (card.toughness != null) ? card.toughness : undefined;

    card.image_uris = { large: null };
    card.type_line = card.type;

    // instantiate layout obj (unpacks scryfall json and stores relevant parts in obj properties)
    if (card.layout in layout_map) {
        var layout = new layout_map[card.layout](card, card.name);
    } else {
        throw new Error("Layout" + card.layout + " is not supported. Sorry!");
    }

    layout.artist = card.artist;

    // select and execute the template - insert text fields, set visibility of layers, etc. - and save to disk
    var originalArtFile = new File(card.image_location);
    var moveArtFile = new File(filePath + "/decklists/images/" + originalArtFile.name);

    // overrides
    // var temp = getTemplateClass(layout, card);
    // var templateName = temp[0];
    // var templateClass = temp[1];

    // layout, ArtFileObj, relativePath
    var template = new WomensDayTemplate(layout, moveArtFile, templateLocation);
    var size = "small";

    // bugged;
    if (!template.renderExists(size)) {
        log(card.name, template.templateName());

        template.execute();
        
        exit();

        template.saveCard(size);
    } else {
        log(["skipping", card.name, template.templateName()]);
    }
}

function cardIsBasic(card) {
    return card.type.indexOf("Basic") !== -1;
}

function main() {
    makeLogFile();

    try {
        main2();
    } catch (error) {
        log("Error occurred");
        log(error.message);
        log(error.fileName + ":" + error.line);
    }
}

function loadJson(jsonPath) {
    var jsonFile = new File(jsonPath);
    jsonFile.open('r');
    var json = jsonFile.read();
    jsonFile.close();

    return JSON.parse(json);
}

function buildTemplateMap() {
    var class_template_map = {};
    class_template_map[normal_class] = {
        default_: NormalTemplate,
        other: [
            NormalClassicTemplate,
            NormalExtendedTemplate,
            WomensDayTemplate,
            StargazingTemplate,
            MasterpieceTemplate,
            ExpeditionTemplate,
        ],
    };
    class_template_map[transform_front_class] = {
        default_: TransformFrontTemplate,
        other: [],
    };
    class_template_map[transform_back_class] = {
        default_: TransformBackTemplate,
        other: [],
    };
    class_template_map[ixalan_class] = {
        default_: IxalanTemplate,
        other: [],
    };
    class_template_map[mdfc_front_class] = {
        default_: MDFCFrontTemplate,
        other: [],
    };
    class_template_map[mdfc_back_class] = {
        default_: MDFCBackTemplate,
        other: [],
    };
    class_template_map[mutate_class] = {
        default_: MutateTemplate,
        other: [],
    };
    class_template_map[adventure_class] = {
        default_: AdventureTemplate,
        other: [],
    };
    class_template_map[leveler_class] = {
        default_: LevelerTemplate,
        other: [],
    };
    class_template_map[saga_class] = {
        default_: SagaTemplate,
        other: [],
    };
    class_template_map[miracle_class] = {
        default_: MiracleTemplate,
        other: [],
    };
    class_template_map[planeswalker_class] = {
        default_: PlaneswalkerTemplate,
        other: [
            PlaneswalkerExtendedTemplate,
        ],
    };
    class_template_map[snow_class] = {
        default_: SnowTemplate,
        other: [],
    };
    class_template_map[basic_class] = {
        default_: BasicLandTemplate,
        other: [
            BasicLandClassicTemplate,
            BasicLandTherosTemplate,
            BasicLandUnstableTemplate,
        ],
    };
    class_template_map[planar_class] = {
        default_: PlanarTemplate,
        other: [],
    };

    return class_template_map;
}

function getTemplateClass(layout, card) {
    var templateMap = buildTemplateMap();
    var artSize = card.art_size;
    var templateClass = null;

    if (layout.card_class == basic_class) {
        return ["BasicLandTheros", BasicLandTherosTemplate];
    } else if (layout.card_class == planeswalker_class) {
        return ["PlaneswalkerExtended", PlaneswalkerExtendedTemplate];
    } else if (layout.card_class == normal_class) {
        // set specific
        if (card.type.indexOf('Legendary') >= 0 && card.type.indexOf('Enchantment') >= 0 &&
            card.type.indexOf('Creature') >= 0 && card.type.indexOf('God') >= 0 &&
            artSize == "fullart" && card.is_personal == false) {
            // StargazingTemplate => (theros god enchantment, fullart)
            return ["Stargazing", StargazingTemplate];
            templateClass = "Stargazing";
            // templateClass = StargazingTemplate;
        } else if (in_array(["ZEN", "WWK", "ROE", "BFZ", "OGW", "ZNR", "EXP", "ZNE"], card.set) &&
            artSize == "fullart" && card.type.indexOf('Land') >= 0) {
            // ExpeditionTemplate => (zendikar landa and fullart)
            // templateClass = ExpeditionTemplate;
            return ["Expedition", ExpeditionTemplate]
            // templateClass = "Expedition";
        } else if (in_array(["MPS"], card.set) && artSize == "fullart") {
            // MasterpieceTemplate => (mps and fullart)
            // templateClass = MasterpieceTemplate;
            // templateClass = "Masterpiece";
            return ["Masterpiece", MasterpieceTemplate];
        } else {
            // not set specific
            if (artSize == "fullart") {
                // templateClass = WomensDayTemplate;
                // templateClass = "WomensDay";
                return ["WomensDay", WomensDayTemplate];
            } else if (artSize == "extended") {
                // templateClass = NormalExtendedTemplate;
                // templateClass = "NormalExtended";
                return ["NormalExtended", NormalExtendedTemplate];
            } else {
                // templateClass = "Normal";
                // templateClass = NormalTemplate;
                // NormalClassicTemplate => 
                return ["Normal", NormalTemplate];
            }
        }
    } else {
        // templateClass = templateMap[layout.card_class];
        var mapToName = [
            [transform_front_class, "TransformFront"],
            [transform_back_class, "TransformBack"],
            [ixalan_class, "Ixalan"],
            [mdfc_front_class, "MDFCFcont"],
            [mdfc_back_class, "MDFCBack"],
            [mutate_class, "Mutate"],
            [adventure_class, "Adventure"],
            [leveler_class, "Leveler"],
            [saga_class, "Saga"],
            [miracle_class, "Miracle"],
            [planeswalker_class, "Planeswalker"],
            [snow_class, "Snow"],
            [planar_class, "Planar"],
        ];
        for (var i = 0; i < mapToName.length; i++) {
            if (mapToName[i][0] == layout.card_class) {
                return [mapToName[i][1], templateMap[layout.card_class]];
            }
        }
    }

    return templateClass;
}

// function getLongCardName(card, templateName) {
//     return card.name + "_" + card.id + " (" + card.artist + ", " + card.art_size + ", " + templateName + ")";
// }