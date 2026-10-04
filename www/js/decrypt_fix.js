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

    // --- RESİM YÜKLEME YAMASI (BITMAP NULL HATASINI KESİN ÇÖZER) ---
    var _ImageManager_loadNormalBitmap = ImageManager.loadNormalBitmap;
    ImageManager.loadNormalBitmap = function(path, hue) {
        var baseUrl = path.replace(/\.(png|rpgmvp)$/i, '');
        var encryptedUrl = baseUrl + '.rpgmvp';
        var normalUrl = baseUrl + '.png';

        // RPG Maker'ın orijinal Bitmap nesnesini başlat
        var bitmap = _ImageManager_loadNormalBitmap.call(this, normalUrl, hue);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', encryptedUrl);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status < 400) {
                var arrayBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                var blob = new Blob([arrayBuffer], { type: 'image/png' });
                bitmap._image.src = URL.createObjectURL(blob);
            }
        };
        xhr.send();

        return bitmap;
    };

    // --- SES DEŞİFRELEME (XOR + HEADER CUT) ---
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
    };

    console.log("Morimiya stabil yükleme yaması yüklendi.");
})();
