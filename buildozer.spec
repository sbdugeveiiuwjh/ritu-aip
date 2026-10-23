[app]

# Application information
title = Ritu AI App
package.name = rituai
package.domain = org.ai

# Version
version = 0.1

# Source files to include
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,json

# Application requirements
requirements = python3,kivy,google-generativeai,requests,certifi,urllib3,idna,charset-normalizer

# App Orientation
orientation = portrait

# Permissions
android.permissions = INTERNET

# Android API Target
android.api = 33
android.minapi = 21

# Application state
fullscreen = 0

[buildozer]
log_level = 2
warn_on_root = 1
