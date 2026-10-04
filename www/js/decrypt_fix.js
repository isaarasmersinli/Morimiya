(function() {
    var ENCRYPTION_KEY = "cbf45b48176a036e58bd338a2b8f326d"; 

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

    // --- DOĞRU SES DEŞİFRELEME (XOR + HEADER CUT) ---
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
                    // Sesi XOR algoritmasıyla deşifre et ve düzgünce yükle
                    var decryptedBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                    this._onXhrLoad(decryptedBuffer);
                } else {
                    this._hasError = true;
                }
            }.bind(this);
            xhr.onerror = this._onError.bind(this);
            xhr.send();
        }
    };

    // RPG Maker MV Doğru ArrayBuffer Deşifre Algoritması
    Decrypter.decryptArrayBuffer = function(arrayBuffer) {
        if (!arrayBuffer) return null;
        var header = new Uint8Array(arrayBuffer, 0, 16);
        var ref = Decrypter._headerArray;
        
        var body = arrayBuffer.slice(16);
        var view = new DataView(body);
        
        if (ref) {
            for (var i = 0; i < 16; i++) {
                view.setUint8(i, view.getUint8(i) ^ ref[i]);
            }
        }
        return body;
        return arrayBuffer;
    };

    // --- RESİM YÜKLEME ---
    var _Bitmap_prototype_initialize = Bitmap.prototype.initialize;
    Bitmap.prototype.initialize = function(width, height) {
        _Bitmap_prototype_initialize.call(this, width, height);
    };

    Bitmap.load = function(url) {
        var bitmap = Object.create(Bitmap.prototype);
        bitmap.initialize();
        bitmap._url = url;

        var ext = url.match(/\.(png|rpgmvp)$/i);
        var baseUrl = url.replace(/\.(png|rpgmvp)$/i, '');
        var tryEncrypted = baseUrl + '.rpgmvp';

        var tryLoad = function(targetUrl, fallbackUrl) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', targetUrl);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status < 400) {
                    if (targetUrl.endsWith('.rpgmvp')) {
                        var arrayBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                        var blob = new Blob([arrayBuffer], { type: 'image/png' });
                        bitmap._image.src = URL.createObjectURL(blob);
                    } else {
                        bitmap._image.src = targetUrl;
                    }
                } else if (fallbackUrl) {
                    tryLoad(fallbackUrl, null);
                } else {
                    bitmap._image.src = targetUrl;
                }
            };
            xhr.onerror = function() {
                if (fallbackUrl) {
                    tryLoad(fallbackUrl, null);
                } else {
                    bitmap._image.src = targetUrl;
                }
            };
            xhr.send();
        };

        var lowerUrl = baseUrl.toLowerCase() + '.rpgmvp';
        tryLoad(tryEncrypted, lowerUrl);

        bitmap._image.onload = Bitmap.prototype._onLoad.bind(bitmap);
        bitmap._image.onerror = Bitmap.prototype._onError.bind(bitmap);
        return bitmap;
    };

    console.log("Ses/Resim canlı deşifre motoru güncellendi.");
})();
