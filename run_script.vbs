'PsJavaScriptExecutionMode Enums
Const psNeverShowDebugger = 1, psDebuggerOnError = 2, psBeforeRunning = 3

Dim appRef
Set appRef = CreateObject("Photoshop.Application")

'\\MACBOOKPRO-B170\ashley\PythonProgramming\mtg-photoshop-automation-ashleym\scripts\test2.jsx'; main();"
' appRef.DoJavaScript "#include 'Z:\PythonProgramming\mtg-photoshop-automation-ashleym\scripts\test2.jsx'; main();", Array(), 2
appRef.DoJavaScript "#include 'Z:\PythonProgramming\mtg-photoshop-automation-ashleym\scripts\test2.jsx'"