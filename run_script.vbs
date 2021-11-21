'PsJavaScriptExecutionMode Enums
Const psNeverShowDebugger = 1, psDebuggerOnError = 2, psBeforeRunning = 3

Dim appRef
Set appRef = CreateObject("Photoshop.Application")

appRef.DoJavaScript "#include 'D:\MTG_ps\mtg-photoshop-automation\scripts\test2.jsx'; main()"
' appRef.DoJavaScript "#include 'D:\PythonProgramming\mtg-photoshop-automation-ashleym\scripts\test2.jsx'"