(function() {
    // System.json içindeki encryptionKey
    var ENCRYPTION_KEY = "cbf45b48176a036e58bd338a2b8f326d"; 

    // Hem Ses hem Resim şifrelemesini aktif et
    Decrypter.hasEncryptedAudio = true;
    Decrypter.hasEncryptedImages = true;
    Decrypter._encryptionKey = ENCRYPTION_KEY;

    if (ENCRYPTION_KEY) {
        var keyArray = [];
        for (var i = 0; i < ENCRYPTION_KEY.length; i += 2) {
            keyArray.push(parseInt(ENCRYPTION_KEY.substr(i, 2), 16));
        }
        Decrypter._headerArray = new Uint8Array(keyArray);
    }

    // --- SES DEŞİFRELEME ---
    var _WebAudio_prototype_initialize = WebAudio.prototype.initialize;
    WebAudio.prototype.initialize = function(url) {
        if (url && !url.match(/\.(rpgmvo|rpgmvm)$/i)) {
            if (AudioManager.isOggSupported()) {
                url = url.replace(/\.ogg$/i, '') + '.rpgmvo';
            } else {
                url = url.replace(/\.m4a$/i, '') + '.rpgmvm';
            }
        }
        _WebAudio_prototype_initialize.call(this, url);
        this._hasEncryptedAudio = true;
    };

    WebAudio.prototype._load = function(url) {
        if (url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status < 400) {
                    var arrayBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                    this._onXhrLoad(arrayBuffer);
                } else {
                    this._hasError = true;
                }
            }.bind(this);
            xhr.onerror = this._onError.bind(this);
            xhr.send();
        }
    };

    // --- RESİM DEŞİFRELEME ---
    var _Bitmap_prototype_initialize = Bitmap.prototype.initialize;
    Bitmap.prototype.initialize = function(width, height) {
        _Bitmap_prototype_initialize.call(this, width, height);
    };

    Bitmap.load = function(url) {
        var bitmap = Object.create(Bitmap.prototype);
        bitmap.initialize();
        bitmap._url = url;

        // Şifreli resim uzantısına dönüştür (.png -> .rpgmvp)
        var encryptedUrl = url.replace(/\.png$/i, '.rpgmvp');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', encryptedUrl);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status < 400) {
                var arrayBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                var blob = new Blob([arrayBuffer], { type: 'image/png' });
                bitmap._image.src = URL.createObjectURL(blob);
            } else {
                // Eğer şifreli hali yoksa normal .png yüklemeyi dene
                bitmap._image.src = url;
            }
        };
        xhr.onerror = function() {
            bitmap._image.src = url;
        };
        xhr.send();

        bitmap._image.onload = Bitmap.prototype._onLoad.bind(bitmap);
        bitmap._image.onerror = Bitmap.prototype._onError.bind(bitmap);
        return bitmap;
    };

    Decrypter.decryptArrayBuffer = function(arrayBuffer) {
        if (!arrayBuffer) return null;
        var header = new Uint8Array(arrayBuffer, 0, 16);
        var ref = Decrypter._headerArray;
        if (ref) {
            for (var i = 0; i < 16; i++) {
                header[i] = header[i] ^ ref[i];
            }
        }
        return arrayBuffer.slice(16);
    };

})();
