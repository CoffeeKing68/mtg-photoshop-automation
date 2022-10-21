#include "constants.jsx";
#include "helpers.jsx";

/* Locating symbols and italics in the input string */

function locate_symbols(input_string) {
    /**
     * Locate symbols in the input string, replace them with the characters we use to represent them in NDPMTG, and determine
     * the colours those characters need to be. Returns an object with the modified input string and a list of symbol indices.
     */

    var symbol_regex = /(\{.*?\})/;
    var symbol_indices = [];
    var match = null;
    while (true) {
        match = symbol_regex.exec(input_string);
        if (match === null) {
            break;
        } else {
            var symbol = match[1];
            var symbol_index = match.index;
            var symbol_chars = symbols[symbol];
            if (symbol_chars === null) {
                throw new Error("Encountered a formatted character in braces that doesn't map to characters: " + symbol);
            }

            input_string = input_string.replace(symbol, symbol_chars);
            symbol_indices.push({
                index: symbol_index,
                symbol: symbol,
                symbol_chars: symbol_chars
            });
        }
    }

    return {
        input_string: input_string,
        symbol_indices: symbol_indices,
    }
}

function escape_regex(value) {
    /**
     * Borrowed from https://stackoverflow.com/questions/494035/how-do-you-use-a-variable-in-a-regular-expression
     */

    return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function locate_italics(input_string, italics_strings) {
    /**
     * Locate all instances of italic strings in the input string and record their start and end indices.
     * Returns a list of italic string indices (start and end).
     */

    var italics_indices = [];
    var italics;
    var start_index;
    var end_index;

    for (var i = 0; i < italics_strings.length; i++) {
        italics = italics_strings[i];
        start_index = 0;
        end_index = 0;

        // replace symbols with their character representations in the italic string
        if (italics.indexOf("}") >= 0) {
            for (var symbol in symbols) {
                var re = new RegExp(escape_regex(symbol), "g");
                italics = italics.replace(re, symbols[symbol]);
            }
        }

        while (true) {
            start_index = input_string.indexOf(italics, end_index);
            end_index = start_index + italics.length;
            if (start_index < 0) {
                break;
            }
            italics_indices.push({
                start_index: start_index,
                end_index: end_index,
            });
        }
    }

    return italics_indices;
}

/* Formatting for different symbol types */
function determine_symbol_colours(symbol, symbol_length) {
    /**
     * Determines the colours of a symbol (represented as Scryfall string) and returns an array of SolidColor objects.
     */

    const symbol_colour_map = {
        "W": rgb_w,
        "U": rgb_u,
        "B": rgb_b,
        "R": rgb_r,
        "G": rgb_g,
        "2": rgb_c,
    }

    // for hybrid symbols with generic mana, use the black symbol colour rather than colourless for B
    const hybrid_symbol_colour_map = {
        "W": rgb_w,
        "U": rgb_u,
        "B": rgb_b,
        "R": rgb_r,
        "G": rgb_g,
        "2": rgb_c,
    }

    if (symbol === "{E}" || symbol === "{CHAOS}") {
        // energy or chaos symbols
        return [rgb_black()];
    } else if (symbol === "{S}") {
        // snow symbol
        return [rgb_c, rgb_black(), rgb_white()];
    } else if (symbol == "{Q}") {
        // untap symbol
        return [rgb_black(), rgb_white()];
    }

    var phyrexian_regex = /^\{([W,U,B,R,G])\/P\}$/;
    var phyrexian_match = symbol.match(phyrexian_regex);
    if (phyrexian_match !== null) {
        return [hybrid_symbol_colour_map[phyrexian_match[1]], rgb_black()];
    }

    var hybrid_regex = /^\{([2,W,U,B,R,G])\/([W,U,B,R,G])\}$/;
    var hybrid_match = symbol.match(hybrid_regex);
    if (hybrid_match !== null) {
        var colour_map = symbol_colour_map;
        if (hybrid_match[1] == "2") {
            // Use the darker colour for black's symbols for 2/B hybrid symbols
            colour_map = hybrid_symbol_colour_map;
        }
        return [
            colour_map[hybrid_match[2]],
            colour_map[hybrid_match[1]],
            rgb_black(),
            rgb_black()
        ];
    }

    // Phyrexian hybrid mana
    var phyrexian_hybrid_regex = /^\{([W,U,B,R,G])\/([W,U,B,R,G])\/P\}$/;
    var phyrexian_hybrid_match = symbol.match(phyrexian_hybrid_regex);
    if (phyrexian_hybrid_match !== null) {
        return [
            symbol_colour_map[phyrexian_hybrid_match[2]],
            symbol_colour_map[phyrexian_hybrid_match[1]],
            rgb_black()
        ];
    }

    var normal_symbol_regex = /^\{([W,U,B,R,G])\}$/;
    var normal_symbol_match = symbol.match(normal_symbol_regex);
    if (normal_symbol_match !== null) {
        return [symbol_colour_map[normal_symbol_match[1]], rgb_black()];
    }

    if (symbol_length == 2) {
        return [rgb_c, rgb_black()];
    }

    throw new Error("Encountered a symbol that I don't know how to colour: " + symbol);
}

function determineMysticalArchiveColors(symbol, symbol_length) {
    /**
     * Determines the colours of a symbol (represented as Scryfall string) and returns an array of SolidColor objects.
     */

    var symbol_colour_map = {
        "W": hexToSolidColor("7f6821"),
        "U": hexToSolidColor("1b60b8"),
        "B": hexToSolidColor("332e21"),
        "R": hexToSolidColor("de361d"),
        "G": hexToSolidColor("057024"),
        "2": hexToSolidColor("332e21"),
    };

    // 332e21

    // for hybrid symbols with generic mana, use the black symbol colour rather than colourless for B
    const hybrid_symbol_colour_map = {
        "W": symbol_colour_map.W,
        "U": symbol_colour_map.U,
        "B": hexToSolidColor("34243c"),
        "R": symbol_colour_map.R,
        "G": symbol_colour_map.G,
        "2": symbol_colour_map["2"],
    }

    if (symbol === "{E}" || symbol === "{CHAOS}") {
        // energy or chaos symbols
        return [rgb_black()];
    } else if (symbol === "{S}") {
        // snow symbol
        return [rgb_white(), symbol_colour_map["2"], rgb_white()];
    } else if (symbol == "{Q}") {
        // untap symbol
        return [rgb_black(), rgb_white()];
    }

    var phyrexian_regex = /^\{([W,U,B,R,G])\/P\}$/;
    var phyrexian_match = symbol.match(phyrexian_regex);
    if (phyrexian_match !== null) {
        // done
        return [rgb_white(), hybrid_symbol_colour_map[phyrexian_match[1]]];
    }

    var hybrid_regex = /^\{([2,W,U,B,R,G])\/([W,U,B,R,G])\}$/;
    var hybrid_match = symbol.match(hybrid_regex);
    if (hybrid_match !== null) {
        var colour_map = symbol_colour_map;
        if (hybrid_match[1] == "2") {
            // Use the darker colour for black's symbols for 2/B hybrid symbols
            colour_map = hybrid_symbol_colour_map;
        }
        // done
        return [
            colour_map[hybrid_match[2]],
            colour_map[hybrid_match[1]],
            rgb_white(),
            rgb_white()
        ];
    }

    // Phyrexian hybrid mana
    var phyrexian_hybrid_regex = /^\{([W,U,B,R,G])\/([W,U,B,R,G])\/P\}$/;
    var phyrexian_hybrid_match = symbol.match(phyrexian_hybrid_regex);
    if (phyrexian_hybrid_match !== null) {
        // done
        return [
            symbol_colour_map[phyrexian_hybrid_match[2]],
            symbol_colour_map[phyrexian_hybrid_match[1]],
            rgb_white()
        ];
    }

    var normal_symbol_regex = /^\{([W,U,B,R,G])\}$/;
    var normal_symbol_match = symbol.match(normal_symbol_regex);
    if (normal_symbol_match !== null) {
        // done
        return [rgb_white(), symbol_colour_map[normal_symbol_match[1]]];
    }

    if (symbol_length == 2) {
        // done
        return [rgb_white(), symbol_colour_map["2"]];
    }

    throw new Error("Encountered a symbol that I don't know how to colour: " + symbol);
}

function format_symbol(primary_action_list, starting_layer_ref, symbol_index, symbol_colours, layer_font_size) {
    /**
     * Formats an n-character symbol at the specified index (symbol length determined from symbol_colours).
     */

    var current_ref = starting_layer_ref;
    for (var i = 0; i < symbol_colours.length; i++) {

        var color = symbol_colours[i];

        primary_action_list.putObject(charIDToTypeID("Txtt"), current_ref);
        desc1 = new ActionDescriptor();
        desc1.putInteger(charIDToTypeID("From"), symbol_index + i);
        desc1.putInteger(charIDToTypeID("T   "), symbol_index + i + 1);

        desc2 = new ActionDescriptor();
        desc2.putString(stringIDToTypeID("fontPostScriptName"), font_name_ndpmtg);  // NDPMTG font name
        desc2.putString(charIDToTypeID("FntN"), font_name_ndpmtg);  // NDPMTG font name
        desc2.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pnt"), layer_font_size);
        desc2.putBoolean(stringIDToTypeID("autoLeading"), false);
        desc2.putUnitDouble(charIDToTypeID("Ldng"), charIDToTypeID("#Pnt"), layer_font_size);

        desc3 = new ActionDescriptor();
        desc3.putDouble(charIDToTypeID("Rd  "), color.rgb.red);  // rgb value.red
        desc3.putDouble(charIDToTypeID("Grn "), color.rgb.green);  // rgb value.green
        desc3.putDouble(charIDToTypeID("Bl  "), color.rgb.blue);  // rgb value.blue

        desc2.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), desc3);
        desc1.putObject(charIDToTypeID("TxtS"), charIDToTypeID("TxtS"), desc2);
        current_ref = desc1;
    }
    return current_ref;
}

function format_text(layer, input_string, italics_strings, flavour_index, is_centred, mysticalArchive) {
    /**
     * Inserts the given string into the active layer and formats it according to function parameters with symbols 
     * from the NDPMTG font.
     * @param {str} input_string The string to insert into the active layer
     * @param {Array[str]} italic_strings An array containing strings that are present in the main input string and should be italicised
     * @param {int} flavour_index The index at which linebreak spacing should be increased and any subsequent chars should be italicised (where the card's flavour text begins)
     * @param {boolean} is_centred Whether or not the input text should be centre-justified
     */

    // record the layer's justification before modifying the layer in case it's reset along the way
    app.activeDocument.activeLayer = layer;
    var layer_justification = layer.textItem.justification;

    var myFontSize = layer.textItem.size * getFontResolutionScalar();

    // TODO: check that the active layer is a text layer, and raise an issue if not
    if (flavour_index > 0) {
        var quote_index = input_string.indexOf("\r", flavour_index + 3);
    }

    // Locate symbols and update the input string
    var ret = locate_symbols(input_string);
    input_string = ret.input_string;
    var symbol_indices = ret.symbol_indices;

    // Locate italics text indices
    var italics_indices = locate_italics(input_string, italics_strings);

    // Prepare action descriptor and reference variables
    var layer_font_size = myFontSize;
    var layer_text_colour = layer.textItem.color;

    var ref101 = new ActionReference();
    ref101.putEnumerated(charIDToTypeID("TxLr"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var desc119 = new ActionDescriptor();
    desc119.putReference(charIDToTypeID("null"), ref101);

    var primary_action_descriptor = new ActionDescriptor();
    primary_action_descriptor.putString(charIDToTypeID("Txt "), input_string);
    var primary_action_list = new ActionList();

    desc25 = new ActionDescriptor();
    desc25.putInteger(charIDToTypeID("From"), 0);
    desc25.putInteger(charIDToTypeID("T   "), input_string.length);

    desc26 = new ActionDescriptor();
    desc26.putString(stringIDToTypeID("fontPostScriptName"), font_name_mplantin);  // MPlantin font name
    desc26.putString(charIDToTypeID("FntN"), font_name_mplantin);  // MPlantin font name
    desc26.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pnt"), layer_font_size);

    desc27 = new ActionDescriptor();
    desc27.putDouble(charIDToTypeID("Rd  "), layer_text_colour.rgb.red);  // text colour.red
    desc27.putDouble(charIDToTypeID("Grn "), layer_text_colour.rgb.green);  // text colour.green
    desc27.putDouble(charIDToTypeID("Bl  "), layer_text_colour.rgb.blue);  // text colour.blue
    desc26.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), desc27);

    desc26.putBoolean(stringIDToTypeID("autoLeading"), false);
    desc26.putUnitDouble(charIDToTypeID("Ldng"), charIDToTypeID("#Pnt"), layer_font_size);
    desc25.putObject(charIDToTypeID("TxtS"), charIDToTypeID("TxtS"), desc26);

    var current_layer_ref = desc25;

    for (i = 0; i < italics_indices.length; i++) {
        // Italics text
        primary_action_list.putObject(charIDToTypeID("TxtS"), current_layer_ref);
        desc125 = new ActionDescriptor();
        desc125.putInteger(charIDToTypeID("From"), italics_indices[i].start_index);  // italics start index
        desc125.putInteger(charIDToTypeID("T   "), italics_indices[i].end_index);  // italics end index

        desc126 = new ActionDescriptor();
        desc126.putString(stringIDToTypeID("fontPostScriptName"), font_name_mplantin_italic);  // MPlantin italic font name
        desc126.putString(charIDToTypeID("FntN"), font_name_mplantin_italic);  // MPlantin italic font name
        desc126.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pnt"), layer_font_size);
        desc126.putBoolean(stringIDToTypeID("autoLeading"), false);
        desc126.putUnitDouble(charIDToTypeID("Ldng"), charIDToTypeID("#Pnt"), layer_font_size);

        desc127 = new ActionDescriptor();
        desc127.putDouble(charIDToTypeID("Rd  "), text_colour.rgb.red);  // text colour.red
        desc127.putDouble(charIDToTypeID("Grn "), text_colour.rgb.green);  // text colour.green
        desc127.putDouble(charIDToTypeID("Bl  "), text_colour.rgb.blue);  // text colour.blue

        desc126.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), desc127);
        desc125.putObject(charIDToTypeID("TxtS"), charIDToTypeID("TxtS"), desc126);
        current_layer_ref = desc125;
    }

    // Format each symbol correctly
    for (i = 0; i < symbol_indices.length; i++) {
        var symbolIndex = symbol_indices[i];

        if (mysticalArchive) {
            var symbolColors = determineMysticalArchiveColors(symbolIndex.symbol, symbolIndex.symbol_chars.length);
        } else {
            var symbolColors = determine_symbol_colours(symbolIndex.symbol, symbolIndex.symbol_chars.length);
        }

        current_layer_ref = format_symbol(primary_action_list, current_layer_ref,
            symbolIndex.index, symbolColors, layer_font_size);
    }

    primary_action_list.putObject(charIDToTypeID("Txtt"), current_layer_ref);
    primary_action_descriptor.putList(charIDToTypeID("Txtt"), primary_action_list);

    // paragraph formatting
    var list13 = new ActionList();

    var desc141 = new ActionDescriptor();
    desc141.putInteger(charIDToTypeID("From"), 0);
    desc141.putInteger(charIDToTypeID("T   "), input_string.length);  // input string length

    var desc142 = new ActionDescriptor();
    desc142.putUnitDouble(stringIDToTypeID("firstLineIndent"), charIDToTypeID("#Pnt"), 0.000000);
    desc142.putUnitDouble(stringIDToTypeID("startIndent"), charIDToTypeID("#Pnt"), 0.000000);
    desc142.putUnitDouble(stringIDToTypeID("endIndent"), charIDToTypeID("#Pnt"), 0.000000);
    // line break lead
    desc142.putUnitDouble(stringIDToTypeID("spaceBefore"), charIDToTypeID("#Pnt"), is_centred ? 0 : line_break_lead);
    desc142.putUnitDouble(stringIDToTypeID("spaceAfter"), charIDToTypeID("#Pnt"), 0.000000);
    desc142.putInteger(stringIDToTypeID("dropCapMultiplier"), 1);
    desc142.putEnumerated(stringIDToTypeID("leadingType"), stringIDToTypeID("leadingType"), stringIDToTypeID("leadingBelow"));

    var desc143 = new ActionDescriptor();
    desc143.putString(stringIDToTypeID("fontPostScriptName"), font_name_ndpmtg);  // NDPMTG font name
    desc143.putString(charIDToTypeID("FntN"), font_name_mplantin);  // MPlantin font name
    desc143.putBoolean(stringIDToTypeID("autoLeading"), false);

    primary_action_descriptor.putList(stringIDToTypeID("paragraphStyleRange"), list13);

    var list14 = new ActionList();
    primary_action_descriptor.putList(stringIDToTypeID("kerningRange"), list14);
    list13 = new ActionList();

    if (input_string.indexOf("\u2022") >= 0) {
        // Modal card with bullet points - adjust the formatting slightly
        var startIndexBullet = input_string.indexOf("\u2022");
        var endIndexBullet = input_string.lastIndexOf("\u2022");
        list13 = new ActionList();
        desc141 = new ActionDescriptor();
        desc141.putInteger(charIDToTypeID("From"), startIndexBullet);
        desc141.putInteger(charIDToTypeID("T   "), endIndexBullet + 1);
        desc142.putUnitDouble(stringIDToTypeID("firstLineIndent"), charIDToTypeID("#Pnt"), -modal_indent); // negative modal indent
        desc142.putUnitDouble(stringIDToTypeID("startIndent"), charIDToTypeID("#Pnt"), modal_indent); // modal indent
        desc142.putUnitDouble(stringIDToTypeID("spaceBefore"), charIDToTypeID("#Pnt"), 1.0);
        desc142.putUnitDouble(stringIDToTypeID("spaceAfter"), charIDToTypeID("#Pnt"), 0.000000);

        desc143 = new ActionDescriptor();
        desc143.putString(stringIDToTypeID("fontPostScriptName"), font_name_ndpmtg);  // NDPMTG font name
        desc143.putString(charIDToTypeID("FntN"), font_name_mplantin);
        desc143.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pnt"), 11.998500);  // TODO: what's this?
        desc143.putBoolean(stringIDToTypeID("autoLeading"), false);

        desc142.putObject(stringIDToTypeID("defaultStyle"), charIDToTypeID("TxtS"), desc143);
        desc141.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), desc142);
        list13.putObject(stringIDToTypeID("paragraphStyleRange"), desc141);
        primary_action_descriptor.putList(stringIDToTypeID("paragraphStyleRange"), list13);

        list14 = new ActionList();
        primary_action_descriptor.putList(stringIDToTypeID("kerningRange"), list14);
    }

    if (flavour_index > 0) {
        // Adjust line break spacing if there's a line break in the flavour text
        desc141 = new ActionDescriptor();
        desc141.putInteger(charIDToTypeID("From"), flavour_index + 3);
        desc141.putInteger(charIDToTypeID("T   "), flavour_index + 4);
        desc142.putUnitDouble(stringIDToTypeID("firstLineIndent"), charIDToTypeID("#Pnt"), 0);
        desc142.putUnitDouble(stringIDToTypeID("impliedFirstLineIndent"), charIDToTypeID("#Pnt"), 0);
        desc142.putUnitDouble(stringIDToTypeID("startIndent"), charIDToTypeID("#Pnt"), 0);
        desc142.putUnitDouble(stringIDToTypeID("impliedStartIndent"), charIDToTypeID("#Pnt"), 0);
        idspaceBefore = stringIDToTypeID("spaceBefore");
        desc142.putUnitDouble(stringIDToTypeID("spaceBefore"), charIDToTypeID("#Pnt"), flavour_text_lead);  // lead size between rules text and flavour text
        desc141.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), desc142);
        list13.putObject(stringIDToTypeID("paragraphStyleRange"), desc141);
        primary_action_descriptor.putList(stringIDToTypeID("paragraphStyleRange"), list13);
        list14 = new ActionList();
        primary_action_descriptor.putList(stringIDToTypeID("kerningRange"), list14);
    }

    if (quote_index > 0) {
        // Adjust line break spacing if there's a line break in the flavour text
        desc141 = new ActionDescriptor();
        desc141.putInteger(charIDToTypeID("From"), quote_index + 3);
        desc141.putInteger(charIDToTypeID("T   "), input_string.length);
        desc142.putUnitDouble(stringIDToTypeID("spaceBefore"), charIDToTypeID("#Pnt"), 0);
        desc141.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), desc142);
        list13.putObject(stringIDToTypeID("paragraphStyleRange"), desc141);
        primary_action_descriptor.putList(stringIDToTypeID("paragraphStyleRange"), list13);
        list14 = new ActionList();
        primary_action_descriptor.putList(stringIDToTypeID("kerningRange"), list14);
    }

    // Push changes to document
    desc119.putObject(charIDToTypeID("T   "), charIDToTypeID("TxLr"), primary_action_descriptor);
    app.refresh();
    executeAction(charIDToTypeID("setd"), desc119, DialogModes.NO);

    // Reset layer's justification and disable hypenation
    app.activeDocument.activeLayer.textItem.justification = layer_justification;
    app.activeDocument.activeLayer.textItem.hyphenation = false;
}

function mysticalArchiveMana(manaCost) {
    var manaSymbols = manaCost.split("{").reverse();

    // setStroke(originalManaSymbol, hexToSolidColor(this.manaColors.R), 4, 100);
    var originalManaSymbol = app.activeDocument
        .layers.getByName(LayerNames.TEXT_AND_ICONS)
        .layers.getByName(LayerNames.MANA_COST + " Group")
        .layers.getByName(LayerNames.MANA_COST);

    originalManaSymbol.visible = true;
    app.activeDocument.activeLayer = originalManaSymbol;

    // filter out ""
    const emptyStringIndex = array_index(manaSymbols, "");
    if (emptyStringIndex > -1) { // only splice array when item is found
        manaSymbols.splice(emptyStringIndex, 1); // 2nd parameter means remove one item only
    }

    var leftBound = 0;
    for (var i in manaSymbols) {
        var manaSymbol = "{" + manaSymbols[i];
        var layerName = LayerNames.MANA_COST + i;

        // duplicate mana layer
        var layer = originalManaSymbol.duplicate(app.activeDocument, ElementPlacement.INSIDE);
        layer.name = layerName;
        layer.moveAfter(originalManaSymbol);

        format_text(layer, manaSymbol, [], -1, false, true);

        var ret = locate_symbols(manaSymbol);
        var symbolIndex = ret.symbol_indices[0];
        var symbolColors = determineMysticalArchiveColors(symbolIndex.symbol, symbolIndex.symbol_chars.length);

        var realColors = [];
        for (var colorIndex in symbolColors) {
            var c = symbolColors[colorIndex];
            if (!in_array(["000000", "FFFFFF"], c.rgb.hexValue)) {
                realColors.push(c);
            }
        }

        if (realColors.length != 1) toggleStroke(layer);
        else setStroke(layer, realColors[0], 4, 100);

        if (i > 0) {
            layer.translate(leftBound - compute_text_layer_dimensions(layer).right - 2, 0);
        }
        leftBound = compute_text_layer_dimensions(layer).left;
    }
    originalManaSymbol.visible = false;
}

function generate_italics(card_text) {
    /**
     * Generates italics text array from card text to italicise all text within (parentheses) and all ability words.
     */

    var reminder_text = true;
    var italic_text = [];
    end_index = 0;
    while (reminder_text) {
        start_index = card_text.indexOf("(", end_index);
        if (start_index >= 0) {
            end_index = card_text.indexOf(")", start_index + 1);
            italic_text.push(card_text.slice(start_index, end_index + 1));
        } else {
            reminder_text = false;
        }
    }

    // Attach all ability words to the italics array
    for (var i = 0; i < ability_words.length; i++) {
        italic_text.push(ability_words[i] + " \u2014");  // Include em dash
    }

    return italic_text;
}

function format_text_wrapper() {
    /**
     * Wrapper for format_text which runs the function with the active layer's current text contents and auto-generated italics array.
     * Flavour text index and centred text not supported.
     * Super useful to add as a script action in Photoshop for making cards manually!
     */

    var card_text = app.activeDocument.activeLayer.textItem.contents;
    var italic_text = generate_italics(card_text);
    format_text(card_text, italic_text, -1, false);
}

function getFontResolutionScalar() {
    return 72 / app.activeDocument.resolution;
}
