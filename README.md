# Lospec Emoji Archive

This is an archive of all current and past lospec emojis.

# Contributing

All files must be formatted specifically as defined below:

## Image Format
- PNG image format
- 16x16 pixels
- Transparent background
- Lospec Emoji Palette - https://lospec.com/palette-list/lospec-emoji

## File Naming
- names should be what the emoji tag would be on discord
- lowercase only
- letters and numbers only
- no spaces or dashes
- name cant be the same as a default discord emoji

## Archived Emojis
If you are replacing an emoji, the old version should be moved into the "old" folder
Images in the "old" folder should be named the same as a file in the "current" folder, but with "_vN" appended to the end, where N is the version number (a sequential integer)
Archived emojis may break the image requirements, as they could have been created before them.

## Credits Data
Every emoji in the current folder should also be listed in `credits.csv` with the following information:
- `name`: The exact name of the emoji file, without the file extension
- `original_author`: The name of the person who created the first version of the emoji
- `date_of_creation`: The date the first version of the emoji was created

## Versions Data
Every emoji in the old folder should also be listed in `versions.csv` with the following information:
- `name`: The exact name of the emoji file, without the file extension
- `version`: The version number of the emoji
- `date_of_creation`: The date the version of the emoji was created
- `author`: The name of the person who created this version of the emoji

## Validation

To ensure that your changes are valid, you can run the validation script like so:
1. install node.js
2. change to the `validation` directory
3. run `npm install`
4. run `npm start` to run the validation
5. The console will tell you if the validation passed or failed

If you can't / won't run the validation script, it will be automatically run when you make a pull request. This validation must pass before your pull request is accepted.

# License

All rights reserved.

These emojis are for use on Lospec.com, the Lospec Discord server, and free Lospec related community projects only. They are not to be used for any commercial purposes without permission from Lospec.

