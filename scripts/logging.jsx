#include "constants.jsx";

function makeLogFile() {
    // make logfile
    var logFolder = new Folder(filePath + "/logs");
    logFolder.create();

    var logFile = new File(filePath + "/logs/" + "log.log");
    // keke
    logFile.open(LayerNames.WHITE, "TEXT");
    logFile.close();
}

makeLogFile();

function log(s) {
    var logFile = new File(filePath + "/logs/" + "log.log");
    if (s === undefined) s = "";

    logFile.open("a", "TEXT");
   
    logFile.write(s);
   
    logFile.write("\n");
    logFile.close();
}


function logObj(s) {
    var logFile = new File(filePath + "/logs/" + "log.log");
    if (s === undefined) s = "";

    logFile.open("a", "TEXT");
   
    logFile.write(JSON.stringify(s, null, 2));
   
    logFile.write("\n");
    logFile.close();
}


// You can use it like this:
// log("hello world");
// log(textAndIcons);
// log(cardnameLayer.textItem.font);