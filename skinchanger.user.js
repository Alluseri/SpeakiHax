// ==UserScript==
// @name         SpeakiRPG SkinChanger
// @namespace    https://lunahook.dev/
// @version      1.0
// @description  Drop-in skinchanger for SpeakiRPG
// @author       Alluseri
// @match        *://speakirpg.overture.io.kr/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const win = unsafeWindow ?? window;
    let spk = undefined;

    const imageDesc = Object.getOwnPropertyDescriptor(win.HTMLImageElement.prototype, 'src');
    if (imageDesc && imageDesc.set) {
        Object.defineProperty(win.HTMLImageElement.prototype, 'src', {
            set: function(val) {
                // this code stinks
                if (val.endsWith("/models/speaki/Map_Body.png")) {
                    if (spk === undefined) {
                        spk = win.prompt(`Please enter the full URL of the Speaki skin (remote files only, leave empty to load normal skin):`);
                    }
                    return imageDesc.set.call(this, spk || val);
                }

                return imageDesc.set.call(this, val);
            },
            get: function() {
                return imageDesc.get.call(this);
            },
            configurable: true
        });
    }
})();
