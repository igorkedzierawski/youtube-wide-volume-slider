<p align="center">
  <img src="https://github.com/user-attachments/assets/cafa60da-59c1-4635-a34b-5368e989349e" alt="extension-icon" width="196">
</p>

<h1 align="center">YouTube Wide Volume Slider</h1>

<p align="center">
  <img src="https://img.shields.io/amo/users/youtube-wide-volume-slider?label=Firefox%20Users" alt="firefox_users">
  <img src="https://img.shields.io/chrome-web-store/users/bhfhbmnjfgbncfcahcinmnfokbjemkba?label=Chrome%20Users" alt="chrome_users">
</p>

YouTube Wide Volume Slider replaces YouTube's default volume slider with a wider one. Initially created for personal use, I decided to publish it. The new slider is ~3.75x wider than the original, which improves UX by making volume adjustments easier and more precise.

<p align="center">
  <img src="https://github.com/user-attachments/assets/bc3299ca-a02d-471b-852f-13823eef34dd" alt="extension_showcase" width="420">
</p>

  - [Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/youtube-wide-volume-slider/) 
  - [Download for Chrome](https://chromewebstore.google.com/detail/youtube-wide-volume-slide/bhfhbmnjfgbncfcahcinmnfokbjemkba/) 

# Building

1. Unzip the source code or clone this repo:  
   `git clone git@github.com:igorkedzierawski/youtube-wide-volume-slider.git`
2. *(Optional)* Open the project in a Dev Container (e.g., in VS Code with the Dev Containers extension)
3. Install dependencies: `npm install` (This runs automatically in a Dev Container)
4. Build the extension: `npm run build`
5. If successful, the `unpacked` directory will contain all files needed to load the extension.

The build process was tested on Linux with npm 10.8.2 and Node.js v20.19.0, but it should work on any modern OS and recent Node.js versions.

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
