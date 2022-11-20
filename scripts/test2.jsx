// "templateLocation": "../new_templates",
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
        // "BRAN",
        // "DANY",
        // "OTHERs",
        // "BLOODRAVEN", "TITANIA", "STONEHEART",
        // "OBEKA", "IRON_BANK", "MAEGOR",
        // "VISENYA", "UG_FLASH", "MODERN",
        // "ELD1",
        // "ELD2",
        // "VINTAGE",
        // "TOKENS", 
        // "STA",
        "EXTRA",
        "TITANIA",
    ];

    for (var i = 0; i < decklistNames.length; i++) {
        var decklistPath = filePath + "/decklists/" + decklistNames[i] + ".json";
        var deckJson = loadJson(decklistPath);
        // log(decklistNames[i]);

        for (var cardIndex = 0; cardIndex < deckJson.length; cardIndex++) {
            exitOnKeyboardInterrupt();
            var card = deckJson[cardIndex];
            exportCard(card);
        }
    }
}

function exportCard(card) {
    log(card.name);
    card.oracle_text = card.text ? card.text : "";
    card.flavour_text = (card.flavor) ? card.flavor : "";
    card.power = (card.power != null) ? card.power : undefined;
    card.toughness = (card.toughness != null) ? card.toughness : undefined;

    card.image_uris = { large: null };
    card.type_line = card.type;
    if (card.mana_cost == null) card.mana_cost = "";

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
    // var smallArtFile = new File('D:\\Gigapixel\\2022_01_30\\' + originalArtFile.name);
    var moveArtFile = new File('D:\\Gigapixel\\2022_01_30\\__scaled\\scaled_' + originalArtFile.name.split(".")[0] + "-art-scale-4_00x.png");

    var cardIdsToSkip = [
        // "68dce077-4ecd-406a-9052-05d5485ffa6f",
        // fb248ba0-2ee7-4994-be57-2bcc8df29680

        // Underground Sea
        "962719f7-ff8e-480b-985e-bd53a111793b",
        // Unholy Heat extra
        "74afaf7e-424b-4aa5-a072-dfa6a8a57aed",
        // Unlicensed Hearse extra
        "69b35a25-8c7c-4c4e-905c-8db59e0d3f32",
        // Historic Ulamog
        "852da9d9-5c88-4375-a756-511c5df00053",
        // Eyeless Watcher small art
        "4d949d0e-baf7-4573-bb15-7e30e3e9b202",
        // Herald of Kozilek
        "2a4180ae-1fd9-4185-b4f0-9e8f668a5737",
        // Kozilek's Return
        "55ae93d4-c72d-47f6-9e15-fc7edf88a6c0",
        // Nettle Drone
        "e633833a-cc4b-4c8c-a0d3-cd263e09df81",

        // No Mercy
        "4133fcbc-de7b-4270-b6c5-8246f290c8cf",
        
        // Rakdos Charm
        // "05741d2b-4aed-47f5-899e-7ed38e84ea39",
        // Caves of Koilos
        // "7328a565-966d-4053-b32b-25bdce031d9f",
        // Underground River // Volkan Baga
        "eb52820c-8660-4c4a-bb64-5b2fc580b6a3",
        // Ancestral Recall // Copyright // Volkan Baga
        // "f80c78c9-1e92-438c-b449-4f05610fe31c",
        // // Force of Will // Copyright
        // "6e7b0e29-09d9-4b3e-ab94-f1f4a61d9159",
        // // Bazaar of Baghdad // Crop
        // "9f0bc2a6-f966-4abe-afb3-d51403f7b9ed",
        // // Time Walk // Crop
        // "79973829-e203-4108-a819-0617e58c7e78",
        // // The Tabernacle at Pendrell Vale // Copyright
        // "a8c697b0-d8af-4539-b955-56ba3c1eb24a",
        // Angrath // Artist Name
        "beab1010-3d63-44f0-9f01-43b5e35aa5f1",
        // Titania, Gaea Incarnate
        "414b9230-9d25-4bdf-8b1e-b4fa2035b6a4",
        // Argoth, Sanctum of Nature
        "b29c9e4f-7b98-4610-a681-ae6297e8fc72",
        // Titania, Voice of Gaea
        "deeb6a21-23b0-44f1-b70e-5899bb9d4a84"
    ];
    var useNormalExtendedIds = [
        // Duals
        "0829af6e-7dd9-4bce-bf14-1c5d509556cb",
        "154ce456-38d2-4195-93b7-302e11c006e2",
        "931184cf-0b9a-49d5-8234-a25b90dbaedb",
        "2674e6d9-51b9-405c-ab01-75474abcf690",
        "962719f7-ff8e-480b-985e-bd53a111793b",
        "8ef5d61d-2648-4cbc-8083-3f3c6b362825",

        // Vessell of Nascency
        "89533790-38c2-4b53-90fa-8abf8c1a6abb",
        // Growth Spasm
        "d8a6849b-6391-4c2c-97bd-267a31e57b38",
        // Animate Dead
        "f9e02314-bb21-48d0-b0c9-2824583b9c6f",
        // Norn's Annex
        "a64073f2-99f5-4dc7-9403-e7cb94ce0e60",
        // Master of Cruelties
        "7b4d8ab5-252c-4727-817d-6f18cbaedd91",
        // Mox Sapphire
        "8c4ab6f6-bcb1-4369-9d05-3582b2639eed",
        // Mox Jet
        "1f5a1578-d5fe-4b31-bb71-3253be8775a1",
        // Mox Sapphire
        "c88832e3-218d-4b4b-9a5f-4389cf0a900c",
        // Gaea's Cradle
        "cf0ca29f-6f81-4336-b182-e03b4da4b7dd"
    ];
    var useWomensDayIds = [
        "e0e26f6c-44e9-4d6f-8eb1-efdef8d04ff5",
    ];
    var useClassicIds = [
        // Lignify
        "264fd6c5-8d73-4928-aed7-5ed637426780",
        // Sunstone
        "3c1c67fa-ff88-4a61-b8a5-8a872b3dc44f",
    ];
    var flavorIdsToSkip = [
        // Demonic Tutor
        "b1676c4d-fcf3-4892-8458-5811f094b10d",
        // Fatal Push
        "307213e3-3c6a-4398-b46e-7a4561d3d980",
    ];

    // overrides
    if (in_array(useNormalExtendedIds, card.id)) {
        var temp = ['NormalExtended', NormalExtendedTemplate];
    } else if (in_array(useClassicIds, card.id)) {
        var temp = ['NormalClassic', NormalClassicTemplate];
    } else if (in_array(useWomensDayIds, card.id)) {
        var temp = ['WomensDay', WomensDayTemplate];
    } else {
        var temp = getTemplateClass(layout, card);
    }
    
    var templateName = temp[0];
    var templateClass = temp[1];
    
    var template = new templateClass(layout, moveArtFile, filePath, templateLocation);
    var cDriveSaveLocation = "C:\\Users\\Ashley Minshall\\Desktop\\MTG ps\\mtg-photoshop-automation\\out\\large";
    var cDriveSave = new File(cDriveSaveLocation + "\\" + template.getLongCardName() + ".png");
    var renderDone = (new File(filePath + "/out/done/" + template.getLongCardName() + ".png")).exists ||
        (new File(filePath + "/out/done_adjusted_1/" + template.getLongCardName() + ".png")).exists ||
        (new File(filePath + "/out/done_adjusted_2/" + template.getLongCardName() + ".png")).exists ||
        (new File(filePath + "/out/Eldrazi/" + template.getLongCardName() + ".png")).exists ||
        (new File(filePath + "/out/sta/" + template.getLongCardName() + ".png")).exists ||
        cDriveSave.exists;

    if (
        // smallArtFile.exists && !moveArtFile.exists
        !(renderDone || template.renderExists(size))
        && card.is_personal == false
        // && smallArtFile.exists
        && moveArtFile.exists

        && card.type.indexOf("Saga") == -1
        // && (templateName != "PlaneswalkerExtended")
//  || templateName == "WomensDay"
        // && templateName != "Token"

        && !in_array(cardIdsToSkip, card.id)
        // && (parseInt(card.number) < 64 || card.set == "SLD")
    ) {
        log(card.id);
        log([card.name, templateName]);

        if (!moveArtFile.exists) {
            log("Art does not exist");
        } else if (card.flavor_name != null) {
            log("Flavor name skip");
        } else if (in_array(flavorIdsToSkip, card.id)) {
            log("Flavor skip");
        } else {
            clearHistory();
            template.execute();
            log(template.getLongCardName());

            // savePngImage(cDriveSaveLocation, template.getLongCardName());

            // template.saveCard(size);
            exit();
        }
    } else {
        if (!(renderDone || template.renderExists(size))) {
            log(["SKIPPED", card.name, templateName]);
        }
        // log("Exists, skipping");
    }
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