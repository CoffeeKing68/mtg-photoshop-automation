from argparse import ArgumentParser
from json import load
import os
import platform
import subprocess
from pathlib import Path
from pprint import pprint

CONFIG_JSON = "config.json"


def get_args():
    parser = ArgumentParser(description='Make some mtg proxies!')

    parser.add_argument(
        '--photoshop', '-ps', help='Target Photoshop app (only need end code `eg. CS6`)')
    parser.add_argument('--javascript', '-js', help='Script to run')
    parser.add_argument('--templateLocation', '-templates', help='templates location')

    args = parser.parse_args()

    try:
        with open(CONFIG_JSON, "r") as f:
            config = load(f)
    except:
        # There should be a better way to do this
        config = {
            "photoshopTarget": "",
            "javascriptToRun": "",
            "templateLocation": "",
        }

    # args take precedent
    if args.photoshop:
        ps = args.photoshop
        if not ps.startswith("Adobe Photoshop "):
            ps = "Adobe Photoshop " + ps
    elif config["photoshopTarget"]:
        ps = config["photoshopTarget"]
    else:
        print("Tell me what photoshop to use!")
        exit()

    if args.javascript:
        # Apple script at least wants a full path
        js = Path(args.javascript).resolve()
    elif config["javascriptToRun"]:
        js = Path(config["javascriptToRun"]).resolve()
    else:
        print("Tell me what javascript to run!")
        exit()
    
    if not Path(js).exists():
        print("Javascript file doesn't exist!") 
        exit()
    
    if args.templateLocation:
        templateLocation = args.templateLocation
    elif config["templateLocation"]:
        templateLocation =config["templateLocation"] 
    else:
        templateLocation = "templates"

    return ps, js, templateLocation


def main():
    keyboardInterruptHackFilePath = 'temp/photoshopIntertupt'

    try:
        os.remove(keyboardInterruptHackFilePath);
    except OSError:
        pass

    ps, js, templateLocation = get_args()
    
    system = platform.system()
    if system == "Darwin":  # MacOS
        # Applescript is so silly, have to do it like this so it doesn't complain
        # Looking for any alternatives
        applescript_string = f"""tell application "{ps}"
            with timeout of 3600 seconds
                activate
                set js to "#include '{js}'; var templateLocation = '{templateLocation}'; main();"
                do javascript js
            end timeout
        end tell"""
        command = ["osascript"]
        for line in applescript_string.splitlines():
            command.append("-e")
            command.append(line.strip())
    elif system == "Windows":
        # need to double up the backslashes for windows
        js = str(js).replace("\\", "\\\\")
        templateLocation = str(Path(templateLocation).resolve()).replace("\\", "\\\\")

        vbsScriptCode =f"""
        'PsJavaScriptExecutionMode Enums
        Const psNeverShowDebugger = 1, psDebuggerOnError = 2, psBeforeRunning = 3

        Dim appRef
        Set appRef = CreateObject("Photoshop.Application")

        appRef.DoJavaScript  "#include '{js}'; var templateLocation = '{templateLocation}'; main();", Array(), 1
        """
        vbsScriptFileName = "temp/windowsVbsScript.vbs"
        with open(vbsScriptFileName, "w") as f:
            f.write(vbsScriptCode)

        command = ["cscript", vbsScriptFileName]
    elif system == "Linux":
        pass


    try:
        subprocess.call(command)
    except KeyboardInterrupt as e:
        print('KeyboardInterrupt')

        with open(keyboardInterruptHackFilePath, 'w'):
            pass
        
    print(">" * 30 + "\n")
    with open("logs/log.log", "r") as f:
        print(f.read())
    print(">" * 30)

if __name__ == "__main__":
    main()