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

#include "frame_logic_tests.jsx";

var filePath = File($.fileName).parent.parent.fsName;

function main2() {
    var decklistNames = [
        "BRAN",
        "DANY",
        "OTHERs",
        "BLOODRAVEN", "TITANIA", "STONEHEART",
        "OBEKA", "IRON_BANK", "MAEGOR",
        "VISENYA", "UG_FLASH", "MODERN",
        "ELD1",
        "ELD2",
        "VINTAGE",
        "TOKENS", 
        "STA"
    ];

    for (var i = 0; i < decklistNames.length; i++) {
        var decklistPath = filePath + "/decklists/" + decklistNames[i] + ".json";
        var deckJson = loadJson(decklistPath);

        for (var cardIndex = 0; cardIndex < deckJson.length; cardIndex++) {
            exitOnKeyboardInterrupt();
            var card = deckJson[cardIndex];
            exportCard(card);
        }
    }
}

function exportCard(card) {
    // log(card.name);
    card.oracle_text = card.text ? card.text : "";
    card.flavour_text = (card.flavor) ? card.flavor : "";
    card.power = (card.power != null) ? card.power : undefined;
    card.toughness = (card.toughness != null) ? card.toughness : undefined;

    card.image_uris = { large: null };
    card.type_line = card.type;
    if (card.mana_cost == null) card.mana_cost = "";

    // card.mana_cost = "{2}{W}{U}{B}{R}{G}"
    // card.mana_cost = "{G/W}{2/B}{G/U/P}"
    // card.mana_cost = "{2}{R}{W/P}{S}"

    var size = "large";
    if (card.layout == "transform" && card.frame_effects == null) {
        card.frame_effects = ["sunmoondfc"];
    }

    // rarity fix
    var rarity_map = {
        "M": rarity_mythic,
        "R": rarity_rare,
        "U": rarity_uncommon,
        "C": rarity_common
    }

    if (rarity_map.hasOwnProperty(card.rarity)) card.rarity = rarity_map[card.rarity];

    // instantiate layout obj (unpacks scryfall json and stores relevant parts in obj properties)
    if (card.layout in layout_map) {
        var layout = new layout_map[card.layout](card, card.name);
    } else {
        log([">>>>>>>>> No layout found", card.name]);
        return false;
    }

    layout.artist = card.artist;

    // select and execute the template - insert text fields, set visibility of layers, etc. - and save to disk
    var originalArtFile = new File(card.image_location);
    var smallArtFile = new File(
        'D:\\Gigapixel\\2022_01_30\\' +
        originalArtFile.name.split(".")[0] +
        ".png"
    );
    var moveArtFile = new File(
        'D:\\Gigapixel\\2022_01_30\\__scaled\\scaled_' +
        originalArtFile.name.split(".")[0] +
        "-art-scale-4_00x.png"
    );
    // var moveArtFile = new File('D:\\Gigapixel\\2022_01_30\\' + originalArtFile.name);
    // overrides
    var temp = getTemplateClass(layout, card);
    var templateName = temp[0];
    var templateClass = temp[1];

    var template = new templateClass(layout, moveArtFile, templateLocation);

    var renderDone = (new File(filePath + "/out/done/" + template.getLongCardName() + ".png")).exists ||
        (new File(filePath + "/out/done_adjustments_1/" + template.getLongCardName() + ".png")).exists;

    var cardIdsToSkip = [
        "68dce077-4ecd-406a-9052-05d5485ffa6f"
    ];

    var imageToBeReplaced = new File(
        'D:\\Gigapixel\\2022_01_30\\imagesToBeReplaced\\_' +
        originalArtFile.name.split(".")[0] +
        ".png"
    );
    if (imageToBeReplaced.exists) {
        log(card.name);
    }
    // if (card.name == "Time Warp") {
    //     log(card.name);
    //     log(template.renderExists(size));
    //     log(card.number);
    //     log(card.set);
    //     log(moveArtFile.exists);
    //     log(card.printed_name);
    // }
    // if (
    //     smallArtFile.exists &&
    //     !moveArtFile.exists
    //     // !template.renderExists(size)
    //     // && !renderDone
    //     // && (parseInt(card.number) < 64 || card.set == "SLD")
    //     // // && card.is_personal == false
    //     // && card.printed_name == null
    //     // && moveArtFile.exists
    //     // && (card.set != "STA" && !in_array(STAIds, card.id))
    //     // && templateName == "WomensDay"
    //     // && !in_array(cardIdsToSkip, card.id)
    // ) {
    //     log([card.name, templateName]);
    //     // log(card.number);
    //     // log(parseInt(card.number));
    //     // log(parseInt(card.number) < 66);
    //     // exit();

    //     // clearHistory();
    //     // template.execute();
    //     // log(template.getLongCardName());
    //     // template.saveCard(size);

    //     // exit();
    // } else {
    //     // log("Exists, skipping");
    // }
}

function cardIsBasic(card) {
    return card.type.indexOf("Basic") !== -1;
}

function main() {
    makeLogFile();
    try {
        // var manaCost = "{2}{G/W}{G/W}{G/W}";
        // var symbol_regex = /(\{.*?\})/g;
        // var symbol_indices = [];
        // match = symbol_regex.exec(manaCost);
        // log(manaCost.split("}{"));
        // var match = null;
        // while (true) {
        //     match = symbol_regex.exec(manaCost);
        //     if (match === null) {
        //         break;
        //     } else {
        //         var symbol = match[1];
        //     }
        // }
        // logObj(locate_symbols(manaCost));
        // var matches = manaCost.match(/\{(.?+)\}/g)
        // log(matches.length)
        // log(matches[0])
        // log(matches);
        main2();
        // runAllFrameLogicTests();
    } catch (error) {
        log("Error occurred");
        log(error.message);
        log(error.fileName + ":" + error.line);
    }
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
        default_: WomensDayTemplate,
        other: [],
    };
    class_template_map[miracle_class] = {
        default_: MiracleTemplate,
        other: [],
    };
    class_template_map[planeswalker_class] = {
        default_: PlaneswalkerExtendedTemplate,
        other: [
            PlaneswalkerTemplate,
        ],
    };
    class_template_map[snow_class] = {
        default_: SnowTemplate,
        other: [],
    };
    class_template_map[basic_class] = {
        default_: BasicLandTherosTemplate,
        other: [
            BasicLandTemplate,
            BasicLandClassicTemplate,
            BasicLandUnstableTemplate,
        ],
    };
    class_template_map[planar_class] = {
        default_: PlanarTemplate,
        other: [],
    };
    class_template_map[token_class] = {
        default_: TokenTemplate,
        other: [],
    };

    return class_template_map;
}

function getTemplateClass(layout, card) {
    var templateMap = buildTemplateMap();
    var artSize = card.art_size;

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
            // templateClass = "Stargazing";
            // templateClass = StargazingTemplate;
        } else if (in_array(["ZEN", "WWK", "ROE", "BFZ", "OGW", "ZNR", "EXP", "ZNE"], card.set) &&
            artSize == "fullart" && card.type.indexOf('Land') >= 0) {
            // ExpeditionTemplate => (zendikar landa and fullart)
            // templateClass = ExpeditionTemplate;
            return ["WomensDay", WomensDayTemplate];
            // return ["Expedition", ExpeditionTemplate]
            // templateClass = "Expedition";
        } else if (in_array(["MPS"], card.set) && artSize == "fullart") {
            return ["Masterpiece", MasterpieceTemplate];
        } else if ("STA" == card.set || (card.set == "SLD" && (card.number >= 268 && card.number <= 273))) {
            return ["MysticalArchive", MysticalArchiveTemplate];
        } else {
            // not set specific
            if (artSize == "fullart") {
                return ["WomensDay", WomensDayTemplate];
            } else if (artSize == "extended") {
                return ["NormalExtended", NormalExtendedTemplate];
            } else {
                return ["Normal", NormalTemplate];
            }
        }
    } else {
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
            [token_class, "Token"]
        ];
        for (var i = 0; i < mapToName.length; i++) {
            if (mapToName[i][0] == layout.card_class) {
                return [mapToName[i][1], templateMap[layout.card_class].default_];
            }
        }
    }
}