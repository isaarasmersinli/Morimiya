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

    // --- BÜYÜK/KÜÇÜK HARF HATA TOLERANSI & RESİM YÜKLEME ---
    var _ImageManager_loadBitmap = ImageManager.loadBitmap;
    ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
        if (filename) {
            // Şifreli dosya uzantısını kontrol et
            var path = folder + encodeURIComponent(filename) + '.png';
            return this.loadNormalBitmap(path, hue || 0);
        } {
            return this.loadEmptyBitmap();
        }
    };

    var _Bitmap_prototype_initialize = Bitmap.prototype.initialize;
    Bitmap.prototype.initialize = function(width, height) {
        _Bitmap_prototype_initialize.call(this, width, height);
    };

    // Dosyayı bulamazsa küçük harfle tekrar deneyen yükleyici
    Bitmap.load = function(url) {
        var bitmap = Object.create(Bitmap.prototype);
        bitmap.initialize();
        bitmap._url = url;

        var ext = url.match(/\.(png|rpgmvp)$/i);
        var baseUrl = url.replace(/\.(png|rpgmvp)$/i, '');
        var tryEncrypted = baseUrl + '.rpgmvp';
        var tryNormal = baseUrl + '.png';

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
                    // Eğer 'Shadow1.png' bulunamazsa 'shadow1.png' dene
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

        // Önce orijinal URL veya küçük harf versiyonu ile dene
        var lowerUrl = baseUrl.toLowerCase() + '.rpgmvp';
        tryLoad(tryEncrypted, lowerUrl);

        bitmap._image.onload = Bitmap.prototype._onLoad.bind(bitmap);
        bitmap._image.onerror = Bitmap.prototype._onError.bind(bitmap);
        return bitmap;
    };

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

    console.log("Morimiya gelişmiş resim/ses yükleme çözücüsü aktif.");
})();
