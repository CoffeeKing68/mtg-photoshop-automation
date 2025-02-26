function makeLogFile() {
    // make logfile
    var logFolder = new Folder(filePath + "/logs");
    logFolder.create();

    var logFile = new File(filePath + "/logs/" + "log.log");
    logFile.open("w", "TEXT");
    logFile.close();
}

makeLogFile();

function log(s) {
    var logFile = new File(filePath + "/logs/" + "log.log");
    if (s === undefined) s = "";

    logFile.open("a", "TEXT");
    logFile.write(s + "\n");
    logFile.close();
}

// You can use it like this:
// log("hello world");
// log(textAndIcons);
// log(cardnameLayer.textItem.font);