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
}

function renameFromWeb(filename) {
    var saveForWebName = filename.replace(/\s/g, "-");
    var savedImage = new File(saveForWebName);

    var correctFile = new File(filename);

    if ((saveForWebName != filename)) {
        if ((savedImage.exists)) {
            if (correctFile.exists) {
                correctFile.remove();
            }
            savedImage.rename(correctFile.name);
        }
    }
}

function savePngImage(location, cardName) {
    // var docRef = app.activeDocument;
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

    // Close the thing without saving
    // docRef.close(SaveOptions.DONOTSAVECHANGES);
}

function enableLayerMask(layer, enable, pixel) {
    var visibility = layer.visible;
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

    var idMaskType = (pixel) ? charIDToTypeID("UsrM") : stringIDToTypeID("vectorMaskEnabled");
    desc1471.putBoolean(idMaskType, enable);

    var idLyr = charIDToTypeID("Lyr ");
    desc1470.putObject(idT, idLyr, desc1471);
    executeAction(idsetd, desc1470, DialogModes.NO);
    layer.visible = visibility;
}