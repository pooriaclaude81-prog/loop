; NSIS installer script - builds the final Windows installer (FarsiOCR-Setup.exe)
; from the PyInstaller onedir build produced at dist\FarsiOCR.
; Compile with: makensis installer/installer.nsi   (run from the repo root)

!include "MUI2.nsh"

Unicode true
Target amd64-unicode

Name "Farsi Medical OCR"
OutFile "..\installer_output\FarsiOCR-Setup.exe"
InstallDir "$PROGRAMFILES64\FarsiOCR"
InstallDirRegKey HKCU "Software\FarsiOCR" "InstallDir"
RequestExecutionLevel admin
SetCompressor /SOLID lzma

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\FarsiOCR.exe"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "..\dist\FarsiOCR\*.*"

  WriteRegStr HKCU "Software\FarsiOCR" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  CreateDirectory "$SMPROGRAMS\Farsi Medical OCR"
  CreateShortcut "$SMPROGRAMS\Farsi Medical OCR\Farsi Medical OCR.lnk" "$INSTDIR\FarsiOCR.exe"
  CreateShortcut "$SMPROGRAMS\Farsi Medical OCR\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\Farsi Medical OCR.lnk" "$INSTDIR\FarsiOCR.exe"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FarsiOCR" \
    "DisplayName" "Farsi Medical OCR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FarsiOCR" \
    "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FarsiOCR" \
    "InstallLocation" "$INSTDIR"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir "$SMPROGRAMS\Farsi Medical OCR"
  Delete "$SMPROGRAMS\Farsi Medical OCR\Farsi Medical OCR.lnk"
  Delete "$SMPROGRAMS\Farsi Medical OCR\Uninstall.lnk"
  Delete "$DESKTOP\Farsi Medical OCR.lnk"
  DeleteRegKey HKCU "Software\FarsiOCR"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FarsiOCR"
SectionEnd
