# Building

1. Unzip the source code or clone this repo:  
   `git clone git@github.com:igorkedzierawski/youtube-wide-volume-slider.git`
2. *(Optional)* Open the project in a Dev Container (e.g., in VS Code with the Dev Containers extension)
3. Install dependencies: `npm install` (This runs automatically in a Dev Container)
4. Build the extension: `npm run build`
5. If successful, the `unpacked` directory will contain all files needed to load the extension.

## Running the built extension

To test the extension, you can:

- Run in Firefox:
  - by using `npm run web-run:firefox` script.
  - by **Loading Temporary Add-on** at `about:debugging#/runtime/this-firefox` by selecting `unpacked/manifest.json` file.
- Run in Chrome:
  - by using `npm run web-run:chrome` script.
  - by **Loading unpacked** addon at `chrome://extensions/` by selecting `unpacked` directory.

## Development

The recommended workflow is to:

- Run `npm run watch` to rebuild the extension every time you make a change.
- At the same time, have the extension loaded in your browser (either by running one of the `npm run web-run:*` scripts or by manually loading it).
