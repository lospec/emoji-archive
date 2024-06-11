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
2. change to the `scripts` directory
3. run `npm install`
4. run `npm run validate` to run the validation
5. The console will tell you if the validation passed or failed

If you can't / won't run the validation script, it will be automatically run when you make a pull request. This validation must pass before your pull request is accepted.

# Scripts 

In the scripts folder are a few scripts that may be useful

To run a script you can either run them through NPM, with `npm run <script name>`, or you can run them directly with node, with `node <script name>`.
Some scripts have command line arguments.

## validate.js
Validates that all the emojis and the credits.cvs file are correctly formatted. This script is run automatically when you make a pull request.

## quantize.js
This checks every current emoji to see if they fit the palette. If they don't fit the palette, all offending colors will be replaced with the closest one in the palette, and will be saved to the `_quantized` folder on the root. Once quantized you should check if the emoji looks good, then move it to the current folder, replacing the old emoji.

## scale.js
This scales all emojis in the current folder, then saves them to the `_scaled` folder on the root. By default it scales them to 4x, which is ideal for discord, but you can change the scale by passing in the desired scale as the sole argument, e.g. `node scale.js 2` will scale the emojis to 2x.

## compile.js
This script compiles all the emojis in the current folder into a single image, then saves it to the root as `_compilation/compiled.png`. By default it compiles them into a grid in order with no margins at 1x, but has many arguments that can be set to change how it generates. To see all the options run `node compile.js -help`.

# License

All rights reserved.

These emojis are for use on Lospec.com, the Lospec Discord server, and free Lospec related community projects only. They are not to be used for any commercial purposes without permission from Lospec.

