[buildozer]

# Application information
title = Ritu AI App
package.name = rituai
package.domain = org.ai

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
android.ndk = 25b

# Application state
fullscreen = 0
