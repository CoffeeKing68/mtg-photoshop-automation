var filePath = File($.fileName).parent.parent.fsName;

function rgb_black() {
    /**
     * Creates and returns a SolidColour with RGB values for solid black.
     */

    var colour = new SolidColor();
    colour.rgb.red = 0;
    colour.rgb.green = 0;
    colour.rgb.blue = 0;
    return colour;
}

function rgb_white() {
    /**
     * Creates and returns a SolidColour with RGB values for solid white.
     */

    var colour = new SolidColor();
    colour.rgb.red = 255;
    colour.rgb.green = 255;
    colour.rgb.blue = 255;
    return colour;
}

function compute_layer_dimensions(layer) {
    /**
     * Return an object with the specified layer's width and height (computed from its bounds).
     */

    return {
        left: layer.bounds[0].as("px"),
        right: layer.bounds[2].as("px"),
        top: layer.bounds[3].as("px"),
        bottom: layer.bounds[1].as("px"),
        width: layer.bounds[2].as("px") - layer.bounds[0].as("px"),
        height: layer.bounds[3].as("px") - layer.bounds[1].as("px"),
    };
}

function compute_text_layer_dimensions(layer) {
    /**
     * Return an object with the specified text layer's width and height, which is achieved by rasterising
     * the layer and computing its width and height from its bounds.
     */
    var layer_copy = layer.duplicate(app.activeDocument, ElementPlacement.INSIDE);
    layer_copy.rasterize(RasterizeType.TEXTCONTENTS);
    rasterizeLayerStyle(layer_copy);
    var dimensions = compute_layer_dimensions(layer_copy);
    layer_copy.remove();

    return dimensions;
}

function compute_text_layer_bounds(layer) {
    /**
     * Return an object with the specified text layer's bounding box.
     */

    var layer_copy = layer.duplicate(activeDocument, ElementPlacement.INSIDE);
    layer_copy.rasterize(RasterizeType.TEXTCONTENTS);
    var layer_bounds = layer_copy.bounds;
    layer_copy.remove();
    return layer_bounds;
}

function select_layer_pixels(layer) {
    /**
     * Select the bounding box of a given layer.
     */

    var left = layer.bounds[0].as("px");
    var top = layer.bounds[1].as("px");
    var right = layer.bounds[2].as("px");
    var bottom = layer.bounds[3].as("px");

    app.activeDocument.selection.select([
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
    ]);
}

function clear_selection() {
    /**
     * Clear the current selection.
     */

    app.activeDocument.selection.select([]);
}

function align(align_type, layer) {
    /**
     * Align the currently active layer with respect to the current selection, either vertically or horizontally.
     * Intended to be used with align_vertical() or align_horizontal().
     */

    if (layer) {
        var activeLayer = app.activeDocument.activeLayer;
        app.activeDocument.activeLayer = layer;
    }

    var idAlgn = charIDToTypeID("Algn");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref.putEnumerated(idLyr, idOrdn, idTrgt);
    desc.putReference(idnull, ref);
    var idUsng = charIDToTypeID("Usng");
    var idADSt = charIDToTypeID("ADSt");
    var idAdCH = charIDToTypeID(align_type);  // align type - "AdCV" for vertical, "AdCH" for horizontal
    desc.putEnumerated(idUsng, idADSt, idAdCH);
    executeAction(idAlgn, desc, DialogModes.NO);

    if (layer) {
        app.activeDocument.activeLayer = activeLayer;
    }
}

function align_vertical(layer) {
    /**
     * Align the currently active layer vertically with respect to the current selection.
     */

    align("AdCV", layer);
}

function align_horizontal(layer) {
    /**
     * Align the currently active layer horizontally with respect to the current selection.
     */

    align("AdCH", layer);
}

function frame_layer(layer, reference_layer) {
    /**
     * Scale a layer equally to the bounds of a reference layer, then centre the layer vertically and horizontally
     * within those bounds.
     */

    var layer_dimensions = compute_layer_dimensions(layer);
    var reference_dimensions = compute_layer_dimensions(reference_layer);

    // Determine how much to scale the layer by such that it fits into the reference layer's bounds
    var scale_factor = 100 * Math.max(reference_dimensions.width / layer_dimensions.width, reference_dimensions.height / layer_dimensions.height);
    layer.resize(scale_factor, scale_factor, AnchorPosition.TOPLEFT);

    select_layer_pixels(reference_layer);

    align_horizontal(layer);
    align_vertical(layer);
    clear_selection();
}

function set_active_layer_mask(visible) {
    /**
     * Set the visibility of the active layer's layer mask.
     */

    var idsetd = charIDToTypeID("setd");
    var desc3078 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1567 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref1567.putEnumerated(idLyr, idOrdn, idTrgt);
    desc3078.putReference(idnull, ref1567);
    var idT = charIDToTypeID("T   ");
    var desc3079 = new ActionDescriptor();
    var idUsrM = charIDToTypeID("UsrM");
    desc3079.putBoolean(idUsrM, visible);
    var idLyr = charIDToTypeID("Lyr ");
    desc3078.putObject(idT, idLyr, desc3079);
    executeAction(idsetd, desc3078, DialogModes.NO);
}

function enable_active_layer_mask() {
    /**
     * Enables the active layer's layer mask.
     */

    set_active_layer_mask(true);
}

function disable_active_layer_mask() {
    /**
     * Disables the active layer's layer mask.
     */

    set_active_layer_mask(false);
}

function set_active_vector_mask(visible) {
    /**
     * Set the visibility of the active layer's vector mask.
     */

    var idsetd = charIDToTypeID("setd");
    var desc248 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref138 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref138.putEnumerated(idLyr, idOrdn, idTrgt);
    desc248.putReference(idnull, ref138);
    var idT = charIDToTypeID("T   ");
    var desc249 = new ActionDescriptor();
    var idvectorMaskEnabled = stringIDToTypeID("vectorMaskEnabled");
    desc249.putBoolean(idvectorMaskEnabled, visible);
    var idLyr = charIDToTypeID("Lyr ");
    desc248.putObject(idT, idLyr, desc249);
    executeAction(idsetd, desc248, DialogModes.NO);
}

function enable_active_vector_mask() {
    /**
     * Enables the active layer's vector mask.
     */

    set_active_vector_mask(true);
}

function disable_active_vector_mask() {
    /**
     * Disables the active layer's vector mask.
     */

    set_active_vector_mask(false);
}

function apply_stroke(stroke_weight, stroke_colour) {
    /**
     * Applies an outer stroke to the active layer with the specified weight and colour.
     */

    idsetd = charIDToTypeID("setd");
    var desc608 = new ActionDescriptor();
    idnull = charIDToTypeID("null");
    var ref149 = new ActionReference();
    var idPrpr = charIDToTypeID("Prpr");
    idLefx = charIDToTypeID("Lefx");
    ref149.putProperty(idPrpr, idLefx);
    idLyr = charIDToTypeID("Lyr ");
    idOrdn = charIDToTypeID("Ordn");
    idTrgt = charIDToTypeID("Trgt");
    ref149.putEnumerated(idLyr, idOrdn, idTrgt);
    desc608.putReference(idnull, ref149);
    idT = charIDToTypeID("T   ");
    var desc609 = new ActionDescriptor();
    var idScl = charIDToTypeID("Scl ");
    idPrc = charIDToTypeID("#Prc");
    desc609.putUnitDouble(idScl, idPrc, 200.000000);
    idFrFX = charIDToTypeID("FrFX");
    var desc610 = new ActionDescriptor();
    var idenab = charIDToTypeID("enab");
    desc610.putBoolean(idenab, true);
    var idStyl = charIDToTypeID("Styl");
    var idFStl = charIDToTypeID("FStl");
    var idInsF = charIDToTypeID("OutF");
    desc610.putEnumerated(idStyl, idFStl, idInsF);
    idPntT = charIDToTypeID("PntT");
    var idFrFl = charIDToTypeID("FrFl");
    var idSClr = charIDToTypeID("SClr");
    desc610.putEnumerated(idPntT, idFrFl, idSClr);
    var idMd = charIDToTypeID("Md  ");
    idBlnM = charIDToTypeID("BlnM");
    var idNrml = charIDToTypeID("Nrml");
    desc610.putEnumerated(idMd, idBlnM, idNrml);
    idOpct = charIDToTypeID("Opct");
    idPrc = charIDToTypeID("#Prc");
    desc610.putUnitDouble(idOpct, idPrc, 100.000000);
    var idSz = charIDToTypeID("Sz  ");
    var idPxl = charIDToTypeID("#Pxl");
    desc610.putUnitDouble(idSz, idPxl, stroke_weight);
    idClr = charIDToTypeID("Clr ");
    var desc611 = new ActionDescriptor();
    idRd = charIDToTypeID("Rd  ");
    desc611.putDouble(idRd, stroke_colour.rgb.red);
    idGrn = charIDToTypeID("Grn ");
    desc611.putDouble(idGrn, stroke_colour.rgb.green);
    idBl = charIDToTypeID("Bl  ");
    desc611.putDouble(idBl, stroke_colour.rgb.blue);
    idRGBC = charIDToTypeID("RGBC");
    desc610.putObject(idClr, idRGBC, desc611);
    idFrFX = charIDToTypeID("FrFX");
    desc609.putObject(idFrFX, idFrFX, desc610);
    idLefx = charIDToTypeID("Lefx");
    desc608.putObject(idT, idLefx, desc609);
    executeAction(idsetd, desc608, DialogModes.NO);
}

function save_and_close(file_name, file_path) {
    /**
     * Saves the current document to the output folder (/out/) as a PNG and closes the document without saving.
     */

    var idsave = charIDToTypeID("save");
    var desc3 = new ActionDescriptor();
    var idAs = charIDToTypeID("As  ");
    var desc4 = new ActionDescriptor();
    var idPGIT = charIDToTypeID("PGIT");
    var idPGIN = charIDToTypeID("PGIN");
    desc4.putEnumerated(idPGIT, idPGIT, idPGIN);
    var idPNGf = charIDToTypeID("PNGf");
    var idPGAd = charIDToTypeID("PGAd");
    desc4.putEnumerated(idPNGf, idPNGf, idPGAd);
    var idPNGF = charIDToTypeID("PNGF");
    desc3.putObject(idAs, idPNGF, desc4);
    var idIn = charIDToTypeID("In  ");
    var file_name_with_path = file_path + '/out/' + file_name + '.png';
    desc3.putPath(idIn, new File(file_name_with_path));
    var idCpy = charIDToTypeID("Cpy ");
    desc3.putBoolean(idCpy, true);
    executeAction(idsave, desc3, DialogModes.NO);

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function strip_reminder_text(oracle_text) {
    /**
     * Strip out any reminder text that a card's oracle text has (reminder text in parentheses).
     * If this would empty the string, instead return the original string.
     */

    var oracle_text_stripped = oracle_text;
    var parentheses_regex = /\(.*?\)/g;
    oracle_text_stripped = oracle_text_stripped.replace(parentheses_regex, "");

    // ensure we didn't add any double whitespace by doing that
    var whitespace_regex = / +/g;
    oracle_text_stripped = oracle_text_stripped.replace(whitespace_regex, " ");
    if (oracle_text_stripped !== "") {
        return oracle_text_stripped;
    }
    return oracle_text;
}

function get_text_layer_colour(layer) {
    /**
     * Occasionally, Photoshop has issues with retrieving the colour of a text layer. This helper guards
     * against errors and null values by defaulting to rgb_black() in the event of a problem.
     */

    var text_layer_colour;
    try {
        text_layer_colour = layer.textItem.color;
        if (text_layer_colour === undefined || text_layer_colour === null) {
            text_layer_colour = rgb_black();
        }
    } catch (err) {
        text_layer_colour = rgb_black();
    }
    return text_layer_colour;
}

function create_new_layer(layer_name) {
    /**
     * Creates a new layer below the currently active layer. The layer will be visible.
     */
    if (layer_name === undefined) {
        layername = "Layer";
    }

    // create new layer at top of layers
    var active_layer = app.activeDocument.activeLayer;
    var layer = app.activeDocument.artLayers.add();

    // name it & set blend mode to normal
    layer.name = layer_name;
    layer.blendMode = BlendMode.NORMAL;
    layer.visible = true;

    // Move the layer below
    layer.moveAfter(active_layer);

    return layer;
}

function array_index(array, thing) {
    /**
     * Get the first index of thing in array, since Extendscript doesn't come with this.
     */

    if (array !== null && array !== undefined) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === thing) {
                return i;
            }
        }
    }
    return -1;
}

function in_array(array, thing) {
    /**
     * Returns true if thing in array.
     */

    return array_index(array, thing) >= 0;
}

function replace_text(layer, replace_this, replace_with) {
    /**
     * Replace all instances of `replace_this` in the specified layer with `replace_with`.
     */
    var state = rememberActiveLayerState();

    app.activeDocument.activeLayer = layer;

    var idreplace = stringIDToTypeID("replace");
    var desc22 = new ActionDescriptor();
    idnull = charIDToTypeID("null");
    var ref3 = new ActionReference();
    var idPrpr = charIDToTypeID("Prpr");
    idreplace = stringIDToTypeID("replace");
    ref3.putProperty(idPrpr, idreplace);
    idTxLr = charIDToTypeID("TxLr");
    idOrdn = charIDToTypeID("Ordn");
    var idAl = charIDToTypeID("Al  ");
    ref3.putEnumerated(idTxLr, idOrdn, idAl);
    desc22.putReference(idnull, ref3);
    var idUsng = charIDToTypeID("Usng");
    var desc23 = new ActionDescriptor();
    var idfind = stringIDToTypeID("find");
    desc23.putString(idfind, replace_this);
    idreplace = stringIDToTypeID("replace");
    desc23.putString(idreplace, replace_with);
    var idcheckAll = stringIDToTypeID("checkAll");
    desc23.putBoolean(idcheckAll, true);
    var idFwd = charIDToTypeID("Fwd ");
    desc23.putBoolean(idFwd, true);
    var idcaseSensitive = stringIDToTypeID("caseSensitive");
    desc23.putBoolean(idcaseSensitive, false);
    var idwholeWord = stringIDToTypeID("wholeWord");
    desc23.putBoolean(idwholeWord, false);
    var idignoreAccents = stringIDToTypeID("ignoreAccents");
    desc23.putBoolean(idignoreAccents, true);
    var idfindReplace = stringIDToTypeID("findReplace");
    desc22.putObject(idUsng, idfindReplace, desc23);
    executeAction(idreplace, desc22, DialogModes.NO);

    restoreActiveLayerState(state);
}

function rememberActiveLayerState() {
    return {
        layer: app.activeDocument.activeLayer,
        visible: app.activeDocument.activeLayer.visible,
    };
}

function restoreActiveLayerState(state) {
    app.activeDocument.activeLayer = state.layer;
    app.activeDocument.activeLayer.visible = state.visible;
}

function paste_file(layer, file) {
    /**
     * Pastes the given file into the specified layer.
     */

    var state = rememberActiveLayerState();
    // var prev_active_layer = app.activeDocument.activeLayer;
    // var visible = 
    app.activeDocument.activeLayer = layer;

    app.load(file);
    // note context switch to art file
    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    // note context switch back to template
    app.activeDocument.paste();

    // return document to previous state
    // app.activeDocument.activeLayer = prev_active_layer;
    restoreActiveLayerState(state);
}

function paste_file_into_new_layer(file) {
    /**
     * Wrapper for paste_file which creates a new layer for the file next to the active layer. Returns the new layer.
     */

    var new_layer = create_new_layer("New Layer");
    paste_file(new_layer, file);
    return new_layer;
}

function retrieve_scryfall_scan(image_url, file_path) {
    /**
     * Calls the Python script which queries Scryfall for full-res scan and saves the resulting jpeg to disk in \scripts.
     * Returns a File object for the scan if the Python call was successful, or raises an error if it wasn't.
     */

    // default to Windows command
    var scryfall_scan_command = python_command + " \"" + file_path + "/scripts/get_card_scan.py\" \"" + image_url + "\"";
    app.system(scryfall_scan_command);
    return new File(file_path + image_file_path);
}

function insert_scryfall_scan(image_url, file_path) {
    /**
     * Downloads the specified scryfall scan and inserts it into a new layer next to the active layer. Returns the new layer.
     */

    var scryfall_scan = retrieve_scryfall_scan(image_url, file_path);
    return paste_file_into_new_layer(scryfall_scan);
}

function revertDocument() {
    if (app.activeDocument.activeHistoryState) {
        var idRvrt = charIDToTypeID("Rvrt");
        executeAction(idRvrt, undefined, DialogModes.NO);
    }
}

function saveSmallImage(saveLocation, cardSaveName) {
    var docRef = app.activeDocument;

    // our web export options
    var options = new ExportOptionsSaveForWeb();
    options.quality = 0;
    options.lossy = 100;
    options.format = SaveDocumentType.JPEG;
    options.optimized = false;

    var filename = saveLocation + "/" + cardSaveName + '.jpg';

    docRef.exportDocument(File(filename), ExportType.SAVEFORWEB, options);

    renameFromWeb(filename);

    docRef.close(SaveOptions.DONOTSAVECHANGES);
}

function renameFromWeb(filename) {
    var saveForWebName = filename.replace(/\s/g, "-");
    var savedImage = new File(saveForWebName);

    var correctFile = new File(filename);

    if ((saveForWebName != filename)) {
        if ((savedImage.exists)) {
            // log("webfile exists");
            if (correctFile.exists) {
                // log("previous file exists");
                correctFile.remove();
            }
            savedImage.rename(correctFile.name);
        }
    }
}

function saveJpgImage(location, cardName) {
    var docRef = app.activeDocument;

    var jpgOptions = new JPEGSaveOptions();
    jpgOptions.quality = 0;
    jpgOptions.embedColorProfile = false;
    jpgOptions.formatOptions = FormatOptions.OPTIMIZEDBASELINE;
    jpgOptions.matte = MatteType.NONE;

    var filename = location + "/" + cardName + '.jpg';

    docRef.saveAs(new File(filename), jpgOptions, true, Extension.LOWERCASE);

}

function savePngImage(location, cardName) {
    var docRef = app.activeDocument;
    // ----------Save as PNG in the out folder ----------
    var idsave = charIDToTypeID("save");
    var desc3 = new ActionDescriptor();
    var idAs = charIDToTypeID("As  ");
    var desc4 = new ActionDescriptor();
    var idPGIT = charIDToTypeID("PGIT");
    var idPGIN = charIDToTypeID("PGIN");
    desc4.putEnumerated(idPGIT, idPGIT, idPGIN);
    var idPNGf = charIDToTypeID("PNGf");
    var idPGAd = charIDToTypeID("PGAd");
    desc4.putEnumerated(idPNGf, idPNGf, idPGAd);
    var idPNGF = charIDToTypeID("PNGF");
    desc3.putObject(idAs, idPNGF, desc4);
    var idIn = charIDToTypeID("In  ");

    var filename = location + "/" + cardName + '.png';

    desc3.putPath(idIn, new File(filename));
    var idCpy = charIDToTypeID("Cpy ");
    desc3.putBoolean(idCpy, true);
    executeAction(idsave, desc3, DialogModes.NO);
}

function removeDicretics(str) {
    var diacriticsMap = {
        '\u0041': 'A', '\u24B6': 'A', '\uFF21': 'A', '\u00C0': 'A', '\u00C1': 'A', '\u00C2': 'A', '\u1EA6': 'A', '\u1EA4': 'A', '\u1EAA': 'A', '\u1EA8': 'A',
        '\u00C3': 'A', '\u0100': 'A', '\u0102': 'A', '\u1EB0': 'A', '\u1EAE': 'A', '\u1EB4': 'A', '\u1EB2': 'A', '\u0226': 'A', '\u01E0': 'A', '\u00C4': 'A',
        '\u01DE': 'A', '\u1EA2': 'A', '\u00C5': 'A', '\u01FA': 'A', '\u01CD': 'A', '\u0200': 'A', '\u0202': 'A', '\u1EA0': 'A', '\u1EAC': 'A', '\u1EB6': 'A',
        '\u1E00': 'A', '\u0104': 'A', '\u023A': 'A', '\u2C6F': 'A',

        '\uA732': 'AA',
        '\u00C6': 'AE', '\u01FC': 'AE', '\u01E2': 'AE',
        '\uA734': 'AO',
        '\uA736': 'AU',
        '\uA738': 'AV', '\uA73A': 'AV',
        '\uA73C': 'AY',
        '\u0042': 'B', '\u24B7': 'B', '\uFF22': 'B', '\u1E02': 'B', '\u1E04': 'B', '\u1E06': 'B', '\u0243': 'B', '\u0182': 'B', '\u0181': 'B',

        '\u0043': 'C', '\u24B8': 'C', '\uFF23': 'C', '\u0106': 'C', '\u0108': 'C', '\u010A': 'C', '\u010C': 'C', '\u00C7': 'C', '\u1E08': 'C', '\u0187': 'C',
        '\u023B': 'C', '\uA73E': 'C',

        '\u0044': 'D', '\u24B9': 'D', '\uFF24': 'D', '\u1E0A': 'D', '\u010E': 'D', '\u1E0C': 'D', '\u1E10': 'D', '\u1E12': 'D', '\u1E0E': 'D', '\u0110': 'D',
        '\u018B': 'D', '\u018A': 'D', '\u0189': 'D', '\uA779': 'D',

        '\u01F1': 'DZ', '\u01C4': 'DZ',
        '\u01F2': 'Dz', '\u01C5': 'Dz',

        '\u0045': 'E', '\u24BA': 'E', '\uFF25': 'E', '\u00C8': 'E', '\u00C9': 'E', '\u00CA': 'E', '\u1EC0': 'E', '\u1EBE': 'E', '\u1EC4': 'E', '\u1EC2': 'E',
        '\u1EBC': 'E', '\u0112': 'E', '\u1E14': 'E', '\u1E16': 'E', '\u0114': 'E', '\u0116': 'E', '\u00CB': 'E', '\u1EBA': 'E', '\u011A': 'E', '\u0204': 'E',
        '\u0206': 'E', '\u1EB8': 'E', '\u1EC6': 'E', '\u0228': 'E', '\u1E1C': 'E', '\u0118': 'E', '\u1E18': 'E', '\u1E1A': 'E', '\u0190': 'E', '\u018E': 'E',

        '\u0046': 'F', '\u24BB': 'F', '\uFF26': 'F', '\u1E1E': 'F', '\u0191': 'F', '\uA77B': 'F',

        '\u0047': 'G', '\u24BC': 'G', '\uFF27': 'G', '\u01F4': 'G', '\u011C': 'G', '\u1E20': 'G', '\u011E': 'G', '\u0120': 'G', '\u01E6': 'G', '\u0122': 'G',
        '\u01E4': 'G', '\u0193': 'G', '\uA7A0': 'G', '\uA77D': 'G', '\uA77E': 'G',

        '\u0048': 'H', '\u24BD': 'H', '\uFF28': 'H', '\u0124': 'H', '\u1E22': 'H', '\u1E26': 'H', '\u021E': 'H', '\u1E24': 'H', '\u1E28': 'H', '\u1E2A': 'H',
        '\u0126': 'H', '\u2C67': 'H', '\u2C75': 'H', '\uA78D': 'H',

        '\u0049': 'I', '\u24BE': 'I', '\uFF29': 'I', '\u00CC': 'I', '\u00CD': 'I', '\u00CE': 'I', '\u0128': 'I', '\u012A': 'I', '\u012C': 'I', '\u0130': 'I',
        '\u00CF': 'I', '\u1E2E': 'I', '\u1EC8': 'I', '\u01CF': 'I', '\u0208': 'I', '\u020A': 'I', '\u1ECA': 'I', '\u012E': 'I', '\u1E2C': 'I', '\u0197': 'I',

        '\u004A': 'J', '\u24BF': 'J', '\uFF2A': 'J', '\u0134': 'J', '\u0248': 'J',

        '\u004B': 'K', '\u24C0': 'K', '\uFF2B': 'K', '\u1E30': 'K', '\u01E8': 'K', '\u1E32': 'K', '\u0136': 'K', '\u1E34': 'K', '\u0198': 'K', '\u2C69': 'K',
        '\uA740': 'K', '\uA742': 'K', '\uA744': 'K', '\uA7A2': 'K',

        '\u004C': 'L', '\u24C1': 'L', '\uFF2C': 'L', '\u013F': 'L', '\u0139': 'L', '\u013D': 'L', '\u1E36': 'L', '\u1E38': 'L', '\u013B': 'L', '\u1E3C': 'L',
        '\u1E3A': 'L', '\u0141': 'L', '\u023D': 'L', '\u2C62': 'L', '\u2C60': 'L', '\uA748': 'L', '\uA746': 'L', '\uA780': 'L',

        '\u01C7': 'LJ',
        '\u01C8': 'Lj',
        '\u004D': 'M', '\u24C2': 'M', '\uFF2D': 'M', '\u1E3E': 'M', '\u1E40': 'M', '\u1E42': 'M', '\u2C6E': 'M', '\u019C': 'M',

        '\u004E': 'N', '\u24C3': 'N', '\uFF2E': 'N', '\u01F8': 'N', '\u0143': 'N', '\u00D1': 'N', '\u1E44': 'N', '\u0147': 'N', '\u1E46': 'N', '\u0145': 'N',
        '\u1E4A': 'N', '\u1E48': 'N', '\u0220': 'N', '\u019D': 'N', '\uA790': 'N', '\uA7A4': 'N',

        '\u01CA': 'NJ',
        '\u01CB': 'Nj',

        '\u004F': 'O', '\u24C4': 'O', '\uFF2F': 'O', '\u00D2': 'O', '\u00D3': 'O', '\u00D4': 'O', '\u1ED2': 'O', '\u1ED0': 'O', '\u1ED6': 'O', '\u1ED4': 'O',
        '\u00D5': 'O', '\u1E4C': 'O', '\u022C': 'O', '\u1E4E': 'O', '\u014C': 'O', '\u1E50': 'O', '\u1E52': 'O', '\u014E': 'O', '\u022E': 'O', '\u0230': 'O',
        '\u00D6': 'O', '\u022A': 'O', '\u1ECE': 'O', '\u0150': 'O', '\u01D1': 'O', '\u020C': 'O', '\u020E': 'O', '\u01A0': 'O', '\u1EDC': 'O', '\u1EDA': 'O',
        '\u1EE0': 'O', '\u1EDE': 'O', '\u1EE2': 'O', '\u1ECC': 'O', '\u1ED8': 'O', '\u01EA': 'O', '\u01EC': 'O', '\u00D8': 'O', '\u01FE': 'O', '\u0186': 'O',
        '\u019F': 'O', '\uA74A': 'O', '\uA74C': 'O',

        '\u01A2': 'OI',
        '\uA74E': 'OO',
        '\u0222': 'OU',
        '\u0050': 'P', '\u24C5': 'P', '\uFF30': 'P', '\u1E54': 'P', '\u1E56': 'P', '\u01A4': 'P', '\u2C63': 'P', '\uA750': 'P', '\uA752': 'P', '\uA754': 'P',
        '\u0051': 'Q', '\u24C6': 'Q', '\uFF31': 'Q', '\uA756': 'Q', '\uA758': 'Q', '\u024A': 'Q',

        '\u0052': 'R', '\u24C7': 'R', '\uFF32': 'R', '\u0154': 'R', '\u1E58': 'R', '\u0158': 'R', '\u0210': 'R', '\u0212': 'R', '\u1E5A': 'R', '\u1E5C': 'R',
        '\u0156': 'R', '\u1E5E': 'R', '\u024C': 'R', '\u2C64': 'R', '\uA75A': 'R', '\uA7A6': 'R', '\uA782': 'R',

        '\u0053': 'S', '\u24C8': 'S', '\uFF33': 'S', '\u1E9E': 'S', '\u015A': 'S', '\u1E64': 'S', '\u015C': 'S', '\u1E60': 'S', '\u0160': 'S', '\u1E66': 'S',
        '\u1E62': 'S', '\u1E68': 'S', '\u0218': 'S', '\u015E': 'S', '\u2C7E': 'S', '\uA7A8': 'S', '\uA784': 'S',

        '\u0054': 'T', '\u24C9': 'T', '\uFF34': 'T', '\u1E6A': 'T', '\u0164': 'T', '\u1E6C': 'T', '\u021A': 'T', '\u0162': 'T', '\u1E70': 'T', '\u1E6E': 'T',
        '\u0166': 'T', '\u01AC': 'T', '\u01AE': 'T', '\u023E': 'T', '\uA786': 'T',

        '\uA728': 'TZ',

        '\u0055': 'U', '\u24CA': 'U', '\uFF35': 'U', '\u00D9': 'U', '\u00DA': 'U', '\u00DB': 'U', '\u0168': 'U', '\u1E78': 'U', '\u016A': 'U', '\u1E7A': 'U',
        '\u016C': 'U', '\u00DC': 'U', '\u01DB': 'U', '\u01D7': 'U', '\u01D5': 'U', '\u01D9': 'U', '\u1EE6': 'U', '\u016E': 'U', '\u0170': 'U', '\u01D3': 'U',
        '\u0214': 'U', '\u0216': 'U', '\u01AF': 'U', '\u1EEA': 'U', '\u1EE8': 'U', '\u1EEE': 'U', '\u1EEC': 'U', '\u1EF0': 'U', '\u1EE4': 'U', '\u1E72': 'U',
        '\u0172': 'U', '\u1E76': 'U', '\u1E74': 'U', '\u0244': 'U',

        '\u0056': 'V', '\u24CB': 'V', '\uFF36': 'V', '\u1E7C': 'V', '\u1E7E': 'V', '\u01B2': 'V', '\uA75E': 'V', '\u0245': 'V',
        '\uA760': 'VY',
        '\u0057': 'W', '\u24CC': 'W', '\uFF37': 'W', '\u1E80': 'W', '\u1E82': 'W', '\u0174': 'W', '\u1E86': 'W', '\u1E84': 'W', '\u1E88': 'W', '\u2C72': 'W',
        '\u0058': 'X', '\u24CD': 'X', '\uFF38': 'X', '\u1E8A': 'X', '\u1E8C': 'X',

        '\u0059': 'Y', '\u24CE': 'Y', '\uFF39': 'Y', '\u1EF2': 'Y', '\u00DD': 'Y', '\u0176': 'Y', '\u1EF8': 'Y', '\u0232': 'Y', '\u1E8E': 'Y', '\u0178': 'Y',
        '\u1EF6': 'Y', '\u1EF4': 'Y', '\u01B3': 'Y', '\u024E': 'Y', '\u1EFE': 'Y',

        '\u005A': 'Z', '\u24CF': 'Z', '\uFF3A': 'Z', '\u0179': 'Z', '\u1E90': 'Z', '\u017B': 'Z', '\u017D': 'Z', '\u1E92': 'Z', '\u1E94': 'Z', '\u01B5': 'Z',
        '\u0224': 'Z', '\u2C7F': 'Z', '\u2C6B': 'Z', '\uA762': 'Z',

        '\u0061': 'a', '\u24D0': 'a', '\uFF41': 'a', '\u1E9A': 'a', '\u00E0': 'a', '\u00E1': 'a', '\u00E2': 'a', '\u1EA7': 'a', '\u1EA5': 'a', '\u1EAB': 'a',
        '\u1EA9': 'a', '\u00E3': 'a', '\u0101': 'a', '\u0103': 'a', '\u1EB1': 'a', '\u1EAF': 'a', '\u1EB5': 'a', '\u1EB3': 'a', '\u0227': 'a', '\u01E1': 'a',
        '\u00E4': 'a', '\u01DF': 'a', '\u1EA3': 'a', '\u00E5': 'a', '\u01FB': 'a', '\u01CE': 'a', '\u0201': 'a', '\u0203': 'a', '\u1EA1': 'a', '\u1EAD': 'a',
        '\u1EB7': 'a', '\u1E01': 'a', '\u0105': 'a', '\u2C65': 'a', '\u0250': 'a',

        '\uA733': 'aa',
        '\u00E6': 'ae', '\u01FD': 'ae', '\u01E3': 'ae',
        '\uA735': 'ao',
        '\uA737': 'au',
        '\uA739': 'av', '\uA73B': 'av',
        '\uA73D': 'ay',
        '\u0062': 'b', '\u24D1': 'b', '\uFF42': 'b', '\u1E03': 'b', '\u1E05': 'b', '\u1E07': 'b', '\u0180': 'b', '\u0183': 'b', '\u0253': 'b',

        '\u0063': 'c', '\u24D2': 'c', '\uFF43': 'c', '\u0107': 'c', '\u0109': 'c', '\u010B': 'c', '\u010D': 'c', '\u00E7': 'c', '\u1E09': 'c', '\u0188': 'c',
        '\u023C': 'c', '\uA73F': 'c', '\u2184': 'c',

        '\u0064': 'd', '\u24D3': 'd', '\uFF44': 'd', '\u1E0B': 'd', '\u010F': 'd', '\u1E0D': 'd', '\u1E11': 'd', '\u1E13': 'd', '\u1E0F': 'd', '\u0111': 'd',
        '\u018C': 'd', '\u0256': 'd', '\u0257': 'd', '\uA77A': 'd',

        '\u01F3': 'dz', '\u01C6': 'dz',

        '\u0065': 'e', '\u24D4': 'e', '\uFF45': 'e', '\u00E8': 'e', '\u00E9': 'e', '\u00EA': 'e', '\u1EC1': 'e', '\u1EBF': 'e', '\u1EC5': 'e', '\u1EC3': 'e',
        '\u1EBD': 'e', '\u0113': 'e', '\u1E15': 'e', '\u1E17': 'e', '\u0115': 'e', '\u0117': 'e', '\u00EB': 'e', '\u1EBB': 'e', '\u011B': 'e', '\u0205': 'e',
        '\u0207': 'e', '\u1EB9': 'e', '\u1EC7': 'e', '\u0229': 'e', '\u1E1D': 'e', '\u0119': 'e', '\u1E19': 'e', '\u1E1B': 'e', '\u0247': 'e', '\u025B': 'e',
        '\u01DD': 'e',

        '\u0066': 'f', '\u24D5': 'f', '\uFF46': 'f', '\u1E1F': 'f', '\u0192': 'f', '\uA77C': 'f',

        '\u0067': 'g', '\u24D6': 'g', '\uFF47': 'g', '\u01F5': 'g', '\u011D': 'g', '\u1E21': 'g', '\u011F': 'g', '\u0121': 'g', '\u01E7': 'g', '\u0123': 'g',
        '\u01E5': 'g', '\u0260': 'g', '\uA7A1': 'g', '\u1D79': 'g', '\uA77F': 'g',

        '\u0068': 'h', '\u24D7': 'h', '\uFF48': 'h', '\u0125': 'h', '\u1E23': 'h', '\u1E27': 'h', '\u021F': 'h', '\u1E25': 'h', '\u1E29': 'h', '\u1E2B': 'h',
        '\u1E96': 'h', '\u0127': 'h', '\u2C68': 'h', '\u2C76': 'h', '\u0265': 'h',

        '\u0195': 'hv',

        '\u0069': 'i', '\u24D8': 'i', '\uFF49': 'i', '\u00EC': 'i', '\u00ED': 'i', '\u00EE': 'i', '\u0129': 'i', '\u012B': 'i', '\u012D': 'i', '\u00EF': 'i',
        '\u1E2F': 'i', '\u1EC9': 'i', '\u01D0': 'i', '\u0209': 'i', '\u020B': 'i', '\u1ECB': 'i', '\u012F': 'i', '\u1E2D': 'i', '\u0268': 'i', '\u0131': 'i',

        '\u006A': 'j', '\u24D9': 'j', '\uFF4A': 'j', '\u0135': 'j', '\u01F0': 'j', '\u0249': 'j',

        '\u006B': 'k', '\u24DA': 'k', '\uFF4B': 'k', '\u1E31': 'k', '\u01E9': 'k', '\u1E33': 'k', '\u0137': 'k', '\u1E35': 'k', '\u0199': 'k', '\u2C6A': 'k',
        '\uA741': 'k', '\uA743': 'k', '\uA745': 'k', '\uA7A3': 'k',

        '\u006C': 'l', '\u24DB': 'l', '\uFF4C': 'l', '\u0140': 'l', '\u013A': 'l', '\u013E': 'l', '\u1E37': 'l', '\u1E39': 'l', '\u013C': 'l', '\u1E3D': 'l',
        '\u1E3B': 'l', '\u017F': 'l', '\u0142': 'l', '\u019A': 'l', '\u026B': 'l', '\u2C61': 'l', '\uA749': 'l', '\uA781': 'l', '\uA747': 'l',

        '\u01C9': 'lj',
        '\u006D': 'm', '\u24DC': 'm', '\uFF4D': 'm', '\u1E3F': 'm', '\u1E41': 'm', '\u1E43': 'm', '\u0271': 'm', '\u026F': 'm',

        '\u006E': 'n', '\u24DD': 'n', '\uFF4E': 'n', '\u01F9': 'n', '\u0144': 'n', '\u00F1': 'n', '\u1E45': 'n', '\u0148': 'n', '\u1E47': 'n', '\u0146': 'n',
        '\u1E4B': 'n', '\u1E49': 'n', '\u019E': 'n', '\u0272': 'n', '\u0149': 'n', '\uA791': 'n', '\uA7A5': 'n',

        '\u01CC': 'nj',

        '\u006F': 'o', '\u24DE': 'o', '\uFF4F': 'o', '\u00F2': 'o', '\u00F3': 'o', '\u00F4': 'o', '\u1ED3': 'o', '\u1ED1': 'o', '\u1ED7': 'o', '\u1ED5': 'o',
        '\u00F5': 'o', '\u1E4D': 'o', '\u022D': 'o', '\u1E4F': 'o', '\u014D': 'o', '\u1E51': 'o', '\u1E53': 'o', '\u014F': 'o', '\u022F': 'o', '\u0231': 'o',
        '\u00F6': 'o', '\u022B': 'o', '\u1ECF': 'o', '\u0151': 'o', '\u01D2': 'o', '\u020D': 'o', '\u020F': 'o', '\u01A1': 'o', '\u1EDD': 'o', '\u1EDB': 'o',
        '\u1EE1': 'o', '\u1EDF': 'o', '\u1EE3': 'o', '\u1ECD': 'o', '\u1ED9': 'o', '\u01EB': 'o', '\u01ED': 'o', '\u00F8': 'o', '\u01FF': 'o', '\u0254': 'o',
        '\uA74B': 'o', '\uA74D': 'o', '\u0275': 'o',

        '\u01A3': 'oi',
        '\u0223': 'ou',
        '\uA74F': 'oo',
        '\u0070': 'p', '\u24DF': 'p', '\uFF50': 'p', '\u1E55': 'p', '\u1E57': 'p', '\u01A5': 'p', '\u1D7D': 'p', '\uA751': 'p', '\uA753': 'p', '\uA755': 'p',
        '\u0071': 'q', '\u24E0': 'q', '\uFF51': 'q', '\u024B': 'q', '\uA757': 'q', '\uA759': 'q',

        '\u0072': 'r', '\u24E1': 'r', '\uFF52': 'r', '\u0155': 'r', '\u1E59': 'r', '\u0159': 'r', '\u0211': 'r', '\u0213': 'r', '\u1E5B': 'r', '\u1E5D': 'r',
        '\u0157': 'r', '\u1E5F': 'r', '\u024D': 'r', '\u027D': 'r', '\uA75B': 'r', '\uA7A7': 'r', '\uA783': 'r',

        '\u0073': 's', '\u24E2': 's', '\uFF53': 's', '\u00DF': 's', '\u015B': 's', '\u1E65': 's', '\u015D': 's', '\u1E61': 's', '\u0161': 's', '\u1E67': 's',
        '\u1E63': 's', '\u1E69': 's', '\u0219': 's', '\u015F': 's', '\u023F': 's', '\uA7A9': 's', '\uA785': 's', '\u1E9B': 's',

        '\u0074': 't', '\u24E3': 't', '\uFF54': 't', '\u1E6B': 't', '\u1E97': 't', '\u0165': 't', '\u1E6D': 't', '\u021B': 't', '\u0163': 't', '\u1E71': 't',
        '\u1E6F': 't', '\u0167': 't', '\u01AD': 't', '\u0288': 't', '\u2C66': 't', '\uA787': 't',

        '\uA729': 'tz',

        '\u0075': 'u', '\u24E4': 'u', '\uFF55': 'u', '\u00F9': 'u', '\u00FA': 'u', '\u00FB': 'u', '\u0169': 'u', '\u1E79': 'u', '\u016B': 'u', '\u1E7B': 'u',
        '\u016D': 'u', '\u00FC': 'u', '\u01DC': 'u', '\u01D8': 'u', '\u01D6': 'u', '\u01DA': 'u', '\u1EE7': 'u', '\u016F': 'u', '\u0171': 'u', '\u01D4': 'u',
        '\u0215': 'u', '\u0217': 'u', '\u01B0': 'u', '\u1EEB': 'u', '\u1EE9': 'u', '\u1EEF': 'u', '\u1EED': 'u', '\u1EF1': 'u', '\u1EE5': 'u', '\u1E73': 'u',
        '\u0173': 'u', '\u1E77': 'u', '\u1E75': 'u', '\u0289': 'u',

        '\u0076': 'v', '\u24E5': 'v', '\uFF56': 'v', '\u1E7D': 'v', '\u1E7F': 'v', '\u028B': 'v', '\uA75F': 'v', '\u028C': 'v',
        '\uA761': 'vy',
        '\u0077': 'w', '\u24E6': 'w', '\uFF57': 'w', '\u1E81': 'w', '\u1E83': 'w', '\u0175': 'w', '\u1E87': 'w', '\u1E85': 'w', '\u1E98': 'w', '\u1E89': 'w',
        '\u2C73': 'w',
        '\u0078': 'x', '\u24E7': 'x', '\uFF58': 'x', '\u1E8B': 'x', '\u1E8D': 'x',

        '\u0079': 'y', '\u24E8': 'y', '\uFF59': 'y', '\u1EF3': 'y', '\u00FD': 'y', '\u0177': 'y', '\u1EF9': 'y', '\u0233': 'y', '\u1E8F': 'y', '\u00FF': 'y',
        '\u1EF7': 'y', '\u1E99': 'y', '\u1EF5': 'y', '\u01B4': 'y', '\u024F': 'y', '\u1EFF': 'y',

        '\u007A': 'z', '\u24E9': 'z', '\uFF5A': 'z', '\u017A': 'z', '\u1E91': 'z', '\u017C': 'z', '\u017E': 'z', '\u1E93': 'z', '\u1E95': 'z', '\u01B6': 'z',
        '\u0225': 'z', '\u0240': 'z', '\u2C6C': 'z', '\uA763': 'z',

        '\u0327': '', '\u0308': ''
    };
    return str.replace(/[^\u0000-\u007E]/g, function (character) {

        return (character in diacriticsMap) ? diacriticsMap[character] : character;
    });
}

function testRemoveDicretics() {
    var testCases = [
        ["Volkan Ba\u01f5a", "Volkan Baga"],
        ["Ertac\u0327 Alt\u0131no\u0308z", "Ertac Altinoz"]
    ];

    var allPassed = true;
    for (var i = 0; i < testCases.length; i++) {
        var expected = testCases[i][1];
        var actual = removeDicretics(testCases[i][0]);

        if (expected != actual) {
            allPassed = false;
        }
    }
}

function loadJson(jsonPath) {
    var jsonFile = new File(jsonPath);
    jsonFile.open('r');
    var json = jsonFile.read();
    jsonFile.close();

    return JSON.parse(json);
}

function fileExists(filePath) {
    return (new File(filePath)).exists;
}

function exitOnKeyboardInterrupt() {
    if (fileExists(filePath + "/temp/photoshopIntertupt")) {
        log(">>>>>>>>>>>>>>>>>>>>>>>>");
        log("KeyboardInterrupt detected");
        log(">>>>>>>>>>>>>>>>>>>>>>>>");

        exit();
    }
}

function clearHistory() {
    // clears history of current file.
    // same effect as closing without saving and re-opening, without having to wait to reopen
    if (app.documents.length) {
        var docName = app.activeDocument.name;

        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(stringIDToTypeID("snapshotClass"), docName);
        desc.putReference(stringIDToTypeID("null"), ref);
        executeAction(stringIDToTypeID("select"), desc, DialogModes.NO);

        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("historyStates"));
        ref.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
        desc.putReference(stringIDToTypeID("null"), ref);
        executeAction(stringIDToTypeID("clearEvent"), desc, DialogModes.NO);
    }
}

function hexToRGB(hex) {
    var c = 1
    if (hex.charAt(0) != "#") c = 0;

    var r = parseInt(hex.substring(c, c + 2), 16)
    var g = parseInt(hex.substring(c + 2, c + 4), 16)
    var b = parseInt(hex.substring(c + 4, c + 6), 16)

    return { r: r, g: g, b: b };
}

function hexToSolidColor(hex) {
    var myColor = new SolidColor();
    var rgb = hexToRGB(hex);

    myColor.rgb.red = rgb.r;
    myColor.rgb.green = rgb.g;
    myColor.rgb.blue = rgb.b;

    return myColor;
}

function fillLayer(layer, solidColor) {
    app.activeDocument.activeLayer = layer;
    app.activeDocument.selection.fill(solidColor);
}

function fillSolidColorFillLayer(layer, solidColor) {
    var state = rememberActiveLayerState();
    app.activeDocument.activeLayer = layer;

    var idsetd = charIDToTypeID("setd");
    var desc195 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref118 = new ActionReference();
    var idcontentLayer = stringIDToTypeID("contentLayer");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref118.putEnumerated(idcontentLayer, idOrdn, idTrgt);
    desc195.putReference(idnull, ref118);
    var idT = charIDToTypeID("T   ");
    var desc196 = new ActionDescriptor();
    var idClr = charIDToTypeID("Clr ");
    var desc197 = new ActionDescriptor();
    var idRd = charIDToTypeID("Rd  ");
    desc197.putDouble(idRd, solidColor.rgb.red);
    var idGrn = charIDToTypeID("Grn ");
    desc197.putDouble(idGrn, solidColor.rgb.green);
    var idBl = charIDToTypeID("Bl  ");
    desc197.putDouble(idBl, solidColor.rgb.blue);
    var idRGBC = charIDToTypeID("RGBC");
    desc196.putObject(idClr, idRGBC, desc197);
    var idsolidColorLayer = stringIDToTypeID("solidColorLayer");
    desc195.putObject(idT, idsolidColorLayer, desc196);
    executeAction(idsetd, desc195, DialogModes.NO);

    restoreActiveLayerState(state);
}

function enableLayerMaskImproved(layer, enable, pixel) {
    if (layer) app.activeDocument.activeLayer = layer;
    enable = (enable === undefined) ? true : enable;
    pixel = (pixel === undefined) ? true : pixel;

    var idsetd = charIDToTypeID("setd");
    var desc1470 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref530 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref530.putEnumerated(idLyr, idOrdn, idTrgt);
    desc1470.putReference(idnull, ref530);
    var idT = charIDToTypeID("T   ");
    var desc1471 = new ActionDescriptor();

    // var idvectorMaskEnabled = stringIDToTypeID("vectorMaskEnabled");
    // var idUsrM = charIDToTypeID("UsrM");

    var idMaskType = charIDToTypeID(pixel ? "UsrM" : "vectorMaskEnabled");
    desc1471.putBoolean(idMaskType, enable);

    var idLyr = charIDToTypeID("Lyr ");
    desc1470.putObject(idT, idLyr, desc1471);
    executeAction(idsetd, desc1470, DialogModes.NO);
}

function setFill(layer, fillPercentage) {
    var state = rememberActiveLayerState();
    if (layer) layer = app.activeDocument.activeLayer;

    var idsetd = charIDToTypeID("setd");
    var desc196 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref91 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref91.putEnumerated(idLyr, idOrdn, idTrgt);
    desc196.putReference(idnull, ref91);
    var idT = charIDToTypeID("T   ");

    var desc197 = new ActionDescriptor();
    var idfillOpacity = stringIDToTypeID("fillOpacity");
    var idPrc = charIDToTypeID("#Prc");
    desc197.putUnitDouble(idfillOpacity, idPrc, fillPercentage);
    var idLyr = charIDToTypeID("Lyr ");
    desc196.putObject(idT, idLyr, desc197);

    executeAction(idsetd, desc196, DialogModes.NO);

    restoreActiveLayerState(state);
}

function setSpaceBeforeParagraph(layer, space) {
    app.activeDocument.activeLayer = layer;
    // =======================================================
    var idsetd = charIDToTypeID("setd");

    var desc564 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");

    var ref94 = new ActionReference();
    var idPrpr = charIDToTypeID("Prpr");
    var idparagraphStyle = stringIDToTypeID("paragraphStyle");
    ref94.putProperty(idPrpr, idparagraphStyle);
    var idTxLr = charIDToTypeID("TxLr");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref94.putEnumerated(idTxLr, idOrdn, idTrgt);
    desc564.putReference(idnull, ref94);
    var idT = charIDToTypeID("T   ");

    var desc565 = new ActionDescriptor();
    var idtextOverrideFeatureName = stringIDToTypeID("textOverrideFeatureName");
    desc565.putInteger(idtextOverrideFeatureName, 808464437);
    var idspaceBefore = stringIDToTypeID("spaceBefore");
    var idPxl = charIDToTypeID("#Pxl");
    desc565.putUnitDouble(idspaceBefore, idPxl, space.as("px"));
    // var idparagraphStyle = stringIDToTypeID("paragraphStyle");
    desc564.putObject(idT, idparagraphStyle, desc565);

    executeAction(idsetd, desc564, DialogModes.NO);
}

function insertManaCost(manaCostLayer, cardManaCost) {
    manaCostLayer.visible = cardManaCost != "";

    var black = hexToSolidColor("000000");

    if (manaCostLayer.visible) {
        // app.activeDocument.activeLayer = manaCostLayer;
        formatText(manaCostLayer, cardManaCost, [], -1, false, black);
        manaCostLayer.textItem.justification = Justification.RIGHT; // Force justification
    }
}

function balanceLeftText(leftTextLayer, rightBound) {
    var minGap = 16; // minimum 16 px gap

    // Scale down text to fit in case it's too long
    var textFontSize = leftTextLayer.textItem.size;
    var fontResolutionScalar = getFontResolutionScalar();

    while (leftTextLayer.bounds[2].as("px") > rightBound - minGap) {
        textFontSize -= 1;
        leftTextLayer.textItem.size = new UnitValue(textFontSize * fontResolutionScalar, "px");
    }
}

function setStroke(layer, color, size, opacity) {
    var state = rememberActiveLayerState();

    app.activeDocument.activeLayer = layer;

    var desc0 = new ActionDescriptor();

    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Lefx"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    desc0.putReference(charIDToTypeID("null"), ref);

    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), 833.333333);

    var desc2 = new ActionDescriptor();
    desc2.putBoolean(charIDToTypeID("enab"), true);
    desc2.putBoolean(stringIDToTypeID("present"), true);
    desc2.putBoolean(stringIDToTypeID("showInDialog"), true);
    desc2.putEnumerated(charIDToTypeID("Styl"), charIDToTypeID("FStl"), charIDToTypeID("OutF"));
    desc2.putEnumerated(charIDToTypeID("PntT"), charIDToTypeID("FrFl"), charIDToTypeID("SClr"));
    // blendmode
    desc2.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("BlnM"), charIDToTypeID("Nrml"));
    // opacity
    if (opacity !== undefined) desc2.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), opacity);
    // stroke size
    if (size !== undefined) desc2.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pxl"), size);

    var desc3 = new ActionDescriptor();
    desc3.putDouble(charIDToTypeID("Rd  "), color.rgb.red);
    desc3.putDouble(charIDToTypeID("Grn "), color.rgb.green);
    desc3.putDouble(charIDToTypeID("Bl  "), color.rgb.blue);

    desc2.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), desc3);
    desc2.putBoolean(stringIDToTypeID("overprint"), false);
    desc1.putObject(charIDToTypeID("FrFX"), charIDToTypeID("FrFX"), desc2);
    desc0.putObject(charIDToTypeID("T   "), charIDToTypeID("Lefx"), desc1);

    executeAction(charIDToTypeID("setd"), desc0, DialogModes.NO);
    restoreActiveLayerState(state);
}

function toggleStroke(layer, show) {
    var state = rememberActiveLayerState();

    app.activeDocument.activeLayer = layer;

    // var idHd = charIDToTypeID(show ? "Shw " : "Hd  ");
    var desc = new ActionDescriptor();
    // var idnull = charIDToTypeID("null");
    var list = new ActionList();
    var ref = new ActionReference();
    // var idFrFX = charIDToTypeID("FrFX");
    ref.putIndex(charIDToTypeID("FrFX"), 1);
    // var idLyr = charIDToTypeID("Lyr ");
    // var idOrdn = charIDToTypeID("Ordn");
    // var idTrgt = charIDToTypeID("Trgt");
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    list.putReference(ref);
    desc.putList(charIDToTypeID("null"), list);
    executeAction(charIDToTypeID(show ? "Shw " : "Hd  "), desc, DialogModes.NO);

    restoreActiveLayerState(state);
}

function rasterizeLayerStyle(layer) {
    var state = rememberActiveLayerState();
    app.activeDocument.activeLayer = layer;

    // =======================================================
    // var idinvokeCommand = stringIDToTypeID("invokeCommand");
    // var desc249 = new ActionDescriptor();
    // var idcommandID = stringIDToTypeID("commandID");
    // desc249.putInteger(idcommandID, 3557);
    // var idkcanDispatchWhileModal = stringIDToTypeID("kcanDispatchWhileModal");
    // desc249.putBoolean(idkcanDispatchWhileModal, true);
    // executeAction(idinvokeCommand, desc249, DialogModes.NO);

    // =======================================================
    // var idhistoryStateChanged = stringIDToTypeID("historyStateChanged");
    // var desc250 = new ActionDescriptor();
    // var idDocI = charIDToTypeID("DocI");
    // desc250.putInteger(idDocI, 224);
    // var idIdnt = charIDToTypeID("Idnt");
    // desc250.putInteger(idIdnt, 962);
    // var idNm = charIDToTypeID("Nm  ");
    // desc250.putString(idNm, """Rasterize Layer Style""");
    // var idhasEnglish = stringIDToTypeID("hasEnglish");
    // desc250.putBoolean(idhasEnglish, true);
    // executeAction(idhistoryStateChanged, desc250, DialogModes.NO);

    // =======================================================
    var idrasterizeLayer = stringIDToTypeID("rasterizeLayer");
    var desc251 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref39 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref39.putEnumerated(idLyr, idOrdn, idTrgt);
    desc251.putReference(idnull, ref39);
    var idWhat = charIDToTypeID("What");
    var idrasterizeItem = stringIDToTypeID("rasterizeItem");
    var idlayerStyle = stringIDToTypeID("layerStyle");
    desc251.putEnumerated(idWhat, idrasterizeItem, idlayerStyle);
    executeAction(idrasterizeLayer, desc251, DialogModes.NO);
    
    restoreActiveLayerState(state);
}