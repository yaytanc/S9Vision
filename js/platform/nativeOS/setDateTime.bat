@echo off
reg copy "HKCU\Control Panel\International" "HKCU\Control Panel\International-Temp" /f
reg add "HKCU\Control Panel\International" /v sShortDate /d "dd/MM/yyyy" /f
time %1
date %2
reg copy "HKCU\Control Panel\International-Temp" "HKCU\Control Panel\International" /f